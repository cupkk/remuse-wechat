# Re-Museum 研究进展日志 20260503

## 总体研究进展

项目目标是把 Re-Museum 的现场体验链路稳定到真实用户可用：游客进入、拍照或相册上传旧物、AI 识别物品并接收故事或语音、自动入馆、继续生成表情包 / 改造指南 / 拼豆图纸，并能在展馆、我的日历和广场继续浏览。

当前仓库为移动端应用代码，前端在 `fronted/`，后端在 `backend/`。生产移动端站点是 `https://app.remuse.top`，后端 PM2 进程为 `remuse-wechat-app`，主站进程为 `re-museum`。部署时只能操作移动端应用目录和移动端静态资源目录，不得影响主站。

本阶段优先保证用户现场主链路，而不是扩展新功能。重点是：减少界面文字和杂乱 UI、修复移动端 safe area 和返回流、补齐广场 / 发布 / 详情的真实数据闭环、确保上传和 AI 失败不伪装成功，并拆分基础 smoke 与真实 AI smoke。

## 2026-05-03 更新

- 读取并确认当前工作树已有大量未提交改动，均视为有效成果保留，不做回滚。
- 确认后续计划以用户可用版硬化为目标：游客现场链路、移动端可用性、真实数据闭环、部署安全。
- 后端已补齐广场真实数据链路：新增 `plaza_posts` 表、官方精选 seed、`GET /api/plaza`、`GET /api/plaza/official`、`POST /api/plaza`。
- 前端已改为真实广场帖子流：广场点击进入真实帖子详情，发布页必须从已有藏品选择，发布成功后进入真实帖子详情。
- 基础 smoke 已从真实 AI 生成中拆出；`backend/scripts/smoke-live-ai.ts` 用于单独验证 live AI 生成。
- 主链路生成入口已收敛为表情包、改造指南、拼豆图纸；贴纸不再作为现场主流程入口。
- 前端多个页面已统一通过 `resolveMediaUrl` 解析上传和生成图片路径，后端 `/api/uploads` 已补充跨源资源策略。
- 移动端重点问题已修：欢迎页游客按钮、广场顶部 safe area、固定发布按钮、发布返回、展馆空白旋转卡片、我的设置入口。
- 本地验证曾通过：后端构建、前端编码检查、前端构建、基础 smoke、375x812 移动视口关键流程；本次继续前需要重新验证。
- 本轮清理了本地测试残留 `backend/uploads-ui/` 和 `remuse-gallery-check.png`。
- `fronted/tsconfig.tsbuildinfo` 是被 Git 跟踪的构建缓存，已恢复，避免把无关删除混入上线改动。

## 当前待办

1. 重新运行 `fronted` 编码检查与构建。
2. 重新运行 `backend` 构建。
3. 启动本地后端并运行基础 smoke。
4. 用移动视口复查关键页面和现场主链路。
5. 部署前备份服务器移动端数据和必要配置，打包时排除 `.env`、数据库、uploads、backups、临时截图、构建缓存。
6. 只重启 PM2 `remuse-wechat-app`，不得重启 `re-museum`。
7. 部署后验证 `https://app.remuse.top/api/healthz`、PM2 状态、生产页面移动端可用性和失败态不伪成功。

## 2026-05-03 本轮验证补充

- 重新运行 `fronted npm run check:encoding` 通过。
- 重新运行 `fronted npm run build` 通过，仍有字体包和单 chunk 较大的 Vite 警告，暂不阻塞上线。
- 重新运行 `backend npm run build` 通过。
- 修复 `backend/scripts/smoke.ts` 中残留乱码和语法风险，基础 smoke 使用正常中文测试数据。
- 使用独立本地后端端口 `3101`、独立数据库 `data/smoke-local.db`、独立上传目录 `uploads-smoke` 运行 `backend npm run smoke` 通过。
- 使用 375x812 视口复查欢迎页：首页首屏能看到“游客体验”，日期为 05/03，文案为“把旧物交给一座有记忆的博物馆”。
- 使用 375x812 视口复查游客首页：能看到“游客身份”和“拍照 / 上传”，空态不伪造藏品。
- 使用真实本地测试图复查上传链路：相册上传后图片真实保存，AI 分析和创建藏品成功，页面进入“已入馆”，保留故事输入和“表情包 / 改造指南 / 拼豆图纸”三个入口。
- 在 `DISABLE_LIVE_AI=true` 环境复查生成失败：点击表情包后显示“未生成 / 故事已保留 / 再试一次”，没有伪装成成功模板；点击“再试一次”会重新请求后端。
- 发现展馆 3D 组件在只有 1 件藏品时仍补多张空白卡片，不符合用户“一件只显示一张”的要求；已修改 `fronted/src/components/VanillaSphereGallery.tsx`：有藏品时只渲染真实藏品数量，0 件藏品时才渲染可旋转空白卡片。
- 复查展馆：0 件藏品时显示多张可旋转空白卡片；1 件藏品时只显示一张真实卡片。
- 复查广场：顶部标题在移动端未被遮挡；发布按钮固定在视口底部上方，滚动列表时坐标不变。
- 复查发布页：只能从已有藏品选择发布；左上返回按钮回到广场。
- 复查“我的”：保留中国真实日历/手账视图，设置 bottom sheet 中包含退出登录。

