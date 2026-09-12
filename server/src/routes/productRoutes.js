import express from "express";

import {
  createProduct,
  getProducts,
  getProductBySlug,
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { uploadProductImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

// Admin
router.post("/", protect, adminOnly, uploadProductImages, createProduct);

export default router;
