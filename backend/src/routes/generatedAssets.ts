import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { listGeneratedAssets } from "../services/aiService.js";

export const generatedAssetsRouter = Router();

generatedAssetsRouter.get("/", authMiddleware, (req, res) => {
  res.json({ ok: true, data: listGeneratedAssets(req.userId!) });
});
