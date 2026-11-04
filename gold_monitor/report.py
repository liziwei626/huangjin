"""报告渲染（Markdown）。"""

from __future__ import annotations

from typing import Any, Optional

from .analysis import COMPONENT_LABELS

DISCLAIMER = "以上数据来自公开行情接口，可能存在延迟或误差，仅供参考，不构成投资建议。"


def _num(value: Optional[float], digits: Optional[int] = None) -> str:
    if value is None:
        return "—"
    if digits is None:
        abs_value = abs(value)
        if abs_value >= 10000:
            digits = 0
        elif abs_value >= 1:
            digits = 2
        else:
            digits = 3
    return f"{value:,.{digits}f}"


def _pct(value: Optional[float], digits: int = 2) -> str:
    if value is None:
        return "—"
    return f"{value:+.{digits}f}%"


def _plain_pct(value: Optional[float], digits: int = 1) -> str:
    if value is None:
        return "—"
    return f"{value:.{digits}f}%"


def _quote_price(quote: Optional[dict[str, Any]], digits: Optional[int] = None) -> str:
    if not quote or quote.get("price") is None:
        return "—"
    return _num(quote["price"], digits)


def _quote_change(quote: Optional[dict[str, Any]]) -> str:
    if not quote or quote.get("change_pct") is None:
        return "—"
    return _pct(quote["change_pct"])


def _quote_time(quote: Optional[dict[str, Any]]) -> str:
    if not quote:
        return "—"
    parts = [part for part in (quote.get("date"), quote.get("time")) if part]
    return " ".join(parts) or "—"


