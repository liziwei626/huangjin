# 暖月 · 月子餐智能搭配

一个移动端优先、桌面端自适应的月子餐搭配小程序（H5）。根据产后天数、分娩方式、喂养方式与忌口，自动生成 7 / 28 天不重样的三餐三点餐单，并汇总采购清单、记录每日体重饮水睡眠、统计打卡与恢复进度。

同时提供独立的电脑端管理后台（`/admin`），用于维护菜品、知识库内容与用户账号，并为后续自助点餐预留了价格、上下架与角色体系。

前后端一体，零第三方运行时依赖，可直接部署为单个 Node.js 20 Web 服务。

## 功能

- **账号体系**：注册 / 登录（scrypt 加盐哈希 + HMAC 签名 Token）、修改密码、内置体验账号
- **电脑端适配**：宽度 ≥1000px 时自动切换为侧边导航 + 宽屏内容区，今日页双栏、食谱 4-5 列、详情弹层居中，手机端保持原底部 Tab 体验
- **管理后台**：`/admin` 独立桌面端后台，概览用户/菜品/内容指标，支持菜品与文章的增改删、上架下架、价格维护，以及用户角色、停用、重置密码与删除
- **文章抓取**：后台粘贴网页链接即可抓取标题、摘要与正文，自动生成草稿，核对修改后再发布；也可直接手动撰写发布
- **点餐基础数据**：菜品包含价格与上下架状态，后台创建/编辑的菜品会实时同步到前台，为后续自助点餐直接复用
- **产后档案**：分娩日期、分娩方式、喂养方式、口味、热量目标、每日餐次
- **阶段化搭配**：按产后第 1 周 / 第 2 周 / 第 3-4 周 / 第 5 周起四个阶段匹配食谱与调养重点
- **智能餐单**：7 / 28 天餐单自动生成，28 天按周切换；避开忌口、控制重复、荤素与蛋白质轮换
- **餐单管理**：任意一道菜「换一道」、按餐「跳过」、从食谱库直接「加入某一餐」、整单重新生成
- **食谱库**：212 道内置月子餐 + 自定义食谱，每道菜配有独立成品图，含食材、步骤、热量与蛋白质/碳水/脂肪、钙/铁/膳食纤维估算、烹饪方式、难度、注意事项、食材替换、素食标识与相似推荐；支持搜索、品类/阶段/餐次/功效/做法/用时/热量筛选、排序、收藏与「做过」标记
- **菜品图片管理**：后台可为任意菜品上传 JPG / PNG / WebP 图片（≤5MB），也可选择自动匹配或内置分类图，保存后前台立即生效
- **精选合集**：催乳优选、补铁补血、快手早餐、一锅炖汤、低脂晚餐、高钙食谱、解馋加餐、素食友好 8 个场景合集，一键筛出想吃的
- **食谱笔记**：每道菜都可以标记「做过」并写下自己的笔记，下次做的时候直接翻看
- **推荐搭配**：食谱详情里按同阶段推荐主食、主菜、蔬菜、汤羹，一餐搭配不用再想
- **自定义食谱**：可以把家里的方子录进食谱库，填写食材、做法和营养估算，保存后能直接加入餐单、进入采购清单
- **调养记录**：体重（30 天趋势）、体温、血压、饮水（8 杯打卡）、睡眠时长与质量、心情、疲劳、活动分钟、补剂、恶露量/颜色/气味、伤口、乳房、疼痛、排便与备注
- **健康提醒**：体温 ≥37.5℃、血压偏高、伤口红肿疼痛、恶露异味、乳房硬块、剧烈疼痛、连续情绪低落等情况会自动给出就医/护理提醒
- **记录统计**：42 天恢复日历、本周小结（记录天数、平均睡眠、饮水达标、体重变化、异常提醒）、饮水/睡眠/体温趋势、CSV 导出
- **采购清单**：按餐单自动汇总食材用量（含自定义食谱），按品类分组，可勾选、隐藏已购、一键复制清单
- **吃饭打卡**：按餐打卡 / 跳过，统计完成率与连续打卡天数
- **月子知识库**：7 篇分阶段饮食、催乳、便秘水肿、忌口排查、常见误区和体重管理文章
- **数据导出**：一键导出个人档案、餐单、记录、收藏与自定义食谱的 JSON 备份
- **PWA**：可添加到手机主屏幕，弱网下仍能打开应用外壳
- **安全提醒**：母乳 / 混合喂养自动排除含酒精菜品；页面内含免责声明

## 技术栈

- 前端：原生 HTML / CSS / JavaScript（无构建步骤，移动端优先并适配桌面端，Service Worker 离线缓存）
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

管理后台：<http://localhost:8000/admin>，初始管理员 `admin` / `admin123456`（登录后请及时修改密码）。

## GitHub Pages 纯静态版

GitHub Pages 只能托管静态文件，因此额外提供了纯前端版本：

```bash
node scripts/build-pages.js
```

构建产物在 `docs/`，可直接由 GitHub Pages 从 `main` 分支的 `/docs` 目录发布。静态版把账号、餐单、健康记录、收藏、后台菜品/文章修改保存在当前浏览器的 `localStorage`，不依赖 Node 服务。

- 前台：`https://<用户名>.github.io/<仓库名>/`
- 后台：`https://<用户名>.github.io/<仓库名>/admin.html`
- 静态版限制：账号与数据仅当前浏览器可见；文章抓取受浏览器跨域限制，失败时可将正文粘贴到「正文」框后发布。

