import express from "express";

import {
  createCategory,
  getCategories,
  getCategoryBySlug,
  getAdminCategories,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} from "../controllers/categoryController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { uploadCategoryImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =========================================================
   PUBLIC
========================================================= */

router.get("/", getCategories);

/* =========================================================
   ADMIN
========================================================= */

router.get("/admin/list", protect, adminOnly, getAdminCategories);

router.post("/", protect, adminOnly, uploadCategoryImage, createCategory);

router.put("/:id", protect, adminOnly, uploadCategoryImage, updateCategory);

router.patch("/:id/status", protect, adminOnly, toggleCategoryStatus);

router.delete("/:id", protect, adminOnly, deleteCategory);

/* =========================================================
   PUBLIC - MUST BE LAST
========================================================= */

router.get("/:slug", getCategoryBySlug);

export default router;
