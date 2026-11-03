"""数据采集与快照组装。"""

from __future__ import annotations

from typing import Any, Optional

from .analysis import (
    DEFAULT_WEIGHTS,
    build_asset_analysis,
    build_jewelry_analysis,
)
from .config import DATA_DIR
from .models import Quote
from .sources import jijinhao, sina, tencent
from .storage import latest_price_from_history
from .util import now_cst, pct_change, percentile_rank

SINA_EXTRA_SYMBOLS = ["hf_XAU", "hf_XAG", "fx_susdcny"]
OUNCE_IN_GRAM = 31.1035


def _error(errors: list[str], label: str, exc: Exception) -> None:
    message = f"{label}: {exc}"
    errors.append(message)
    print(f"[warn] {message}")


def _collect_jijinhao_codes(config: dict[str, Any]) -> tuple[list[str], dict[str, str]]:
    codes: list[str] = []
    units: dict[str, str] = {}

    def add(code: str, unit: str = "") -> None:
        if code and code not in codes:
            codes.append(code)
        if code and unit and code not in units:
            units[code] = unit

    for item in config.get("sge", []):
        add(item["code"], "元/克" if item.get("metal") == "gold" else "元/千克")
    for item in config.get("bank_paper", []):
        add(item["code"], item.get("unit", ""))
    for item in config.get("bars", []):
        add(item["code"], item.get("unit", "元/克"))
    for item in config.get("brands", []):
        add(item.get("gold", ""), "元/克")
        add(item.get("platinum", ""), "元/克")
    return codes, units


def _asset_live(
    asset: dict[str, Any],
    sina_quotes: dict[str, Quote],
    tencent_quotes: dict[str, Quote],
) -> Optional[Quote]:
    live = asset.get("live") or {}
    if live.get("source") == "sina":
        return sina_quotes.get(live.get("symbol", ""))
    if live.get("source") == "tencent":
        return tencent_quotes.get(live.get("symbol", ""))
    return None


def _fetch_history(asset: dict[str, Any], days: int, timeout: int, retries: int) -> list[dict[str, Any]]:
    history = asset.get("history") or {}
    source = history.get("source")
    symbol = history.get("symbol", "")
    if source == "sina_inner":
        return sina.fetch_inner_kline(symbol, days=days, timeout=timeout, retries=retries)
    if source == "sina_global":
        return sina.fetch_global_kline(symbol, days=days, timeout=timeout, retries=retries)
    if source == "sina_stock":
        return sina.fetch_stock_kline(symbol, days=days, timeout=timeout, retries=retries)
    return []


def _ratio_series(
    gold_history: list[dict[str, Any]], silver_history: list[dict[str, Any]]
) -> list[float]:
    gold = {row["date"]: row["close"] for row in gold_history}
    silver = {row["date"]: row["close"] for row in silver_history}
    dates = sorted(set(gold) & set(silver))
    ratios = [gold[date] / silver[date] for date in dates if silver[date]]
    return ratios


def _ratio_rank(ratios: list[float], current: Optional[float]) -> Optional[float]:
    if not ratios or current is None:
        return None
    return percentile_rank(ratios[-252:], current)


def _spread_pct(price: Optional[float], base: Optional[float]) -> Optional[float]:
    return pct_change(price, base)