开发期配图脚本：`node scripts/fetch-dish-images.js`，打包脚本：`node scripts/pack-dish-images.js`。

## 目录结构

```
server.js              HTTP 服务入口（静态资源 + API 分发）
src/
  api.js               全部 API 路由与业务处理
  content.js           后台菜品/内容覆盖存储与管理
  article-fetch.js     文章链接抓取与正文解析
  net.js               支持系统代理的网页抓取工具
  auth.js              密码哈希与 Token 签发/校验
  db.js                JSON 存储与种子数据
  planner.js           阶段计算、餐单生成、换菜、清单汇总、统计
  data/recipes.js      212 道月子餐食谱库
  data/dish-images.bin 212 道菜品的成品图二进制包
  data/dish-images-index.json 菜品图偏移索引
  data/recipe-utils.js 营养估算、烹饪方式、注意事项与食材替换规则
  data/meta.js         阶段、餐次、忌口、功效、记录选项等配置
  data/articles.js     月子知识库文章
public/
  index.html           应用外壳
  app.js               单页应用逻辑
  styles.css           移动端 + 桌面端自适应样式
  admin.html           管理后台外壳
  admin.js             管理后台单页逻辑
  admin.css            管理后台桌面端样式
  sw.js                Service Worker 离线缓存
  images/              分类配图
scripts/
  fetch-dish-images.js 开发期菜品配图抓取与去重脚本
  pack-dish-images.js  将菜品图打包为部署用二进制文件
```

## API 一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/auth/me` | 当前用户、档案、餐单概览 |
| POST | `/api/auth/password` | 修改密码 |
| GET/PUT | `/api/profile` | 读取 / 更新产后档案 |
| GET | `/api/recipes` | 食谱列表（含当前用户的自定义食谱） |
| GET | `/api/recipes/:id` | 食谱详情（营养、注意事项、替换建议） |
| POST | `/api/recipes/:id/favorite` | 收藏 / 取消收藏 |
| POST | `/api/recipes/:id/cook` | 标记 / 取消「做过」 |
| PUT | `/api/recipes/:id/note` | 保存个人食谱笔记 |
| POST | `/api/recipes/custom` | 新增自定义食谱 |
| PUT | `/api/recipes/custom/:id` | 编辑自定义食谱 |
| DELETE | `/api/recipes/custom/:id` | 删除自定义食谱 |
| GET | `/api/favorites` | 收藏列表 |
| GET | `/api/plan` | 指定日期的餐单与本周概览 |
| POST | `/api/plan/generate` | 生成 7 / 28 天餐单 |
| POST | `/api/plan/swap` | 单道菜替换 |
| POST | `/api/plan/skip` | 跳过 / 取消跳过某一餐 |
| POST | `/api/plan/apply` | 把食谱库中的菜加入某一餐 |
| POST | `/api/plan/eat` | 打卡 / 取消打卡 |
| GET | `/api/logs` | 体重、饮水、睡眠等每日记录 |
| PUT | `/api/logs/:date` | 保存某天的记录 |
| GET | `/api/grocery` | 采购清单（按日期范围汇总） |
| POST | `/api/grocery/toggle` | 勾选 / 取消勾选 |
| POST | `/api/grocery/clear` | 清空勾选 |
| GET | `/api/stats` | 打卡统计 |
| GET | `/api/export` | 导出个人数据 |
| GET | `/api/articles` | 月子知识库列表 |
| GET | `/api/articles/:id` | 知识文章详情 |
| GET | `/api/meta` | 阶段、餐次、忌口、功效、记录选项等配置 |

### 管理后台 API

以下接口需在 `Authorization: Bearer <token>` 中携带管理员 Token。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/admin/overview` | 用户、菜品、内容与打卡概览 |
| GET/POST | `/api/admin/recipes` | 菜品列表（含下架）/ 新增菜品 |
| PUT/DELETE | `/api/admin/recipes/:id` | 编辑 / 删除后台创建的菜品 |
| PATCH | `/api/admin/recipes/:id/status` | 上架 / 下架 |
| GET/POST | `/api/admin/articles` | 文章列表 / 新增文章 |
| PUT/DELETE | `/api/admin/articles/:id` | 编辑 / 删除后台创建的文章 |
| PATCH | `/api/admin/articles/:id/status` | 上架 / 下架 |
| POST | `/api/admin/articles/fetch` | 抓取网页文章并生成草稿 |
| POST | `/api/admin/upload` | 上传菜品图片（base64，≤5MB） |
| GET | `/api/admin/users` | 用户列表（含角色、使用情况） |
| GET/PATCH/DELETE | `/api/admin/users/:id` | 用户详情 / 角色与状态、重置密码 / 删除 |

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

- 账号、餐单、打卡记录与后台内容（菜品/文章编辑、上下架、上传图片）保存在实例的临时目录 `${TMPDIR:-/tmp}/nuanyue-data/`，用于功能演示与个人使用。
- 内置菜品配图由开发期脚本从公开网络检索并按菜名逐道下载，仅作演示用途；正式商用前请替换为自有版权图片。后台可直接上传替换任意菜品图片。
- 实例重启后数据会重新播种，不适合作为长期生产数据存储；如需长期保存请接入外部数据库。

## 免责声明

食谱、营养数据与功效说明均为日常饮食参考，不构成医疗建议。产后饮食需结合个人体质、伤口恢复、哺乳情况和医生建议调整；如出现过敏、发热、伤口异常、恶露异常等情况，请及时就医。
