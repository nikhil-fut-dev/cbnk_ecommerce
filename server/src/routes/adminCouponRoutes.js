import express from "express";

import {
  createCoupon,
  getAdminCoupons,
  getAdminCouponById,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from "../controllers/adminCouponController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// List coupons
router.get("/", getAdminCoupons);

// Create coupon
router.post("/", createCoupon);

// Single coupon
router.get("/:id", getAdminCouponById);

// Update coupon
router.put("/:id", updateCoupon);

// Activate / deactivate
router.patch("/:id/status", toggleCouponStatus);

// Delete coupon
router.delete("/:id", deleteCoupon);

export default router;
