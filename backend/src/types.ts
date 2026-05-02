export type GenerationKind = "sticker" | "emoji" | "perler" | "guide";

export interface AuthUser {
  id: string;
  nickname: string;
  email: string | null;
  isGuest: boolean;
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

export interface GeneratedAssetRecord {
  id: string;
  userId: string;
  itemId: string | null;
  kind: GenerationKind;
  title: string;
  payloadJson: string;
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

export interface PlazaPostRecord {
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
