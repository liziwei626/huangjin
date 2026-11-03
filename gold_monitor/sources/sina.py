"""新浪财经行情与历史日线。"""

from __future__ import annotations

import re
from typing import Any, Optional

from ..models import Quote
from ..util import http_get, parse_jsonp, pct_change, to_float

SINA_HQ = "https://hq.sinajs.cn/list={symbols}"
SINA_HEADERS = {"Referer": "https://finance.sina.com.cn/"}

INNER_KLINE = (
    "https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_{symbol}=/"
    "InnerFuturesNewService.getDailyKLine?symbol={symbol}"
)
GLOBAL_KLINE = (
    "https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_{symbol}=/"
    "GlobalFuturesService.getGlobalFuturesDailyKLine?symbol={symbol}"
)
STOCK_KLINE = (
    "https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_=/"
    "CN_MarketDataService.getKLineData?symbol={symbol}&scale=240&ma=no&datalen={datalen}"
)

_LINE_PATTERN = re.compile(r'var hq_str_([A-Za-z0-9_]+)="(.*?)";')


def fetch_hq(
    symbols: list[str], *, timeout: int = 20, retries: int = 3
) -> dict[str, list[str]]:
    if not symbols:
        return {}
    text = http_get(
        SINA_HQ.format(symbols=",".join(symbols)),
        headers=SINA_HEADERS,
        encoding="gbk",
        timeout=timeout,
        retries=retries,
    )
    result: dict[str, list[str]] = {}
    for match in _LINE_PATTERN.finditer(text):
        fields = match.group(2).split(",")
        if fields and fields[0]:
            result[match.group(1)] = fields
    return result


def build_quote(symbol: str, fields: list[str]) -> Optional[Quote]:
    if not fields:
        return None

    def field(index: int) -> Optional[float]:
        return to_float(fields[index]) if index < len(fields) else None

    if symbol.startswith("gds_"):
        price = field(0)
        prev = field(7)
        quote = Quote(
            key=symbol,
            name=fields[13] if len(fields) > 13 else symbol,
            price=price,
            prev_close=prev,
            open=field(8),
            high=field(4),
            low=field(5),
            time=fields[6] if len(fields) > 6 else "",
            date=fields[12] if len(fields) > 12 else "",
            source="sina",
            raw_code=symbol,
        )
        quote.unit = "元/千克" if "AG" in symbol.upper() else "元/克"
    elif symbol.startswith("nf_"):
        price = field(8)
        prev = field(10)
        time_text = fields[1] if len(fields) > 1 else ""
        if len(time_text) >= 6 and time_text.isdigit():
            time_text = f"{time_text[0:2]}:{time_text[2:4]}:{time_text[4:6]}"
        quote = Quote(
            key=symbol,
            name=fields[0],
            price=price,
            prev_close=prev,
            open=field(2),
            high=field(3),
            low=field(4),
            time=time_text,
            date=fields[17] if len(fields) > 17 else "",
            source="sina",
            raw_code=symbol,
        )
        quote.unit = "元/克" if "AU" in symbol.upper() else "元/千克"
    elif symbol.startswith("hf_"):
        price = field(0)
        prev = field(7)
        quote = Quote(
            key=symbol,
            name=fields[13] if len(fields) > 13 else symbol,
            price=price,
            prev_close=prev,
            open=field(8),
            high=field(4),
            low=field(5),
            time=fields[6] if len(fields) > 6 else "",
            date=fields[12] if len(fields) > 12 else "",
            source="sina",
            raw_code=symbol,
        )
        quote.unit = "美元/盎司"
    elif symbol.startswith("fx_"):
        quote = Quote(
            key=symbol,
            name=fields[9] if len(fields) > 9 else symbol,
            price=field(8),
            prev_close=field(7),
            time=fields[0] if fields else "",
            date=fields[17] if len(fields) > 17 else "",
            source="sina",
            raw_code=symbol,
        )
        quote.unit = "人民币"
    else:
        return None

    if quote.price is not None and quote.prev_close is not None:
        quote.change = quote.price - quote.prev_close
    quote.change_pct = pct_change(quote.price, quote.prev_close)
    return quote


def fetch_quotes(
    symbols: list[str], *, timeout: int = 20, retries: int = 3
) -> dict[str, Quote]:
    raw = fetch_hq(symbols, timeout=timeout, retries=retries)
    quotes: dict[str, Quote] = {}
    for symbol, fields in raw.items():
        quote = build_quote(symbol, fields)
        if quote and quote.price is not None:
            quotes[symbol] = quote
    return quotes


def _parse_kline(text: str, date_key: str, close_key: str, days: int) -> list[dict[str, Any]]:
    data = parse_jsonp(text)
    if not isinstance(data, list):
        return []
    rows: list[dict[str, Any]] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        date = str(item.get(date_key, "")).strip()
        close = to_float(item.get(close_key))
        if date and close is not None:
            rows.append({"date": date, "close": close})
    return rows[-days:] if days else rows


def fetch_inner_kline(
    symbol: str, days: int = 320, *, timeout: int = 20, retries: int = 3
) -> list[dict[str, Any]]:
    text = http_get(
        INNER_KLINE.format(symbol=symbol), timeout=timeout, retries=retries
    )
    return _parse_kline(text, "d", "c", days)


def fetch_global_kline(
    symbol: str, days: int = 320, *, timeout: int = 20, retries: int = 3
) -> list[dict[str, Any]]:
    text = http_get(
        GLOBAL_KLINE.format(symbol=symbol), timeout=timeout, retries=retries
    )
    return _parse_kline(text, "date", "close", days)


def fetch_stock_kline(
    symbol: str, days: int = 300, *, timeout: int = 20, retries: int = 3
) -> list[dict[str, Any]]:
    text = http_get(
        STOCK_KLINE.format(symbol=symbol, datalen=max(days, 120)),
        timeout=timeout,
        retries=retries,
    )
    return _parse_kline(text, "day", "close", days)
