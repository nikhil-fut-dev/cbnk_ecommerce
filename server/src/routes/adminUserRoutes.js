import express from "express";

import {
  getAdminUsers,
  getAdminUserById,
  toggleUserStatus,
} from "../controllers/adminUserController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Customer list
router.get("/", getAdminUsers);

// Customer details
router.get("/:id", getAdminUserById);

// Activate / deactivate customer
router.patch("/:id/status", toggleUserStatus);

export default router;
