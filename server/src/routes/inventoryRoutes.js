import express from "express";

import {
  getProductInventory,
  syncProductInventory,
  getLowStockProducts,
} from "../controllers/inventoryController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/low-stock", getLowStockProducts);

router.get("/product/:productId", getProductInventory);

router.post("/product/:productId/sync", syncProductInventory);

export default router;
