import express from "express";

import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Get only approved reviews of a product
router.get("/product/:productId", getProductReviews);

/*
|--------------------------------------------------------------------------
| Protected Customer Routes
|--------------------------------------------------------------------------
*/

router.use(protect);

// Get logged-in user's reviews
router.get("/my", getMyReviews);

// Create a review
router.post("/", createReview);

// Update own review
router.put("/:id", updateReview);

// Delete own review
router.delete("/:id", deleteReview);

export default router;
