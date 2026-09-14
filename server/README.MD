# CBNK E-Commerce Backend

A production-oriented REST API backend for the **CBNK E-Commerce
Platform**, built with Node.js, Express, MongoDB, Mongoose, JWT
authentication, Cloudinary image management, Razorpay payments,
inventory control, coupons, reviews, addresses, orders, cart, wishlist,
and admin management.

------------------------------------------------------------------------

## Table of Contents

-   [Overview](#overview)
-   [Core Features](#core-features)
-   [Technology Stack](#technology-stack)
-   [Architecture](#architecture)
-   [Project Structure](#project-structure)
-   [API Base URL](#api-base-url)
-   [API Modules](#api-modules)
-   [Authentication & Authorization](#authentication--authorization)
-   [User Management](#user-management)
-   [Categories](#categories)
-   [Products](#products)
-   [Inventory](#inventory)
-   [Cart](#cart)
-   [Wishlist](#wishlist)
-   [Addresses](#addresses)
-   [Coupons & Pricing](#coupons--pricing)
-   [Orders](#orders)
-   [Payments](#payments)
-   [Reviews](#reviews)
-   [Admin Module](#admin-module)
-   [Cloudinary](#cloudinary)
-   [Security](#security)
-   [Environment Variables](#environment-variables)
-   [Installation](#installation)
-   [Running the Server](#running-the-server)
-   [Frontend Integration](#frontend-integration)
-   [API Response Convention](#api-response-convention)
-   [Order & Payment Flow](#order--payment-flow)
-   [Inventory Flow](#inventory-flow)
-   [Production Considerations](#production-considerations)
-   [Troubleshooting](#troubleshooting)
-   [Development Guidelines](#development-guidelines)
-   [License](#license)

------------------------------------------------------------------------

## Overview

CBNK E-Commerce Backend is a modular REST API designed to support a
complete fashion/e-commerce application.

The backend is responsible for:

-   Customer authentication
-   User profiles and account security
-   Product and category management
-   Product search, filtering, sorting, and pagination
-   Product image upload through Cloudinary
-   Variant, size, color, and SKU management
-   Inventory and stock validation
-   Shopping cart
-   Wishlist
-   Customer addresses
-   Coupons and discount calculation
-   Order creation and order lifecycle
-   Razorpay payment creation and verification
-   Razorpay webhook processing
-   Payment refund handling
-   Product reviews and ratings
-   Admin operations

The backend follows a layered Express architecture using controllers,
services, models, middleware, validators, utilities, and route modules.

------------------------------------------------------------------------

# Core Features

## Customer Features

-   Register
-   Login
-   Logout
-   Refresh access token
-   Get current profile
-   Update profile
-   Change password
-   Forgot password
-   Reset password
-   Browse active categories
-   Browse active products
-   Search products
-   Filter products
-   Sort products
-   Pagination
-   Product details by slug
-   Add products to cart
-   Update cart quantity
-   Remove cart items
-   Clear cart
-   Add/remove wishlist items
-   Manage shipping addresses
-   Set default address
-   Apply coupons
-   Calculate checkout pricing
-   Create orders
-   Razorpay payment
-   Verify Razorpay payment
-   View orders
-   Cancel/refund-related order operations where supported
-   Submit product reviews

## Admin Features

-   Manage users
-   Manage products
-   Manage product images
-   Manage categories
-   Manage category status
-   Manage inventory
-   Manage orders
-   Manage coupons
-   Manage reviews
-   Manage payment/order operations
-   Administrative dashboard capabilities exposed through the admin
    module

------------------------------------------------------------------------

# Technology Stack

  Technology           Purpose
  -------------------- ---------------------------------
  Node.js              JavaScript runtime
  Express.js           REST API framework
  MongoDB              Database
  Mongoose             MongoDB ODM
  JWT                  Authentication
  bcryptjs             Password hashing
  Cloudinary           Product/category image storage
  Multer               Multipart upload handling
  Streamifier          Streaming uploads to Cloudinary
  Razorpay             Payment gateway
  Helmet               HTTP security headers
  CORS                 Cross-origin request handling
  Cookie Parser        HTTP cookie handling
  Morgan               HTTP request logging
  Express Rate Limit   Rate limiting
  dotenv               Environment configuration

------------------------------------------------------------------------

# Architecture

The backend follows a modular structure:

``` text
server/
│
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Layer Responsibilities

### `config/`

Contains external service and application configuration such as
database, Cloudinary, and Razorpay setup.

### `constants/`

Contains reusable application constants such as roles, statuses, and
other fixed values.

### `controllers/`

Handles HTTP requests and responses.

Controllers should remain focused on:

-   Reading request data
-   Calling services/models
-   Returning HTTP responses
-   Handling controller-level validation/errors

### `services/`

Contains reusable business logic.

Examples include:

-   Inventory calculations
-   Pricing calculations
-   Payment processing
-   Refund handling
-   Order completion

### `models/`

Contains Mongoose schemas and database models.

### `routes/`

Defines API endpoints and middleware protection.

### `middleware/`

Handles cross-cutting concerns such as:

-   Authentication
-   Admin authorization
-   Upload processing
-   Request protection

### `validators/`

Contains request validation logic.

### `utils/`

Contains reusable helper functions such as:

-   Order number generation
-   JWT helpers
-   Razorpay signature verification
-   Webhook signature verification

------------------------------------------------------------------------

# API Base URL

The API is versioned under:

``` text
/api/v1
```

Local development:

``` text
http://localhost:5000/api/v1
```

Main modules:

``` text
/api/v1/auth
/api/v1/users
/api/v1/products
/api/v1/categories
/api/v1/cart
/api/v1/wishlist
/api/v1/orders
/api/v1/payments
/api/v1/reviews
/api/v1/coupons
/api/v1/addresses
/api/v1/admin
```

------------------------------------------------------------------------

# API Modules

## Authentication

``` text
/api/v1/auth
```

Handles:

-   Registration
-   Login
-   Logout
-   Refresh token
-   Current user
-   Forgot password
-   Reset password

Authentication uses short-lived access tokens and longer-lived refresh
tokens stored using HTTP-only cookies.

------------------------------------------------------------------------

## Users

``` text
/api/v1/users
```

Handles customer account functionality including:

-   Profile information
-   Profile updates
-   Password changes
-   Account-related operations

------------------------------------------------------------------------

## Products

``` text
/api/v1/products
```

Public product functionality includes:

-   Product listing
-   Search
-   Filtering
-   Sorting
-   Pagination
-   Product details by slug

Admin functionality includes:

-   Product creation
-   Product updates
-   Product deletion/soft deletion
-   Image management
-   Inventory-related synchronization

------------------------------------------------------------------------

## Categories

``` text
/api/v1/categories
```

Supports:

-   Category listing
-   Active categories
-   Category lookup by slug
-   Category creation
-   Category updates
-   Category status changes
-   Category deletion
-   Parent category support

Categories can contain:

-   Name
-   Slug
-   Description
-   Image
-   Active status
-   Sort order
-   Parent category

Category hierarchy is intentionally limited to one parent level.

------------------------------------------------------------------------

## Cart

``` text
/api/v1/cart
```

Endpoints:

``` text
GET    /cart
POST   /cart
PUT    /cart/:itemId
DELETE /cart/:itemId
DELETE /cart
```

Add-to-cart payload:

``` json
{
  "productId": "PRODUCT_ID",
  "variantId": null,
  "size": "",
  "color": "",
  "quantity": 1
}
```

The backend validates inventory before accepting cart quantities.

The client must not be treated as the source of truth for:

-   Product price
-   Stock
-   Variant availability

Those values are revalidated from the database during order creation.

------------------------------------------------------------------------

# Wishlist

``` text
/api/v1/wishlist
```

The wishlist is user-specific.

Supported operations include:

-   Get wishlist
-   Add product
-   Remove product
-   Clear wishlist

Inactive/deleted products are filtered from customer-facing wishlist
results.

------------------------------------------------------------------------

# Addresses

``` text
/api/v1/addresses
```

Customer addresses contain fields such as:

``` text
fullName
phone
addressLine1
addressLine2
landmark
city
state
postalCode
country
isDefault
```

Supported operations include:

-   Create address
-   List addresses
-   Update address
-   Delete address
-   Set default address

A customer can maintain multiple saved addresses while one address can
be marked as default.

------------------------------------------------------------------------

# Products

The product model supports a full fashion-commerce catalog.

Important fields include:

``` text
name
slug
description
shortDescription
category
subCategory
brand
gender
ageGroup
price
compareAtPrice
discount
SKU
stock
images
sizes
colors
variants
tags
material
specifications
rating
reviewCount
isFeatured
isNewArrival
isBestSeller
isActive
isDeleted
createdAt
updatedAt
```

## Product Images

Images are stored using Cloudinary.

Each product image contains:

``` json
{
  "url": "https://...",
  "publicId": "cbnk/products/...",
  "alt": "Product image"
}
```

The frontend should consume the returned Cloudinary URL instead of
expecting local image paths.

## Product Search & Filtering

The product listing API supports:

``` text
search
category
subCategory
gender
size
color
minPrice
maxPrice
inStock
featured
newArrivals
bestSeller
sort
page
limit
```

Example:

``` text
GET /products?search=shirt&gender=men&page=1&limit=20
```

## Product Pagination

Product responses contain:

``` json
{
  "success": true,
  "products": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalProducts": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

------------------------------------------------------------------------

# Inventory

Inventory is treated as a critical business concern rather than relying
only on product-level stock fields.

Inventory supports:

-   Product stock
-   Variant stock
-   Stock availability checks
-   Stock deduction
-   Stock restoration
-   Inventory synchronization

The inventory service provides operations conceptually equivalent to:

``` text
get inventory
sync inventory
check stock
deduct stock
restore stock
```

## Important Rule

The frontend must never be trusted for final:

-   Price
-   Stock
-   Variant availability
-   SKU

During checkout/order creation, the backend fetches the current product
and validates the selected variant and available stock again.

------------------------------------------------------------------------

# Coupons & Pricing

Pricing is centralized in the pricing service.

Current pricing rules include:

``` text
FREE_SHIPPING_THRESHOLD = ₹999
SHIPPING_FEE = ₹79
TAX_RATE = 0%
```

The final checkout calculation can include:

``` text
Subtotal
- Coupon Discount
+ Shipping
+ Tax
= Total
```

Coupon rules support concepts such as:

-   Percentage discount
-   Fixed discount
-   Maximum discount
-   Minimum order value
-   Maximum order value
-   Usage limits
-   Per-user limits
-   Start date
-   Expiry date
-   Applicable categories
-   Applicable products

Coupon usage is tracked separately to support usage restrictions and
prevent duplicate order usage.

------------------------------------------------------------------------

# Orders

``` text
/api/v1/orders
```

Orders are created only for authenticated users.

The order creation process performs several validations.

## Order Creation Flow

1.  Validate shipping address ownership.
2.  Fetch the authenticated user's cart.
3.  Verify the cart is not empty.
4.  Re-fetch every product from MongoDB.
5.  Verify product is active and not deleted.
6.  Validate selected variants.
7.  Validate current stock.
8.  Read current database price.
9.  Build immutable order-item snapshots.
10. Calculate pricing.
11. Validate coupon.
12. Snapshot the shipping address.
13. Create the order.
14. Create/process payment according to the payment flow.
15. Deduct inventory after successful payment where applicable.
16. Clear the cart only after the successful payment/order completion
    flow.

Order items preserve important historical data such as:

``` text
product
variant
name
slug
SKU
image
size
color
quantity
price
total
category
```

This prevents future product edits from changing historical order
information.

------------------------------------------------------------------------

# Payments

``` text
/api/v1/payments
```

Razorpay is integrated as the primary online payment gateway.

Payment statuses include:

``` text
CREATED
AUTHORIZED
CAPTURED
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

## Razorpay Verification

The backend verifies Razorpay payment signatures before marking an order
as paid.

The successful payment flow updates:

``` text
Payment status -> CAPTURED
Order payment status -> PAID
Order status -> CONFIRMED
```

The stored payment information can include:

``` text
razorpayOrderId
razorpayPaymentId
razorpaySignature
paidAt
```

## Stock Deduction

For the verified successful payment flow, inventory is deducted for
every order item.

## Cart Clearing

The customer's cart is cleared only after successful payment and
inventory processing.

This prevents a failed payment from prematurely deleting the customer's
cart.

------------------------------------------------------------------------

# Razorpay Webhooks

The backend supports Razorpay webhook processing.

Webhook signatures are verified using the raw request body.

Supported webhook handling includes payment capture events such as:

``` text
payment.captured
```

Webhook processing includes idempotency protection so an already
processed capture event is not processed repeatedly.

The payment record maintains processed webhook events where required.

------------------------------------------------------------------------

# Reviews

``` text
/api/v1/reviews
```

The review module is designed around product/customer reviews and
ratings.

Typical review functionality includes:

-   Create review
-   View product reviews
-   Update review
-   Delete review
-   Rating information
-   Review count synchronization

Customer-facing product data exposes:

``` text
rating
reviewCount
```

------------------------------------------------------------------------

# Admin Module

``` text
/api/v1/admin
```

Admin routes are protected by authentication and administrator
authorization.

The admin layer is intended to manage the operational side of the store:

-   Products
-   Categories
-   Inventory
-   Orders
-   Coupons
-   Reviews
-   Users
-   Payments
-   Store-level data

The backend separates customer permissions from administrative
permissions through role-based authorization.

------------------------------------------------------------------------

# Authentication & Authorization

## User Roles

The user model supports roles including:

``` text
CUSTOMER
ADMIN
```

## JWT Strategy

The authentication system uses:

``` text
Access Token
Refresh Token
```

The access token is short-lived and the refresh token has a longer
lifetime.

Current configured lifetimes:

``` text
Access Token  -> 15 minutes
Refresh Token -> 7 days
```

Tokens are handled using HTTP-only cookies.

## Password Security

Passwords are hashed using `bcryptjs`.

Plain-text passwords should never be stored in MongoDB.

The password field is configured to be excluded from normal queries and
explicitly selected only when authentication logic requires it.

------------------------------------------------------------------------

# Cloudinary

Cloudinary is used for remote image storage.

Typical folders include:

``` text
cbnk/products
```

Category and product uploads use multipart handling through Multer with
memory storage before uploading to Cloudinary.

Image validation includes:

-   Image-only upload handling
-   File-size restrictions
-   Cloudinary upload
-   Public ID storage
-   Cloudinary deletion when required

The frontend should always render the URL returned by the backend.

------------------------------------------------------------------------

# Security

The backend includes several security layers.

## Helmet

HTTP security headers are configured using:

``` text
helmet
```

## CORS

Cross-origin requests are configured with credential support because
authentication uses cookies.

## Rate Limiting

Sensitive/public API protection uses:

``` text
express-rate-limit
```

## Cookies

Authentication cookies are designed to use HTTP-only behavior.

## Password Hashing

Passwords are hashed with:

``` text
bcryptjs
```

## Authorization

Protected routes use authentication middleware.

Admin routes additionally use role-based authorization.

## Payment Security

Razorpay signatures are verified before trusting payment completion
data.

Webhook signatures are independently verified.

------------------------------------------------------------------------

# Environment Variables

Create:

``` text
server/.env
```

A typical environment configuration contains values for:

``` env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLIENT_URL=http://localhost:5173
```

The exact variable names should match the configuration files in the
backend.

> Never commit real `.env` credentials to GitHub.

Use `.env.example` for safe configuration documentation.

------------------------------------------------------------------------

# Installation

## 1. Clone the project

``` bash
git clone <your-repository-url>
cd cbnk_ecommerce/server
```

## 2. Install dependencies

``` bash
npm install
```

The backend uses packages including:

``` text
express
mongoose
dotenv
cors
cookie-parser
helmet
morgan
express-rate-limit
bcryptjs
jsonwebtoken
cloudinary
multer
streamifier
razorpay
```

## 3. Configure environment variables

Create:

``` text
.env
```

and configure MongoDB, JWT, Cloudinary, Razorpay, and frontend origin
values.

## 4. Start the server

Development:

``` bash
npm run dev
```

Production:

``` bash
npm start
```

The development server runs on:

``` text
http://localhost:5000
```

------------------------------------------------------------------------

# Running the Server

Expected startup behavior:

``` text
MongoDB Connected: ...
CBNK E-Commerce Server running on http://localhost:5000
```

The main entry points are:

``` text
src/server.js
src/app.js
```

`server.js` starts the application, while `app.js` configures Express
middleware and routes.

------------------------------------------------------------------------

# Frontend Integration

The React frontend should use the versioned API:

``` text
http://localhost:5000/api/v1
```

For Axios:

``` js
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/v1",
  withCredentials: true,
});

export default api;
```

Because authentication uses cookies, frontend requests must use:

``` text
withCredentials: true
```

Do not store application cart/order/wishlist data in `localStorage` as a
replacement for the backend.

The backend database remains the source of truth.

------------------------------------------------------------------------

# API Response Convention

Successful responses generally follow:

``` json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Some resource endpoints return the resource directly at the top level,
for example:

``` json
{
  "success": true,
  "product": {}
}
```

Product listing responses use:

``` json
{
  "success": true,
  "products": [],
  "pagination": {}
}
```

Errors generally follow:

``` json
{
  "success": false,
  "message": "Error message"
}
```

Frontend code should primarily use the `success` flag and backend
`message` rather than depending on hardcoded HTTP error text.

------------------------------------------------------------------------

# Order & Payment Flow

The intended Razorpay checkout lifecycle is:

``` text
Customer
   │
   ▼
Cart
   │
   ▼
Select Address
   │
   ▼
Apply Coupon
   │
   ▼
Calculate Pricing
   │
   ▼
Create Order
   │
   ▼
Create Razorpay Payment
   │
   ▼
Customer Completes Payment
   │
   ▼
Backend Verifies Signature
   │
   ▼
Deduct Inventory
   │
   ▼
Mark Payment CAPTURED
   │
   ▼
Mark Order PAID / CONFIRMED
   │
   ▼
Clear Cart
```

The backend intentionally revalidates product price and stock during
order creation rather than trusting client-provided values.

------------------------------------------------------------------------

# Inventory Flow

``` text
Product / Variant
       │
       ▼
Inventory Check
       │
       ├── Available ──► Continue
       │
       └── Unavailable ─► Reject

Successful Payment
       │
       ▼
Deduct Stock
       │
       ▼
Order Confirmed
```

If an order/payment must be rolled back, stock restoration services are
available for supported refund/cancellation workflows.

------------------------------------------------------------------------

# Database Models

The backend is centered around the following domain models:

``` text
User
Category
Product
Inventory
Cart
Wishlist
Address
Coupon
CouponUsage
Order
Payment
Review
```

The models are connected through MongoDB ObjectId references where
appropriate.

------------------------------------------------------------------------

# Important Business Rules

## Product

-   Deleted products are hidden from normal customer queries.
-   Inactive products are excluded from customer-facing availability.
-   Variants can have their own stock, SKU, image, and price.
-   Product images are stored externally through Cloudinary.

## Cart

-   Cart belongs to an authenticated user.
-   Stock is checked before adding/updating quantities.
-   Cart price should not be trusted during checkout.

## Order

-   Address must belong to the authenticated user.
-   Empty carts cannot create orders.
-   Product availability is rechecked.
-   Current database prices are used.
-   Variant availability is rechecked.
-   Order items preserve price/product snapshots.

## Coupon

-   Coupon activity is checked.
-   Start and expiry dates are checked.
-   Usage limits are checked.
-   Per-user limits are checked.
-   Minimum order conditions are checked.
-   Product/category applicability is supported.

## Payment

-   Razorpay signature must be valid.
-   Payment records are updated only after verification.
-   Inventory is deducted as part of the successful payment completion
    flow.
-   Cart is cleared after successful payment/order processing.
-   Webhook events are verified and handled idempotently.

------------------------------------------------------------------------

# MongoDB Transactions

Order/payment inventory workflows use MongoDB sessions and transactions
where configured.

For transaction-based workflows, MongoDB must run in an environment that
supports transactions, such as:

-   MongoDB Atlas replica-set deployment
-   Local MongoDB configured as a replica set
-   MongoDB through a suitable mongos/replica-set environment

If a local MongoDB deployment does not support transactions, order
creation flows that use `startSession()` / `withTransaction()` can fail.

------------------------------------------------------------------------

# Production Considerations

Before production deployment, verify:

-   Production MongoDB is a replica set.
-   `retryWrites` configuration matches the MongoDB deployment.
-   HTTPS is enabled.
-   Secure cookie settings are enabled for production.
-   CORS allows only trusted frontend origins.
-   Razorpay production keys are used instead of test keys.
-   Razorpay webhook URL is configured.
-   Razorpay webhook secret is configured.
-   Cloudinary production credentials are configured.
-   Rate limits are appropriate for production traffic.
-   `.env` is never committed.
-   Error responses do not expose secrets or internal stack traces.
-   Database indexes are reviewed before high-volume production usage.
-   Payment and inventory flows are tested with failure/retry scenarios.
-   Webhook idempotency is tested.
-   Refund and stock restoration behavior is tested.

------------------------------------------------------------------------

# Troubleshooting

## MongoDB connection problem

Check:

``` env
MONGO_URI=...
```

and confirm MongoDB is running and reachable.

## Transaction error

If you see an error similar to:

``` text
Transaction numbers are only allowed on a replica set member or mongos
```

the MongoDB deployment being used does not support the transaction
workflow.

Use MongoDB Atlas or configure the local MongoDB instance as a replica
set.

## CORS error

Verify that the frontend origin is included in the backend CORS
configuration.

For local development, the frontend commonly runs on:

``` text
http://localhost:5173
```

## Authentication cookie not sent

Make sure:

Frontend:

``` js
withCredentials: true
```

Backend:

``` text
CORS credentials enabled
```

Also ensure cookie settings are compatible with the frontend/backend
deployment domains.

## Cloudinary upload failure

Verify:

``` text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

and check that the uploaded file is a supported image and within the
configured size limit.

## Razorpay verification failure

Verify:

``` text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

and ensure the Razorpay order/payment IDs and signature are being passed
exactly as returned by Razorpay.

------------------------------------------------------------------------

# Development Guidelines

## Keep Controllers Thin

Business-heavy logic should live in services instead of becoming
duplicated across controllers.

## Validate on the Server

Never trust:

``` text
price
stock
discount
payment status
user ID
order ownership
```

from the frontend.

## Use Database State as Source of Truth

For checkout:

``` text
Database Product
      ↓
Current Price
      ↓
Current Stock
      ↓
Current Variant
      ↓
Final Order
```

## Keep Secrets Out of Source Code

Use:

``` text
.env
```

for secrets and provide safe placeholders through:

``` text
.env.example
```

## Prefer Reusable Services

Shared business logic such as pricing, inventory, payment verification,
and refund handling should remain centralized.

------------------------------------------------------------------------

# Suggested Frontend Modules

The backend is ready to support a frontend organized around:

``` text
Home
Products
Product Details
Search
Categories
Cart
Wishlist
Authentication
Account
Addresses
Checkout
Coupons
Orders
Payments
Reviews
```

An admin frontend can consume:

``` text
Admin Dashboard
Products
Categories
Inventory
Orders
Coupons
Reviews
Users
Payments
```

------------------------------------------------------------------------

# API Development Philosophy

CBNK backend follows these principles:

``` text
Security first
        ↓
Server-side validation
        ↓
Database as source of truth
        ↓
Reusable business services
        ↓
Consistent API responses
        ↓
Safe payment processing
        ↓
Reliable inventory handling
        ↓
Scalable modular architecture
```

------------------------------------------------------------------------

# Project Status

The backend contains the major modules required for a complete CBNK
fashion e-commerce platform:

-   Authentication
-   User management
-   Categories
-   Products
-   Inventory
-   Cart
-   Wishlist
-   Addresses
-   Coupons
-   Orders
-   Payments
-   Reviews
-   Admin APIs
-   Cloudinary integration
-   Razorpay integration
-   Security middleware
-   Pagination/filtering
-   Pricing engine
-   Inventory services

The frontend can therefore be developed independently against the
versioned `/api/v1` API.

------------------------------------------------------------------------

# License

This project is intended for the CBNK E-Commerce application.

Copyright © CBNK.
