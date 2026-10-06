import express from "express";

import { getSleepwearEdits } from "../controllers/sleepwearEditController.js";

const router = express.Router();

// Public
router.get("/", getSleepwearEdits);

export default router;
