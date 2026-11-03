"""金投网行情（金店、银行、金条、上金所）。"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from ..models import Quote
from ..util import TZ, http_get, parse_jsonp, pct_change, to_float

API = "https://api.jijinhao.com/quoteCenter/realTime.htm?codes={codes}"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    ),
    "Referer": "https://m.cngold.org/",
}


def fetch_raw(
    codes: list[str], *, timeout: int = 20, retries: int = 3
) -> dict[str, dict[str, Any]]:
    if not codes:
        return {}
    text = http_get(
        API.format(codes=",".join(codes)), headers=HEADERS, timeout=timeout, retries=retries
    )
    try:
        data = parse_jsonp(text)
    except ValueError:
        return {}
    result: dict[str, dict[str, Any]] = {}
    if isinstance(data, dict):
        for key, value in data.items():
            if key.startswith("JO_") and isinstance(value, dict):
                result[key] = value
    return result


def _quote_time(timestamp: Any) -> tuple[str, str]:
    value = to_float(timestamp)
    if value is None or value <= 0:
        return "", ""
    if value > 1e11:  # 毫秒
        value = value / 1000
    try:
        moment = datetime.fromtimestamp(value, TZ)
    except (OverflowError, OSError, ValueError):
        return "", ""
    return moment.strftime("%H:%M:%S"), moment.strftime("%Y-%m-%d")


def build_quote(code: str, data: dict[str, Any], default_unit: str = "") -> Optional[Quote]:
    price = to_float(data.get("q63"))
    if price is None or price == 0:
        price = to_float(data.get("q1"))
    if price is None or price == 0:
        return None
    prev = to_float(data.get("q2"))
    change = to_float(data.get("q70"))
    change_pct = to_float(data.get("q80"))
    time_text, date_text = _quote_time(data.get("time"))
    quote = Quote(
        key=code,
        name=str(data.get("showName") or code),
        price=price,
        unit=str(data.get("unit") or default_unit),
        prev_close=prev,
        high=to_float(data.get("q3")),
        low=to_float(data.get("q4")),
        change=change,
        change_pct=change_pct,
        time=time_text,
        date=date_text,
        source="jijinhao",
        raw_code=code,
    )
    if quote.change is None and prev is not None:
        quote.change = price - prev
    if quote.change_pct is None:
        quote.change_pct = pct_change(price, prev)
    return quote


def fetch_quotes(
    codes: list[str],
    *,
    units: Optional[dict[str, str]] = None,
    timeout: int = 20,
    retries: int = 3,
) -> dict[str, Quote]:
    raw = fetch_raw(codes, timeout=timeout, retries=retries)
    units = units or {}
    quotes: dict[str, Quote] = {}
    for code, data in raw.items():
        quote = build_quote(code, data, units.get(code, ""))
        if quote:
            quotes[code] = quote
    return quotes
