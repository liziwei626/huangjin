"""数据模型。"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Optional


@dataclass
class Quote:
    key: str
    name: str
    price: Optional[float]
    unit: str = ""
    prev_close: Optional[float] = None
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    change: Optional[float] = None
    change_pct: Optional[float] = None
    time: str = ""
    date: str = ""
    source: str = ""
    raw_code: str = ""
    extra: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["price"] = round(self.price, 4) if self.price is not None else None
        for key in ("prev_close", "open", "high", "low", "change"):
            if data[key] is not None:
                data[key] = round(data[key], 4)
        if data["change_pct"] is not None:
            data["change_pct"] = round(data["change_pct"], 2)
        return data


@dataclass
class Analysis:
    key: str
    name: str
    kind: str
    price: Optional[float]
    unit: str
    score: float
    rating: str
    components: dict[str, float] = field(default_factory=dict)
    metrics: dict[str, Any] = field(default_factory=dict)
    signals: list[str] = field(default_factory=list)
    advice: str = ""
    timing: str = ""

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["score"] = round(self.score, 1)
        data["components"] = {key: round(value, 1) for key, value in self.components.items()}
        for key, value in list(self.metrics.items()):
            if isinstance(value, float):
                data["metrics"][key] = round(value, 4)
        return data
