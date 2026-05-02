# Remuse 移动端项目 Handoff

更新时间：2026-05-02

## 1. 当前目标

Remuse 当前目标是先做一个可上线的移动 Web 版本，后续再迁移到微信小程序或 App。产品核心不是传统工具箱，而是“旧物上传 -> 讲述故事 -> AI 理解物品和情绪 -> 生成第二人生建议 -> 保存到展馆 / 生成成果 / 发布到广场”。

当前确认的产品结构：

- 首页：今日幸运好物，上方约 3/4 展示随机旧物、幸运含义、查看详情、收下好运；下方约 1/4 是显眼拍照入口。
- 展馆：个人记忆资产中心，包含藏品、故事、成果、盲盒历史、藏品详情。
- 广场：旧物再生社区，双列视觉流、帖子详情、点赞收藏、一键同款、交换入口、发帖流程。
- 我的：个人资产统计、成就、交换请求、会员入口、设置。
- 上传不作为底部 Tab，而是从首页拍照入口和广场一键同款进入。

视觉方向：

- 简洁的夜间数字博物馆。
- 深色背景、真实旧物图片、克制荧光黄绿 / 冷青点缀。
- 不要明显 AI 味，不要堆功能，不要整张 Figma 图片当背景。
- 所有按钮、文字、卡片、导航、状态都应是真实 HTML/CSS/React 图层。

## 2. 用户最新明确要求

1. 前端要高度还原 Figma/生成图片界面的样式，不能只是粗糙 Demo。
2. 首页“收下好运”按钮右下角缺口已要求修复。
3. 补齐四类成果页：
   - 生成专属贴纸
   - 表情包
   - 拼豆图纸
   - 改造指南
4. 新增欢迎页 / 登录页，支持注册、登录、游客进入，游客进入应更突出。
5. 后端需要重新搭建，不整体迁移 `D:\github\Re-Museum`。
6. `D:\github\Re-Museum` 只用于参考模型供应商、API key、base URL、模型名、代理配置。
7. 密钥只能进入 `.env`，不能写进源码，也不能在回复中暴露。
8. 最终目标是移动 Web 先上线，服务器 IP 是 `47.86.53.69`。

## 3. 当前工作进度

### 3.1 前端已完成

前端目录：`D:\github\remuse-wechat\fronted`

已完成内容：

- 修复首页“收下好运”按钮右下角缺口。
- 新增欢迎页，包含注册、登录、游客进入。
- 游客进入已接后端 `/api/auth/guest`。
- 首页保留“今日幸运好物 + 拍照入口”的移动端结构。
- 上传链路已有基础交互：拍照入口、识别为奶茶袋、故事草稿、继续分析。
- 结果页已有“第二人生说明书”结构。
- 新增四个成果页：
  - `sticker-result`
  - `emoji-pack`
  - `perler-pattern`
  - `guide-result`
- 底部导航为：首页 / 展馆 / 广场 / 我的。
- 中文编码检查脚本已增强，覆盖前端和后端源码。

关键文件：

- `fronted/src/app/App.tsx`
- `fronted/src/app/types.ts`
- `fronted/src/screens/WelcomeScreen.tsx`
- `fronted/src/screens/HomeScreen.tsx`
- `fronted/src/screens/CaptureScreen.tsx`
- `fronted/src/screens/ResultScreen.tsx`
- `fronted/src/screens/GenerationResultScreen.tsx`
- `fronted/src/services/api.ts`
- `fronted/scripts/check-encoding.mjs`
- `fronted/src/styles/index.css`

验证结果：

- `npm run check:encoding` 通过。
- `npm run build` 通过。
- Vite 构建有 Three.js chunk 大于 500k 的警告，不影响运行。
- Playwright 390x844 走通过：欢迎页 -> 游客进入 -> 首页 -> 拍照入口 -> 结果页 -> 专属贴纸页。
- 浏览器控制台错误为 0。

本地前端预览：

- `http://127.0.0.1:5175/`

### 3.2 后端已完成

后端目录：`D:\github\remuse-wechat\backend`

技术栈：

- Express
- TypeScript
- SQLite
- `better-sqlite3`
- `multer`
- `sharp`
- `jsonwebtoken`
- `bcryptjs`
- `@google/genai`

