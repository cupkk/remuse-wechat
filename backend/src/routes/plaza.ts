import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { db, toPlazaPostRecord, type GeneratedAssetRow, type ItemRow, type PlazaPostRow, type UserRow } from "../database.js";

export const plazaRouter = Router();

const publishSchema = z.object({
  itemId: z.string().min(1),
  generatedAssetId: z.string().nullable().optional(),
  title: z.string().min(1).max(80).optional(),
  allowSameStyle: z.boolean().optional(),
  allowExchange: z.boolean().optional()
});

plazaRouter.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM plaza_posts ORDER BY is_official ASC, created_at DESC, likes DESC")
    .all() as PlazaPostRow[];
  res.json({ ok: true, data: rows.map(toPlazaPostRecord) });
});

plazaRouter.get("/official", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM plaza_posts WHERE is_official = 1 ORDER BY likes DESC, created_at DESC")
    .all() as PlazaPostRow[];
  res.json({ ok: true, data: rows.map(toPlazaPostRecord) });
});

plazaRouter.post("/", authMiddleware, (req, res) => {
  const parsed = publishSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: "请先选择一件藏品。" });
    return;
  }

  const item = db
    .prepare("SELECT * FROM items WHERE id = ? AND user_id = ?")
    .get(parsed.data.itemId, req.userId!) as ItemRow | undefined;
  if (!item) {
    res.status(404).json({ ok: false, error: "没有找到这件藏品。" });
    return;
  }

  const asset = parsed.data.generatedAssetId
    ? db
        .prepare("SELECT * FROM generated_assets WHERE id = ? AND user_id = ?")
        .get(parsed.data.generatedAssetId, req.userId!) as GeneratedAssetRow | undefined
    : undefined;

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId!) as UserRow | undefined;
  const imageUrl = getAssetImageUrl(asset) || item.cover_image_url || item.image_url;
  const description = buildDescription(item.story, parsed.data.allowSameStyle, parsed.data.allowExchange);
  const category = asset ? getKindLabel(asset.kind) : item.category;
  const id = randomUUID();

  db.prepare(`
    INSERT INTO plaza_posts (
      id, user_id, item_id, generated_asset_id, category, title, author, likes, image_url,
      bg_color, aspect_ratio, description, is_official
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 0)
  `).run(
    id,
    req.userId!,
    item.id,
    asset?.id || null,
    category,
    parsed.data.title?.trim() || item.name,
    user?.nickname || "旧物收藏家",
    imageUrl,
    pickBackground(item.id),
    imageUrl ? "1 / 1.08" : "1 / 1",
    description
  );

  const row = db.prepare("SELECT * FROM plaza_posts WHERE id = ?").get(id) as PlazaPostRow;
  res.status(201).json({ ok: true, data: toPlazaPostRecord(row) });
});

function getAssetImageUrl(asset?: GeneratedAssetRow) {
  if (!asset) return "";
  try {
    const payload = JSON.parse(asset.payload_json) as { imageUrl?: unknown };
    return typeof payload.imageUrl === "string" ? payload.imageUrl : "";
  } catch {
    return "";
  }
}

function getKindLabel(kind: string) {
  if (kind === "emoji") return "表情包";
  if (kind === "perler") return "拼豆";
  if (kind === "guide") return "改造";
  return "成果";
}

function buildDescription(story: string, allowSameStyle?: boolean, allowExchange?: boolean) {
  const trimmedStory = story.trim();
  const tags = [allowSameStyle ? "可同款" : "", allowExchange ? "可交换" : ""].filter(Boolean).join(" · ");
  if (trimmedStory && tags) return `${trimmedStory}\n${tags}`;
  return trimmedStory || tags || "这件旧物已经入馆。";
}

function pickBackground(seed: string) {
  const palettes = [
    "linear-gradient(135deg, rgba(142, 197, 252, 0.18), rgba(224, 195, 252, 0.1))",
    "linear-gradient(135deg, rgba(132, 250, 176, 0.16), rgba(143, 211, 244, 0.1))",
    "linear-gradient(135deg, rgba(255, 236, 210, 0.18), rgba(252, 182, 159, 0.1))",
    "linear-gradient(135deg, rgba(187, 247, 208, 0.16), rgba(103, 232, 249, 0.1))"
  ];
  const index = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length;
  return palettes[index];
}
