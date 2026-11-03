"""通用工具：HTTP、JSONP 解析、数值计算、时间格式化。"""

from __future__ import annotations

import json
import math
import os
import re
import statistics
import time
from datetime import datetime
from typing import Any, Iterable, Optional
from zoneinfo import ZoneInfo

import requests

TZ = ZoneInfo("Asia/Shanghai")

UA_DESKTOP = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)
UA_MOBILE = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)


def now_cst() -> datetime:
    return datetime.now(TZ)


def http_get(
    url: str,
    *,
    headers: Optional[dict[str, str]] = None,
    encoding: Optional[str] = None,
    timeout: int = 20,
    retries: int = 3,
) -> str:
    """带重试的 GET，返回文本（自动处理 GBK 等编码）。"""
    base_headers = {"User-Agent": UA_DESKTOP}
    if headers:
        base_headers.update(headers)
    last_error: Optional[Exception] = None
    for attempt in range(max(1, retries)):
        try:
            resp = requests.get(url, headers=base_headers, timeout=timeout)
            resp.raise_for_status()
            if encoding:
                resp.encoding = encoding
            elif resp.encoding is None or resp.encoding.lower() == "iso-8859-1":
                resp.encoding = resp.apparent_encoding or "utf-8"
            return resp.text
        except Exception as exc:  # noqa: BLE001 - 网络异常统一重试
            last_error = exc
            if attempt < retries - 1:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"请求失败: {url} ({last_error})")


def http_post_json(
    url: str,
    payload: dict[str, Any],
    *,
    headers: Optional[dict[str, str]] = None,
    timeout: int = 20,
) -> dict[str, Any]:
    base_headers = {"User-Agent": UA_DESKTOP, "Content-Type": "application/json"}
    if headers:
        base_headers.update(headers)
    resp = requests.post(url, json=payload, headers=base_headers, timeout=timeout)
    resp.raise_for_status()
    try:
        return resp.json()
    except ValueError:
        return {"raw": resp.text}


def parse_jsonp(text: str) -> Any:
    """从 JSONP / 变量赋值文本中提取 JSON。"""
    starts = [idx for idx in (text.find("["), text.find("{")) if idx != -1]
    if not starts:
        raise ValueError("响应中没有 JSON 数据")
    start = min(starts)
    opener = text[start]
    closer = "]" if opener == "[" else "}"
    end = text.rfind(closer)
    if end <= start:
        raise ValueError("JSON 数据不完整")
    return json.loads(text[start : end + 1])


def to_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value) if math.isfinite(float(value)) else None
    text = str(value).strip().replace(",", "")
    if not text or text in {"-", "--", "null", "None"}:
        return None
    try:
        number = float(text)
    except ValueError:
        return None
    return number if math.isfinite(number) else None


def clamp(value: float, low: float = 0, high: float = 100) -> float:
    return max(low, min(high, value))


def pct_change(current: Optional[float], previous: Optional[float]) -> Optional[float]:
    if current is None or previous is None or previous == 0:
        return None
    return (current / previous - 1) * 100


def percentile_rank(values: list[float], value: float) -> Optional[float]:
    """value 在样本中的分位（0-100，越大越靠高位）。"""
    if not values:
        return None
    count = sum(1 for item in values if item <= value)
    return count / len(values) * 100


def price_quantile(values: list[float], q: float) -> Optional[float]:
    if not values:
        return None
    ordered = sorted(values)
    idx = round((len(ordered) - 1) * q)
    return ordered[max(0, min(len(ordered) - 1, idx))]


def stdev(values: Iterable[float]) -> Optional[float]:
    data = list(values)
    if len(data) < 2:
        return None
    return statistics.stdev(data)


def fmt_price(value: Optional[float], digits: Optional[int] = None) -> str:
    if value is None:
        return "-"
    if digits is not None:
        return f"{value:,.{digits}f}"
    abs_value = abs(value)
    if abs_value >= 10000:
        return f"{value:,.0f}"
    if abs_value >= 100:
        return f"{value:,.2f}"
    if abs_value >= 10:
        return f"{value:,.3f}"
    return f"{value:,.4f}"


def fmt_pct(value: Optional[float], digits: int = 2, sign: bool = True) -> str:
    if value is None:
        return "-"
    pattern = f"{{:+.{digits}f}}%" if sign else f"{{:.{digits}f}}%"
    return pattern.format(value)


def fmt_signed(value: Optional[float], digits: Optional[int] = None) -> str:
    if value is None:
        return "-"
    if digits is None:
        abs_value = abs(value)
        digits = 2 if abs_value >= 1 else 4
    return f"{value:+.{digits}f}"


def split_env_list(name: str) -> list[str]:
    raw = os.getenv(name, "").strip()
    if not raw:
        return []
    return [item.strip() for item in re.split(r"[,;\n]+", raw) if item.strip()]


def as_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, (list, tuple)):
        return [str(item).strip() for item in value if str(item).strip()]
    text = str(value).strip()
    if not text:
        return []
    return [item.strip() for item in re.split(r"[,;\n]+", text) if item.strip()]


def truncate_bytes(text: str, limit: int = 4000) -> str:
    data = text.encode("utf-8")
    if len(data) <= limit:
        return text
    cut = data[: limit - 20].decode("utf-8", errors="ignore")
    return cut + "\n\n*（内容过长已截断）*"
