import api from "../../services/api/axios";

// =====================================================
// GET ADMIN PRODUCTS
// Backend: GET /admin/products
// =====================================================
export const getAdminProducts = async ({
  search = "",
  category = "",
  status = "",
  isDeleted = "",
  page = 1,
  limit = 20,
  sort = "newest",
} = {}) => {
  const response = await api.get("/admin/products", {
    params: {
      search,
      category,
      status,
      isDeleted,
      page,
      limit,
      sort,
    },
  });

  return response.data;
};

// =====================================================
// GET SINGLE ADMIN PRODUCT
// Backend: GET /admin/products/:id
// =====================================================
export const getAdminProductById = async (productId) => {
  const response = await api.get(`/admin/products/${productId}`);

  return response.data;
};

// =====================================================
// TOGGLE PRODUCT STATUS
// Backend: PATCH /admin/products/:id/status
// =====================================================
export const toggleAdminProductStatus = async (productId) => {
  const response = await api.patch(`/admin/products/${productId}/status`);

  return response.data;
};

// =====================================================
// CREATE PRODUCT
// Backend: POST /products
//
// Uses multipart/form-data because product images
// are uploaded using multer.
// =====================================================
export const createAdminProduct = async (productData) => {
  const formData = new FormData();

  Object.entries(productData).forEach(([key, value]) => {
    // Ignore empty values
    if (value === undefined || value === null || value === "") {
      return;
    }

    // Product images
    if (key === "images") {
      value.forEach((file) => {
        if (file instanceof File) {
          formData.append("images", file);
        }
      });

      return;
    }

    // Arrays / Objects
    // Backend expects JSON for these fields.
    if (Array.isArray(value) || typeof value === "object") {
      formData.append(key, JSON.stringify(value));

      return;
    }

    // Normal values
    formData.append(key, value);
  });

  const response = await api.post("/products", formData);

  return response.data;
};

// =====================================================
// UPDATE PRODUCT
// Backend: PUT /products/:id
//
// Uses multipart/form-data.
// Supports:
// - normal product fields
// - new images
// - keepImages
// - arrays
// - objects
// =====================================================
export const updateAdminProduct = async (productId, productData) => {
  const formData = new FormData();

  Object.entries(productData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    // New product images
    if (key === "images") {
      value.forEach((file) => {
        if (file instanceof File) {
          formData.append("images", file);
        }
      });

      return;
    }

    // Existing images that should remain
    // Backend expects keepImages as JSON.
    if (key === "keepImages") {
      formData.append("keepImages", JSON.stringify(value));

      return;
    }

    // Arrays / Objects
    if (Array.isArray(value) || typeof value === "object") {
      formData.append(key, JSON.stringify(value));

      return;
    }

    // Normal values
    formData.append(key, value);
  });

  const response = await api.put(`/products/${productId}`, formData);

  return response.data;
};

// =====================================================
// DELETE / ARCHIVE PRODUCT
// Backend: DELETE /products/:id
//
// IMPORTANT:
// Backend does NOT permanently delete the product.
// It archives the product using:
// isActive = false
// isDeleted = true
// =====================================================
export const deleteAdminProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);

  return response.data;
};
