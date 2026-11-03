"""报告渲染（Markdown）。"""

from __future__ import annotations

from typing import Any, Optional

from .analysis import COMPONENT_LABELS

DISCLAIMER = "以上数据来自公开行情接口，可能存在延迟或误差；评分仅为量化参考，不构成投资建议，据此操作风险自负。"


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
        best_jewelry = max(jewelry, key=lambda item: item["score"])
        lines.append(
            f"- **金店饰品**：品牌金价均价 {_num(snapshot.get('brand_gold_avg'))} 元/克，"
            f"较 Au99.99 溢价 {_plain_pct(avg_premium)}；最高评分 "
            f"{best_jewelry['name']} {best_jewelry['score']:.1f} 分（{best_jewelry['rating']}）。"
            "金饰是消费不是投资，溢价高时不建议买入。"
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
    lines = [
        "| 品牌 | 黄金(元/克) | 涨跌幅 | 铂金(元/克) | 较基准溢价 | 评分 | 建议 |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for item in snapshot.get("brands", []):
        gold = item.get("gold")
        platinum = item.get("platinum")
        spread = item.get("premium_pct")
        spread_text = f"{spread:+.1f}%" if spread is not None else "—"
        score = f"{item['score']:.1f}" if item.get("score") is not None else "—"
        lines.append(
            f"| {item['name']} | {_quote_price(gold)} | {_quote_change(gold)} | "
            f"{_quote_price(platinum)} | {spread_text} | {score} | {item.get('rating', '—')} |"
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
    weights = config.get("analysis", {}).get("weights", {})
    analyses = _analysis_by_key(snapshot)
    slot_text = snapshot.get("slot_label") or snapshot.get("slot", "")
    lines: list[str] = []
    lines.append(f"# 黄金白银价格与买入时机日报（{slot_text}）")
    lines.append("")
    lines.append(
        f"> 更新时间：{snapshot.get('generated_at_display')}（北京时间） · "
        f"数据源：新浪财经 / 金投网 / 腾讯证券"
    )
    if snapshot.get("errors"):
        lines.append(f"> ⚠️ 部分数据抓取失败：{'；'.join(snapshot['errors'])}")
    lines.append("")
    lines.append("## 一、行情速览")
    lines.append("")
    lines.extend(_price_table(snapshot))
    lines.append("")
    lines.append("## 二、结论与买点")
    lines.append("")
    lines.extend(_conclusion(snapshot, analyses))
    lines.append("")
    lines.append("## 三、金店饰品价格")
    lines.append("")
    lines.extend(_brands_table(snapshot))
    lines.append("")
    lines.append("> 品牌银饰通常按件计价并另收工费，无统一克价，白银价格请参考上金所、银行纸白银与国际白银。")
    lines.append("")
    lines.append("## 四、银行纸贵金属")
    lines.append("")
    lines.extend(_banks_table(snapshot))
    lines.append("")
    lines.append("## 五、投资金条与回收")
    lines.append("")
    lines.extend(_bars_table(snapshot))
    lines.append("")
    lines.append("## 六、黄金股票与 ETF")
    lines.append("")
    lines.extend(_stocks_table(snapshot))
    lines.append("")
    lines.append("## 七、买入时机评分（核心标的）")
    lines.append("")
    for key in ("au_cn", "ag_cn", "au_intl", "ag_intl", "stock_sd", "etf_gold"):
        analysis = analyses.get(key)
        if analysis:
            lines.extend(_analysis_block(analysis, weights))
    if snapshot.get("jewelry_analyses"):
        lines.append("## 八、金店饰品怎么买")
        lines.append("")
        for item in snapshot["jewelry_analyses"]:
            lines.append(
                f"- **{item['name']}**：评分 {item['score']:.1f}（{item['rating']}）；"
                f"{item.get('timing', '')}"
            )
        lines.append("")
    lines.append("## 九、操作纪律")
    lines.append("")
    lines.append(
        "- 分批而不是一次满仓：把计划资金分成 3-5 份，首次最多 30%，越跌越买要设总仓位上限。\n"
        "- 不追高：RSI > 70 或价格处于近一年 80% 分位以上时暂停买入。\n"
        "- 不梭哈金饰：金饰溢价通常 20%-40%，回收按原料价折价，品牌溢价无法收回。\n"
        "- 设止损/止盈：短线跌破买入价 8%-10% 或金价趋势破位时减仓；长期配置可按季度再平衡。\n"
        "- 关注信号：美联储利率决议、美元指数、实际利率、央行购金、地缘风险。"
    )
    lines.append("")
    lines.append("## 数据说明")
    lines.append("")
    lines.append(
        "- 国内基准：上海黄金交易所 Au99.99、Ag(T+D)；国际：COMEX 黄金/白银、伦敦金/银。\n"
        "- 金店价格为品牌饰品挂牌价，含工费与品牌溢价；银行价格多为纸贵金属买卖报价。\n"
        "- 评分由价格分位、RSI、均线趋势、金银比、波动率、20 日动能加权得出，仅用于横向比较。"
    )
    lines.append("")
    lines.append(f"> {DISCLAIMER}")
    lines.append("")
    return "\n".join(lines)


def render_push(snapshot: dict[str, Any]) -> tuple[str, str]:
    analyses = _analysis_by_key(snapshot)
    market = snapshot.get("market", {})
    sge = {item["name"]: item.get("quote") for item in market.get("sge", [])}
    au = sge.get("黄金9999(Au99.99)")
    ag = sge.get("白银T+D")
    intl_gold = next(
        (item.get("quote") for item in market.get("intl", []) if item["name"] == "COMEX 黄金"),
        None,
    )
    ratio = market.get("gold_silver_ratio") or {}
    gold = analyses.get("au_cn")
    silver = analyses.get("ag_cn")
    title = (
        f"金银日报 {snapshot.get('date', '')} "
        f"金 {_num(au.get('price') if au else None)} "
        f"银 {_num(ag.get('price') if ag else None)}"
    )
    slot_text = snapshot.get("slot_label") or snapshot.get("slot", "")
    lines = [
        f"## 黄金白银提醒（{snapshot.get('date', '')} {slot_text}）",
        "",
        f"- 国内黄金 Au99.99：**{_quote_price(au)} 元/克**（{_quote_change(au)}）",
        f"- 白银 T+D：**{_quote_price(ag)} 元/千克**（{_quote_change(ag)}）",
        f"- COMEX 黄金：{_quote_price(intl_gold)} 美元/盎司（{_quote_change(intl_gold)}）",
        f"- 金银比：{ratio.get('value', '—')}"
        + (f"（历史分位 {ratio['rank']:.0f}%）" if ratio.get("rank") is not None else ""),
        "",
        "### 买点评分",
    ]
    for label, item in (("黄金", gold), ("白银", silver)):
        if item:
            lines.append(f"- {label}：**{item['score']:.1f} 分**，{item['rating']}")
            if item.get("signals"):
                lines.append(f"  - 信号：{'；'.join(item['signals'][:2])}")
    if snapshot.get("brand_gold_avg"):
        lines.append(
            f"- 金店均价：{_num(snapshot['brand_gold_avg'])} 元/克，"
            f"较基准溢价 {_plain_pct(snapshot.get('brand_premium_pct'))}"
        )
    lines.append("")
    lines.append("### 操作提示")
    if gold:
        lines.append(f"- 黄金：{gold.get('timing', '')}")
    if silver:
        lines.append(f"- 白银：{silver.get('timing', '')}")
    lines.append("- 分批买入，不追高；金饰溢价高，不适合作为投资。")
    lines.append("")
    lines.append(f"> {DISCLAIMER}")
    return title[:100], "\n".join(lines)
