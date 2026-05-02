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

export interface SquareItem {
  id: string;
  category: string;
  title: string;
  likes: number;
  bgColor: string;
  aspectRatio: string;
}

export interface Work {
  id: string;
  title: string;
  date: string;
  description: string;
  moodText: string;
  colorHex: string;
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
