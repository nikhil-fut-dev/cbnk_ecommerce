import mongoose from "mongoose";

import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

/*
|--------------------------------------------------------------------------
| Helper: Check whether user purchased the product
|--------------------------------------------------------------------------
*/

const findPurchasedProduct = async ({ userId, productId, orderId }) => {
  const query = {
    _id: orderId,
    user: userId,
    orderStatus: "DELIVERED",
    "items.product": productId,
  };

  const order = await Order.findOne(query);

  if (!order) {
    return null;
  }

  const orderItem = order.items.find(
    (item) => item.product.toString() === productId.toString(),
  );

  if (!orderItem) {
    return null;
  }

  return {
    order,
    orderItem,
  };
};

/*
|--------------------------------------------------------------------------
| Create Review
|--------------------------------------------------------------------------
*/

export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /*
     * Only customers who actually received
     * the product can create a review.
     */
    const purchase = await findPurchasedProduct({
      userId: req.user._id,
      productId,
      orderId,
    });

    if (!purchase) {
      return res.status(403).json({
        success: false,
        message: "You can review a product only after receiving it",
      });
    }

    /*
     * Prevent duplicate review for the same
     * product and order.
     */
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
      order: orderId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: orderId,
      rating: numericRating,
      title: title?.trim() || "",
      comment: comment?.trim() || "",
      isVerifiedPurchase: true,
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully and is awaiting approval",
      data: review,
    });
  } catch (error) {
    /*
     * Handles the unique index race condition.
     */
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    console.error("Create review error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Product Reviews
|--------------------------------------------------------------------------
*/

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const skip = (page - 1) * limit;

    const filter = {
      product: productId,
      status: "APPROVED",
    };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "fullName username avatar")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Review.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        totalReviews: total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get product reviews error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get My Reviews
|--------------------------------------------------------------------------
*/

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      user: req.user._id,
    })
      .populate("product", "name slug images price")
      .populate("order", "orderNumber orderStatus createdAt")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your reviews",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update My Review
|--------------------------------------------------------------------------
*/

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const { rating, title, comment } = req.body;

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = numericRating;
    }

    if (title !== undefined) {
      review.title = title.trim();
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    /*
     * Any customer edit goes back to moderation.
     */
    review.status = "PENDING";
    review.approvedAt = null;
    review.approvedBy = null;

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated and sent for approval",
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete My Review
|--------------------------------------------------------------------------
*/

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};
