import type { GalleryItem, GeneratedAsset, SquareItem, Work } from "../app/types";

export const galleryItems: GalleryItem[] = [
  {
    id: "1",
    name: "火车票根",
    status: "已写故事",
    statusType: "story",
    bgColor: "linear-gradient(135deg, rgba(227,223,214,0.12), rgba(197,194,186,0.08))"
  },
  {
    id: "2",
    name: "奶茶袋",
    status: "已生成表情包",
    statusType: "sticker",
    bgColor: "linear-gradient(135deg, rgba(214,184,139,0.14), rgba(189,162,122,0.08))"
  },
  {
    id: "3",
    name: "小狗玩偶",
    status: "已写故事",
    statusType: "story",
    bgColor: "linear-gradient(135deg, rgba(197,202,208,0.12), rgba(172,177,183,0.08))"
  },
  {
    id: "4",
    name: "空香水瓶",
    status: "已写故事",
    statusType: "story",
    bgColor: "linear-gradient(135deg, rgba(226,223,216,0.12), rgba(197,195,188,0.08))"
  },
  {
    id: "5",
    name: "徽章",
    status: "可交换",
    statusType: "exchange",
    bgColor: "linear-gradient(135deg, rgba(209,206,193,0.12), rgba(181,179,166,0.08))"
  },
  {
    id: "6",
    name: "电影票根",
    status: "已写故事",
    statusType: "story",
    bgColor: "linear-gradient(135deg, rgba(232,230,223,0.12), rgba(204,203,197,0.08))"
  }
];

export const squareItems: SquareItem[] = [
  {
    id: "1",
    category: "表情包",
    title: "一张票根做成了春天表情包",
    likes: 128,
    bgColor: "linear-gradient(135deg, rgba(227,223,211,0.14), rgba(197,194,183,0.08))",
    aspectRatio: "1 / 1.15"
  },
  {
    id: "2",
    category: "卡片",
    title: "空瓶也有记忆",
    likes: 96,
    bgColor: "linear-gradient(135deg, rgba(216,213,212,0.12), rgba(188,185,185,0.08))",
    aspectRatio: "1 / 1.02"
  },
  {
    id: "3",
    category: "表情包",
    title: "陪了我十年的小狗",
    likes: 87,
    bgColor: "linear-gradient(135deg, rgba(222,200,169,0.14), rgba(194,176,147,0.08))",
    aspectRatio: "1 / 1.1"
  },
  {
    id: "4",
    category: "拼豆",
    title: "旧包装拼成了小挂件",
    likes: 74,
    bgColor: "linear-gradient(135deg, rgba(215,216,198,0.12), rgba(188,188,173,0.08))",
    aspectRatio: "1 / 0.95"
  }
];

export const cityWorks: Work[] = [
  {
    id: "w7",
    title: "夜自习咖啡",
    date: "2024.06.15",
    description: "一杯陪我熬过复习夜的咖啡，后来变成了书桌旁的时间标记。",
    moodText: "那天很累，但终于觉得自己没有停下。",
    colorHex: "20b2aa"
  },
  {
    id: "w10",
    title: "秋天的叶子",
    date: "2024.09.25",
    description: "夹在书页里的叶子，保存了一个下午的风。",
    moodText: "想把那天慢一点地留下来。",
    colorHex: "3cb371"
  },
  {
    id: "w12",
    title: "海边票据",
    date: "2024.07.10",
    description: "第一次独自出行留下的车票，提醒我可以自己决定路线。",
    moodText: "自由感很轻，却一直在。",
    colorHex: "008080"
  },
  {
    id: "w1",
    title: "春天票根",
    date: "2024.04.22",
    description: "一张演唱会票根，留住了春天的碎片。",
    moodText: "好想再去一次。",
    colorHex: "2e8b57"
  },
  {
    id: "w2",
    title: "空瓶也有记忆",
    date: "2024.04.10",
    description: "香味已经散去，但瓶子的形状还记得那次旅行。",
    moodText: "时间过得真快。",
    colorHex: "4682b4"
  },
  {
    id: "w15",
    title: "第一场雪",
    date: "2024.12.20",
    description: "手套上融化的雪，像一张很短的明信片。",
    moodText: "冷，但很亮。",
    colorHex: "5f9ea0"
  }
];

export const generatedAssets: Record<string, GeneratedAsset> = {
  sticker: {
    id: "asset-sticker",
    kind: "sticker",
    title: "夏天的奶茶袋表情包",
    subtitle: "保留纸袋的折痕和绿色标记",
    description: "适合做成一组清爽的日常表情，主图保留原物轮廓，周围加入小气泡和日期。",
    primaryAction: "保存表情包",
    secondaryAction: "换一版"
  },
  emoji: {
    id: "asset-emoji",
    kind: "emoji",
    title: "松一口气表情包",
    subtitle: "把旧物变成 6 个日常情绪",
    description: "围绕考试后的轻松感生成开心、松气、加油、想喝、已收藏、再来一杯六个表情。",
    primaryAction: "保存表情包",
    secondaryAction: "重新配文"
  },
  perler: {
    id: "asset-perler",
    kind: "perler",
    title: "奶茶袋拼豆图纸",
    subtitle: "32 x 32 小挂件尺寸",
    description: "颜色控制在 8 种以内，适合手工拼豆复刻，也可以导出给朋友一起做。",
    primaryAction: "保存图纸",
    secondaryAction: "调整颜色"
  },
  guide: {
    id: "asset-guide",
    kind: "guide",
    title: "旧包装改造指南",
    subtitle: "做成一张可夹在手账里的记忆卡",
    description: "保留正面图案，裁成双层卡片，背面写下故事摘要，最后加透明封套保护。",
    primaryAction: "保存指南",
    secondaryAction: "生成材料清单"
  }
};
