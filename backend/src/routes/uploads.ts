import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { config } from "../config.js";
import { authMiddleware } from "../middleware/auth.js";

export const uploadsRouter = Router();

fs.mkdirSync(config.uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes }
});

uploadsRouter.post("/image", authMiddleware, upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ ok: false, error: "请选择一张图片。" });
    return;
  }

  try {
    const userDir = path.join(config.uploadsDir, req.userId!);
    fs.mkdirSync(userDir, { recursive: true });
    const fileName = `${randomUUID()}.webp`;
    const absolutePath = path.join(userDir, fileName);

    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 86 })
      .toFile(absolutePath);

    res.status(201).json({
      ok: true,
      data: {
        url: `/api/uploads/${req.userId}/${fileName}`
      }
    });
  } catch {
    res.status(500).json({ ok: false, error: "图片暂时没有上传成功，请再试一次。" });
  }
});
