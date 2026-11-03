"""配置加载。"""

from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

import yaml

from .util import as_list, split_env_list

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONFIG_PATH = ROOT / "config" / "config.yaml"
DATA_DIR = ROOT / "data"

_ENV_PATTERN = re.compile(r"\$\{([A-Z0-9_]+)\}")


def _expand_env(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: _expand_env(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_expand_env(item) for item in value]
    if isinstance(value, str):
        return _ENV_PATTERN.sub(lambda match: os.getenv(match.group(1), ""), value)
    return value


def _merge_env_list(config: dict[str, Any], key: str, env_name: str) -> None:
    channels = config.setdefault("notify", {}).setdefault("channels", {})
    current = as_list(channels.get(key))
    for item in split_env_list(env_name):
        if item not in current:
            current.append(item)
    channels[key] = current


def load_config(path: str | Path | None = None) -> dict[str, Any]:
    config_path = Path(path or os.getenv("GOLD_CONFIG") or DEFAULT_CONFIG_PATH)
    with open(config_path, "r", encoding="utf-8") as handle:
        config = yaml.safe_load(handle) or {}
    config = _expand_env(config)

    http_cfg = config.setdefault("http", {})
    http_cfg.setdefault("timeout", 20)
    http_cfg.setdefault("retries", 3)

    notify = config.setdefault("notify", {})
    slots = notify.setdefault("slots", {})
    for slot in ("morning", "noon", "close", "evening"):
        slots.setdefault(slot, "signal" if slot == "noon" else "always")
    channels = notify.setdefault("channels", {})
    channels.setdefault("pushplus", [])
    channels.setdefault("serverchan", [])
    channels.setdefault("wecom", [])
    wxpusher = channels.setdefault("wxpusher", {})
    wxpusher.setdefault("app_token", "")
    wxpusher["uids"] = as_list(wxpusher.get("uids"))
    wxpusher["topic_ids"] = as_list(wxpusher.get("topic_ids"))

    # 环境变量补充（GitHub Actions Secrets / 本地 .env）
    _merge_env_list(config, "pushplus", "PUSHPLUS_TOKENS")
    _merge_env_list(config, "serverchan", "SERVERCHAN_KEYS")
    _merge_env_list(config, "wecom", "WECOM_WEBHOOKS")

    if not wxpusher.get("app_token"):
        wxpusher["app_token"] = os.getenv("WXPUSHER_APP_TOKEN", "").strip()
    for item in split_env_list("WXPUSHER_UIDS"):
        if item not in wxpusher["uids"]:
            wxpusher["uids"].append(item)
    for item in split_env_list("WXPUSHER_TOPIC_IDS"):
        if item not in wxpusher["topic_ids"]:
            wxpusher["topic_ids"].append(item)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    config["_config_path"] = str(config_path)
    return config


def has_push_channels(config: dict[str, Any]) -> bool:
    channels = config.get("notify", {}).get("channels", {})
    if channels.get("pushplus") or channels.get("serverchan") or channels.get("wecom"):
        return True
    wxpusher = channels.get("wxpusher") or {}
    return bool(wxpusher.get("app_token") and (wxpusher.get("uids") or wxpusher.get("topic_ids")))
