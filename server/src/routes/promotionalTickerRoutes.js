import express from "express";

import { getPromotionalTickers } from "../controllers/promotionalTickerController.js";

const router = express.Router();

// Public
router.get("/", getPromotionalTickers);

export default router;
