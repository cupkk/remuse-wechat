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
