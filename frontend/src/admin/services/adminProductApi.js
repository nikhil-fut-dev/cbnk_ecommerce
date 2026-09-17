import api from "../../services/api/axios";

// Get admin products
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

// Get single admin product
export const getAdminProductById = async (productId) => {
  const response = await api.get(`/admin/products/${productId}`);

  return response.data;
};

// Activate / deactivate product
export const toggleAdminProductStatus = async (productId) => {
  const response = await api.patch(`/admin/products/${productId}/status`);

  return response.data;
};
