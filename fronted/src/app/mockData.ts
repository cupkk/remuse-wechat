export interface ArchiveItem {
  id: string;
  title: string;
  category: string;
  material: string;
  tags: string[];
  story: string;
  imageUrl: string;
  date: string;
  hasSticker?: boolean;
}

export interface ResultItem {
  id: string;
  type: 'sticker' | 'emoji' | 'pixel' | 'journal' | 'guide';
  title: string;
  imageUrl?: string;
  date: string;
  sourceArchiveId?: string;
}

export const mockUser = {
  isGuest: true,
  name: "游客_7749",
  archiveCount: 4,
  stickerCount: 2,
  resultsCount: {
    sticker: 2,
    emoji: 3,
    pixel: 1,
    journal: 2,
    guide: 4
  }
};

export const mockResults: ResultItem[] = [
  { id: "r1", type: "sticker", title: "悲伤杯盖", imageUrl: "https://images.unsplash.com/photo-1763619814070-e9c66c4e0e37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFzdGljJTIwY3VwJTIwbGlkfGVufDF8fHx8MTc3NTQyODg3N3ww&ixlib=rb-4.1.0&q=80&w=1080", date: "2023.08.15", sourceArchiveId: "a1" },
  { id: "r2", type: "sticker", title: "蓝色药瓶的微笑", imageUrl: "https://images.unsplash.com/photo-1692764719158-77276a8fb65e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZ2xhc3MlMjBib3R0bGV8ZW58MXx8fHwxNzc1NDI4ODc3fDA&ixlib=rb-4.1.0&q=80&w=1080", date: "2024.01.12", sourceArchiveId: "a3" },
  { id: "r3", type: "emoji", title: "这班上的我像个杯盖", imageUrl: "https://images.unsplash.com/photo-1763619814070-e9c66c4e0e37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFzdGljJTIwY3VwJTIwbGlkfGVufDF8fHx8MTc3NTQyODg3N3ww&ixlib=rb-4.1.0&q=80&w=1080", date: "2024.02.10", sourceArchiveId: "a1" },
  { id: "r4", type: "emoji", title: "破碎的心", imageUrl: "https://images.unsplash.com/photo-1586176319401-23cfebea19f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmFtZWwlMjBwaW4lMjBiYWRnZXxlbnwxfHx8fDE3NzU0Mjg4Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080", date: "2024.02.15", sourceArchiveId: "a4" },
  { id: "r5", type: "emoji", title: "看穿一切", imageUrl: "https://images.unsplash.com/photo-1692764719158-77276a8fb65e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZ2xhc3MlMjBib3R0bGV8ZW58MXx8fHwxNzc1NDI4ODc3fDA&ixlib=rb-4.1.0&q=80&w=1080", date: "2024.02.20", sourceArchiveId: "a3" },
  { id: "r6", type: "pixel", title: "迷笛音乐节像素门票", imageUrl: "https://images.unsplash.com/photo-1652018440238-1aeb20a803a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjBjb25jZXJ0JTIwdGlja2V0fGVufDF8fHx8MTc3NTQyODg3N3ww&ixlib=rb-4.1.0&q=80&w=1080", date: "2024.03.01", sourceArchiveId: "a2" },
  { id: "r7", type: "journal", title: "那场大雨里的安静", date: "2023.08.15", sourceArchiveId: "a1" },
  { id: "r8", type: "journal", title: "解散的乐队与青春", date: "2024.03.05", sourceArchiveId: "a2" },
  { id: "r9", type: "guide", title: "玻璃瓶风铃改造法", date: "2024.03.10", sourceArchiveId: "a3" },
  { id: "r10", type: "guide", title: "珐琅徽章翻新指南", date: "2024.03.15", sourceArchiveId: "a4" },
  { id: "r11", type: "guide", title: "塑料杯盖盆栽制作", date: "2024.03.20", sourceArchiveId: "a1" },
  { id: "r12", type: "guide", title: "票根创意手账排版", date: "2024.03.25", sourceArchiveId: "a2" }
];

export const mockArchives: ArchiveItem[] = [
  {
    id: "a1",
    title: "夏日最后的奶茶盖",
    category: "餐饮遗留",
    material: "塑料",
    tags: ["2023", "夏天", "一个人"],
    story: "那天下了很大的雨，我在街角的奶茶店躲雨，点了一杯已经下架的百香果双响炮。杯盖留下来了，上面的水痕已经干透，但每次看到它，都能想起那场大雨里的安静。",
    imageUrl: "https://images.unsplash.com/photo-1763619814070-e9c66c4e0e37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFzdGljJTIwY3VwJTIwbGlkfGVufDF8fHx8MTc3NTQyODg3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2023.08.15",
    hasSticker: true
  },
  {
    id: "a2",
    title: "迷笛音乐节票根",
    category: "纪念物",
    material: "纸质",
    tags: ["音乐", "狂欢", "北京"],
    story: "纸张已经有点泛黄，右上角被检票员撕掉了一个小角。那是我第一次看现场，现在那些乐队有的解散了，有的再也见不到了。声音留不住，还好纸留住了。",
    imageUrl: "https://images.unsplash.com/photo-1652018440238-1aeb20a803a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjBjb25jZXJ0JTIwdGlja2V0fGVufDF8fHx8MTc3NTQyODg3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2018.05.01"
  },
  {
    id: "a3",
    title: "蓝色玻璃药瓶",
    category: "包装容器",
    material: "玻璃",
    tags: ["透明", "童年"],
    story: "小时候在奶奶家找到的空药瓶，里面装过彩色糖果，后来装了沙子，现在什么都没有装，只是因为觉得蓝色在阳光下很好看就一直带着。",
    imageUrl: "https://images.unsplash.com/photo-1692764719158-77276a8fb65e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZ2xhc3MlMjBib3R0bGV8ZW58MXx8fHwxNzc1NDI4ODc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2024.01.12",
    hasSticker: true
  },
  {
    id: "a4",
    title: "没送出去的宇航员徽章",
    category: "饰品",
    material: "金属/珐琅",
    tags: ["遗憾", "礼物"],
    story: "原本准备在毕业那天送给他，但那天人太多，我一直没有找到合适的时机。后来就一直放在抽屉的最深处了。",
    imageUrl: "https://images.unsplash.com/photo-1586176319401-23cfebea19f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmFtZWwlMjBwaW4lMjBiYWRnZXxlbnwxfHx8fDE3NzU0Mjg4Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "2021.06.24"
  }
];