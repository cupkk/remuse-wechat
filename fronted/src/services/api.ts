import type { GenerationKind, GeneratedAssetRecord, ItemAnalysisResult, ItemRecord, PlazaPost, UserSession } from "../app/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = window.localStorage.getItem("remuse_token");
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "请求没有成功，请稍后再试。");
  }

  return payload.data ?? payload;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = window.localStorage.getItem("remuse_token");
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "上传没有成功，请稍后再试。");
  }

  return payload.data ?? payload;
}

export function enterAsGuest() {
  return apiRequest<UserSession>("/auth/guest", { method: "POST", body: JSON.stringify({}) });
}

export function register(email: string, password: string) {
  return apiRequest<UserSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, nickname: "旧物收藏家" })
  });
}

export function login(email: string, password: string) {
  return apiRequest<UserSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function generateAsset(kind: GenerationKind, itemId: string) {
  const endpointMap: Record<GenerationKind, string> = {
    sticker: "/ai/generate-sticker",
    emoji: "/ai/generate-emoji-pack",
    perler: "/ai/generate-perler-pattern",
    guide: "/ai/generate-transformation-guide"
  };

  return apiRequest(endpointMap[kind], {
    method: "POST",
    body: JSON.stringify({ itemId })
  });
}

export function listItems() {
  return apiRequest<ItemRecord[]>("/items");
}

export function createItem(input: {
  name: string;
  category: string;
  story: string;
  imageUrl: string | null;
  analysis: ItemAnalysisResult;
}) {
  return apiRequest<ItemRecord>("/items", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateItem(
  itemId: string,
  input: Partial<{
    name: string;
    category: string;
    story: string;
    analysis: ItemAnalysisResult;
  }>
) {
  return apiRequest<ItemRecord>(`/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return apiUpload<{ url: string }>("/uploads/image", formData);
}

export function analyzeUploadedItem(input: {
  itemName?: string;
  category?: string;
  story: string;
  imageUrl: string;
}) {
  return apiRequest<ItemAnalysisResult>("/ai/analyze-item", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function listGeneratedAssets() {
  return apiRequest<GeneratedAssetRecord[]>("/generated-assets");
}

export function listOfficialPlazaPosts() {
  return apiRequest<PlazaPost[]>("/plaza/official");
}

export function generateAssetForItem(kind: GenerationKind, item?: ItemRecord | null) {
  const endpointMap: Record<GenerationKind, string> = {
    sticker: "/ai/generate-sticker",
    emoji: "/ai/generate-emoji-pack",
    perler: "/ai/generate-perler-pattern",
    guide: "/ai/generate-transformation-guide"
  };

  return apiRequest<GeneratedAssetRecord>(endpointMap[kind], {
    method: "POST",
    body: JSON.stringify({
      itemId: item?.id,
      itemName: item?.name,
      category: item?.category,
      imageUrl: item?.imageUrl,
      story: item?.story,
      analysis: parseAnalysis(item?.analysisJson)
    })
  });
}

function parseAnalysis(analysisJson?: string | null) {
  if (!analysisJson) return null;
  try {
    return JSON.parse(analysisJson) as ItemAnalysisResult;
  } catch {
    return null;
  }
}
