import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";
import { db, toGeneratedAssetRecord, type GeneratedAssetRow } from "../database.js";
import type { GeneratedAssetRecord, GenerationKind } from "../types.js";

interface GenerateAssetInput {
  userId: string;
  itemId?: string;
  kind: GenerationKind;
  itemName?: string;
  story?: string;
}

interface GeminiPart {
  text?: string;
  inlineData?: {
    data?: string;
    mimeType?: string;
  };
}

interface GeminiResponseShape {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  text?: string;
}

const kindTitle: Record<GenerationKind, string> = {
  sticker: "生成专属贴纸",
  emoji: "生成表情包",
  perler: "生成拼豆图纸",
  guide: "生成改造指南"
};

const kindLabel: Record<GenerationKind, string> = {
  sticker: "专属贴纸",
  emoji: "表情包",
  perler: "拼豆图纸",
  guide: "改造指南"
};

let geminiClient: GoogleGenAI | null = null;

export async function analyzeItem(input: { itemName?: string; story?: string; imageUrl?: string }) {
  if (config.disableLiveAi || !config.stepfun.apiKey) {
    return {
      itemName: input.itemName || "旧物",
      category: "记忆物品",
      emotion: "轻松、怀旧",
      recommendation: "生成专属贴纸",
      reason: "它有清晰的视觉特征，也承载了具体故事，适合先做成便于保存和分享的贴纸。"
    };
  }

  const prompt = [
    "你是 Remuse 再生博物馆的物品故事分析助手。",
    "请根据物品名称和故事，输出 JSON：itemName, category, emotion, recommendation, reason。",
    `物品：${input.itemName || "未知"}`,
    `故事：${input.story || "用户还没有补充故事"}`
  ].join("\n");

  return callStepfunJson(prompt);
}

export async function generateAsset(input: GenerateAssetInput): Promise<GeneratedAssetRecord> {
  const title = kindTitle[input.kind];
  const payload = await buildGenerationPayload(input);

  const id = randomUUID();
  db.prepare(
    "INSERT INTO generated_assets (id, user_id, item_id, kind, title, payload_json) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, input.userId, input.itemId || null, input.kind, title, JSON.stringify(payload));

  const row = db.prepare("SELECT * FROM generated_assets WHERE id = ?").get(id) as GeneratedAssetRow;
  return toGeneratedAssetRecord(row);
}

export function listGeneratedAssets(userId: string) {
  const rows = db.prepare("SELECT * FROM generated_assets WHERE user_id = ? ORDER BY created_at DESC").all(userId) as GeneratedAssetRow[];
  return rows.map(toGeneratedAssetRecord);
}

async function buildGenerationPayload(input: GenerateAssetInput) {
  if (config.disableLiveAi || !config.gemini.apiKey) {
    return buildLocalPreview(input, "local-preview");
  }

  try {
    return await buildGeminiGeneration(input);
  } catch (error) {
    console.warn("Gemini image generation fell back to local preview:", error instanceof Error ? error.message : error);
    return buildLocalPreview(input, "fallback", "图像模型暂时没有返回可用图片，已保留本地预览结果。");
  }
}

async function callStepfunJson(prompt: string) {
  const response = await fetch(`${config.stepfun.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.stepfun.apiKey}`
    },
    body: JSON.stringify({
      model: config.stepfun.textModel,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    }),
    signal: AbortSignal.timeout(config.stepfun.timeoutMs)
  });

  if (!response.ok) {
    throw new Error("文字模型暂时没有回应，请稍后再试。");
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content) as Record<string, unknown>;
}

async function buildGeminiGeneration(input: GenerateAssetInput) {
  const prompt = buildImagePrompt(input);
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: config.gemini.imageModel,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  const imagePart = findInlineImage(response as GeminiResponseShape);
  if (!imagePart.inlineData?.data) {
    throw new Error("图像模型没有返回图片数据。");
  }

  const imageUrl = await saveGeneratedImage(input.userId, imagePart.inlineData.data, imagePart.inlineData.mimeType || "image/png");

  return {
    ...buildLocalPreview(input, "gemini"),
    imageUrl,
    model: config.gemini.imageModel,
    prompt,
    provider: "gemini",
    status: "ready"
  };
}

function getGeminiClient() {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: config.gemini.apiKey,
      httpOptions: {
        baseUrl: config.gemini.baseUrl || undefined,
        timeout: config.gemini.timeoutMs
      }
    });
  }
  return geminiClient;
}

function findInlineImage(response: GeminiResponseShape): GeminiPart {
  const parts = response.candidates?.flatMap((candidate) => candidate.content?.parts || []) || [];
  const imagePart = parts.find((part) => Boolean(part.inlineData?.data));
  if (!imagePart) {
    throw new Error("图像模型没有返回可保存的图片。");
  }
  return imagePart;
}

async function saveGeneratedImage(userId: string, base64Data: string, mimeType: string) {
  const extension = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : mimeType.includes("webp") ? "webp" : "png";
  const userDir = path.join(config.uploadsDir, userId, "generated");
  await fs.mkdir(userDir, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  await fs.writeFile(path.join(userDir, fileName), Buffer.from(base64Data, "base64"));
  return `/api/uploads/${userId}/generated/${fileName}`;
}

function buildImagePrompt(input: GenerateAssetInput) {
  const itemName = input.itemName || "一件有故事的旧物";
  const story = input.story || "这件旧物被用户认真保存，希望继续陪伴日常生活。";
  const shared = [
    "移动端产品 Remuse 再生博物馆的生成素材。",
    "视觉要求：简洁、干净、有真实手作感，深色背景可用但不要赛博朋克，不要出现英文，不要出现 UI 边框，不要文字堆叠。",
    `物品：${itemName}`,
    `故事：${story}`
  ];

  const kindPrompt: Record<GenerationKind, string> = {
    sticker: "生成一张适合手机端展示的透明感贴纸主视觉：保留旧物轮廓，加入少量荧光黄绿和冷青点缀，边缘干净，像收藏贴纸。",
    emoji: "生成 4 个表情包风格参考图的集合：同一旧物拟人化但不过度可爱，包含开心、收到好运、认真保存、再见旧物四种情绪。",
    perler: "生成一张拼豆图纸风格的方形图：像素颗粒清晰，配色不超过 8 种，中心是旧物的简化轮廓，适合手工复刻。",
    guide: "生成一张改造指南封面图：旧物被整理、裁切或装裱成新的日常小物，画面像真实桌面手作照片，克制温暖。"
  };

  return [...shared, kindPrompt[input.kind]].join("\n");
}

function buildLocalPreview(input: GenerateAssetInput, provider: "local-preview" | "fallback" | "gemini", warning?: string) {
  return {
    itemName: input.itemName || "旧物",
    story: input.story || "一段值得留下的故事",
    kind: input.kind,
    kindLabel: kindLabel[input.kind],
    status: provider === "fallback" ? "fallback" : "ready",
    provider,
    imageUrl: null,
    warning,
    note: provider === "gemini" ? "已通过图像模型生成结果。" : "当前返回本地预览数据；配置模型密钥后可生成真实图片。"
  };
}
