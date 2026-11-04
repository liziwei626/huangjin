"""今日金价网（cngolddaily.com）品牌金店报价。"""

from __future__ import annotations

import html as html_lib
import re
from typing import Optional

from ..models import Quote
from ..util import http_get, now_cst, to_float

BRANDS_URL = "https://cngolddaily.com/brands"


def _text_lines(text: str) -> list[str]:
    text = re.sub(r"<script.*?</script>", "", text, flags=re.S)
    text = re.sub(r"<style.*?</style>", "", text, flags=re.S)
    text = re.sub(r"<[^>]+>", "\n", text)
    text = html_lib.unescape(text)
    return [line.strip() for line in text.splitlines() if line.strip()]


def _value_after(lines: list[str], label: str, start: int, end: int) -> Optional[float]:
    for index in range(start, end):
        if lines[index] != label:
            continue
        for value in lines[index + 1 : min(index + 4, end)]:
            number = to_float(value)
            if number is not None:
                return number
    return None


def parse_brands(text: str) -> list[Quote]:
    """解析品牌卡片：品牌、工费、铂金、金条、黄金克价、涨跌。"""
    lines = _text_lines(text)
    quotes: list[Quote] = []
    for index, line in enumerate(lines):
        if line != "工费" or index < 2:
            continue
        name = lines[index - 1]
        if name in ("工费", "品牌金价") or not 2 <= len(name) <= 6:
            continue
        fee_range = lines[index + 1] if index + 1 < len(lines) else ""
        if not re.fullmatch(r"\d+\s*-\s*\d+", fee_range):
            continue
        # 第一个“元/克”是工费单位，第二个才是黄金克价单位
        unit_index = index + 4
        while unit_index < len(lines) and lines[unit_index] != "元/克":
            unit_index += 1
        if unit_index >= len(lines):
            continue
        price = to_float(lines[unit_index - 1])
        if price is None or price <= 0:
            continue
        change = None
        if unit_index + 1 < len(lines) and lines[unit_index + 1] in ("+", "-"):
            value = to_float(lines[unit_index + 2]) if unit_index + 2 < len(lines) else None
            if value is not None:
                change = value if lines[unit_index + 1] == "+" else -value
        change_pct = (
            change / (price - change) * 100
            if change is not None and price - change > 0
            else None
        )
        quotes.append(
            Quote(
                key=f"cngold_{name}",
                name=name,
                price=price,
                unit="元/克",
                change=change,
                change_pct=change_pct,
                time=now_cst().strftime("%H:%M:%S"),
                date=now_cst().strftime("%Y-%m-%d"),
                source="cngolddaily",
                raw_code=name,
                extra={
                    "labor_fee": fee_range,
                    "platinum": _value_after(lines, "· 铂金", index, unit_index),
                    "gold_bar": _value_after(lines, "· 金条", index, unit_index),
                },
            )
        )
    return quotes


def fetch_brands(
    *, timeout: int = 20, retries: int = 3
) -> dict[str, Quote]:
    text = http_get(BRANDS_URL, timeout=timeout, retries=retries)
    quotes = parse_brands(text)
    if not quotes:
        raise RuntimeError("今日金价网未解析到品牌金价")
    return {quote.name: quote for quote in quotes}
