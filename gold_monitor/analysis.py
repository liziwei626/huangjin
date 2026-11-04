"""指标计算、买入评分与操作建议。"""

from __future__ import annotations

import statistics
from typing import Any, Optional

from .models import Analysis, Quote
from .util import clamp, fmt_pct, fmt_price, percentile_rank, price_quantile, stdev

DEFAULT_WEIGHTS = {
    "metal": {"valuation": 30, "rsi": 24, "trend": 16, "ratio": 12, "volatility": 8, "momentum": 10},
    "equity": {"valuation": 30, "rsi": 25, "trend": 20, "volatility": 10, "momentum": 15},
}

COMPONENT_LABELS = {
    "valuation": "价格位置（低者优）",
    "rsi": "RSI（低者优）",
    "trend": "均线趋势",
    "ratio": "金银比",
    "premium": "绝对溢价（低者优）",
    "gold_position": "金价位置（低者优）",
    "price_advantage": "同城比价（低者优）",
    "volatility": "波动率（低者优）",
    "momentum": "20日动能",
}


def compute_rsi(closes: list[float], period: int = 14) -> Optional[float]:
    if len(closes) < period + 1:
        return None
    deltas = [closes[index] - closes[index - 1] for index in range(1, len(closes))]
    gains = [max(delta, 0.0) for delta in deltas]
    losses = [max(-delta, 0.0) for delta in deltas]
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    for index in range(period, len(deltas)):
        avg_gain = (avg_gain * (period - 1) + gains[index]) / period
        avg_loss = (avg_loss * (period - 1) + losses[index]) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return 100 - 100 / (1 + rs)


def _rolling_vol(returns: list[float], window: int = 20) -> list[float]:
    values: list[float] = []
    for end in range(window, len(returns) + 1):
        chunk = returns[end - window : end]
        vol = stdev(chunk)
        if vol is not None:
            values.append(vol * 100)
    return values


def compute_indicators(closes: list[float], rsi_period: int = 14) -> dict[str, Any]:
    if len(closes) < 30:
        return {}
    last = closes[-1]
    window = closes[-252:]
    ma20 = statistics.fmean(closes[-20:]) if len(closes) >= 20 else None
    ma60 = statistics.fmean(closes[-60:]) if len(closes) >= 60 else None
    returns = [
        closes[index] / closes[index - 1] - 1
        for index in range(1, len(closes))
        if closes[index - 1]
    ]
    vol_20 = stdev(returns[-20:]) if len(returns) >= 20 else None
    current_vol = vol_20 * 100 if vol_20 else None
    vol_series = _rolling_vol(returns, 20)[-252:]
    vol_rank = percentile_rank(vol_series, current_vol) if current_vol is not None else None
    chg20 = (closes[-1] / closes[-21] - 1) * 100 if len(closes) >= 21 else None
    high_252 = max(window)
    low_252 = min(window)
    return {
        "last": last,
        "ma20": ma20,
        "ma60": ma60,
        "rsi": compute_rsi(closes, rsi_period),
        "pct_rank": percentile_rank(window, last),
        "vol20": current_vol,
        "vol_rank": vol_rank,
        "chg20": chg20,
        "high252": high_252,
        "low252": low_252,
        "q20": price_quantile(window, 0.20),
        "q80": price_quantile(window, 0.80),
        "drawdown": (last / high_252 - 1) * 100 if high_252 else None,
        "samples": len(window),
    }


def rsi_score(rsi: Optional[float]) -> float:
    if rsi is None:
        return 50.0
    if rsi <= 20:
        return 100.0
    if rsi <= 30:
        return 100 - (rsi - 20) * 2
    if rsi <= 40:
        return 80 - (rsi - 30) * 1.5
    if rsi <= 55:
        return 65 - (rsi - 40)
    if rsi <= 70:
        return 50 - (rsi - 55) * 2
    return clamp(20 - (rsi - 70) * 1.33)


