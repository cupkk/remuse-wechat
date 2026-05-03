import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "./config.js";
import type { GeneratedAssetRecord, ItemRecord, PlazaPostRecord } from "./types.js";

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

export const db = new Database(config.dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    nickname TEXT NOT NULL,
    is_guest INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    story TEXT NOT NULL DEFAULT '',
    image_url TEXT,
    cover_image_url TEXT,
    analysis_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS generated_assets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_id TEXT,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS plaza_posts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    item_id TEXT,
    generated_asset_id TEXT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    bg_color TEXT NOT NULL,
    aspect_ratio TEXT NOT NULL DEFAULT '1 / 1',
    description TEXT NOT NULL DEFAULT '',
    is_official INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
    FOREIGN KEY (generated_asset_id) REFERENCES generated_assets(id) ON DELETE SET NULL
  );
`);

ensureColumn("items", "cover_image_url", "TEXT");
seedOfficialPlazaPosts();

export interface UserRow {
  id: string;
  email: string | null;
  password_hash: string | null;
  nickname: string;
  is_guest: 0 | 1;
  created_at: string;
}

export interface ItemRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  story: string;
  image_url: string | null;
  cover_image_url: string | null;
  analysis_json: string | null;
  created_at: string;
}

export interface GeneratedAssetRow {
  id: string;
  user_id: string;
  item_id: string | null;
  kind: GeneratedAssetRecord["kind"];
  title: string;
  payload_json: string;
  created_at: string;
}

export interface PlazaPostRow {
  id: string;
  user_id: string | null;
  item_id: string | null;
  generated_asset_id: string | null;
  category: string;
  title: string;
  author: string;
  likes: number;
  image_url: string | null;
  bg_color: string;
  aspect_ratio: string;
  description: string;
  is_official: 0 | 1;
  created_at: string;
}

export function toItemRecord(row: ItemRow): ItemRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    story: row.story,
    imageUrl: row.image_url,
    coverImageUrl: row.cover_image_url,
    analysisJson: row.analysis_json,
    createdAt: row.created_at
  };
}

export function toGeneratedAssetRecord(row: GeneratedAssetRow): GeneratedAssetRecord {
  return {
    id: row.id,
    userId: row.user_id,
    itemId: row.item_id,
    kind: row.kind,
    title: row.title,
    payloadJson: row.payload_json,
    createdAt: row.created_at
  };
}

export function toPlazaPostRecord(row: PlazaPostRow): PlazaPostRecord {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    author: row.author,
    likes: row.likes,
    imageUrl: row.image_url,
    bgColor: row.bg_color,
    aspectRatio: row.aspect_ratio,
    description: row.description,
    itemId: row.item_id,
    generatedAssetId: row.generated_asset_id,
    isOfficial: row.is_official === 1,
    createdAt: row.created_at
  };
}

function seedOfficialPlazaPosts() {
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

  const insert = db.prepare(`
    INSERT OR IGNORE INTO plaza_posts (
      id, category, title, author, likes, image_url, bg_color, aspect_ratio, description, is_official
    ) VALUES (
      @id, @category, @title, @author, @likes, @imageUrl, @bgColor, @aspectRatio, @description, 1
    )
  `);

  const seed = db.transaction(() => {
    officialPosts.forEach((post) => insert.run(post));
  });
  seed();
}

function ensureColumn(tableName: string, columnName: string, definition: string) {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  if (rows.some((row) => row.name === columnName)) return;
  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}
