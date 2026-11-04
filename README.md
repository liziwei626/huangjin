# 黄金白银价格监控与买点提醒

每天自动更新**金店饰品、银行纸贵金属、投资金条、上金所、COMEX、黄金/白银/珠宝股票与 ETF** 的价格，计算出买入时机评分，并通过**免费微信渠道推送给多名用户**。适合盯金价低位买实体金饰，也适合观察黄金、白银和珠宝股票。

数据示例：[最新报告](data/latest.md) · [结构化快照](data/latest.json) · [历史记录](data/history.csv)

> 本项目仅做行情聚合与量化参考，不构成投资建议。

## 功能

- **每天 4 次自动更新**（北京时间 08:30 / 12:00 / 15:30 / 20:30），也可手动触发
- **金店**：周大福、老凤祥、周六福、周生生、六福、老庙、菜百、金至尊的黄金/铂金挂牌价与溢价
- **银行**：工行、中行、农行、建行的纸黄金/纸白银/铂金/钯金（人民币、美元报价）
- **金条与回收**：工行如意、建行龙鼎、农行传世之宝、中国黄金基础金价/投资金条、黄金/白银/铂金/钯金回收价
- **国内国际**：上金所 Au99.99、Au99.95、黄金 T+D、白银 T+D；COMEX 黄金/白银、伦敦金/银、美元人民币、金银比
- **股票/ETF**：26 只黄金、白银、珠宝相关股票（山东黄金、紫金矿业、盛达资源、兴业银锡、周大福、老铺黄金、周大生等），及黄金 ETF、白银 LOF
- **买点分析**：价格分位、RSI、均线趋势、金银比、波动率、20 日动能加权评分；给出分批买点、关键价位、买入方式
- **免费微信推送**：PushPlus / Server酱 / WxPusher / 企业微信群机器人，可一次推送给多名用户
- **数据留痕**：每次运行写入 `data/latest.json`、`data/latest.md`、`data/history.csv`

## 快速开始（本地）

需要 Python 3.10+。

```bash
pip install -r requirements.txt

# 只抓取并生成报告，不推送
python -m gold_monitor run --slot evening --no-push

# 查看生成的报告
cat data/latest.md

# 配置推送后，实际发送（时段策略见下文）
python -m gold_monitor run --slot evening

# 只发一条测试消息
python -m gold_monitor test-push
```

报告同时会打印到终端，并保存到 [data/latest.md](data/latest.md)。

## 免费微信推送配置（支持多名用户）

四种渠道都提供免费额度（具体配额以官方为准），可同时配置多个，互相备份。

### 当前方案：PushPlus + WxPusher

代码与工作流已同时支持这两个渠道，无需改代码，只在 GitHub 仓库添加 Secrets：

| Secret | 必填 | 说明 |
| --- | --- | --- |
| `PUSHPLUS_TOKENS` | 使用 PushPlus 时必填 | 多个用户 token 用英文逗号分隔 |
| `WXPUSHER_APP_TOKEN` | 使用 WxPusher 时必填 | WxPusher 应用的 appToken |
| `WXPUSHER_UIDS` | 与 Topic 至少填一项 | 多个接收人 UID，逗号分隔 |
| `WXPUSHER_TOPIC_IDS` | 可选 | 推送到主题时填写 |

> 只配置 `PUSHPLUS_TOKENS` 即可先跑通 PushPlus；WxPusher 必须同时有 `WXPUSHER_APP_TOKEN` 和 `WXPUSHER_UIDS`（或 `WXPUSHER_TOPIC_IDS`）。

### 方式一：PushPlus（推荐，一人一个 token）

1. 微信扫码登录 <https://www.pushplus.plus/>，在“发送消息”页面复制 token。
2. 让每位接收人各自登录获取 token。
3. 把所有 token 用英文逗号拼接，配置到环境变量/Secret `PUSHPLUS_TOKENS`：

```bash
export PUSHPLUS_TOKENS="tokenA,tokenB,tokenC"
```

### 方式二：Server酱

1. 微信扫码登录 <https://sct.ftqq.com/>，绑定微信后获取 SendKey。
2. 多个用户各自获取 SendKey，逗号拼接配置到 `SERVERCHAN_KEYS`。

```bash
export SERVERCHAN_KEYS="SCTxxxx,SCTyyyy"
```

### 方式三：WxPusher（一个应用推给多个人）

1. 登录 <https://wxpusher.zjiecode.com/> 创建应用，获取 `appToken`。
2. 接收人扫码关注应用后，在后台复制各自的 `UID`；群发也可以创建主题（Topic）。
3. 配置：

```bash
export WXPUSHER_APP_TOKEN="AT_xxxx"
export WXPUSHER_UIDS="UID_xxx,UID_yyy"
export WXPUSHER_TOPIC_IDS="123"   # 可选
```

### 方式四：企业微信群机器人（群内多人接收）

在企业微信群 → 群设置 → 群机器人 → 添加机器人，复制 Webhook 地址：

```bash
export WECOM_WEBHOOKS="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx,https://..."
```

### 本地使用 `.env`

```bash
cp .env.example .env
# 编辑 .env 后，让当前 shell 载入：
set -a && source .env && set +a
python -m gold_monitor run --slot evening
```

也可以直接写在 `config/config.yaml` 的 `notify.channels` 中，但**不要把真实 token 提交到公开仓库**。

## GitHub Actions 自动运行（零成本）

本仓库配置入口：

- Secrets：<https://github.com/liziwei626/huangjin/settings/secrets/actions>
- Actions 权限：<https://github.com/liziwei626/huangjin/settings/actions>
- 工作流运行/测试：<https://github.com/liziwei626/huangjin/actions/workflows/monitor.yml>

