import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db, toItemRecord, type ItemRow } from "../database.js";
import { authMiddleware } from "../middleware/auth.js";

export const itemsRouter = Router();

const itemSchema = z.object({
  name: z.string().min(1).max(80),
  category: z.string().min(1).max(40).default("旧物"),
  story: z.string().max(2000).default(""),
  imageUrl: z.string().nullable().optional(),
  analysis: z.record(z.string(), z.unknown()).optional()
});

itemsRouter.use(authMiddleware);

itemsRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC").all(req.userId!) as ItemRow[];
  res.json({ ok: true, data: rows.map(toItemRecord) });
});

itemsRouter.post("/", (req, res) => {
  const parsed = itemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: "藏品信息不完整。" });
    return;
  }

  const id = randomUUID();
  db.prepare(
    "INSERT INTO items (id, user_id, name, category, story, image_url, analysis_json) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    id,
    req.userId!,
    parsed.data.name,
    parsed.data.category,
    parsed.data.story,
    parsed.data.imageUrl || null,
    parsed.data.analysis ? JSON.stringify(parsed.data.analysis) : null
  );

  const row = db.prepare("SELECT * FROM items WHERE id = ?").get(id) as ItemRow;
  res.status(201).json({ ok: true, data: toItemRecord(row) });
});
