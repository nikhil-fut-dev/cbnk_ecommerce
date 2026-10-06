import express from "express";

import { getKidsSets } from "../controllers/kidsSetController.js";

const router = express.Router();

// Public
router.get("/", getKidsSets);

export default router;
