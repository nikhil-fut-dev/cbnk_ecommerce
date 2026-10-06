import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminCouponRoutes from "./routes/adminCouponRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import adminHomeRoutes from "./routes/adminHomeRoutes.js";
import promotionalTickerRoutes from "./routes/promotionalTickerRoutes.js";
import adminPromotionalTickerRoutes from "./routes/adminPromotionalTickerRoutes.js";
import heroBannerRoutes from "./routes/heroBannerRoutes.js";
import adminHeroBannerRoutes from "./routes/adminHeroBannerRoutes.js";
import characterModeRoutes from "./routes/characterModeRoutes.js";
import adminCharacterModeRoutes from "./routes/adminCharacterModeRoutes.js";
import cBNKEliteRoutes from "./routes/cBNKEliteRoutes.js";
import adminCBNKEliteRoutes from "./routes/adminCBNKEliteRoutes.js";
import kidsSetRoutes from "./routes/kidsSetRoutes.js";
import adminKidsSetRoutes from "./routes/adminKidsSetRoutes.js";
import sleepwearEditRoutes from "./routes/sleepwearEditRoutes.js";
import adminSleepwearEditRoutes from "./routes/adminSleepwearEditRoutes.js";
import poloShopRoutes from "./routes/poloShopRoutes.js";
import adminPoloShopRoutes from "./routes/adminPoloShopRoutes.js";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// Body parser
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buffer) => {
      if (req.originalUrl === "/api/v1/payments/razorpay/webhook") {
        req.rawBody = buffer;
      }
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookies
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin/orders", adminOrderRoutes);
app.use("/api/v1/admin/products", adminProductRoutes);
app.use("/api/v1/admin/coupons", adminCouponRoutes);
app.use("/api/v1/admin/dashboard", adminDashboardRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/home", homeRoutes);
app.use("/api/v1/admin/home", adminHomeRoutes);
app.use("/api/v1/home/promotional-ticker", promotionalTickerRoutes);
app.use("/api/v1/admin/home/promotional-ticker", adminPromotionalTickerRoutes);
app.use("/api/v1/home/hero-banners", heroBannerRoutes);
app.use("/api/v1/admin/home/hero-banners", adminHeroBannerRoutes);
app.use("/api/v1/home/character-modes", characterModeRoutes);
app.use("/api/v1/admin/home/character-modes", adminCharacterModeRoutes);
app.use("/api/v1/home/elite", cBNKEliteRoutes);
app.use("/api/v1/admin/home/elite", adminCBNKEliteRoutes);
app.use("/api/v1/home/kids-sets", kidsSetRoutes);
app.use("/api/v1/admin/home/kids-sets", adminKidsSetRoutes);
app.use("/api/v1/home/sleepwear", sleepwearEditRoutes);
app.use("/api/v1/admin/home/sleepwear", adminSleepwearEditRoutes);
app.use("/api/v1/home/polo-shop", poloShopRoutes);
app.use("/api/v1/admin/home/polo-shop", adminPoloShopRoutes);

// Health
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CBNK E-Commerce API is running",
    environment: process.env.NODE_ENV,
  });
});

// Root
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to CBNK E-Commerce API",
  });
});

// 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  // Multer errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }

  // Invalid JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