## 2026-05-03 生产部署记录

- 部署前确认生产 `https://app.remuse.top/api/healthz` 正常，`liveAi=true`。
- 只读检查服务器：磁盘 `/` 使用率约 83%，PM2 中 `re-museum` 与 `remuse-wechat-app` 均在线。
- 部署前备份移动端后端 `data/` 和 `.env` 到 `/home/ecs-user/remuse-wechat-app/deploy-backups/20260503-120501`。
- 部署前备份前端静态目录到 `/home/ecs-user/remuse-wechat-app/deploy-backups/20260503-121105-front-www`。
- 本地构建产物打包时排除了 `.env`、数据库、uploads、backups、node_modules、测试截图和临时目录。
- 服务器没有 `unzip` 和 `rsync`，第一次 zip 解压方案失败；未同步前端、未重启 PM2。随后改用 tar 包和 Python/tar 解压。
- 第二次脚本在 `rsync` 缺失处停止；此时后端 `dist` 已覆盖但 PM2 尚未重启，前端尚未替换。随后用 `cp` 和受限清理完成前端替换。
- 最终只重启 PM2 `remuse-wechat-app`，未重启 `re-museum`。
- 部署后验证：
  - `curl https://app.remuse.top/api/healthz` 正常。
  - 首页 HTML 已引用新前端资源 `index-BWFuY0Yq.js` 和 `index-Cam0IyFB.css`。
  - `backend npm run smoke` 指向生产通过。
  - 用 375x812 线上视口复查欢迎页、游客首页和广场：游客体验按钮可见，游客身份和拍照/上传可见，广场标题未遮挡，发布按钮固定。
  - `/api/plaza/official` 返回后端 seed 的官方精选，中文正常。
- 生产 smoke 创建了一条游客测试帖子“奶茶杯套”；已按精确 ID 清理该游客、藏品和广场帖子，避免污染线上广场。
- zip 方案失败时曾在服务器移动端后端目录留下带反斜杠文件名的无效文件；已用受限脚本清理，未触碰真实数据目录和主站。
- 本地 `.deploy-stage`、`test-results` 和临时截图/测试数据库已清理。

## 后续建议

1. 尽快补一个不会污染生产数据的 smoke 模式，例如给 smoke 创建的数据加固定 `source=smoke` 字段或使用专门清理接口。
2. 生产 live AI 成功链路尚未做完整生成成功验证；本轮本地验证了失败态不伪成功，生产健康显示 `liveAi=true`，但真实模型成功率仍需要用现场测试图再跑一次。
3. 前端字体包很大，Vite 构建持续提示 chunk/font 体积偏大；上线不阻塞，但后续应做字体子集化或按需加载，优化首屏等待。

## 2026-05-03 抠图封面与真实链路更新

- 用户新增要求：上传图片入馆后，要把真实图片进一步做抠图/贴纸化处理，并作为展馆 3D 卡片封面；原始上传图仍需保留给多模态分析和后续生成使用。
- 参考了 `D:\github\Re-Museum` 的实现思路：主站使用 `cover_image_path`、`generateCollectionCoverTask`、`subjectCutout` 和后台封面刷新任务；本仓库采用更窄的移动端版本，不引入完整主站封面模板体系。
- 后端改动：
  - `backend/src/database.ts` 为 `items` 增加 `cover_image_url` 字段，并加幂等 `ensureColumn` 迁移。
  - `backend/src/types.ts` 和 `fronted/src/app/types.ts` 增加 `coverImageUrl`。
  - `backend/src/services/aiService.ts` 新增 `generateItemCover`：调用 Gemini 图像模型，输入上传图片 + 物品名/分类/故事，要求生成干净贴纸式封面；生成后保存到 `/api/uploads/<userId>/item-covers/...`。
  - `generateItemCover` 增加轻量后处理：对边缘近似纯色背景做透明化，尽量让封面更像抠图贴纸；如果无明显背景可删，则保留模型输出。
  - `backend/src/routes/items.ts` 在创建藏品后启动后台封面生成任务；`GET /items` 对历史有原图但无封面的藏品也会补触发任务。封面失败只记录日志，不阻塞入馆。
  - `backend/src/routes/plaza.ts` 发布时优先使用生成成果图，其次使用 `item.cover_image_url`，最后回退原图。
  - `backend/src/config.ts` 将默认分析模型改为 `gemini-2.5-flash`，避免用生图模型做 JSON 分析；Gemini 分析失败后会降级到 StepFun 文本分析，再失败才本地结构化兜底，防止现场入馆被模型拒绝卡死。
