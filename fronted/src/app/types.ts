export type ScreenType =
  | "welcome"
  | "home"
  | "gallery"
  | "square"
  | "profile"
  | "capture"
  | "result"
  | "post-detail"
  | "publish"
  | "generation-loading"
  | "sticker-result"
  | "emoji-pack"
  | "perler-pattern"
  | "guide-result";

export type MainTab = "home" | "gallery" | "square" | "profile";

export type GenerationKind = "sticker" | "emoji" | "perler" | "guide";

export interface GalleryItem {
  id: string;
  name: string;
  status: string;
  statusType: "story" | "sticker" | "exchange";
  bgColor: string;
}

export interface ItemRecord {
  id: string;
  userId: string;
  name: string;
  category: string;
  story: string;
  imageUrl: string | null;
  analysisJson: string | null;
  createdAt: string;
}

export interface ItemAnalysisResult {
  itemRecognition: {
    name: string;
    category: string;
    visualFeatures: string[];
  };
  storySummary: string;
  emotionalResponse: string;
  primaryRecommendation: GenerationKind;
  alternativeRecommendations: GenerationKind[];
  recommendationReason: string;
  rarityAndValue: {
    rarity: "普通" | "少见" | "稀有" | "极稀有";
    referenceValue: string;
    note: string;
  };
}

export interface SquareItem {
  id: string;
  category: string;
  title: string;
  likes: number;
  bgColor: string;
  aspectRatio: string;
}

export interface PlazaPost {
  id: string;
  category: string;
  title: string;
  author: string;
  likes: number;
  imageUrl: string | null;
  bgColor: string;
  aspectRatio: string;
  description: string;
}

export interface Work {
  id: string;
  title: string;
  date: string;
  description: string;
  moodText: string;
  colorHex: string;
  imageUrl?: string | null;
  isPlaceholder?: boolean;
}

export interface UserSession {
  token: string;
  user: {
    id: string;
    nickname: string;
    isGuest: boolean;
  };
}

export interface GeneratedAsset {
  id: string;
  kind: GenerationKind;
  title: string;
  subtitle: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
}

export interface GeneratedAssetRecord {
  id: string;
  userId: string;
  itemId: string | null;
  kind: GenerationKind;
  title: string;
  payloadJson: string;
  createdAt: string;
}

export interface AppSessionUser {
  id: string;
  email?: string | null;
  nickname: string;
  isGuest: boolean;
}
