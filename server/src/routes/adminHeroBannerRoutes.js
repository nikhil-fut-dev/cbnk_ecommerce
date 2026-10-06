import express from "express";

import {
  getAdminHeroBanners,
  getAdminHeroBannerById,
  createAdminHeroBanner,
  updateAdminHeroBanner,
  deleteAdminHeroBanner,
  toggleAdminHeroBannerStatus,
} from "../controllers/heroBannerController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

import { uploadHeroBannerImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Get all banners
router.get("/", getAdminHeroBanners);

// Get single banner
router.get("/:id", getAdminHeroBannerById);

// Create banner
router.post("/", uploadHeroBannerImages, createAdminHeroBanner);

// Update banner
router.put("/:id", uploadHeroBannerImages, updateAdminHeroBanner);

// Delete banner
router.delete("/:id", deleteAdminHeroBanner);

// Activate / deactivate
router.patch("/:id/status", toggleAdminHeroBannerStatus);

export default router;