def collect(config: dict[str, Any], slot: str = "manual") -> dict[str, Any]:
    http_cfg = config.get("http", {})
    timeout = int(http_cfg.get("timeout", 20))
    retries = int(http_cfg.get("retries", 3))
    analysis_cfg = config.get("analysis", {})
    history_days = int(analysis_cfg.get("history_days", 260))
    rsi_period = int(analysis_cfg.get("rsi_period", 14))
    weights_cfg = analysis_cfg.get("weights") or DEFAULT_WEIGHTS
    thresholds = analysis_cfg.get("thresholds") or {}

    errors: list[str] = []

    codes, units = _collect_jijinhao_codes(config)
    quotes_jj: dict[str, Quote] = {}
    try:
        quotes_jj = jijinhao.fetch_quotes(codes, units=units, timeout=timeout, retries=retries)
    except Exception as exc:  # noqa: BLE001
        _error(errors, "金投网行情", exc)
    if codes and not quotes_jj:
        errors.append("金投网行情返回空数据")

    assets = analysis_cfg.get("assets", [])
    sina_symbols = sorted(
        {
            asset["live"]["symbol"]
            for asset in assets
            if (asset.get("live") or {}).get("source") == "sina"
        }
        | set(SINA_EXTRA_SYMBOLS)
    )
    tencent_codes = sorted(
        {
            item["code"] for item in config.get("stocks", []) + config.get("etfs", [])
        }
        | {
            asset["live"]["symbol"]
            for asset in assets
            if (asset.get("live") or {}).get("source") == "tencent"
        }
    )

    quotes_sina: dict[str, Quote] = {}
    try:
        quotes_sina = sina.fetch_quotes(sina_symbols, timeout=timeout, retries=retries)
    except Exception as exc:  # noqa: BLE001
        _error(errors, "新浪行情", exc)
    if sina_symbols and not quotes_sina:
        errors.append("新浪行情返回空数据")

    quotes_tencent: dict[str, Quote] = {}
    try:
        quotes_tencent = tencent.fetch_quotes(tencent_codes, timeout=timeout, retries=retries)
    except Exception as exc:  # noqa: BLE001
        _error(errors, "腾讯行情", exc)
    if tencent_codes and not quotes_tencent:
        errors.append("腾讯行情返回空数据")

    histories: dict[str, list[dict[str, Any]]] = {}
    for asset in assets:
        try:
            histories[asset["key"]] = _fetch_history(
                asset, max(history_days, 280), timeout, retries
            )
        except Exception as exc:  # noqa: BLE001
            histories[asset["key"]] = []
            _error(errors, f"历史数据 {asset.get('name', asset['key'])}", exc)

    # 金银比
    gold_hist = histories.get("au_intl", [])
    silver_hist = histories.get("ag_intl", [])
    ratio_history = _ratio_series(gold_hist, silver_hist)
    live_gold = quotes_sina.get("hf_GC")
    live_silver = quotes_sina.get("hf_SI")
    ratio_live: Optional[float] = None
    if live_gold and live_gold.price and live_silver and live_silver.price:
        ratio_live = live_gold.price / live_silver.price
    elif ratio_history:
        ratio_live = ratio_history[-1]
    ratio_rank = _ratio_rank(ratio_history, ratio_live)

    usdcny = quotes_sina.get("fx_susdcny")
    usdcny_value = usdcny.price if usdcny else None

    # 资产分析
    analyses = []
    for asset in assets:
        kind = asset.get("kind", "metal_gold")
        extra_ratio = ratio_live if kind in {"metal_gold", "metal_silver"} else None
        extra_rank = ratio_rank if kind in {"metal_gold", "metal_silver"} else None
        live = _asset_live(asset, quotes_sina, quotes_tencent)
        closes = [row["close"] for row in histories.get(asset["key"], [])]
        weight_key = "equity" if kind in {"equity", "fund"} else "metal"
        analysis = build_asset_analysis(
            asset,
            live,
            closes,
            ratio_rank=extra_rank,
            ratio_value=extra_ratio,
            weights=weights_cfg.get(weight_key),
            thresholds=thresholds,
            rsi_period=rsi_period,
        )
        if analysis:
            if asset["key"] in {"au_intl", "ag_intl"} and usdcny_value:
                analysis.metrics["cny_per_gram"] = (
                    (analysis.price or 0) * usdcny_value / OUNCE_IN_GRAM
                )
                if asset["key"] == "au_intl":
                    cn_price = quotes_sina.get("gds_AU9999")
                    if cn_price and cn_price.price:
                        analysis.metrics["internal_spread_pct"] = (
                            analysis.metrics["cny_per_gram"] / cn_price.price - 1
                        ) * 100
                else:
                    cn_price = quotes_sina.get("gds_AGTD")
                    if cn_price and cn_price.price:
                        analysis.metrics["internal_spread_pct"] = (
                            analysis.metrics["cny_per_gram"] * 1000 / cn_price.price - 1
                        ) * 100
            analyses.append(analysis)

    analysis_map = {item.key: item for item in analyses}

    # 基准价：Au99.99 / Ag(T+D)
    au_base = quotes_sina.get("gds_AU9999")
    ag_base = quotes_sina.get("gds_AGTD")
    recycle_quote = quotes_jj.get("JO_321453")

    # 金店
    brands_data = []
    jewelry_analyses = []
    brand_prices = []
    for brand in config.get("brands", []):
        gold_quote = quotes_jj.get(brand.get("gold", ""))
        platinum_quote = quotes_jj.get(brand.get("platinum", ""))
        premium_pct = (
            _spread_pct(gold_quote.price, au_base.price if au_base else None)
            if gold_quote
            else None
        )
        jewelry = None
        if gold_quote:
            brand_prices.append(gold_quote.price)
            jewelry = build_jewelry_analysis(
                f"jewelry_{brand['name']}",
                f"{brand['name']} 金饰",
                gold_quote,
                au_base,
                analysis_map.get("au_cn"),
                thresholds=thresholds,
                recycle_price=recycle_quote.price if recycle_quote else None,
            )
        brands_data.append(
            {
                "name": brand["name"],
                "gold": gold_quote.to_dict() if gold_quote else None,
                "platinum": platinum_quote.to_dict() if platinum_quote else None,
                "premium_pct": round(premium_pct, 2) if premium_pct is not None else None,
                "score": round(jewelry.score, 1) if jewelry else None,
                "rating": jewelry.rating if jewelry else "数据缺失",
            }
        )
        if jewelry:
            jewelry_analyses.append(jewelry)

    brand_avg = sum(brand_prices) / len(brand_prices) if brand_prices else None
    brand_premium = (
        (brand_avg / au_base.price - 1) * 100
        if brand_avg and au_base and au_base.price
        else None
    )

    # 银行纸贵金属
    banks_data = []
    for item in config.get("bank_paper", []):
        quote = quotes_jj.get(item["code"])
        spread = None
        if quote and quote.price and "人民币" in item["name"]:
            if item.get("metal") == "gold" and au_base:
                spread = _spread_pct(quote.price, au_base.price)
            elif item.get("metal") == "silver" and ag_base:
                # 银行纸白银报价为 元/克，上金所白银为 元/千克
                spread = _spread_pct(quote.price * 1000, ag_base.price)
        banks_data.append(
            {
                "name": item["name"],
                "metal": item.get("metal", ""),
                "quote": quote.to_dict() if quote else None,
                "spread_pct": round(spread, 2) if spread is not None else None,
            }
        )

    # 金条 / 回收
    bars_data = []
    for item in config.get("bars", []):
        quote = quotes_jj.get(item["code"])
        spread = None
        if quote and quote.price:
            if item.get("metal") == "gold" and au_base:
                spread = _spread_pct(quote.price, au_base.price)
            elif item.get("metal") == "silver" and ag_base:
                spread = _spread_pct(quote.price * 1000, ag_base.price)
        bars_data.append(
            {
                "name": item["name"],
                "metal": item.get("metal", ""),
                "type": item.get("type", "buy"),
                "quote": quote.to_dict() if quote else None,
                "spread_pct": round(spread, 2) if spread is not None else None,
            }
        )

    stocks_data = [
        {"name": item["name"], "quote": quotes_tencent.get(item["code"]).to_dict()
         if quotes_tencent.get(item["code"]) else None}
        for item in config.get("stocks", [])
    ]
    etfs_data = [
        {"name": item["name"], "quote": quotes_tencent.get(item["code"]).to_dict()
         if quotes_tencent.get(item["code"]) else None}
        for item in config.get("etfs", [])
    ]

    sge_items = [
        {
            "name": item["name"],
            "metal": item.get("metal", ""),
            "quote": quotes_jj.get(item["code"]).to_dict()
            if quotes_jj.get(item["code"])
            else None,
        }
        for item in config.get("sge", [])
    ]
    intl_items = [
        {
            "name": label,
            "symbol": symbol,
            "quote": quotes_sina.get(symbol).to_dict() if quotes_sina.get(symbol) else None,
        }
        for symbol, label in (
            ("hf_GC", "COMEX 黄金"),
            ("hf_SI", "COMEX 白银"),
            ("hf_XAU", "伦敦金现"),
            ("hf_XAG", "伦敦银现"),
        )
    ]

    now = now_cst()
    # 与上一次运行对比（用于日内提醒）
    previous_au = latest_price_from_history(DATA_DIR, "au_cn", offset=0)
    intraday = (
        (au_base.price / previous_au - 1) * 100
        if au_base and au_base.price and previous_au
        else None
    )

    best = max(
        (item for item in analyses if item.kind not in {"jewelry"}),
        key=lambda item: item.score,
        default=None,
    )

    snapshot = {
        "generated_at": now.isoformat(),
        "generated_at_display": now.strftime("%Y-%m-%d %H:%M:%S"),
        "date": now.strftime("%Y-%m-%d"),
        "slot": slot,
        "timezone": "Asia/Shanghai",
        "market": {
            "sge": sge_items,
            "intl": intl_items,
            "usdcny": usdcny.to_dict() if usdcny else None,
            "gold_silver_ratio": {
                "value": round(ratio_live, 2) if ratio_live is not None else None,
                "rank": round(ratio_rank, 1) if ratio_rank is not None else None,
            },
            "intraday_change_pct": round(intraday, 2) if intraday is not None else None,
        },
        "brands": brands_data,
        "brand_gold_avg": round(brand_avg, 2) if brand_avg else None,
        "brand_premium_pct": round(brand_premium, 2) if brand_premium is not None else None,
        "banks": banks_data,
        "bars": bars_data,
        "stocks": stocks_data,
        "etfs": etfs_data,
        "analyses": [item.to_dict() for item in analyses],
        "jewelry_analyses": [item.to_dict() for item in jewelry_analyses],
        "summary": {
            "best_asset_key": best.key if best else None,
            "best_asset_name": best.name if best else None,
            "best_asset_score": round(best.score, 1) if best else None,
            "best_asset_rating": best.rating if best else None,
        },
        "errors": errors,
    }
    return snapshot


def build_history_row(snapshot: dict[str, Any]) -> dict[str, Any]:
    analyses = {item["key"]: item for item in snapshot.get("analyses", [])}
    market = snapshot.get("market", {})

    def score(key: str) -> Any:
        return analyses.get(key, {}).get("score", "")

    return {
        "run_at": snapshot.get("generated_at", ""),
        "date": snapshot.get("date", ""),
        "slot": snapshot.get("slot", ""),
        "usdcny": (market.get("usdcny") or {}).get("price", ""),
        "au_cn": analyses.get("au_cn", {}).get("price", ""),
        "ag_cn": analyses.get("ag_cn", {}).get("price", ""),
        "au_intl": analyses.get("au_intl", {}).get("price", ""),
        "ag_intl": analyses.get("ag_intl", {}).get("price", ""),
        "gold_silver_ratio": (market.get("gold_silver_ratio") or {}).get("value", ""),
        "au_cn_score": score("au_cn"),
        "ag_cn_score": score("ag_cn"),
        "au_intl_score": score("au_intl"),
        "ag_intl_score": score("ag_intl"),
        "brand_gold_avg": snapshot.get("brand_gold_avg", ""),
        "brand_premium_pct": snapshot.get("brand_premium_pct", ""),
    }
