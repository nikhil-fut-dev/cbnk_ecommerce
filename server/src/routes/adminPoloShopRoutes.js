import express from "express";

import {
  getAdminPoloShops,
  getAdminPoloShopById,
  createAdminPoloShop,
  updateAdminPoloShop,
  deleteAdminPoloShop,
  toggleAdminPoloShopStatus,
} from "../controllers/poloShopController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { uploadHeroBannerImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Get all Polo Shops
router.get("/", getAdminPoloShops);

// Get single Polo Shop
router.get("/:id", getAdminPoloShopById);

// Create
router.post("/", uploadHeroBannerImages, createAdminPoloShop);

// Update
router.put("/:id", uploadHeroBannerImages, updateAdminPoloShop);

// Delete
router.delete("/:id", deleteAdminPoloShop);

// Toggle active / inactive
router.patch("/:id/status", toggleAdminPoloShopStatus);

export default router;
