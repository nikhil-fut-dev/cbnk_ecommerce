import express from "express";

import {
  getAllInventory,
  getProductInventory,
  syncProductInventory,
  getLowStockProducts,
  restockProduct,
} from "../controllers/inventoryController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
 * Every inventory endpoint is ADMIN only.
 */
router.use(protect, adminOnly);

/* =========================================================
   INVENTORY LIST
========================================================= */

router.get("/", getAllInventory);

/* =========================================================
   LOW STOCK
========================================================= */

router.get("/low-stock", getLowStockProducts);

/* =========================================================
   PRODUCT INVENTORY
========================================================= */

router.get("/product/:productId", getProductInventory);

/* =========================================================
   SYNC PRODUCT INVENTORY
========================================================= */

router.post("/product/:productId/sync", syncProductInventory);

/* =========================================================
   RESTOCK
========================================================= */

router.patch("/product/:productId/restock", restockProduct);

export default router;
