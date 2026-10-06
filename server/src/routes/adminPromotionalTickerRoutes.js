import express from "express";

import {
  getAdminPromotionalTickers,
  getAdminPromotionalTickerById,
  createAdminPromotionalTicker,
  updateAdminPromotionalTicker,
  deleteAdminPromotionalTicker,
  toggleAdminPromotionalTickerStatus,
} from "../controllers/promotionalTickerController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Get all
router.get("/", getAdminPromotionalTickers);

// Get single
router.get("/:id", getAdminPromotionalTickerById);

// Create
router.post("/", createAdminPromotionalTicker);

// Update
router.put("/:id", updateAdminPromotionalTicker);

// Delete
router.delete("/:id", deleteAdminPromotionalTicker);

// Toggle active/inactive
router.patch("/:id/status", toggleAdminPromotionalTickerStatus);

export default router;
