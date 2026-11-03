"""免费微信推送渠道：PushPlus / Server酱 / WxPusher / 企业微信群机器人。"""

from __future__ import annotations

from typing import Any, Callable

import requests

from .util import as_list, truncate_bytes

TIMEOUT = 20


def _pushplus(token: str, title: str, content: str) -> tuple[bool, str]:
    response = requests.post(
        "https://www.pushplus.plus/send",
        json={"token": token, "title": title, "content": content, "template": "markdown"},
        timeout=TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    ok = data.get("code") == 200
    return ok, str(data.get("msg") or data.get("code"))


def _serverchan(key: str, title: str, content: str) -> tuple[bool, str]:
    response = requests.post(
        f"https://sctapi.ftqq.com/{key}.send",
        data={"title": title, "desp": content},
        timeout=TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    ok = data.get("code") == 0
    return ok, str(data.get("message") or data.get("code"))


def _wxpusher(
    app_token: str, content: str, summary: str, uids: list[str], topic_ids: list[str]
) -> tuple[bool, str]:
    payload: dict[str, Any] = {
        "appToken": app_token,
        "content": content,
        "summary": summary[:100],
        "contentType": 3,
        "uids": uids,
    }
    if topic_ids:
        try:
            payload["topicIds"] = [int(item) for item in topic_ids]
        except ValueError:
            payload["topicIds"] = topic_ids
    response = requests.post(
        "https://wxpusher.zjiecode.com/api/send/message",
        json=payload,
        timeout=TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    ok = data.get("code") == 1000
    return ok, str(data.get("msg") or data.get("code"))


def _wecom(webhook: str, content: str) -> tuple[bool, str]:
    response = requests.post(
        webhook,
        json={"msgtype": "markdown", "markdown": {"content": truncate_bytes(content, 4000)}},
        timeout=TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    ok = data.get("errcode") == 0
    return ok, str(data.get("errmsg") or data.get("errcode"))


def channel_count(config: dict[str, Any]) -> int:
    channels = config.get("notify", {}).get("channels", {})
    count = len(as_list(channels.get("pushplus")))
    count += len(as_list(channels.get("serverchan")))
    count += len(as_list(channels.get("wecom")))
    wxpusher = channels.get("wxpusher") or {}
    if wxpusher.get("app_token") and (wxpusher.get("uids") or wxpusher.get("topic_ids")):
        count += 1
    return count


def describe_channels(config: dict[str, Any]) -> str:
    channels = config.get("notify", {}).get("channels", {})
    parts = []
    if channels.get("pushplus"):
        parts.append(f"PushPlus×{len(channels['pushplus'])}")
    if channels.get("serverchan"):
        parts.append(f"Server酱×{len(channels['serverchan'])}")
    wxpusher = channels.get("wxpusher") or {}
    if wxpusher.get("app_token") and (wxpusher.get("uids") or wxpusher.get("topic_ids")):
        parts.append(f"WxPusher×{len(wxpusher.get('uids') or []) + len(wxpusher.get('topic_ids') or [])}")
    if channels.get("wecom"):
        parts.append(f"企业微信×{len(channels['wecom'])}")
    return "、".join(parts) if parts else "未配置"


def send_all(
    config: dict[str, Any], title: str, content: str, *, dry_run: bool = False
) -> list[dict[str, Any]]:
    channels = config.get("notify", {}).get("channels", {})
    results: list[dict[str, Any]] = []

    def run(name: str, target: str, sender: Callable[[], tuple[bool, str]]) -> None:
        if dry_run:
            results.append({"channel": name, "target": target, "ok": True, "message": "dry-run"})
            print(f"[push] {name} {target} -> dry-run")
            return
        try:
            ok, message = sender()
        except Exception as exc:  # noqa: BLE001 - 单个渠道失败不影响其他渠道
            ok, message = False, str(exc)
        results.append({"channel": name, "target": target, "ok": ok, "message": message})
        print(f"[push] {name} {target} -> {'OK' if ok else 'FAIL'}: {message}")

    for index, token in enumerate(as_list(channels.get("pushplus")), start=1):
        run("PushPlus", f"#{index}", lambda token=token: _pushplus(token, title, content))

    for index, key in enumerate(as_list(channels.get("serverchan")), start=1):
        run("Server酱", f"#{index}", lambda key=key: _serverchan(key, title, content))

    wxpusher = channels.get("wxpusher") or {}
    app_token = wxpusher.get("app_token")
    uids = as_list(wxpusher.get("uids"))
    topic_ids = as_list(wxpusher.get("topic_ids"))
    if app_token and (uids or topic_ids):
        target = f"{len(uids)} 用户 / {len(topic_ids)} 主题"
        run(
            "WxPusher",
            target,
            lambda: _wxpusher(app_token, content, title, uids, topic_ids),
        )

    for index, webhook in enumerate(as_list(channels.get("wecom")), start=1):
        run("企业微信", f"群#{index}", lambda webhook=webhook: _wecom(webhook, content))

    return results
