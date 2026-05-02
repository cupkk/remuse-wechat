import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { analyzeItem, generateAsset } from "../services/aiService.js";
import type { GenerationKind } from "../types.js";

export const aiRouter = Router();

const analysisSchema = z.object({
  itemName: z.string().max(80).optional(),
  category: z.string().max(40).optional(),
  story: z.string().max(2000).optional(),
  imageUrl: z.string().optional()
});

const generateSchema = z.object({
  itemId: z.string().optional(),
  itemName: z.string().max(80).optional(),
  category: z.string().max(40).optional(),
  imageUrl: z.string().nullable().optional(),
  analysis: z.record(z.string(), z.unknown()).nullable().optional(),
  story: z.string().max(2000).optional()
});

aiRouter.use(authMiddleware);

aiRouter.post("/analyze-item", async (req, res) => {
  const parsed = analysisSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: "请补充物品信息后再分析。" });
    return;
  }

  try {
    res.json({ ok: true, data: await analyzeItem(parsed.data) });
  } catch (error) {
    res.status(502).json({ ok: false, error: error instanceof Error ? error.message : "分析暂时失败，请稍后再试。" });
  }
});

aiRouter.post("/generate-sticker", generateHandler("sticker"));
aiRouter.post("/generate-emoji-pack", generateHandler("emoji"));
aiRouter.post("/generate-perler-pattern", generateHandler("perler"));
aiRouter.post("/generate-transformation-guide", generateHandler("guide"));

function generateHandler(kind: GenerationKind) {
  return async (req: import("express").Request, res: import("express").Response) => {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: "生成信息不完整。" });
      return;
    }

    try {
      const asset = await generateAsset({
        userId: req.userId!,
        itemId: parsed.data.itemId,
        itemName: parsed.data.itemName,
        category: parsed.data.category,
        imageUrl: parsed.data.imageUrl,
        analysis: parsed.data.analysis || null,
        story: parsed.data.story,
        kind
      });
      res.status(201).json({ ok: true, data: asset });
    } catch (error) {
      res.status(502).json({ ok: false, error: error instanceof Error ? error.message : "生成暂时失败，请稍后再试。" });
    }
  };
}
