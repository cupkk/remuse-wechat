import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db, type UserRow } from "../database.js";
import { signToken } from "../middleware/auth.js";

const publicUserSelect = "id, email, nickname, is_guest, created_at";

export function createGuestSession() {
  const userId = randomUUID();
  const nickname = `游客 ${userId.slice(0, 4)}`;
  db.prepare("INSERT INTO users (id, nickname, is_guest) VALUES (?, ?, 1)").run(userId, nickname);
  return buildSession(userId);
}

export function registerSession(email: string, password: string, nickname = "旧物收藏家") {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: string } | undefined;
  if (existing) {
    throw new Error("这个账号已经注册过。");
  }

  const userId = randomUUID();
  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO users (id, email, password_hash, nickname, is_guest) VALUES (?, ?, ?, ?, 0)").run(
    userId,
    email,
    passwordHash,
    nickname
  );
  return buildSession(userId);
}

export function loginSession(email: string, password: string) {
  const user = db.prepare("SELECT * FROM users WHERE email = ? AND is_guest = 0").get(email) as UserRow | undefined;
  if (!user || !user.password_hash || !bcrypt.compareSync(password, user.password_hash)) {
    throw new Error("账号或密码不正确。");
  }

  return buildSession(user.id);
}

export function buildSession(userId: string) {
  const user = db.prepare(`SELECT ${publicUserSelect} FROM users WHERE id = ?`).get(userId) as
    | Pick<UserRow, "id" | "email" | "nickname" | "is_guest">
    | undefined;

  if (!user) {
    throw new Error("用户不存在。");
  }

  return {
    token: signToken(user.id),
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      isGuest: user.is_guest === 1
    }
  };
}
