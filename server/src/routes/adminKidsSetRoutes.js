import express from "express";

import {
  getAdminKidsSets,
  getAdminKidsSetById,
  createAdminKidsSet,
  updateAdminKidsSet,
  deleteAdminKidsSet,
  toggleAdminKidsSetStatus,
} from "../controllers/kidsSetController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { uploadCategoryImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Get all Kids Sets
router.get("/", getAdminKidsSets);

// Get single Kids Set
router.get("/:id", getAdminKidsSetById);

// Create
router.post("/", uploadCategoryImage, createAdminKidsSet);

// Update
router.put("/:id", uploadCategoryImage, updateAdminKidsSet);

// Delete
router.delete("/:id", deleteAdminKidsSet);

// Toggle active/inactive
router.patch("/:id/status", toggleAdminKidsSetStatus);

export default router;