def trend_score(price: Optional[float], ma20: Optional[float], ma60: Optional[float]) -> float:
    if price is None or ma20 is None or ma60 is None:
        return 50.0
    if price > ma20 and price > ma60:
        return 100.0
    if price > ma20:
        return 70.0
    if price > ma60:
        return 55.0
    return 25.0


def momentum_score(chg20: Optional[float]) -> float:
    if chg20 is None:
        return 50.0
    return clamp(50 + chg20 * 3)


def weighted_score(components: dict[str, float], weights: dict[str, float]) -> float:
    available = {key: weights[key] for key in weights if key in components}
    total = sum(available.values())
    if not total:
        return 50.0
    return sum(components[key] * weight for key, weight in available.items()) / total


def rating_for(score: float, thresholds: dict[str, float]) -> str:
    if score >= thresholds.get("strong", 75):
        return "强烈建议分批买入"
    if score >= thresholds.get("buy", 65):
        return "适合分批买入"
    if score >= thresholds.get("small", 55):
        return "可小仓位试买"
    if score >= thresholds.get("watch", 45):
        return "观望"
    return "暂不建议买入"


def _signals(
    kind: str,
    metrics: dict[str, Any],
    ratio_rank: Optional[float],
    premium_pct: Optional[float] = None,
) -> list[str]:
    signals: list[str] = []
    rank = metrics.get("pct_rank")
    rsi = metrics.get("rsi")
    if rank is not None and rank <= 20:
        signals.append(f"价格处于近一年低位（分位 {rank:.0f}%）")
    elif rank is not None and rank >= 80:
        signals.append(f"价格处于近一年高位（分位 {rank:.0f}%）")
    if rsi is not None and rsi <= 30:
        signals.append(f"RSI 超卖（{rsi:.1f}）")
    elif rsi is not None and rsi >= 70:
        signals.append(f"RSI 超买（{rsi:.1f}）")
    price = metrics.get("last")
    ma20 = metrics.get("ma20")
    ma60 = metrics.get("ma60")
    if price is not None and ma20 is not None and ma60 is not None:
        if price > ma20 and price > ma60:
            signals.append("价格位于 MA20、MA60 上方，趋势偏强")
        elif price < ma20 and price < ma60:
            signals.append("价格位于 MA20、MA60 下方，趋势偏弱")
    vol_rank = metrics.get("vol_rank")
    if vol_rank is not None and vol_rank >= 80:
        signals.append(f"波动率处于近一年高位（分位 {vol_rank:.0f}%）")
    chg20 = metrics.get("chg20")
    if chg20 is not None and chg20 <= -10:
        signals.append(f"近 20 日跌幅 {chg20:.1f}%，下跌动能较强")
    ratio_value = metrics.get("ratio")
    if ratio_rank is not None and ratio_value is not None:
        if kind == "metal_gold" and ratio_rank >= 85:
            signals.append(f"金银比 {ratio_value:.1f}，处于历史高位，黄金相对白银偏贵")
        elif kind == "metal_silver" and ratio_rank >= 85:
            signals.append(f"金银比 {ratio_value:.1f}，处于历史高位，白银相对黄金便宜")
        elif kind == "metal_silver" and ratio_rank <= 15:
            signals.append(f"金银比 {ratio_value:.1f}，处于历史低位，白银相对黄金偏贵")
    if premium_pct is not None and premium_pct >= 25:
        signals.append(f"品牌金价较基准溢价 {premium_pct:.1f}%，不适合作为投资")
    return signals


