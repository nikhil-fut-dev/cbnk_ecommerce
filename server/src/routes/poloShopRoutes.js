import express from "express";

import { getPoloShops } from "../controllers/poloShopController.js";

const router = express.Router();

// Public
router.get("/", getPoloShops);

export default router;
