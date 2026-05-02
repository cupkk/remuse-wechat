import type { GenerationKind, UserSession } from "../app/types";

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
