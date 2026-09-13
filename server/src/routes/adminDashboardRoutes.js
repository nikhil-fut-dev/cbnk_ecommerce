import express from "express";

import { getAdminDashboard } from "../controllers/adminDashboardController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAdminDashboard);

export default router;
