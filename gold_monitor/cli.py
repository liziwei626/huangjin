"""命令行入口。"""

from __future__ import annotations

import argparse
import re
import sys
from typing import Any

from .collector import build_history_row, collect
from .config import DATA_DIR, has_push_channels, load_config
from .notify import channel_count, describe_channels, send_all
from .report import DISCLAIMER, render_markdown, render_push
from .sources import sina
from .storage import (
    append_history,
    load_state,
    save_latest,
    save_state,
)
from .util import now_cst, split_env_list

SLOT_LABELS = {
    "morning": "早盘",
    "noon": "午间",
    "close": "收盘",
    "evening": "晚间",
    "manual": "手动",
}

SLOT_ORDER = ("morning", "noon", "close", "evening")


def _infer_slot() -> str:
    hour = now_cst().hour
    if 6 <= hour < 11:
        return "morning"
    if 11 <= hour < 14:
        return "noon"
    if 14 <= hour < 17:
        return "close"
    return "evening"


def _signal_key(signal: str) -> str:
    return re.sub(r"[0-9.%＋+\-（）() ]", "", signal)


def _detect_changes(snapshot: dict[str, Any], state: dict[str, Any]) -> list[str]:
    old_assets = state.get("assets", {}) if state else {}
    changes: list[str] = []
    for analysis in snapshot.get("analyses", []):
        key = analysis["key"]
        old = old_assets.get(key, {})
        if old.get("rating") and old["rating"] != analysis["rating"]:
            changes.append(f"{analysis['name']} 评级 {old['rating']} → {analysis['rating']}")
        old_score = old.get("score")
        if isinstance(old_score, (int, float)) and abs(analysis["score"] - old_score) >= 5:
            changes.append(
                f"{analysis['name']} 评分 {old_score:.1f} → {analysis['score']:.1f}"
            )
        old_signals = {_signal_key(item) for item in old.get("signals", [])}
        new_signals = {_signal_key(item) for item in analysis.get("signals", [])}
        for item in analysis.get("signals", []):
            if _signal_key(item) not in old_signals:
                changes.append(f"{analysis['name']} 新信号：{item}")
        if old_signals - new_signals:
            changes.append(f"{analysis['name']} 信号解除")
    return changes


def _make_state(
    snapshot: dict[str, Any], previous: dict[str, Any] | None = None
) -> dict[str, Any]:
    state = {
        "updated_at": snapshot.get("generated_at"),
        "date": snapshot.get("date"),
        "slot": snapshot.get("slot"),
        "assets": {
            item["key"]: {
                "score": item["score"],
                "rating": item["rating"],
                "signals": item.get("signals", []),
            }
            for item in snapshot.get("analyses", [])
        },
    }
    if previous:
        for key in ("emergency_active", "emergency_gold_below", "emergency_updated_at"):
            if key in previous:
                state[key] = previous[key]
    return state


def _print_report(title: str, content: str) -> None:
    print("=" * 72)
    print(content)
    print("=" * 72)


def _save_report(snapshot: dict[str, Any], config: dict[str, Any]) -> None:
    content = render_markdown(snapshot, config)
    path = DATA_DIR / "latest.md"
    path.write_text(content, encoding="utf-8")
    print(f"[save] {path}")


def _push_decision(
    snapshot: dict[str, Any],
    config: dict[str, Any],
    slot: str,
    changes: list[str],
    force: bool,
) -> tuple[bool, str]:
    thresholds = config.get("analysis", {}).get("thresholds", {})
    scores = [item["score"] for item in snapshot.get("analyses", [])]
    policy = config.get("notify", {}).get("slots", {}).get(slot, "always")
    if policy != "signal":
        return True, "定时推送"
    if force:
        return True, "强制推送"
    buy_threshold = thresholds.get("buy", 65)
    if any(score >= buy_threshold for score in scores):
        return True, "有标的进入分批买入区间"
    if changes:
        return True, "评分/评级/信号发生变化"
    return False, "午间静默：无买入信号且无变化"


def _update_slot_label(snapshot: dict[str, Any], slot: str) -> None:
    snapshot["slot"] = slot
    snapshot["slot_label"] = SLOT_LABELS.get(slot, slot)


