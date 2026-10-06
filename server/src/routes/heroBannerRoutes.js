import express from "express";

import { getHeroBanners } from "../controllers/heroBannerController.js";

const router = express.Router();

// Public
router.get("/", getHeroBanners);

export default router;