- 前端改动：
  - `GalleryScreen`、`HomeScreen`、`PublishScreen` 改为优先展示 `coverImageUrl || imageUrl`。
  - `App.tsx` 增加短轮询：有图片但无封面的藏品会在入馆后短时间自动刷新 `/items`，封面生成完成后 UI 自然切到封面。
  - 修复 `VanillaSphereGallery` 单件藏品侧边显示问题：单件藏品不再 `lookAt(0,0,0)`，改为正面朝向用户并轻微摆动；0 件藏品仍显示可旋转空白卡片。
- 本地验证：
  - `cd backend && npm run build` 通过。
  - `cd fronted && npm run check:encoding && npm run build` 通过；仍有 Vite chunk/font 体积警告，暂不阻塞。
  - 使用独立本地服务 `http://127.0.0.1:3011` 和真实图片 `.playwright-mcp/remuse-test-item.png` 跑 `backend npm run smoke` 通过。
  - `backend npm run smoke:live-ai` 已改为真实链路：游客登录 -> 上传图片 -> AI 分析 -> 创建藏品 -> 等待 `coverImageUrl` -> 访问封面 -> 生成表情包 -> 确认 `generated_assets` 落库；本地通过，生成封面路径包含 `/item-covers/`。
  - Playwright 390x844 验证：欢迎页、游客首页、上传入馆、故事输入、三个生成按钮、展馆空态旋转卡片、有一件藏品时单张正面 3D 卡片、点击卡片进入详情均正常。
- 生产部署：
  - 部署前备份到 `/home/ecs-user/remuse-wechat-app/deploy-backups/20260503-130117-cutout-cover`。
  - 只操作 `/home/ecs-user/remuse-wechat-app` 和 `/var/www/remuse-app`；只重启 PM2 `remuse-wechat-app`；未重启、未修改 `re-museum` 主站进程。
  - 生产健康检查 `https://app.remuse.top/api/healthz` 通过，`liveAi=true`。
  - 生产 `backend npm run smoke:live-ai` 指向 `https://app.remuse.top` 通过，真实生成了上传图、`item-covers` 封面和表情包生成资产。
  - 生产 smoke 创建的测试用户 `1762e66f-2b0a-4786-a8af-6a3582626120` 已精确清理：删除 1 个 item、1 个 generated_asset、0 个 plaza post，并删除对应 uploads 目录。
- 当前线上模型配置只读确认：
  - 图片生成：`GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview`，`GEMINI_BASE_URL=https://cdn.12ai.org`，`GEMINI_API_KEY=set`。
  - 文本：`STEPFUN_TEXT_MODEL=step-3.5-flash`，`STEPFUN_API_KEY=set`。
  - 线上 `.env` 未显式设置 `GEMINI_ANALYSIS_MODEL`，部署后的代码默认使用 `gemini-2.5-flash` 做分析。
- 国内生图模型初步建议：
  - 优先候选：阿里云百炼 Qwen-Image / Qwen-Image-Edit / 通义万相。理由是国内访问、文生图与图像编辑链路完整，文档和 OpenAI 兼容生态较清晰，适合先作为 Gemini 生图降本提速替代。
  - 第二候选：腾讯混元图像。理由是中文语义和 API 兼容性较好，适合做表情包/封面类中文创意图；需要实测图生图和透明/抠图效果。
  - 可评估：百度千帆图像生成。价格通常有优势，但对“上传图 + 故事”的贴纸式编辑质量需要样例实测。
  - 待核价：火山方舟 Seedream / 豆包图像。能力很强且国内链路可能更快，但正式接入前必须以控制台/合同价格为准。
- 下一步建议：
  1. 抽象 `imageProvider`，保留 Gemini 为默认，新增阿里百炼 provider 做 A/B 测试。
  2. 增加封面生成状态字段或后台任务表，避免前端只能通过短轮询猜测。
  3. 对真实拍摄物品再收集 5-10 张样本，比较 Gemini、Qwen-Image-Edit、混元的封面质量、耗时和单次成本。
