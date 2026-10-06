import express from "express";

import {
  getAdminCharacterModes,
  getAdminCharacterModeById,
  createAdminCharacterMode,
  updateAdminCharacterMode,
  deleteAdminCharacterMode,
  toggleAdminCharacterModeStatus,
} from "../controllers/characterModeController.js";

import { protect } from "../middleware/authMiddleware.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

import { uploadCategoryImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Get all character modes
router.get("/", getAdminCharacterModes);

// Get single character mode
router.get("/:id", getAdminCharacterModeById);

// Create
router.post("/", uploadCategoryImage, createAdminCharacterMode);

// Update
router.put("/:id", uploadCategoryImage, updateAdminCharacterMode);

// Delete
router.delete("/:id", deleteAdminCharacterMode);

// Activate / deactivate
router.patch("/:id/status", toggleAdminCharacterModeStatus);

export default router;
