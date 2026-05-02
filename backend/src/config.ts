import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const config = {
  port: Number(process.env.PORT || 3001),
  host: process.env.HOST || "127.0.0.1",
  jwtSecret: process.env.JWT_SECRET || "remuse-dev-secret-change-before-production",
  dbPath: path.resolve(backendRoot, process.env.DB_PATH || "./data/remuse-mobile.db"),
  uploadsDir: path.resolve(backendRoot, process.env.UPLOADS_DIR || "./uploads"),
  disableLiveAi: process.env.DISABLE_LIVE_AI === "true",
  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES || 6 * 1024 * 1024),
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    baseUrl: process.env.GEMINI_BASE_URL || "https://cdn.12ai.org",
    imageModel: process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview",
    timeoutMs: Number(process.env.GEMINI_IMAGE_TIMEOUT_MS || 90_000)
  },
  stepfun: {
    apiKey: process.env.STEPFUN_API_KEY || "",
    baseUrl: process.env.STEPFUN_BASE_URL || "https://api.stepfun.com/v1",
    textModel: process.env.STEPFUN_TEXT_MODEL || "step-3.5-flash",
    timeoutMs: Number(process.env.STEPFUN_TIMEOUT_MS || 30_000)
  }
};
