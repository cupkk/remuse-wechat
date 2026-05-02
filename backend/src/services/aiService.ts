import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";
import { db, toGeneratedAssetRecord, type GeneratedAssetRow, type ItemRow } from "../database.js";
import type { GeneratedAssetRecord, GenerationKind, ItemAnalysisResult } from "../types.js";

interface GenerateAssetInput {
  userId: string;
  itemId?: string;
  kind: GenerationKind;
  itemName?: string;
  category?: string;
  story?: string;
  imageUrl?: string | null;
  analysis?: Record<string, unknown> | null;
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

interface ImageInput {
  data: string;
  mimeType: string;
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

export async function analyzeItem(input: { itemName?: string; category?: string; story?: string; imageUrl?: string }) {
  const image = await loadUploadImage(input.imageUrl);

  if (!config.disableLiveAi && config.gemini.apiKey && image) {
    return normalizeAnalysis(await callGeminiAnalysis(input, image));
  }

  if (!config.disableLiveAi && config.stepfun.apiKey) {
    return normalizeAnalysis(await callStepfunJson(buildAnalysisPrompt(input, false)));
  }

  return buildLocalAnalysis(input);
}

export async function generateAsset(input: GenerateAssetInput): Promise<GeneratedAssetRecord> {
  const hydratedInput = hydrateGenerateInput(input);
  const title = kindTitle[hydratedInput.kind];
  const payload = await buildGenerationPayload(hydratedInput);

  const id = randomUUID();
  db.prepare(
    "INSERT INTO generated_assets (id, user_id, item_id, kind, title, payload_json) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, hydratedInput.userId, hydratedInput.itemId || null, hydratedInput.kind, title, JSON.stringify(payload));

  const row = db.prepare("SELECT * FROM generated_assets WHERE id = ?").get(id) as GeneratedAssetRow;
  return toGeneratedAssetRecord(row);
}

function hydrateGenerateInput(input: GenerateAssetInput): GenerateAssetInput {
  if (!input.itemId) return input;
  const row = db.prepare("SELECT * FROM items WHERE id = ? AND user_id = ?").get(input.itemId, input.userId) as ItemRow | undefined;
  if (!row) return input;
  return {
    ...input,
    itemName: input.itemName || row.name,
    category: input.category || row.category,
    story: input.story || row.story,
    imageUrl: input.imageUrl || row.image_url,
    analysis: input.analysis || parseAnalysisJson(row.analysis_json)
  };
}

function parseAnalysisJson(analysisJson: string | null) {
  if (!analysisJson) return null;
  try {
    return JSON.parse(analysisJson) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function listGeneratedAssets(userId: string) {
  const rows = db.prepare("SELECT * FROM generated_assets WHERE user_id = ? ORDER BY created_at DESC").all(userId) as GeneratedAssetRow[];
  return rows.map(toGeneratedAssetRecord);
}

async function buildGenerationPayload(input: GenerateAssetInput) {
  if (config.disableLiveAi || !config.gemini.apiKey) {
    throw new Error("这次没有生成成功，可以保留故事再试一次。");
  }

  return buildGeminiGeneration(input);
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
  const image = await loadUploadImage(input.imageUrl);
  const parts: GeminiPart[] = [{ text: prompt }];
  if (image) {
    parts.push({ inlineData: image });
  }

  const response = await ai.models.generateContent({
    model: config.gemini.imageModel,
    contents: [{ role: "user", parts }],
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
    itemName: input.itemName || "旧物",
    story: input.story || "一段值得留下的故事",
    kind: input.kind,
    kindLabel: kindLabel[input.kind],
    status: "ready",
    imageUrl,
    model: config.gemini.imageModel,
    prompt,
    provider: "gemini",
    usedImageInput: Boolean(image),
    analysis: input.analysis || null
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
  const category = input.category || "旧物";
  const shared = [
    "移动端产品 Remuse 再生博物馆的生成素材。",
    "请优先参考随消息一起提供的用户上传物品图片，保留真实物品轮廓、材质、磨损和颜色关系。",
    "视觉要求：简洁、干净、有真实手作感，深色背景可用但不要赛博朋克，不要出现英文，不要出现 UI 边框，不要文字堆叠。",
    `物品：${itemName}`,
    `分类：${category}`,
    `故事：${story}`
  ];

  const kindPrompt: Record<GenerationKind, string> = {
    sticker: "生成一张适合手机端展示的透明感贴纸主视觉：保留旧物轮廓，加入少量荧光黄绿和冷青点缀，边缘干净，像收藏贴纸。",
    emoji: "生成一套默认 6 张可爱有趣表情包：同一旧物拟人化，保持上传物品的颜色和轮廓特征，六张分别表达开心、惊喜、收到好运、认真保存、贴贴陪伴、再见旧物。请把 6 张做成整齐 2x3 表情包预览图，风格统一，干净明亮，不需要用户再选择风格。",
    perler: "生成一张拼豆图纸风格的方形图：像素颗粒清晰，配色不超过 8 种，中心是旧物的简化轮廓，适合手工复刻。",
    guide: "生成一张改造指南封面图：旧物被整理、裁切或装裱成新的日常小物，画面像真实桌面手作照片，克制温暖。"
  };

  return [...shared, kindPrompt[input.kind]].join("\n");
}

async function callGeminiAnalysis(input: { itemName?: string; category?: string; story?: string; imageUrl?: string }, image: ImageInput) {
  const response = await getGeminiClient().models.generateContent({
    model: config.gemini.analysisModel,
    contents: [
      {
        role: "user",
        parts: [{ text: buildAnalysisPrompt(input, true) }, { inlineData: image }]
      }
    ],
    config: {
      responseModalities: ["TEXT"]
    }
  });

  const text = (response as GeminiResponseShape).text || "";
  const partsText = (response as GeminiResponseShape).candidates
    ?.flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n");
  return parseJsonObject(text || partsText || "{}");
}

function buildAnalysisPrompt(input: { itemName?: string; category?: string; story?: string; imageUrl?: string }, hasImage: boolean) {
  return [
    "你是 Remuse 再生博物馆的多模态物品故事分析助手。",
    hasImage ? "请结合用户上传的物品图片、故事文本、物品名称/分类分析。" : "当前没有可用图片，请根据故事文本、物品名称/分类分析。",
    "只输出 JSON，不要 Markdown，不要额外解释。",
    "JSON schema:",
    `{
  "itemRecognition": { "name": "物品名称", "category": "分类", "visualFeatures": ["外观特征"] },
  "storySummary": "一句话故事摘要",
  "emotionalResponse": "温柔但克制的情绪回应",
  "primaryRecommendation": "sticker | emoji | perler | guide",
  "alternativeRecommendations": ["emoji", "perler"],
  "recommendationReason": "为什么推荐这样继续存在",
  "rarityAndValue": { "rarity": "普通 | 少见 | 稀有 | 极稀有", "referenceValue": "参考价值描述", "note": "收藏或流转建议" }
}`,
    `物品名称：${input.itemName || "用户暂未确认"}`,
    `分类：${input.category || "用户暂未确认"}`,
    `故事：${input.story || "用户还没有补充故事"}`
  ].join("\n");
}

function normalizeAnalysis(raw: Record<string, unknown>): ItemAnalysisResult {
  const itemRecognition = asRecord(raw.itemRecognition);
  const rarityAndValue = asRecord(raw.rarityAndValue);
  const primary = normalizeKind(raw.primaryRecommendation) || "sticker";
  const alternatives = Array.isArray(raw.alternativeRecommendations)
    ? raw.alternativeRecommendations.map(normalizeKind).filter((kind): kind is GenerationKind => Boolean(kind))
    : [];

  return {
    itemRecognition: {
      name: stringValue(itemRecognition.name, "旧物"),
      category: stringValue(itemRecognition.category, "记忆物品"),
      visualFeatures: Array.isArray(itemRecognition.visualFeatures)
        ? itemRecognition.visualFeatures.map((value) => String(value)).slice(0, 6)
        : []
    },
    storySummary: stringValue(raw.storySummary, "这件旧物被认真保存，背后有一段值得留下的故事。"),
    emotionalResponse: stringValue(raw.emotionalResponse, "它不像普通物品，更像那段时刻留下的坐标。"),
    primaryRecommendation: primary,
    alternativeRecommendations: alternatives.filter((kind) => kind !== primary).slice(0, 3),
    recommendationReason: stringValue(raw.recommendationReason, "它既有视觉特征，也承载了具体故事，适合转化成可保存的再生成果。"),
    rarityAndValue: {
      rarity: normalizeRarity(rarityAndValue.rarity),
      referenceValue: stringValue(rarityAndValue.referenceValue, "以情感价值为主，暂不做价格判断。"),
      note: stringValue(rarityAndValue.note, "建议先保存故事，再选择一种轻量再生方式。")
    }
  };
}

function buildLocalAnalysis(input: { itemName?: string; category?: string; story?: string }): ItemAnalysisResult {
  return normalizeAnalysis({
    itemRecognition: {
      name: input.itemName || "旧物",
      category: input.category || "记忆物品",
      visualFeatures: []
    },
    storySummary: input.story || "这件旧物还没有补充完整故事。",
    emotionalResponse: "故事已经被保留下来，等模型可用时可以继续生成更完整的回应。",
    primaryRecommendation: "sticker",
    alternativeRecommendations: ["emoji", "perler", "guide"],
    recommendationReason: "当前使用本地分析兜底；建议先保存故事，稍后再生成真实结果。",
    rarityAndValue: {
      rarity: "普通",
      referenceValue: "以情感价值为主。",
      note: "模型不可用时不做稀有度扩展判断。"
    }
  });
}

async function loadUploadImage(imageUrl?: string | null): Promise<ImageInput | null> {
  if (!imageUrl || !imageUrl.startsWith("/api/uploads/")) return null;

  const relative = imageUrl.replace(/^\/api\/uploads\/?/, "");
  const resolved = path.resolve(config.uploadsDir, relative);
  const uploadsRoot = path.resolve(config.uploadsDir);
  if (!resolved.startsWith(`${uploadsRoot}${path.sep}`) && resolved !== uploadsRoot) return null;

  try {
    const data = await fs.readFile(resolved);
    return {
      data: data.toString("base64"),
      mimeType: mimeTypeFromPath(resolved)
    };
  } catch {
    return null;
  }
}

function mimeTypeFromPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

function parseJsonObject(text: string) {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("{") ? trimmed : trimmed.match(/\{[\s\S]*\}/)?.[0] || "{}";
  return JSON.parse(jsonText) as Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeKind(value: unknown): GenerationKind | null {
  if (value === "sticker" || value === "emoji" || value === "perler" || value === "guide") return value;
  return null;
}

function normalizeRarity(value: unknown): ItemAnalysisResult["rarityAndValue"]["rarity"] {
  if (value === "少见" || value === "稀有" || value === "极稀有") return value;
  return "普通";
}
