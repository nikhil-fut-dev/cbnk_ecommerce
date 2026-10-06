import express from "express";

import {
  getAdminHomeSections,
  getAdminHomeSectionById,
  createAdminHomeSection,
  updateAdminHomeSection,
  deleteAdminHomeSection,
  toggleAdminHomeSectionStatus,
} from "../controllers/homeController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Get all home sections
router.get("/sections", getAdminHomeSections);

// Get single home section
router.get("/sections/:id", getAdminHomeSectionById);

// Create home section
router.post("/sections", createAdminHomeSection);

// Update home section
router.put("/sections/:id", updateAdminHomeSection);

// Delete home section
router.delete("/sections/:id", deleteAdminHomeSection);

// Activate / deactivate
router.patch("/sections/:id/status", toggleAdminHomeSectionStatus);

export default router;
