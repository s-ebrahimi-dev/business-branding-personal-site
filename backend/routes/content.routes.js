import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import {
  getContent,
  createContent,
  getContentBySlug,
  updateContent,
} from "../controllers/content.controller.js";

const router = express.Router();

router.get("/", optionalAuth, getContent);
router.get("/:slug", optionalAuth, getContentBySlug);
router.post("/", requireAuth, requireRole("admin"), createContent);
router.patch("/:id", requireAuth, requireRole("admin"), updateContent);

export default router;
