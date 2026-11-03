"""腾讯证券行情（A股 / 港股 / ETF）。"""

from __future__ import annotations

import re
from typing import Optional

from ..models import Quote
from ..util import http_get, pct_change, to_float

API = "https://qt.gtimg.cn/q={codes}"
_LINE_PATTERN = re.compile(r'v_([A-Za-z0-9_]+)="(.*?)";')


def fetch_raw(
    codes: list[str], *, timeout: int = 20, retries: int = 3
) -> dict[str, list[str]]:
    if not codes:
        return {}
    text = http_get(
        API.format(codes=",".join(codes)), encoding="gbk", timeout=timeout, retries=retries
    )
    result: dict[str, list[str]] = {}
    for match in _LINE_PATTERN.finditer(text):
        fields = match.group(2).split("~")
        if len(fields) > 4 and fields[1]:
            result[match.group(1)] = fields
    return result


def build_quote(code: str, fields: list[str]) -> Optional[Quote]:
    if len(fields) < 35:
        return None
    price = to_float(fields[3])
    if price is None:
        return None
    prev = to_float(fields[4])
    raw_time = fields[30] if len(fields) > 30 else ""
    date_text = ""
    time_text = ""
    if len(raw_time) >= 14 and raw_time.isdigit():
        date_text = f"{raw_time[0:4]}-{raw_time[4:6]}-{raw_time[6:8]}"
        time_text = f"{raw_time[8:10]}:{raw_time[10:12]}:{raw_time[12:14]}"
    quote = Quote(
        key=code,
        name=fields[1],
        price=price,
        prev_close=prev,
        high=to_float(fields[33]),
        low=to_float(fields[34]),
        change=to_float(fields[31]),
        change_pct=to_float(fields[32]),
        time=time_text,
        date=date_text,
        source="tencent",
        raw_code=code,
        unit="港元/股" if code.startswith("hk") else "元/股",
    )
    if quote.change is None and prev is not None:
        quote.change = price - prev
    if quote.change_pct is None:
        quote.change_pct = pct_change(price, prev)
    return quote


def fetch_quotes(
    codes: list[str], *, timeout: int = 20, retries: int = 3
) -> dict[str, Quote]:
    raw = fetch_raw(codes, timeout=timeout, retries=retries)
    quotes: dict[str, Quote] = {}
    for code, fields in raw.items():
        quote = build_quote(code, fields)
        if quote:
            quotes[code] = quote
    return quotes
