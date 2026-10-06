import express from "express";

import { getCBNKElite } from "../controllers/cBNKEliteController.js";

const router = express.Router();

// Public
router.get("/", getCBNKElite);

export default router;
