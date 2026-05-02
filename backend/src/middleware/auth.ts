import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

interface TokenPayload {
  userId: string;
}

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export function signToken(userId: string) {
  return jwt.sign({ userId } satisfies TokenPayload, config.jwtSecret, { expiresIn: "30d" });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

  if (!token) {
    res.status(401).json({ ok: false, error: "请先登录或以游客身份进入。" });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ ok: false, error: "登录状态已过期，请重新进入。" });
  }
}
