import express from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getProfile);

router.put("/me", protect, updateProfile);

router.put("/change-password", protect, changePassword);

export default router;
