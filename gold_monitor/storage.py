"""本地数据持久化。"""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any, Optional

HISTORY_COLUMNS = [
    "run_at",
    "date",
    "slot",
    "usdcny",
    "au_cn",
    "ag_cn",
    "au_intl",
    "ag_intl",
    "gold_silver_ratio",
    "au_cn_score",
    "ag_cn_score",
    "au_intl_score",
    "ag_intl_score",
    "brand_gold_avg",
    "brand_premium_pct",
]


def _write_json(path: Path, data: Any) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2, sort_keys=False)
        handle.write("\n")
    tmp.replace(path)


def save_latest(data: dict[str, Any], data_dir: Path) -> Path:
    data_dir.mkdir(parents=True, exist_ok=True)
    path = data_dir / "latest.json"
    _write_json(path, data)
    return path


def append_history(row: dict[str, Any], data_dir: Path) -> Path:
    data_dir.mkdir(parents=True, exist_ok=True)
    path = data_dir / "history.csv"
    exists = path.exists() and path.stat().st_size > 0
    with open(path, "a", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=HISTORY_COLUMNS, extrasaction="ignore")
        if not exists:
            writer.writeheader()
        writer.writerow(row)
    return path


def load_state(data_dir: Path) -> dict[str, Any]:
    path = data_dir / "state.json"
    if not path.exists():
        return {}
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return {}


def save_state(state: dict[str, Any], data_dir: Path) -> Path:
    path = data_dir / "state.json"
    _write_json(path, state)
    return path


def load_history(data_dir: Path) -> list[dict[str, str]]:
    path = data_dir / "history.csv"
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def latest_price_from_history(
    data_dir: Path, column: str, offset: int = 1
) -> Optional[float]:
    """从历史 CSV 取倒数第 offset 条有效价格（用于计算日内变化）。"""
    rows = load_history(data_dir)
    valid = [row for row in rows if row.get(column) not in (None, "", "-")]
    if len(valid) < offset + 1:
        return None
    try:
        return float(valid[-1 - offset][column])
    except (TypeError, ValueError):
        return None
