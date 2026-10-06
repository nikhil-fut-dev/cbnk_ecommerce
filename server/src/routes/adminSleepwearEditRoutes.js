import express from "express";

import {
  getAdminSleepwearEdits,
  getAdminSleepwearEditById,
  createAdminSleepwearEdit,
  updateAdminSleepwearEdit,
  deleteAdminSleepwearEdit,
  toggleAdminSleepwearEditStatus,
} from "../controllers/sleepwearEditController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { uploadHeroBannerImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Get all
router.get("/", getAdminSleepwearEdits);

// Get single
router.get("/:id", getAdminSleepwearEditById);

// Create
router.post("/", uploadHeroBannerImages, createAdminSleepwearEdit);

// Update
router.put("/:id", uploadHeroBannerImages, updateAdminSleepwearEdit);

// Delete
router.delete("/:id", deleteAdminSleepwearEdit);

// Toggle active/inactive
router.patch("/:id/status", toggleAdminSleepwearEditStatus);

export default router;
