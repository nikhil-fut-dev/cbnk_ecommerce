# 🛍️ CBNK E-Commerce

### A Full-Stack MERN E-Commerce Platform

<p align="center">
  <strong>A modern, scalable and maintainable e-commerce application built with MongoDB, Express.js, React and Node.js.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/License-To_Be_Defined-lightgrey?style=flat-square" alt="License" />
</p>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Live Demo](#-live-demo)
- [Project Objectives](#-project-objectives)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Authentication and Security](#-authentication-and-security)
- [Database and Inventory](#-database-and-inventory)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Development Workflow](#-development-workflow)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🚀 About the Project

**CBNK E-Commerce** is a full-stack e-commerce web application developed using the MERN stack.

The project is designed to provide an online shopping experience through a customer-facing frontend and a separate administration interface.

The backend provides REST APIs, authentication, product and category management, cart functionality, and inventory-related operations.

The project follows a modular architecture to make the application easier to maintain, extend and improve as the business grows.

### 🎯 Main Goals

- Build a complete full-stack e-commerce application.
- Separate customer and administrator experiences.
- Develop reusable frontend components.
- Create modular and maintainable backend architecture.
- Implement secure authentication and authorization.
- Manage products, categories, carts and inventory.
- Integrate frontend and backend through REST APIs.
- Prepare the application for production deployment.

---

## 🌐 Live Demo

| Application | URL |
|---|---|
| Customer Website | https://cbnk-e-com.onrender.com |
| Backend API | https://cbnk-e-commerce.onrender.com |

> Note: Live deployment availability may depend on hosting service status and configuration.

---

## 🎯 Project Objectives

The application is organized around three major areas:

### 1. Customer Storefront

The customer-facing application is responsible for presenting products and providing the shopping experience.

Key areas include:

- Homepage and promotional sections
- Product browsing
- Category-based navigation
- Product details
- Customer authentication
- Shopping cart

### 2. Admin Dashboard

The administration interface provides tools to manage the store.

Key areas include:

- Admin authentication and protected access
- Product management
- Category management
- Product image management
- Product status management
- Inventory-related operations
- Homepage content management

### 3. Backend API

The backend handles business logic and communication with the database.

Responsibilities include:

- Authentication and authorization
- User management
- Product CRUD operations
- Category CRUD operations
- Cart management
- Inventory synchronization
- Image upload handling
- API validation and error handling

---

## ✨ Features

### 👤 Authentication

- User registration
- User login
- User logout
- Access token generation
- Refresh token functionality
- Protected user routes
- Current user profile endpoint
- Forgot-password endpoint
- Reset-password endpoint
- Role-based administrative authorization

### 🛒 Product Management

- Create products
- Retrieve product information
- Update existing products
- Archive products
- Product categories
- Product pricing
- Compare-at pricing
- Discount information
- Product SKU
- Product stock
- Product sizes and colors
- Product variants
- Product tags
- Product specifications
- Featured products
- New arrivals
- Best sellers
- Multiple product images

### 📂 Category Management

- Create categories
- Retrieve categories
- Update categories
- Category image upload
- Category active/inactive status
- Parent category support
- Subcategory support
- Category-based product organization
- Soft-delete behavior

### 🛍️ Shopping Cart

- Retrieve the authenticated user's cart
- Add products to cart
- Update cart item quantities
- Remove individual cart items
- Clear the cart
- Product and variant matching
- Stock validation during cart operations

### 📦 Inventory Management

- Inventory creation and synchronization
- Product stock tracking
- Variant-level inventory
- Reserved stock tracking
- Sold stock tracking
- Low-stock threshold
- Restocking timestamps

### 🖼️ Image Management

- Product image uploads
- Category image uploads
- Image metadata management
- Cloudinary integration in the backend upload flow
- Existing image retention during product updates

### 🖥️ Admin Experience

- Separate administration interface
- Product creation and editing forms
- Category management interface
- Product listing and management
- Product status controls
- Reusable admin components

---

## 🧰 Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| Vite | Frontend development and build tooling |
| JavaScript | Application logic |
| Tailwind CSS | Utility-first styling |
| React Router | Client-side routing |
| Axios | HTTP requests to backend APIs |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | NoSQL database |
| Mongoose | Database modeling and queries |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Multer | Multipart file upload handling |
| Cloudinary | Image storage and management |

### Development Tools

- Git
- GitHub
- npm
- Nodemon
- Postman
- VS Code

---

## 🏗️ Project Architecture

The project follows a separated frontend/backend architecture.

```text
                 CBNK E-COMMERCE
                         |
          +--------------+--------------+
          |                             |
     FRONTEND                        BACKEND
          |                             |
    React + Vite                  Node + Express
          |                             |
    +-----+------+              +-------+--------+
    |            |              |       |        |
 Customer      Admin          Routes Controllers Services
 Storefront   Dashboard          |       |        |
    |            |               +-------+--------+
    +------+-----+                       |
           |                           Models
           |                              |
         Axios                          MongoDB
           |
       REST APIs
```

### Backend Request Flow

```text
Client Request
      |
      v
Express Application
      |
      v
API Route
      |
      v
Authentication Middleware
      |
      v
Controller
      |
      v
Service / Model
      |
      v
MongoDB
      |
      v
JSON Response
      |
      v
Frontend UI
```

---

## 📁 Project Structure

The repository is organized into separate frontend and backend applications.

```text
cbnk_ecommerce/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   │
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api/
│   │   ├── assets/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
└── README.md
```

> The structure above is a high-level overview. Refer to the actual repository for the complete list of files and folders.

---

## ⚙️ Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Install the following tools:

- Node.js
- npm
- MongoDB Atlas account or local MongoDB
- Git
- Code editor
- Cloudinary account if using image uploads

Check your installed versions:

```bash
node -v
npm -v
git --version
```

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project:

```bash
cd cbnk_ecommerce
```

### 2. Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create your backend environment file:

```text
server/.env
```

Add the environment variables required by the backend configuration.

Start the development server:

```bash
npm run dev
```

Expected server output:

```text
MongoDB Connected
CBNK E-Commerce Server running on http://localhost:5000
```

> Actual startup messages may differ depending on the current server configuration.

### 3. Frontend Setup

Open another terminal and navigate to:

```bash
cd cbnk_ecommerce/frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal, commonly:

```text
http://localhost:5173
```

### 4. Run Both Applications

Keep both terminals running:

| Application | Development Command |
|---|---|
| Backend | `npm run dev` inside `server` |
| Frontend | `npm run dev` inside `frontend` |

---

## 🔐 Environment Variables

Environment variables are used to keep application configuration and sensitive credentials outside the source code.

Create a `.env` file inside the backend directory.

Example configuration template:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> This is an illustrative template, not a verified list of every variable used by the current backend. Check `server/src/config/` and the environment configuration before running the application. Use the exact variable names expected by your code.

### Environment Security Rules

- Never upload `.env` files to GitHub.
- Never expose database credentials.
- Never expose JWT secrets.
- Never expose Cloudinary secrets.
- Use separate credentials for development and production.
- Rotate credentials if they are accidentally exposed.
- Configure production environment variables through the hosting provider.

---

## 🔌 API Overview

The backend exposes REST API endpoints.

The examples below use the route paths identified in the application. The complete route list and any global API prefix should be checked in the backend route configuration.

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a user |
| POST | `/login` | Login |
| POST | `/logout` | Logout |
| POST | `/refresh` | Refresh authentication |
| GET | `/me` | Get authenticated user |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password |

### Product APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | Retrieve products |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Archive product |
| GET | `/admin/products` | Admin product listing |
| GET | `/admin/products/:id` | Retrieve admin product |

### Category APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | Retrieve categories |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| PATCH | `/categories/:id/status` | Toggle category status |
| DELETE | `/categories/:id` | Soft-delete category |
| GET | `/categories/admin/list` | Admin category listing |

### Cart APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Get authenticated user's cart |
| POST | `/cart` | Add an item |
| PUT | `/cart/:itemId` | Update an item |
| DELETE | `/cart/:itemId` | Remove an item |
| DELETE | `/cart` | Clear cart |

> API paths above are route-level paths. Your Axios base URL or Express router mounting may add a prefix such as `/api/v1`. Confirm the final URLs from the route mounting configuration.

---

## 🛡️ Authentication and Security

Security is an important part of the application architecture.

The backend includes the following security-related mechanisms:

### Password Security

- Password hashing using `bcryptjs`.
- Passwords are not intended to be stored as plain text.
- Password validation is handled by the user model and related authentication logic.

### Token Authentication

- JWT-based access tokens.
- JWT-based refresh tokens.
- Token generation through reusable utility functions.
- Authentication middleware for protected routes.
- Authenticated user retrieval through the protected profile endpoint.

### Authorization

- Protected routes require authentication.
- Administrative routes use admin authorization middleware.
- User roles are used to restrict privileged operations.

### Data Validation

- Product input validation.
- Category and product model validation.
- Stock checks during cart operations.
- Object references between products, variants and categories.

> Security depends on the complete deployment configuration, cookie settings, middleware, CORS rules, rate limiting and other controls. This section documents known mechanisms; it is not a security certification or a claim that every production security control has been audited.

---

## 📦 Database and Inventory

The application uses MongoDB with Mongoose models.

### Product Data

Product information includes fields such as:

- Name
- Description
- Category
- Subcategory
- Brand
- Gender
- Age group
- Price
- Compare-at price
- Discount
- SKU
- Stock
- Sizes
- Colors
- Variants
- Tags
- Specifications
- Images
- Product status flags

### Inventory Data

Inventory functionality tracks:

- Available stock
- Reserved stock
- Sold stock
- Variant-level stock
- Low-stock threshold
- Last restocked timestamp

### Important Inventory Rule

Existing inventory values such as sold stock and reserved stock should be preserved when product information is updated.

Inventory synchronization should not unintentionally reset historical stock information.

---

## ☁️ Deployment

The project has deployed frontend and backend applications.

| Component | Hosting URL |
|---|---|
| Frontend | https://cbnk-e-com.onrender.com |
| Backend | https://cbnk-e-commerce.onrender.com |

### Production Deployment Checklist

- Configure production MongoDB connection.
- Configure secure JWT secrets.
- Configure frontend/backend origins.
- Configure CORS correctly.
- Configure image storage credentials.
- Configure all required environment variables.
- Verify authentication cookies and cross-origin settings.
- Test product creation and updates.
- Test category management.
- Test cart and stock validation.
- Verify production API URLs.
- Confirm that secrets are not committed to Git.

---

## 📸 Screenshots

Screenshots help visitors understand the project quickly.

Add screenshots in a folder such as:

```text
docs/
└── screenshots/
    ├── homepage.png
    ├── product-listing.png
    ├── product-details.png
    ├── cart.png
    └── admin-dashboard.png
```

Then include them here:

```markdown
![Homepage](docs/screenshots/homepage.png)

![Product Listing](docs/screenshots/product-listing.png)

![Admin Dashboard](docs/screenshots/admin-dashboard.png)
```

---

## 🔄 Development Workflow

The project follows a modular development approach.

1. Inspect the existing backend architecture.
2. Build and verify backend functionality.
3. Develop reusable frontend components.
4. Integrate frontend services with backend APIs.
5. Test CRUD operations.
6. Verify authentication and authorization.
7. Test inventory and cart operations.
8. Fix integration issues.
9. Prepare production deployment.

### Code Organization Principles

- Reusable React components.
- Separation of API services and UI components.
- Modular backend routes and controllers.
- Reusable middleware.
- Centralized configuration.
- Model-based database design.
- Validation before database operations.

---

## 🚧 Future Improvements

Potential areas for future development include:

- Automated backend and frontend testing.
- Advanced product search and filtering.
- Product reviews and ratings.
- Wishlist functionality.
- Order management.
- Customer order history.
- Payment integration verification and improvements.
- Shipping and delivery tracking.
- Advanced analytics dashboard.
- Performance optimization.
- CI/CD automation.
- Accessibility improvements.
- Automated security testing.

These are roadmap ideas, not a claim that they are already implemented.

---

## 🤝 Contributing

Contributions, suggestions and improvements are welcome.

### Contribution Steps

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes.
4. Test your changes.
5. Commit your work.

```bash
git add .
git commit -m "Add: your feature description"
```

6. Push your branch.

```bash
git push origin feature/your-feature-name
```

7. Open a Pull Request.

Please keep contributions focused, maintainable and consistent with the existing project architecture.

---

## 📄 License

No license has been specified in this documentation.

Before distributing or reusing this project, add an appropriate `LICENSE` file and update this section.

---

## 👨‍💻 Author

**Project:** CBNK E-Commerce

**Developer:** Add your preferred public name here.

**GitHub:** Add your GitHub profile URL here.

**Portfolio:** Add your portfolio URL here.

---

<p align="center">
  <strong>CBNK E-Commerce</strong>
  <br />
  Built with the MERN Stack ❤️
  <br />
  <sub>Thank you for visiting this repository!</sub>
</p>