已完成路由：

- `GET /api/healthz`
- `POST /api/auth/guest`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/items`
- `GET /api/items`
- `POST /api/uploads/image`
- `POST /api/ai/analyze-item`
- `POST /api/ai/generate-sticker`
- `POST /api/ai/generate-emoji-pack`
- `POST /api/ai/generate-perler-pattern`
- `POST /api/ai/generate-transformation-guide`
- `GET /api/generated-assets`

AI 接入情况：

- `aiService.ts` 已接入 StepFun 文本分析接口，读取 `.env`。
- `aiService.ts` 已接入 Gemini 生图接口，读取 `.env`。
- 生成图片保存到 `backend/uploads/<userId>/generated/`。
- 生成结果写入 SQLite 的 `generated_assets` 表。
- AI 上游失败时返回本地预览兜底，并带中文 warning，不伪装成真实成功。

关键文件：

- `backend/src/server.ts`
- `backend/src/config.ts`
- `backend/src/database.ts`
- `backend/src/routes/auth.ts`
- `backend/src/routes/items.ts`
- `backend/src/routes/uploads.ts`
- `backend/src/routes/ai.ts`
- `backend/src/routes/generatedAssets.ts`
- `backend/src/services/authService.ts`
- `backend/src/services/aiService.ts`
- `backend/scripts/smoke.ts`
- `backend/.env.example`
- `backend/.env`

注意：

- `backend/.env` 已从 `D:\github\Re-Museum\.env` 中按变量名生成 / 参考配置。
- `.env` 中包含真实密钥，不能提交，不能展示。
- `.gitignore` 已忽略真实 `.env`、数据库、上传文件、构建产物。

验证结果：

- `backend npm run build` 通过。
- `backend npm run smoke` 通过。
- 本地后端健康检查显示 `liveAi: true`。

本地后端预览：

- `http://127.0.0.1:3001/api/healthz`

## 4. 当前问题和风险

### 4.1 前端问题

- 前端已有完整骨架，但仍需要继续做高保真视觉打磨，用户之前明确反馈“现在太丑”，所以不能只满足功能可点。
- 部分页面仍偏原型化，尤其是：
  - 结果页排版还需要更像“第二人生说明书”。
  - 成果页虽然已有，但需要更接近真实产品生成结果。
  - 展馆页应继续借鉴 `D:\github\remuse-wechat\前端\展馆界面.tsx` 中的展馆界面和子界面。
  - 广场详情、一键同款、发布流程还需要更真实的交互状态。
- 目前四类成果页主要是前端静态展示，尚未完全接入后端生成结果的真实返回展示。
- 前端 API 层已经有基础能力，但还需要把上传、分析、生成、保存完整串起来。

### 4.2 后端问题

- 后端是第一版轻量 API，适合移动 Web MVP，不是最终生产级完整服务。
- 目前还缺：
  - 真实文件上传与前端上传流完整联调。
  - 语音转文字接口。
  - 生成结果与藏品详情的双向绑定。
  - 广场帖子、点赞、收藏、交换、发帖接口。
  - 会员、成就、盲盒历史接口。
  - 更严格的配额、限流、错误日志、AI 调用审计。
- Gemini 生图调用已经接入代码，但需要用真实 `.env` 在本机或服务器实际生成一次，确认代理 base URL 和模型名可用。
- StepFun 文本模型也需要真实调用验证。

### 4.3 部署问题

已知服务器 IP：

- `47.86.53.69`

仍缺信息：

- SSH 用户名。
- SSH 私钥或密码。
- 服务器目标目录。
- 是否已有域名。
- 是否已有 Nginx。
- 是否已有 PM2。
- 线上 `.env` 应由用户提供还是从本机安全复制。
- 是否允许在服务器安装 Node、npm、PM2、Nginx。

部署前不要直接上传 `.env` 到公开位置，不要把本地临时文件、截图、`.tmp`、`dist`、`node_modules`、数据库、上传文件一起打包。

## 5. 下一步建议

### 阶段 1：前端高保真继续打磨

优先级最高，因为用户最不满意的是视觉还原。

建议顺序：

1. 重新检查 Figma/生成图，逐页对照前端页面。
2. 首页继续优化：
   - 今日幸运好物主视觉比例。
   - 收下好运动效。
   - 查看详情弹层。
   - 拍照入口占底部 1/4，不能压住底部导航。
