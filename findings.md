# Re-Museum 项目发现记录

## 项目结构

- 前端入口：`fronted/src/main.tsx`、`fronted/src/app/App.tsx`。
- 前端页面：欢迎、首页、拍照、识别结果、生成 loading、生成结果、展馆、广场、发布、我的日历。
- 前端 API 封装：`fronted/src/services/api.ts`。
- 后端入口：`backend/src/server.ts`。
- 后端路由：`auth`、`uploads`、`items`、`ai`、`generated-assets`、`plaza`。
- 后端核心：`backend/src/database.ts`、`backend/src/services/aiService.ts`、`backend/src/services/authService.ts`。

## 前端初步发现

- `App.tsx` 采用本地组件状态编排全局流程，没有引入全局状态库，符合项目约束。
- 首屏欢迎页已经把“游客体验”作为主按钮，登录/注册在 bottom sheet 中。
- 首页“今日好物”使用 `featuredItem`，来源是当前 item 或用户藏品第一条；无藏品时显示真实空态。
- 拍照页链路为：选择文件 -> 上传图片 -> AI 分析 -> 创建藏品 -> 进入结果页。
- 识别结果页已经包含 AI 主推荐、2x2 生成入口、中心旧物预览和“立即生成”主按钮。
- 生成触发集中在 `App.tsx` 的 `handleStartGeneration`，失败会写入 `generationError` 并停留在 loading 页。

## 风险初步记录

- 后端 AI 已确认会读取 `/api/uploads/...` 对应本地文件，并以 `inlineData` 传给 Gemini；分析和生成均具备多模态输入基础。
- `generated_assets` 表已存在，生成结果会落库，前端会读取并用于展馆 / 我的最近成果。
- 广场官方精选已从后端 `/api/plaza/official` 返回，前端主链路未引用 `mockData.ts`。

## 已开发能力

- 欢迎 / 登录：游客体验为首屏主 CTA；登录注册为 bottom sheet；游客会显示“游客身份”。
- 首页：今日好物优先取用户藏品；无藏品显示真实空态，引导上传。
- 拍照录入：选择图片、上传文件、填写故事、调用分析、创建藏品、进入结果页。
- AI 分析：输出物品识别、故事摘要、情绪回应、主推荐、备选推荐、推荐理由、稀有度/价值。
- 生成链路：四类生成接口已经接入；生成失败不伪装成功；成功后保存图片和 `generated_assets`。
- 结果页：主推荐 + 立即生成，四个 2x2 快捷圆块围绕旧物预览。
- 展馆：基于参考展馆文件实现 3D 球形卡片；真实藏品占用真实卡片，空位为暗色占位卡。
- 我的：有真实中国日历/农历标签，按藏品和生成成果日期标记手账数量。
- 广场：官方精选从后端 seed 路由返回。

## 主要不足

- 展馆在 `works.length === 0` 时不初始化的问题已修复，现在空展馆也会渲染 3D 空白卡片。
- 展馆详情里的表情包 / 拼豆 / 改造按钮已改为真实生成链路，会进入 loading 并调用对应后端接口。
- 发布页只是本地表单和跳转，没有真正创建广场帖子。
- 广场详情页仍是硬编码票根内容和图片占位，没有绑定所点击的真实官方 post。
- 拍照页已允许无故事继续分析；选图后会显示第一层识别反馈。
- 后端 smoke 当前直接测生成接口；如果无 live AI 或模型失败会失败，不适合作为稳定 CI smoke，需要拆成基础 smoke 和 live AI smoke。
- 缺语音转文字、点赞收藏、交换请求、一键同款风格传递、成就/盲盒/会员等业务接口。
- AI 调用已有全局 rate limit，但还缺按用户/按模型的配额、调用审计和更明确的错误日志。
- `fronted/src/data/mockData.ts` 已不在主链路引用，但仍保留，后续可删除或移到 demo 文档，减少误用风险。

## 本轮 P0 验证

- `fronted npm run check:encoding` 通过。
- `backend npm run build` 通过。
- `fronted npm run build` 通过；仍有既有 Vite 大 chunk 警告。
- 375x812 浏览器验证：空展馆有 Three.js canvas，显示 `0 件藏品`。
- 375x812 浏览器验证：无故事上传测试图片后，“分析”按钮可用，并成功创建真实藏品。
- 375x812 浏览器验证：生成接口在本地 `liveAi:false` 下返回 502，前端显示“这次没有生成成功”和“再试一次”，没有伪装成功。
- 375x812 浏览器验证：点击“再试一次”会重新请求同一生成接口。
- 375x812 浏览器验证：展馆详情入口点击“表情包”会请求 `/api/ai/generate-emoji-pack`，并进入同一失败/重试 UI。
