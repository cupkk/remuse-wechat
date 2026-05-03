import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { analyzeItem, generateAsset, transcribeStoryAudio } from "../services/aiService.js";
import type { GenerationKind } from "../types.js";

export const aiRouter = Router();

const analyzeFailureMessage = "这次没有识别成功，可以保留故事再试一次。";
const generateFailureMessage = "这次没有生成成功，可以保留故事再试一次。";
const transcribeFailureMessage = "这次没有听清楚，可以直接输入故事。";

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

const transcribeSchema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().min(1).max(80)
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
    console.error("ai.analyze.failed", {
      message: error instanceof Error ? error.message : String(error)
    });
    res.status(502).json({ ok: false, error: analyzeFailureMessage });
  }
});

aiRouter.post("/generate-sticker", generateHandler("sticker"));
aiRouter.post("/generate-emoji-pack", generateHandler("emoji"));
aiRouter.post("/generate-perler-pattern", generateHandler("perler"));
aiRouter.post("/generate-transformation-guide", generateHandler("guide"));

aiRouter.post("/transcribe-story", async (req, res) => {
  const parsed = transcribeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: transcribeFailureMessage });
    return;
  }

  try {
    const text = await transcribeStoryAudio({
      base64Audio: parsed.data.audioBase64,
      mimeType: parsed.data.mimeType
    });
    res.json({ ok: true, data: { text } });
  } catch (error) {
    console.error("ai.transcribe.failed", {
      message: error instanceof Error ? error.message : String(error)
    });
    res.status(502).json({ ok: false, error: transcribeFailureMessage });
  }
});

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
      console.error("ai.generate.failed", {
        kind,
        message: error instanceof Error ? error.message : String(error)
      });
      res.status(502).json({ ok: false, error: generateFailureMessage });
    }
  };
}
