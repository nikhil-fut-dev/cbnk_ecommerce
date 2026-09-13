import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/razorpay/create-order", createPaymentOrder);

router.post("/razorpay/verify", verifyPayment);

export default router;
