import express from "express";

import {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  cancelAdminOrder,
} from "../controllers/adminOrderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAllOrders);

router.get("/:id", getAdminOrderById);

router.patch("/:id/status", updateOrderStatus);

router.patch("/:id/cancel", cancelAdminOrder);

export default router;