def _has_any_data(snapshot: dict[str, Any]) -> bool:
    if snapshot.get("analyses"):
        return True
    market = snapshot.get("market", {})
    items = list(market.get("sge", [])) + list(market.get("intl", []))
    for section in ("brands", "banks", "bars", "stocks", "etfs"):
        items.extend(snapshot.get(section, []))
    return any(item.get("quote") or item.get("gold") for item in items)


def cmd_run(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    slot = args.slot or _infer_slot()
    snapshot = collect(config, slot=slot)
    _update_slot_label(snapshot, slot)

    if not _has_any_data(snapshot):
        print("[error] 未获取到任何行情数据，终止本次运行。")
        return 1

    _save_report(snapshot, config)
    save_latest(snapshot, DATA_DIR)
    append_history(build_history_row(snapshot), DATA_DIR)

    state = load_state(DATA_DIR)
    changes = _detect_changes(snapshot, state)
    save_state(_make_state(snapshot, state), DATA_DIR)

    title, push_content = render_push(snapshot)
    _print_report(title, render_markdown(snapshot, config))

    if changes:
        print("[signal] 变化：")
        for item in changes:
            print(f"  - {item}")

    if args.no_push:
        print("[push] 已指定 --no-push，跳过推送。")
        return 0
    if not has_push_channels(config):
        print("[push] 未配置任何推送渠道，跳过。参考 .env.example / README 配置微信推送。")
        return 0

    should_push, reason = _push_decision(snapshot, config, slot, changes, args.force_push)
    if not should_push:
        print(f"[push] 跳过：{reason}")
        return 0

    print(f"[push] 推送渠道：{describe_channels(config)}（共 {channel_count(config)} 个目标）")
    results = send_all(config, title, push_content)
    failed = [item for item in results if not item["ok"]]
    print(f"[push] 完成：成功 {len(results) - len(failed)} / 共 {len(results)}")
    if failed:
        print("[push] 失败详情：")
        for item in failed:
            print(f"  - {item['channel']} {item['target']}: {item['message']}")
    return 0


def cmd_test_push(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    if not has_push_channels(config):
        print("[push] 未配置推送渠道。")
        print("请设置环境变量 PUSHPLUS_TOKENS / SERVERCHAN_KEYS / WECOM_WEBHOOKS / WXPUSHER_*，")
        print("或在 config/config.yaml 的 notify.channels 中填写（不建议提交公开仓库）。")
        return 1
    content = (
        f"## 黄金白银监控测试推送\n\n"
        f"- 时间：{now_cst().strftime('%Y-%m-%d %H:%M:%S')}（北京时间）\n"
        f"- 已配置渠道：{describe_channels(config)}\n"
        f"- 目标数：{channel_count(config)}\n\n"
        f"> 收到这条消息说明推送配置成功。{DISCLAIMER}"
    )
    print(f"[push] 测试推送：{describe_channels(config)}")
    results = send_all(config, "黄金白银监控测试推送", content)
    failed = [item for item in results if not item["ok"]]
    print(f"[push] 完成：成功 {len(results) - len(failed)} / 共 {len(results)}")
    return 0 if results and not failed else 1


def _quote_change_text(quote: Any) -> str:
    if quote is None or quote.price is None:
        return "—"
    pct = quote.change_pct
    if pct is None and quote.prev_close and quote.prev_close > 0:
        pct = (quote.price / quote.prev_close - 1) * 100
    if pct is None:
        return "—"
    return f"{pct:+.2f}%"


def cmd_check_emergency(args: argparse.Namespace) -> int:
    """轻量检查 Au99.99，跌破阈值时只在“首次跌破”推送一次。"""
    config = load_config(args.config)
    threshold = float(config.get("notify", {}).get("emergency_gold_below", 600))
    http_cfg = config.get("http", {})
    symbols = ["gds_AU9999", "gds_AGTD", "hf_GC"]
    fields = sina.fetch_hq(
        symbols,
        timeout=int(http_cfg.get("timeout", 20)),
        retries=int(http_cfg.get("retries", 3)),
    )
    quotes = {
        symbol: sina.build_quote(symbol, fields.get(symbol, []))
        for symbol in symbols
    }
    gold = quotes["gds_AU9999"]
    silver = quotes["gds_AGTD"]
    if gold is None or gold.price is None:
        print("[emergency] 未获取到 Au99.99 报价，跳过本次检查。")
        return 1

    price = gold.price
    state = load_state(DATA_DIR)
    active = bool(state.get("emergency_active"))
    if price >= threshold:
        if active:
            state["emergency_active"] = False
            state["emergency_updated_at"] = now_cst().strftime("%Y-%m-%d %H:%M:%S")
            save_state(state, DATA_DIR)
            print(f"[emergency] 金价已回升至 {price:.2f}，紧急状态复位。")
        else:
            print(f"[emergency] 金价 {price:.2f} >= {threshold:.0f}，无需提醒。")
        return 0

    if active:
        print(f"[emergency] 金价 {price:.2f} 仍低于 {threshold:.0f}，已提醒过，等待回升后再复位。")
        return 0
    if not has_push_channels(config):
        print("[emergency] 金价已跌破阈值，但未配置推送渠道。")
        return 0

    title = f"【紧急】金价跌破 {threshold:.0f} 元/克"
    silver_text = (
        f"{silver.price:,.2f} 元/千克（{_quote_change_text(silver)}）"
        if silver and silver.price is not None
        else "—"
    )
    content = (
        f"## 【紧急】金价跌破 {threshold:.0f} 元/克\n\n"
        f"- Au99.99：**{price:,.2f} 元/克**（{_quote_change_text(gold)}）\n"
        f"- 白银 T+D：**{silver_text}**\n"
        f"- 时间：{now_cst().strftime('%Y-%m-%d %H:%M:%S')}（北京时间）\n\n"
        f"> 请复核实时行情并谨慎操作。{DISCLAIMER}"
    )
    print(f"[emergency] 金价 {price:.2f} < {threshold:.0f}，发送紧急通知。")
    results = send_all(config, title, content)
    failed = [item for item in results if not item["ok"]]
    if failed:
        print(f"[emergency] 推送失败：{len(failed)}/{len(results)}")
        return 1
    state["emergency_active"] = True
    state["emergency_gold_below"] = threshold
    state["emergency_updated_at"] = now_cst().strftime("%Y-%m-%d %H:%M:%S")
    save_state(state, DATA_DIR)
    print(f"[emergency] 推送成功：{len(results)} 个渠道。")
    return 0


def cmd_show_config(args: argparse.Namespace) -> int:
    config = load_config(args.config)
    print(f"配置文件：{config.get('_config_path')}")
    print(f"推送渠道：{describe_channels(config)}")
    print(f"环境变量候选：PUSHPLUS_TOKENS={len(split_env_list('PUSHPLUS_TOKENS'))} 个，"
          f"SERVERCHAN_KEYS={len(split_env_list('SERVERCHAN_KEYS'))} 个，"
          f"WECOM_WEBHOOKS={len(split_env_list('WECOM_WEBHOOKS'))} 个")
    print(f"数据目录：{DATA_DIR}")
    print(f"时段：{', '.join(SLOT_ORDER)}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="黄金白银价格监控与买入时机分析")
    subparsers = parser.add_subparsers(dest="command", required=True)

    run = subparsers.add_parser("run", help="抓取行情、生成报告并按策略推送")
    run.add_argument("--config", help="配置文件路径")
    run.add_argument("--slot", choices=SLOT_ORDER + ("manual",), help="运行时段")
    run.add_argument("--no-push", action="store_true", help="只生成报告，不推送")
    run.add_argument("--force-push", action="store_true", help="忽略午间静默策略，强制推送")
    run.set_defaults(func=cmd_run)

    test_push = subparsers.add_parser("test-push", help="发送一条测试消息")
    test_push.add_argument("--config", help="配置文件路径")
    test_push.set_defaults(func=cmd_test_push)

    emergency = subparsers.add_parser(
        "check-emergency", help="检查金价是否跌破紧急阈值，只在首次跌破时推送"
    )
    emergency.add_argument("--config", help="配置文件路径")
    emergency.set_defaults(func=cmd_check_emergency)

    show = subparsers.add_parser("show-config", help="查看当前推送配置")
    show.add_argument("--config", help="配置文件路径")
    show.set_defaults(func=cmd_show_config)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return int(args.func(args))
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    sys.exit(main())
