import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config.js";
import "./database.js";
import { aiRouter } from "./routes/ai.js";
import { authRouter } from "./routes/auth.js";
import { generatedAssetsRouter } from "./routes/generatedAssets.js";
import { itemsRouter } from "./routes/items.js";
import { uploadsRouter } from "./routes/uploads.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-origin" } }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(rateLimit({ windowMs: 5 * 60 * 1000, limit: 240 }));

  app.get("/api/healthz", (_req, res) => {
    res.json({
      ok: true,
      data: {
        service: "remuse-mobile-backend",
        timestamp: new Date().toISOString(),
        liveAi: !config.disableLiveAi
      }
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/items", itemsRouter);
  app.use("/api/uploads", uploadsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/generated-assets", generatedAssetsRouter);

  fs.mkdirSync(config.uploadsDir, { recursive: true });
  app.use("/api/uploads", express.static(path.resolve(config.uploadsDir), { maxAge: "1d" }));

  app.use("/api", (_req, res) => {
    res.status(404).json({ ok: false, error: "未找到对应接口。" });
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (res.headersSent) return;
    const message = error instanceof Error ? error.message : "服务器开小差了，请稍后再试。";
    res.status(500).json({ ok: false, error: message });
  });

  return app;
}

export function startServer() {
  const app = createApp();
  return app.listen(config.port, config.host, () => {
    console.log(`Remuse mobile API listening at http://${config.host}:${config.port}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}
