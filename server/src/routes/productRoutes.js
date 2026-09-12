import express from "express";

import {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
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

router.put("/:id", protect, adminOnly, uploadProductImages, updateProduct);

router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
