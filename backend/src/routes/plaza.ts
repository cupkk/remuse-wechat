import { Router } from "express";
import type { PlazaPostRecord } from "../types.js";

export const plazaRouter = Router();

const officialPosts: PlazaPostRecord[] = [
  {
    id: "official-ticket-emoji",
    category: "表情包",
    title: "一张票根变成春天表情包",
    author: "Remuse 官方",
    likes: 128,
    imageUrl: null,
    bgColor: "linear-gradient(135deg, rgba(227,223,211,0.14), rgba(197,194,183,0.08))",
    aspectRatio: "1 / 1.15",
    description: "把演唱会票根整理成一组可以保存、也可以分享的记忆表情。"
  },
  {
    id: "official-bottle-guide",
    category: "改造",
    title: "空瓶也有自己的旅行坐标",
    author: "Remuse 官方",
    likes: 96,
    imageUrl: null,
    bgColor: "linear-gradient(135deg, rgba(216,213,212,0.12), rgba(188,185,185,0.08))",
    aspectRatio: "1 / 1.02",
    description: "把香水瓶的轮廓和一次独自出行的故事做成纪念卡。"
  },
  {
    id: "official-plush-emoji",
    category: "表情包",
    title: "陪了十年的小狗变成表情包",
    author: "Remuse 官方",
    likes: 87,
    imageUrl: null,
    bgColor: "linear-gradient(135deg, rgba(222,200,169,0.14), rgba(194,176,147,0.08))",
    aspectRatio: "1 / 1.1",
    description: "保留玩偶的表情和旧旧的毛边，做成四个日常情绪。"
  },
  {
    id: "official-package-perler",
    category: "拼豆",
    title: "旧包装拼成了小挂件",
    author: "Remuse 官方",
    likes: 74,
    imageUrl: null,
    bgColor: "linear-gradient(135deg, rgba(215,216,198,0.12), rgba(188,188,173,0.08))",
    aspectRatio: "1 / 0.95",
    description: "把包装上的主图案简化成 32x32 拼豆图纸。"
  }
];

plazaRouter.get("/official", (_req, res) => {
  res.json({ ok: true, data: officialPosts });
});
