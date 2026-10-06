import express from "express";

import { getHomeSections, getHomeData } from "../controllers/homeController.js";

const router = express.Router();

// ======================================================
// PUBLIC HOMEPAGE CMS DATA
// ======================================================

// Home section configuration
router.get("/sections", getHomeSections);

// ======================================================
// PUBLIC COMPLETE HOME DATA
// ======================================================

// All published homepage content in one API
router.get("/", getHomeData);

export default router;
