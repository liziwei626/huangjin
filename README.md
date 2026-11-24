# 暖月 · 月子餐智能搭配

一个移动端优先的月子餐搭配小程序（H5）。根据产后天数、分娩方式、喂养方式与忌口，自动生成一周不重样的三餐三点餐单，并汇总采购清单、记录每日打卡。

前后端一体，零第三方运行时依赖，可直接部署为单个 Node.js 20 Web 服务。

## 功能

- **账号体系**：注册 / 登录（scrypt 加盐哈希 + HMAC 签名 Token），内置体验账号
- **产后档案**：分娩日期、分娩方式、喂养方式、口味、热量目标、每日餐次
- **阶段化搭配**：按产后第 1 周 / 第 2 周 / 第 3-4 周 / 第 5 周起四个阶段匹配食谱与调养重点
- **智能餐单**：7 / 28 天餐单自动生成，避开忌口、控制重复、荤素与蛋白质轮换
- **灵活换菜**：任意一餐可单独「换一道」，仍遵守忌口与同餐不重复
- **食谱库**：91 道月子餐，含食材、步骤、营养估算、小贴士；支持搜索、阶段/餐次筛选、收藏
- **采购清单**：按餐单自动汇总食材用量，按品类分组，可勾选已购
- **吃饭打卡**：按餐打卡，统计完成率与连续打卡天数
- **安全提醒**：母乳 / 混合喂养自动排除含酒精菜品；页面内含免责声明

## 技术栈

- 前端：原生 HTML / CSS / JavaScript（无构建步骤，移动端优先）
- 后端：Node.js 20 原生 `http` 模块，自建轻量路由
- 存储：JSON 文件（运行时写入 `${TMPDIR:-/tmp}/nuanyue-data`），无需数据库
- 依赖：**0 个 npm 运行时依赖**

## 本地运行

```bash
npm start
# 或
PORT=8000 node server.js
```

打开 <http://localhost:8000>。

体验账号：`demo` / `demo123456`

## 目录结构

```
server.js              HTTP 服务入口（静态资源 + API 分发）
src/
  api.js               全部 API 路由与业务处理
  auth.js              密码哈希与 Token 签发/校验
  db.js                JSON 存储与种子数据
  planner.js           阶段计算、餐单生成、换菜、清单汇总、统计
  data/recipes.js      91 道月子餐食谱库
  data/meta.js         阶段、餐次、忌口、热量档位等基础配置
public/
  index.html           应用外壳
  app.js               单页应用逻辑
  styles.css           移动端样式
  images/              分类配图
```

## API 一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 当前用户、档案、餐单概览 |
| GET/PUT | `/api/profile` | 读取 / 更新产后档案 |
| GET | `/api/recipes` | 食谱列表（可按阶段、餐次、品类、关键词筛选） |
| GET | `/api/recipes/:id` | 食谱详情 |
| POST | `/api/recipes/:id/favorite` | 收藏 / 取消收藏 |
| GET | `/api/favorites` | 收藏列表 |
| GET | `/api/plan` | 指定日期的餐单与本周概览 |
| POST | `/api/plan/generate` | 生成 7 / 28 天餐单 |
| POST | `/api/plan/swap` | 单道菜替换 |
| POST | `/api/plan/eat` | 打卡 / 取消打卡 |
| GET | `/api/grocery` | 采购清单（按日期范围汇总） |
| POST | `/api/grocery/toggle` | 勾选 / 取消勾选 |
| POST | `/api/grocery/clear` | 清空勾选 |
| GET | `/api/stats` | 打卡统计 |
| GET | `/api/meta` | 阶段、餐次、忌口等配置 |

## 部署

项目为单进程 Node.js 20 应用，监听 `PORT`（默认 8000），绑定 `0.0.0.0`。

```sh
# 构建产物
mkdir -p dist
cp server.js package.json dist/
cp -R src public dist/
# 启动
cd dist && PORT=8000 node server.js
```

部署到 Trae 托管环境时，使用 `function-web` 类型，构建脚本将 `server.js`、`src/`、`public/` 复制到 `dist/`，启动脚本执行 `node server.js`。

### 数据说明

- 账号、餐单、打卡记录保存在实例的临时目录 `${TMPDIR:-/tmp}/nuanyue-data/db.json`，用于功能演示与个人使用。
- 实例重启后数据会重新播种，不适合作为长期生产数据存储；如需长期保存请接入外部数据库。

## 免责声明

食谱、营养数据与功效说明均为日常饮食参考，不构成医疗建议。产后饮食需结合个人体质、伤口恢复、哺乳情况和医生建议调整；如出现过敏、发热、伤口异常、恶露异常等情况，请及时就医。
