import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
  razorpayWebhook,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Razorpay webhook
router.post("/razorpay/webhook", razorpayWebhook);

// Protected payment APIs
router.use(protect);

router.post("/razorpay/create-order", createPaymentOrder);

router.post("/razorpay/verify", verifyPayment);

export default router;