def _metal_timing(analysis: Analysis, metrics: dict[str, Any], thresholds: dict[str, float]) -> str:
    unit = analysis.unit
    q20 = metrics.get("q20")
    q80 = metrics.get("q80")
    ma20 = metrics.get("ma20")
    ma60 = metrics.get("ma60")
    price = metrics.get("last")
    level_text = (
        f"MA20 {fmt_price(ma20)}、MA60 {fmt_price(ma60)}、"
        f"近一年 20% 分位 {fmt_price(q20)}、80% 分位 {fmt_price(q80)}（{unit}）"
    )
    below_ma20 = bool(price and ma20 and price < ma20)
    buy_line = thresholds.get("buy", 65)
    if analysis.score >= buy_line:
        if below_ma20:
            action = (
                "评分已进入分批区间，但价格仍在 MA20 下方：先建计划仓位的 20%-30% 试仓，"
                "等重新站上 MA20 后再补 30%，剩余仓位等 RSI 回升至 50 上方确认趋势。"
            )
        else:
            action = (
                "评分已进入分批区间：先建计划仓位的 30%，回踩 MA20 不破再补 30%，"
                "剩余仓位等趋势确认（RSI 回升至 50 上方）后补齐。"
            )
    elif analysis.score >= thresholds.get("small", 55):
        action = (
            "可小仓位试买（不超过计划仓位 20%）。加仓需满足其中两项：评分升至 65 以上、"
            "价格重新站上 MA20、RSI 回升至 40 上方；若继续跌破近一年低点则暂停加仓。"
        )
    else:
        action = (
            "暂不买入，等待以下任一条件：价格回到近一年 20% 分位附近、RSI 跌至 35 以下，"
            "或价格重新站上 MA20 且评分回升至 65 以上。"
        )
    return f"{level_text}。{action} RSI>70 或价格分位>85% 时不要追高。"


def _advice_for(kind: str) -> str:
    if kind == "metal_gold":
        return (
            "买入方式（按费率从低到高）：①银行积存金/纸黄金（工行、中行、建行等，按克买，点差较低）；"
            "②黄金 ETF（518880、159934 等，场内按份买，费率低、紧跟金价）；"
            "③上金所 Au99.99（需开通贵金属账户）；④银行投资金条（如意、龙鼎、传世之宝），"
            "注意回购折价与工费。金饰溢价高，不适合投资。"
        )
    if kind == "metal_silver":
        return (
            "买入方式：①银行纸白银（工行、中行、建行，门槛低）；②白银 T+D（带杠杆，新手不要碰）；"
            "③白银 LOF（161226，场外/场内均可）。白银波动约为黄金的 1.5-2 倍，"
            "仓位控制在黄金的一半以内，分批买入。"
        )
    if kind == "equity":
        return (
            "买入方式：股票账户直接买入，优选矿端成本低、产量稳定的龙头；单只不超过总仓位 10%，"
            "分 3 次建仓。黄金股弹性大，但会受大盘、成本、汇率影响，等金价企稳后再买更稳。"
        )
    if kind == "fund":
        return (
            "买入方式：场内按份买入黄金 ETF，费率低、跟踪误差小；避免在溢价明显时买入，"
            "可分批定投。"
        )
    if kind == "jewelry":
        return (
            "金饰是消费品，不是投资品。刚需购买优先选按克计价、工费低、有促销的门店；"
            "投资请选金条、积存金或黄金 ETF，回收时按原料金价折价，品牌溢价无法收回。"
        )
    return ""


