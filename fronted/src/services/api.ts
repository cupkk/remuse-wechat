import type { GenerationKind, GeneratedAssetRecord, ItemAnalysisResult, ItemRecord, PlazaPost, UserSession } from "../app/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const LOCAL_PREVIEW_TOKEN = "local-preview-token";

let guestSessionPromise: Promise<UserSession> | null = null;

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getRequestToken(path);
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
    throw new Error(toSafeApiError(payload?.error, "请求没有成功，请稍后再试。"));
  }

  return payload.data ?? payload;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const token = await getRequestToken(path);
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(toSafeApiError(payload?.error, "上传没有成功，请再试一次。"));
  }

  return payload.data ?? payload;
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (!url.startsWith("/api/")) return url;

  if (API_BASE.startsWith("http")) {
    return `${API_BASE.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
}

export function enterAsGuest() {
  return requestGuestSession();
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

export function transcribeStoryAudio(input: { audioBase64: string; mimeType: string }) {
  return apiRequest<{ text: string }>("/ai/transcribe-story", {
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

export function listPlazaPosts() {
  return apiRequest<PlazaPost[]>("/plaza");
}

export function createPlazaPost(input: {
  itemId: string;
  generatedAssetId?: string | null;
  title?: string;
  allowSameStyle: boolean;
  allowExchange: boolean;
}) {
  return apiRequest<PlazaPost>("/plaza", {
    method: "POST",
    body: JSON.stringify(input)
  });
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

function toSafeApiError(error: unknown, fallback: string) {
  if (typeof error !== "string" || !error.trim()) return fallback;
  const message = error.trim();
  if (message.includes("{") || message.includes("openai_error") || message.includes("\"message\"") || message.length > 100) {
    return fallback;
  }
  return message;
}

function requestGuestSession() {
  if (!guestSessionPromise) {
    guestSessionPromise = fetch(`${API_BASE}/auth/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(toSafeApiError(payload?.error, "暂时无法进入，请稍后再试。"));
        }
        return (payload.data ?? payload) as UserSession;
      })
      .catch((error) => {
        guestSessionPromise = null;
        throw error;
      });
  }
  return guestSessionPromise;
}

async function getRequestToken(path: string) {
  const token = window.localStorage.getItem("remuse_token");
  if (token !== LOCAL_PREVIEW_TOKEN || path.startsWith("/auth/")) {
    return token;
  }

  const session = await requestGuestSession();
  window.localStorage.setItem("remuse_token", session.token);
  return session.token;
}
