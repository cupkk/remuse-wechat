import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "./config.js";
import type { GeneratedAssetRecord, ItemRecord } from "./types.js";

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
`);

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

export function toItemRecord(row: ItemRow): ItemRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    story: row.story,
    imageUrl: row.image_url,
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