def build_asset_analysis(
    asset: dict[str, Any],
    live: Optional[Quote],
    closes: list[float],
    *,
    ratio_rank: Optional[float] = None,
    ratio_value: Optional[float] = None,
    weights: Optional[dict[str, float]] = None,
    thresholds: Optional[dict[str, float]] = None,
    rsi_period: int = 14,
) -> Optional[Analysis]:
    thresholds = thresholds or {}
    metrics = compute_indicators(closes, rsi_period)
    if not metrics:
        return None
    if live and live.price is not None:
        metrics["last"] = live.price
        metrics["change_pct"] = live.change_pct
    kind = asset.get("kind", "metal_gold")
    weight_set = weights or DEFAULT_WEIGHTS["equity" if kind in {"equity", "fund"} else "metal"]
    if kind in {"metal_gold", "metal_silver"}:
        weight_set = weight_set or DEFAULT_WEIGHTS["metal"]
    else:
        weight_set = weight_set or DEFAULT_WEIGHTS["equity"]

    components: dict[str, float] = {
        "valuation": 100 - metrics["pct_rank"] if metrics.get("pct_rank") is not None else 50,
        "rsi": rsi_score(metrics.get("rsi")),
        "trend": trend_score(metrics.get("last"), metrics.get("ma20"), metrics.get("ma60")),
        "volatility": 100 - metrics["vol_rank"] if metrics.get("vol_rank") is not None else 50,
        "momentum": momentum_score(metrics.get("chg20")),
    }
    if kind in {"metal_gold", "metal_silver"}:
        if ratio_rank is None:
            components["ratio"] = 50.0
        elif kind == "metal_gold":
            components["ratio"] = 100 - ratio_rank
        else:
            components["ratio"] = ratio_rank
    metrics["ratio"] = ratio_value
    metrics["ratio_rank"] = ratio_rank

    score = weighted_score(components, weight_set)
    rating = rating_for(score, thresholds)
    analysis = Analysis(
        key=asset["key"],
        name=asset.get("name", asset["key"]),
        kind=kind,
        price=metrics.get("last"),
        unit=asset.get("unit", live.unit if live else ""),
        score=score,
        rating=rating,
        components=components,
        metrics=metrics,
        signals=_signals(kind, metrics, ratio_rank),
        advice=_advice_for(kind),
    )
    if kind in {"metal_gold", "metal_silver"}:
        analysis.timing = _metal_timing(analysis, metrics, thresholds)
    elif kind in {"equity", "fund"}:
        analysis.timing = (
            f"关键价位：MA20 {fmt_price(metrics.get('ma20'))}、MA60 {fmt_price(metrics.get('ma60'))}、"
            f"近一年 20% 分位 {fmt_price(metrics.get('q20'))}、80% 分位 {fmt_price(metrics.get('q80'))}"
            f"（{analysis.unit}）。"
        )
        price = metrics.get("last")
        ma20 = metrics.get("ma20")
        if analysis.score >= thresholds.get("buy", 65):
            if price and ma20 and price < ma20:
                analysis.timing += (
                    "评分已达分批区间，但价格仍在 MA20 下方：可先建 1/3 试仓，"
                    "等重新站上 MA20 后再补；跌破近一年低点则减仓。"
                )
            else:
                analysis.timing += "评分已达分批区间，可先建 1/3 仓位，回踩 MA20 不破再补。"
        else:
            analysis.timing += (
                "暂不急于买入，等金价 RSI 回到 40 上方、股价重新站上 MA20 后再分批。"
            )
    return analysis


