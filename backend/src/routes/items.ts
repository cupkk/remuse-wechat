import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db, toItemRecord, type ItemRow } from "../database.js";
import { authMiddleware } from "../middleware/auth.js";
import { generateItemCover } from "../services/aiService.js";

export const itemsRouter = Router();
const coverJobs = new Map<string, Promise<void>>();

const itemSchema = z.object({
  name: z.string().min(1).max(80),
  category: z.string().min(1).max(40).default("旧物"),
  story: z.string().max(2000).default(""),
  imageUrl: z.string().nullable().optional(),
  analysis: z.record(z.string(), z.unknown()).optional()
});

const updateItemSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  category: z.string().min(1).max(40).optional(),
  story: z.string().max(2000).optional(),
  analysis: z.record(z.string(), z.unknown()).optional()
});

itemsRouter.use(authMiddleware);

itemsRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC").all(req.userId!) as ItemRow[];
  rows.forEach((row) => scheduleItemCoverGeneration(row));
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
    "INSERT INTO items (id, user_id, name, category, story, image_url, cover_image_url, analysis_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    id,
    req.userId!,
    parsed.data.name,
    parsed.data.category,
    parsed.data.story,
    parsed.data.imageUrl || null,
    null,
    parsed.data.analysis ? JSON.stringify(parsed.data.analysis) : null
  );

  const row = db.prepare("SELECT * FROM items WHERE id = ?").get(id) as ItemRow;
  scheduleItemCoverGeneration(row);
  res.status(201).json({ ok: true, data: toItemRecord(row) });
});

itemsRouter.patch("/:id", (req, res) => {
  const parsed = updateItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: "藏品信息不完整。" });
    return;
  }

  const existing = db.prepare("SELECT * FROM items WHERE id = ? AND user_id = ?").get(req.params.id, req.userId!) as ItemRow | undefined;
  if (!existing) {
    res.status(404).json({ ok: false, error: "没有找到这件藏品。" });
    return;
  }

  const nextName = parsed.data.name ?? existing.name;
  const nextCategory = parsed.data.category ?? existing.category;
  const nextStory = parsed.data.story ?? existing.story;
  const nextAnalysis =
    parsed.data.analysis !== undefined ? JSON.stringify(parsed.data.analysis) : existing.analysis_json;

  db.prepare("UPDATE items SET name = ?, category = ?, story = ?, analysis_json = ? WHERE id = ? AND user_id = ?").run(
    nextName,
    nextCategory,
    nextStory,
    nextAnalysis,
    req.params.id,
    req.userId!
  );

  const row = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id) as ItemRow;
  if (row.image_url && !row.cover_image_url) scheduleItemCoverGeneration(row);
  res.json({ ok: true, data: toItemRecord(row) });
});

function scheduleItemCoverGeneration(item: ItemRow) {
  if (!item.image_url || item.cover_image_url) return;
  const jobKey = `${item.user_id}:${item.id}`;
  if (coverJobs.has(jobKey)) return;

  const job = (async () => {
    try {
      const coverImageUrl = await generateItemCover({
        userId: item.user_id,
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        story: item.story,
        imageUrl: item.image_url
      });
      db.prepare("UPDATE items SET cover_image_url = ? WHERE id = ? AND user_id = ? AND (cover_image_url IS NULL OR cover_image_url = '')").run(
        coverImageUrl,
        item.id,
        item.user_id
      );
    } catch (error) {
      console.warn("items.cover_generation_failed", {
        itemId: item.id,
        userId: item.user_id,
        message: error instanceof Error ? error.message : String(error)
      });
    } finally {
      coverJobs.delete(jobKey);
    }
  })();

  coverJobs.set(jobKey, job);
  void job;
}
