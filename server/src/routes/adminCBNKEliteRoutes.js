import express from "express";

import {
  getAdminCBNKElite,
  getAdminCBNKEliteById,
  createAdminCBNKElite,
  updateAdminCBNKElite,
  deleteAdminCBNKElite,
  toggleAdminCBNKEliteStatus,
} from "../controllers/cBNKEliteController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Get all
router.get("/", getAdminCBNKElite);

// Get single
router.get("/:id", getAdminCBNKEliteById);

// Create
router.post("/", createAdminCBNKElite);

// Update
router.put("/:id", updateAdminCBNKElite);

// Delete
router.delete("/:id", deleteAdminCBNKElite);

// Toggle active/inactive
router.patch("/:id/status", toggleAdminCBNKEliteStatus);

export default router;