def build_jewelry_analysis(
    key: str,
    name: str,
    brand_quote: Quote,
    base_quote: Optional[Quote],
    gold_analysis: Optional[Analysis],
    *,
    thresholds: Optional[dict[str, float]] = None,
    recycle_price: Optional[float] = None,
    min_brand_price: Optional[float] = None,
    avg_premium_pct: Optional[float] = None,
) -> Optional[Analysis]:
    if brand_quote.price is None:
        return None
    base_price = base_quote.price if base_quote else None
    premium_pct = (
        (brand_quote.price / base_price - 1) * 100
        if base_price and base_price > 0
        else None
    )
    gold_metrics = gold_analysis.metrics if gold_analysis else {}
    pct_rank = gold_metrics.get("pct_rank")
    rsi = gold_metrics.get("rsi")
    gold_position = (
        100 - pct_rank
        if pct_rank is not None
        else (gold_analysis.score if gold_analysis else 50.0)
    )
    price_gap = (
        brand_quote.price - min_brand_price
        if min_brand_price is not None and brand_quote.price is not None
        else 0.0
    )
    price_component = clamp(100 - max(0.0, price_gap) * 2.0, 0, 100)
    premium_component = (
        clamp(100 - max(0.0, premium_pct - 30) * 6, 0, 100)
        if premium_pct is not None
        else 50.0
    )
    high_premium_penalty = -8.0 if avg_premium_pct and avg_premium_pct > 35 else 0.0
    score = clamp(
        gold_position * 0.55
        + price_component * 0.20
        + premium_component * 0.25
        + high_premium_penalty
    )
    metrics = {
        "last": brand_quote.price,
        "base_price": base_price,
        "premium_pct": premium_pct,
        "recycle_price": recycle_price,
        "gold_pct_rank": pct_rank,
        "gold_rsi": rsi,
        "brand_min_price": min_brand_price,
        "brand_price_gap": price_gap,
        "avg_premium_pct": avg_premium_pct,
        "change_pct": brand_quote.change_pct,
    }
    components = {
        "gold_position": gold_position,
        "price_advantage": price_component,
        "premium": premium_component,
    }

    if score >= 75 and price_gap <= 0.01:
        rating = "适合入手，今日最低价"
    elif score >= 65:
        rating = "可以入手，优先低价品牌"
    elif score >= 55:
        rating = "刚需可买，不建议囤货"
    elif score >= 45:
        rating = "等促销或金价回调"
    else:
        rating = "暂缓，等金价回落"

    signals = []
    if pct_rank is not None and pct_rank <= 25:
        signals.append(f"金价处于近一年低位（分位 {pct_rank:.0f}%），适合关注实体金饰")
    elif pct_rank is not None and pct_rank >= 75:
        signals.append(f"金价处于近一年高位（分位 {pct_rank:.0f}%）")
    if min_brand_price is not None:
        if price_gap <= 0.01:
            signals.append("今日主要金店最低报价")
        elif price_gap <= 3:
            signals.append(f"接近最低价（高 {fmt_price(price_gap, 0)} 元/克）")
        elif price_gap >= 10:
            signals.append(f"比最低价高 {fmt_price(price_gap, 0)} 元/克")
    if premium_pct is not None and premium_pct >= 40:
        signals.append(f"绝对溢价 {premium_pct:.1f}%，偏高，等克减/工费活动")
    elif premium_pct is not None and premium_pct <= 30:
        signals.append(f"绝对溢价 {premium_pct:.1f}%，相对温和")
    if rsi is not None and rsi <= 30:
        signals.append("金价 RSI 超卖，刚需可关注入手机会")

    timing = (
        f"品牌金价 {fmt_price(brand_quote.price)} 元/克，较 Au99.99 基准 "
        f"{fmt_price(base_price)} 元/克溢价 {fmt_pct(premium_pct, 1, sign=False)}"
    )
    if price_gap > 0.01:
        timing += f"，比今日最低报价高 {fmt_price(price_gap, 0)} 元/克"
    else:
        timing += "，为今日主要金店最低报价"
    if recycle_price:
        timing += f"；回收价约 {fmt_price(recycle_price)} 元/克"
    if pct_rank is not None and pct_rank <= 25:
        timing += "。金价处于近一年低位，刚需可以入手"
    elif pct_rank is not None and pct_rank <= 60:
        timing += "。金价位置中性，刚需可买但不建议囤货"
    else:
        timing += "。金价偏高，建议等回调或大促"
    if avg_premium_pct and avg_premium_pct > 35:
        timing += "；品牌绝对溢价仍偏高，优先按克计价、把工费谈到 20-40 元/克，等克减/工费减免再下手。"
    else:
        timing += "；优先按克计价、工费可谈，关注门店克减活动。"
    timing += "金饰回收按原料价折价，溢价部分不保值。"

    return Analysis(
        key=key,
        name=name,
        kind="jewelry",
        price=brand_quote.price,
        unit="元/克",
        score=score,
        rating=rating,
        components=components,
        metrics=metrics,
        signals=signals,
        advice=_advice_for("jewelry"),
        timing=timing,
    )