3. 展馆页替换 / 融合 `前端/展馆界面.tsx` 的展馆与子页面。
4. 结果页视觉继续升级：
   - 物品识别
   - 故事摘要
   - 情绪回应
   - 主推荐
   - 备选推荐
   - 推荐理由
   - 稀有度 / 价值
5. 四类成果页接后端生成接口，显示真实 payload 和生成图。
6. 广场页补齐真实社区交互状态。
7. 用 Playwright 检查 375x812、390x844、430x932。

### 阶段 2：前后端主链路联调

1. 欢迎页游客进入 -> 后端生成 token。
2. 上传图片 -> `/api/uploads/image`。
3. 创建藏品 -> `/api/items`。
4. AI 分析 -> `/api/ai/analyze-item`。
5. 生成成果 -> 四个 `/api/ai/generate-*`。
6. 保存成果 -> `generated_assets`。
7. 展馆读取藏品与成果。

### 阶段 3：后端补齐业务接口

需要新增或完善：

- 语音转文字。
- 广场帖子 CRUD。
- 点赞收藏。
- 一键同款样式传递。
- 交换请求。
- 今日幸运好物 / 盲盒历史。
- 成就。
- 会员入口。
- 用户设置。

### 阶段 4：上线准备

1. 本地 `fronted npm run check:encoding`。
2. 本地 `fronted npm run build`。
3. 本地 `backend npm run build`。
4. 本地后端 smoke。
5. 生成部署包，排除：
   - `.env`
   - `node_modules`
   - `dist`
   - `backend/data`
   - `backend/uploads`
   - `.tmp`
   - `output`
   - `*.tgz`
   - 调试截图
6. 服务器配置 `.env`。
7. PM2 启动后端。
8. Nginx 反代前端和 `/api`。
9. 生产 smoke。

## 6. 新会话启动 Prompt

请把下面这段复制到新会话开头：

```text
你是 Codex，继续接手 Remuse 移动 Web 项目。仓库路径是 D:\github\remuse-wechat。请先阅读根目录的 HANDOFF-Remuse-2026-05-02.md，然后继续完成任务。

项目目标：先上线一个移动 Web 版本，后续再迁移微信小程序或 App。产品主链路是：旧物上传 -> 讲述故事 -> AI 分析物品和情绪 -> 给出第二人生建议 -> 生成贴纸 / 表情包 / 拼豆图纸 / 改造指南 -> 保存到展馆 / 发布到广场。

用户最新要求：前端要高度还原 Figma/生成图，不要粗糙 Demo；底部导航为 首页 / 展馆 / 广场 / 我的；上传入口在首页和一键同款里；后端独立搭建，不整体迁移 D:\github\Re-Museum，只参考里面的模型供应商、API key、base URL、模型名，密钥只能进 .env，不能写源码或回复。

当前状态：前端已有欢迎页、首页、上传流、结果页、四类成果页；后端已有 Express + TypeScript + SQLite + @google/genai，已实现 auth/items/uploads/ai/generated-assets 基础路由；本地前端预览是 http://127.0.0.1:5175/，后端是 http://127.0.0.1:3001/api/healthz。此前验证：fronted npm run check:encoding 通过，fronted npm run build 通过，backend npm run build 通过，backend npm run smoke 通过，Playwright 390x844 走通欢迎页到专属贴纸页且控制台 0 错误。

下一步请优先做前端高保真：对照 Figma/生成图继续优化首页、结果页、成果页；展馆页要借鉴 D:\github\remuse-wechat\前端\展馆界面.tsx 的展馆和子界面；之后联调前后端主链路。注意不要暴露 .env 密钥，不要提交 backend/data、backend/uploads、dist、node_modules。改中文文案后必须跑 npm run check:encoding。
```

## 7. 当前会话 ID

我无法从当前 Codex 工具上下文中读取平台内部会话 ID。当前环境只暴露了工作目录、日期、工具和开发上下文，没有提供可查询的 conversation/session id。

如果你使用的是 Codex 桌面端，通常可以在应用界面、URL、日志或导出的会话元数据里找到会话 ID；但我不能在当前对话里可靠读取它。
