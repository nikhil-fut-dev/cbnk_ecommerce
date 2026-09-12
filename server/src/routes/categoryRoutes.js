import express from "express";

import {
  createCategory,
  getCategories,
  getCategoryBySlug,
} from "../controllers/categoryController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

// Admin
router.post("/", protect, adminOnly, createCategory);

export default router;
