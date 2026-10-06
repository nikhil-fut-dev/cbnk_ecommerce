import express from "express";

import { getCharacterModes } from "../controllers/characterModeController.js";

const router = express.Router();

// Public
router.get("/", getCharacterModes);

export default router;
