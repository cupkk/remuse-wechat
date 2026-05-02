import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { buildSession, createGuestSession, loginSession, registerSession } from "../services/authService.js";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email("请输入有效邮箱。"),
  password: z.string().min(6, "密码至少 6 位。"),
  nickname: z.string().min(1).max(24).optional()
});

authRouter.post("/guest", (_req, res) => {
  res.json({ ok: true, data: createGuestSession() });
});

authRouter.post("/register", (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.issues[0]?.message || "注册信息不完整。" });
    return;
  }

  try {
    res.json({ ok: true, data: registerSession(parsed.data.email, parsed.data.password, parsed.data.nickname) });
  } catch (error) {
    res.status(409).json({ ok: false, error: error instanceof Error ? error.message : "注册失败。" });
  }
});

authRouter.post("/login", (req, res) => {
  const parsed = credentialsSchema.omit({ nickname: true }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, error: parsed.error.issues[0]?.message || "登录信息不完整。" });
    return;
  }

  try {
    res.json({ ok: true, data: loginSession(parsed.data.email, parsed.data.password) });
  } catch (error) {
    res.status(401).json({ ok: false, error: error instanceof Error ? error.message : "登录失败。" });
  }
});

authRouter.get("/me", authMiddleware, (req, res) => {
  res.json({ ok: true, data: buildSession(req.userId!) });
});