> 定时任务只读取默认分支 `main` 上的工作流。如果代码还在功能分支，请先合并到 `main`，再添加 Secrets。

1. Fork 或 clone 本仓库到自己的 GitHub 账号。
2. 进入 **Settings → Actions → General → Workflow permissions**，选择 **Read and write permissions**（工作流需要提交数据文件）。
3. 进入 **Settings → Secrets and variables → Actions → New repository secret**，按需添加：
   - `PUSHPLUS_TOKENS`
   - `SERVERCHAN_KEYS`
   - `WXPUSHER_APP_TOKEN`
   - `WXPUSHER_UIDS`
   - `WXPUSHER_TOPIC_IDS`
   - `WECOM_WEBHOOKS`
4. 打开 **Actions** 标签页，启用 `黄金白银价格监控` 工作流。
5. 在 **Run workflow** 中可手动运行：
   - `test_push = true`：只发测试消息，验证微信是否能收到。
   - `push = false`：只更新数据，不推送。
6. 定时任务使用 UTC，已预设为北京时间 08:30 / 12:00 / 15:30 / 20:30。

GitHub 的定时任务可能有几分钟到几十分钟延迟；仓库连续 60 天无活动时，GitHub 会自动暂停 schedule，重新手动运行一次即可恢复。

## 推送策略

| 时段 | 北京时间 | 策略 |
| --- | --- | --- |
| morning | 08:30 | 总是推送 |
| noon | 12:00 | 仅当有标的评分 ≥65 或评级/信号变化时推送（避免打扰） |
| close | 15:30 | 总是推送 |
| evening | 20:30 | 总是推送 |

可用 `--force-push` 忽略午间静默，或用 `--no-push` 只生成报告。

## 买点评分怎么算

评分范围 0-100，越高代表当前越适合买入。核心标的权重：

| 分项 | 黄金/白银 | 股票/ETF | 说明 |
| --- | --- | --- | --- |
| 价格分位 | 30% | 30% | 现价在近一年收盘价中的分位，越低分越高 |
| RSI | 24% | 25% | RSI 越低分越高，超卖加分、超买扣分 |
| 均线趋势 | 16% | 20% | 站上 MA20/MA60 加分，破位扣分 |
| 金银比 | 12% | — | 金银比高位利多白银、利空黄金，反之亦然 |
| 波动率 | 8% | 10% | 波动率低分高，降低追高回撤风险 |
| 20 日动能 | 10% | 15% | 近 20 日跌幅过大扣分，避免接飞刀 |

评级与含义：

| 评分 | 评级 | 操作建议 |
| --- | --- | --- |
| ≥75 | 强烈建议分批买入 | 可先建 30% 计划仓位，回调再加 |
| 65-75 | 适合分批买入 | 分 3 次建仓，首次不超过 30% |
| 55-65 | 可小仓位试买 | 最多 20% 仓位试水 |
| 45-55 | 观望 | 等待更低价格或趋势确认 |
| <45 | 暂不建议买入 | 不追高，等信号反转 |

金饰单独评分：**55% 看金价位置 + 20% 看同城最低价差 + 25% 看绝对溢价**。金价越接近近一年低位、品牌报价越接近当日最低价，分数越高；品牌溢价超过 35% 会额外扣分。金饰是消费品，报告会给出“适合逛店比价 / 刚需可买 / 等促销”的结论，并提示按克计价、谈工费。

### “什么时候买、怎么买”

报告会对每个核心标的给出：

- **关键价位**：MA20、MA60、近一年 20%/80% 分位
- **触发条件**：价格回到 20% 分位附近、RSI 跌破 35，或重新站上 MA20 且评分 ≥65
- **买入方式**：银行积存金/纸黄金、黄金 ETF、上金所 Au99.99、银行投资金条；白银用纸白银/白银 T+D/白银 LOF
- **纪律**：分批 3-5 次、首次 ≤30%、RSI>70 或分位>85% 不追高、单只股票 ≤10%、金饰不用于投资

## 目录结构

```
config/config.yaml          品牌/银行/股票代码、评分权重、推送策略
gold_monitor/
  analysis.py               指标与评分模型
  collector.py              多数据源采集与快照组装
  report.py                 Markdown 报告/推送文案
  notify.py                 PushPlus/Server酱/WxPusher/企业微信
  sources/                  新浪、金投网、腾讯行情适配
  storage.py                latest.json / history.csv / state.json
.github/workflows/          GitHub Actions 定时任务
data/                       运行后生成的数据与报告
```

## 数据来源

- 新浪财经：上金所、国内外期货、汇率、股票/ETF 日线
- 金投网：金店、银行、金条、回收价
- 腾讯证券：A 股/港股/ETF 实时行情

公开接口可能调整或限流；抓取失败不会中断整次运行，报告顶部会标注失败项。

## 常见问题

**Q：收不到微信推送？**
先运行 `python -m gold_monitor test-push` 或在 Actions 里勾选 `test_push`。检查 token 是否填写、是否关注了对应公众号/应用、是否超过免费额度。

**Q：如何推送给更多人？**
PushPlus/Server酱为每个用户配置一个 token/SendKey，逗号拼接；WxPusher 填多个 UID 或让用户关注同一 Topic；企业微信群机器人拉多人进群即可。

**Q：数据时间为什么不是整点？**
行情接口本身有几分钟延迟，且 GitHub Actions 定时任务可能延迟；报告会显示每个品种的实际行情时间。

**Q：评分能直接当买卖信号吗？**
不能。评分是横向比较与择时辅助，不含仓位、税费、点差、个人风险承受能力。请结合自身情况并设置止损。

## 免责声明

以上数据来自公开行情接口，可能存在延迟或误差；评分仅为量化参考，不构成投资建议，据此操作风险自负。