def _analysis_by_key(snapshot: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {item["key"]: item for item in snapshot.get("analyses", [])}


def _score_line(analysis: dict[str, Any]) -> str:
    return f"评分 **{analysis['score']:.1f} / 100** — {analysis['rating']}"


def _component_text(analysis: dict[str, Any], weights: dict[str, dict[str, float]]) -> str:
    weight_key = "equity" if analysis["kind"] in {"equity", "fund"} else "metal"
    weight_map = weights.get(weight_key, {})
    parts = []
    for key, value in analysis.get("components", {}).items():
        label = COMPONENT_LABELS.get(key, key)
        weight = weight_map.get(key)
        suffix = f"（权重 {weight:.0f}%）" if weight else ""
        parts.append(f"{label} {value:.0f}{suffix}")
    return "、".join(parts)


def _key_metrics_text(analysis: dict[str, Any]) -> str:
    metrics = analysis.get("metrics", {})
    unit = analysis.get("unit", "")
    parts: list[str] = []
    if metrics.get("ma20") is not None:
        parts.append(f"MA20 {_num(metrics['ma20'])}")
    if metrics.get("ma60") is not None:
        parts.append(f"MA60 {_num(metrics['ma60'])}")
    if metrics.get("rsi") is not None:
        parts.append(f"RSI {metrics['rsi']:.1f}")
    if metrics.get("pct_rank") is not None:
        parts.append(f"近一年分位 {metrics['pct_rank']:.0f}%")
    if metrics.get("chg20") is not None:
        parts.append(f"20日涨跌 {metrics['chg20']:+.1f}%")
    if metrics.get("vol20") is not None:
        parts.append(f"20日波动率 {metrics['vol20']:.2f}%")
    if metrics.get("vol_rank") is not None:
        parts.append(f"波动率分位 {metrics['vol_rank']:.0f}%")
    if metrics.get("ratio") is not None:
        ratio_text = f"金银比 {metrics['ratio']:.2f}"
        if metrics.get("ratio_rank") is not None:
            ratio_text += f"（历史分位 {metrics['ratio_rank']:.0f}%）"
        parts.append(ratio_text)
    if metrics.get("cny_per_gram") is not None:
        parts.append(f"折合 {_num(metrics['cny_per_gram'])} 元/克")
    if metrics.get("internal_spread_pct") is not None:
        parts.append(f"内外价差 {metrics['internal_spread_pct']:+.2f}%")
    if unit:
        parts.append(f"单位 {unit}")
    return "；".join(parts)


def _signals_text(analysis: dict[str, Any]) -> str:
    signals = analysis.get("signals") or []
    return "；".join(signals) if signals else "暂无突出信号"


def _conclusion(snapshot: dict[str, Any], analyses: dict[str, dict[str, Any]]) -> list[str]:
    lines: list[str] = []
    gold = analyses.get("au_cn")
    silver = analyses.get("ag_cn")
    jewelry = snapshot.get("jewelry_analyses") or []
    avg_premium = snapshot.get("brand_premium_pct")
    if gold:
        lines.append(f"- **国内黄金**：{gold['score']:.1f} 分，{gold['rating']}。{gold.get('timing', '')}")
    if silver:
        lines.append(f"- **国内白银**：{silver['score']:.1f} 分，{silver['rating']}。{silver.get('timing', '')}")
    if jewelry:
        cheapest = min(jewelry, key=lambda item: item.get("price") or float("inf"))
        cheapest_name = cheapest["name"].replace(" 金饰", "")
        rank = (gold or {}).get("metrics", {}).get("pct_rank")
        if rank is not None and rank <= 25:
            window = "金价处于近一年低位，刚需可以入手"
        elif rank is not None and rank <= 60:
            window = "金价位置中性，刚需可买但不建议囤货"
        else:
            window = "金价偏高，建议等回调或大促"
        if avg_premium is not None and avg_premium > 35:
            premium_hint = "品牌绝对溢价仍偏高，优先按克计价、把工费谈到 20-40 元/克，等克减/工费减免再下手"
        else:
            premium_hint = "品牌溢价相对温和，优先最低价门店"
        lines.append(
            f"- **实体金饰**：今日最低 {cheapest_name} {_num(cheapest.get('price'))} 元/克，"
            f"品牌均价溢价 {_plain_pct(avg_premium)}；{window}；{premium_hint}。"
        )
    stock = analyses.get("stock_sd")
    if stock:
        lines.append(
            f"- **黄金股（山东黄金）**：{stock['score']:.1f} 分，{stock['rating']}。"
            "股票弹性大，等金价企稳后再考虑，单只不超过总仓位 10%。"
        )
    best = snapshot.get("summary", {})
    if best.get("best_asset_name"):
        lines.append(
            f"- **相对最优**：{best['best_asset_name']}（{best['best_asset_score']:.1f} 分，"
            f"{best['best_asset_rating']}）。评分高不代表立刻满仓，仍需分批并设好止损。"
        )
    return lines


def _price_table(snapshot: dict[str, Any]) -> list[str]:
    lines = [
        "| 品种 | 最新价 | 涨跌 | 涨跌幅 | 更新时间 |",
        "| --- | --- | --- | --- | --- |",
    ]
    wanted = {"黄金9999(Au99.99)", "黄金T+D", "白银T+D"}
    for item in snapshot.get("market", {}).get("sge", []):
        if item["name"] not in wanted:
            continue
        quote = item.get("quote")
        lines.append(
            f"| {item['name']} | {_quote_price(quote)} {quote.get('unit', '') if quote else ''} | "
            f"{_num(quote.get('change') if quote else None)} | {_quote_change(quote)} | {_quote_time(quote)} |"
        )
    for item in snapshot.get("market", {}).get("intl", []):
        quote = item.get("quote")
        lines.append(
            f"| {item['name']} | {_quote_price(quote)} 美元/盎司 | "
            f"{_num(quote.get('change') if quote else None)} | {_quote_change(quote)} | {_quote_time(quote)} |"
        )
    usdcny = snapshot.get("market", {}).get("usdcny")
    lines.append(
        f"| 美元/人民币 | {_quote_price(usdcny, 4)} | — | — | {_quote_time(usdcny)} |"
    )
    ratio = snapshot.get("market", {}).get("gold_silver_ratio") or {}
    ratio_value_text = f"{ratio['value']:.2f}" if ratio.get("value") is not None else "—"
    ratio_rank_text = f"（历史分位 {ratio['rank']:.0f}%）" if ratio.get("rank") is not None else ""
    lines.append(f"| 金银比（COMEX） | {ratio_value_text} {ratio_rank_text} | — | — | — |")
    return lines


def _brands_table(snapshot: dict[str, Any]) -> list[str]:
    min_price = min(
        (
            item["gold"]["price"]
            for item in snapshot.get("brands", [])
            if item.get("gold") and item["gold"].get("price")
        ),
        default=None,
    )
    lines = [
        "| 品牌 | 黄金(元/克) | 涨跌 | 工费(元/克) | 比最低 |",
        "| --- | --- | --- | --- | --- |",
    ]
    brands = sorted(
        snapshot.get("brands", []),
        key=lambda item: (item.get("gold") or {}).get("price") or float("inf"),
    )
    for item in brands:
        gold = item.get("gold")
        gap = "—"
        if gold and gold.get("price") is not None and min_price is not None:
            diff = gold["price"] - min_price
            gap = "最低" if diff <= 0.01 else f"+{diff:.0f}"
        lines.append(
            f"| {item['name']} | {_quote_price(gold)} | {_quote_change(gold)} | "
            f"{item.get('labor_fee') or '—'} | {gap} |"
        )
    return lines


def _banks_table(snapshot: dict[str, Any]) -> list[str]:
    lines = [
        "| 品种 | 最新价 | 涨跌幅 | 对基准价差 |",
        "| --- | --- | --- | --- |",
    ]
    for item in snapshot.get("banks", []):
        quote = item.get("quote")
        spread = item.get("spread_pct")
        spread_text = f"{spread:+.2f}%" if spread is not None else "—"
        unit = quote.get("unit", "") if quote else ""
        lines.append(
            f"| {item['name']} | {_quote_price(quote)} {unit} | {_quote_change(quote)} | {spread_text} |"
        )
    return lines


def _bars_table(snapshot: dict[str, Any]) -> list[str]:
    lines = [
        "| 品种 | 最新价(元/克) | 涨跌幅 | 较基准价 |",
        "| --- | --- | --- | --- |",
    ]
    for item in snapshot.get("bars", []):
        quote = item.get("quote")
        spread = item.get("spread_pct")
        spread_text = f"{spread:+.2f}%" if spread is not None else "—"
        lines.append(
            f"| {item['name']} | {_quote_price(quote)} | {_quote_change(quote)} | {spread_text} |"
        )
    return lines


def _stocks_table(snapshot: dict[str, Any]) -> list[str]:
    lines = ["| 名称 | 代码 | 最新价 | 涨跌幅 |", "| --- | --- | --- | --- |"]
    for section in ("stocks", "etfs"):
        for item in snapshot.get(section, []):
            quote = item.get("quote")
            if not quote:
                continue
            lines.append(
                f"| {item['name']} | {quote.get('raw_code', '')} | "
                f"{_quote_price(quote)} {quote.get('unit', '')} | {_quote_change(quote)} |"
            )
    return lines


def _analysis_block(
    analysis: dict[str, Any],
    weights: dict[str, dict[str, float]],
    level: str = "###",
) -> list[str]:
    lines = [
        f"{level} {analysis['name']}（{_num(analysis.get('price'))} {analysis.get('unit', '')}）",
        f"- 结论：{_score_line(analysis)}",
        f"- 分项：{_component_text(analysis, weights)}",
        f"- 指标：{_key_metrics_text(analysis)}",
        f"- 信号：{_signals_text(analysis)}",
        f"- 何时买：{analysis.get('timing') or '—'}",
        f"- 怎么买：{analysis.get('advice') or '—'}",
        "",
    ]
    return lines


def render_markdown(snapshot: dict[str, Any], config: dict[str, Any]) -> str:
    slot_text = snapshot.get("slot_label") or snapshot.get("slot", "")
    lines: list[str] = []
    lines.append(f"# 黄金白银价格日报（{slot_text}）")
    lines.append("")
    lines.append(
        f"> 更新时间：{snapshot.get('generated_at_display')}（北京时间） · "
        f"数据源：新浪财经 / 今日金价网 / 金投网 / 腾讯证券"
    )
    if snapshot.get("errors"):
        lines.append(f"> ⚠️ 部分数据抓取失败：{'；'.join(snapshot['errors'])}")
    lines.append("")
    lines.append("## 一、黄金白银价格")
    lines.append("")
    lines.extend(_price_table(snapshot))
    lines.append("")
    lines.append("## 二、金店黄金价（14 家主流品牌）")
    lines.append("")
    lines.extend(_brands_table(snapshot))
    lines.append("")
    brands = [
        item
        for item in snapshot.get("brands", [])
        if item.get("gold") and item["gold"].get("price")
    ]
    if brands:
        cheapest = min(brands, key=lambda item: item["gold"]["price"])
        highest = max(brands, key=lambda item: item["gold"]["price"])
        top_price = highest["gold"]["price"]
        top_count = sum(
            1
            for item in brands
            if abs(item["gold"]["price"] - top_price) <= 0.01
        )
        highest_text = (
            f"{_quote_price(highest['gold'])} 元/克（{top_count} 家）"
            if top_count > 1
            else f"{highest['name']} {_quote_price(highest['gold'])} 元/克"
        )
        lines.append(
            f"> 最低：**{cheapest['name']} {_quote_price(cheapest['gold'])} 元/克**；"
            f"最高：**{highest_text}**；"
            f"均价 {_num(snapshot.get('brand_gold_avg'))} 元/克，"
            f"较 Au99.99 溢价 {_plain_pct(snapshot.get('brand_premium_pct'))}。"
        )
    lines.append("")
    lines.append("> 品牌银饰通常按件计价并另收工费，无统一克价；银价参考上金所白银 T+D、银行纸白银与国际白银。")
    lines.append("")
    lines.append("## 三、银行纸贵金属")
    lines.append("")
    lines.extend(_banks_table(snapshot))
    lines.append("")
    lines.append("## 四、投资金条与回收")
    lines.append("")
    lines.extend(_bars_table(snapshot))
    lines.append("")
    lines.append("## 五、黄金/白银/珠宝股票与 ETF")
    lines.append("")
    lines.extend(_stocks_table(snapshot))
    lines.append("")
    lines.append("## 六、购买提示")
    lines.append("")
    lines.append(
        "- 金饰只买按克计价，不买一口价/按件计价；工费尽量谈到 20-40 元/克。\n"
        "- 同城比价，优先当日最低价品牌；关注双11、店庆、春节前的克减和工费减免。\n"
        "- 金饰回收按原料价折价，品牌溢价不保值；刚需可买，不必囤货。"
    )
    lines.append("")
    lines.append("## 数据说明")
    lines.append("")
    lines.append(
        "- 国内基准：上海黄金交易所 Au99.99、Ag(T+D)；国际：COMEX 黄金/白银、伦敦金/银。\n"
        "- 金店价格为品牌饰品挂牌价，工费另计；银行价格多为纸贵金属买卖报价。\n"
        "- 金价低于 600 元/克时触发紧急通知；数据仅供参考，不构成投资建议。"
    )
    lines.append("")
    lines.append(f"> {DISCLAIMER}")
    lines.append("")
    return "\n".join(lines)


def render_push(snapshot: dict[str, Any]) -> tuple[str, str]:
    market = snapshot.get("market", {})
    sge = {item["name"]: item.get("quote") for item in market.get("sge", [])}
    au = sge.get("黄金9999(Au99.99)")
    ag = sge.get("白银T+D")
    intl = {item["name"]: item.get("quote") for item in market.get("intl", [])}
    intl_gold = intl.get("COMEX 黄金")
    intl_silver = intl.get("COMEX 白银")
    ratio = market.get("gold_silver_ratio") or {}
    banks = {item["name"]: item.get("quote") for item in snapshot.get("banks", [])}
    stocks = {item["name"]: item.get("quote") for item in snapshot.get("stocks", [])}
    title = (
        f"金银价格 {snapshot.get('date', '')} "
        f"金 {_num(au.get('price') if au else None)} "
        f"银 {_num(ag.get('price') if ag else None)}"
    )
    slot_text = snapshot.get("slot_label") or snapshot.get("slot", "")
    lines = [
        f"## 黄金白银价格（{snapshot.get('date', '')} {slot_text}）",
        "",
        f"**黄金** Au99.99 **{_quote_price(au)} 元/克**（{_quote_change(au)}）"
        f"｜COMEX {_quote_price(intl_gold)} 美元/盎司（{_quote_change(intl_gold)}）",
        f"**白银** Ag(T+D) **{_quote_price(ag)} 元/千克**（{_quote_change(ag)}）"
        f"｜COMEX {_quote_price(intl_silver)} 美元/盎司（{_quote_change(intl_silver)}）",
        f"金银比 **{ratio.get('value', '—')}**"
        + (f"（近一年 {ratio['rank']:.0f}% 分位）" if ratio.get("rank") is not None else ""),
        f"银行：工行纸黄金 {_quote_price(banks.get('工行纸黄金(人民币)'))} 元/克"
        f"｜纸白银 {_quote_price(banks.get('工行纸白银(人民币)'))} 元/克",
    ]
    stock_parts = []
    for name in ("山东黄金", "紫金矿业", "盛达资源", "周大福"):
        quote = stocks.get(name)
        if quote:
            stock_parts.append(f"{name} {_quote_price(quote)}（{_quote_change(quote)}）")
    if stock_parts:
        lines.append("股票：" + "｜".join(stock_parts))
    lines.append("")

    brands = sorted(
        [
            item
            for item in snapshot.get("brands", [])
            if item.get("gold") and item["gold"].get("price")
        ],
        key=lambda item: item["gold"]["price"],
    )
    if brands:
        lines.append("### 金店黄金价（元/克，从低到高）")
        parts = []
        cheapest = brands[0]["gold"]["price"]
        for item in brands:
            price = item["gold"]["price"]
            label = f"{item['name']} {price:,.0f}"
            if abs(price - cheapest) <= 0.01:
                label += "（最低）"
            parts.append(label)
        for start in range(0, len(parts), 4):
            lines.append("｜".join(parts[start : start + 4]))
        avg = snapshot.get("brand_gold_avg")
        premium = snapshot.get("brand_premium_pct")
        if avg and premium is not None:
            lines.append(
                f"> 14 家均价 **{avg:,.0f} 元/克**，较 Au99.99 溢价 **{premium:.1f}%**；工费另计。"
            )
        lines.append("")
        lines.append(
            "> 只买按克计价，不买一口价；工费谈到 20-40 元/克，关注克减/工费减免。"
            "银饰多按件计价，银价参考上金所与银行纸白银。"
        )
    lines.append("")
    lines.append("> 金价（Au99.99）低于 **600 元/克** 时触发紧急通知。")
    lines.append("")
    lines.append(f"> {DISCLAIMER}")
    return title[:100], "\n".join(lines)
