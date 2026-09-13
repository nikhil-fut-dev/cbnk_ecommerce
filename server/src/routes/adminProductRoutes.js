import express from "express";

import {
  getAdminProducts,
  getAdminProductById,
  toggleProductStatus,
} from "../controllers/adminProductController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// GET all products
router.get("/", getAdminProducts);

// GET single product
router.get("/:id", getAdminProductById);

// Activate / deactivate product
router.patch("/:id/status", toggleProductStatus);

export default router;
