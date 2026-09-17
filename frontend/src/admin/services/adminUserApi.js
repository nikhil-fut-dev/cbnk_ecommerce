import api from "../../services/api/axios";

// ===============================
// GET ALL CUSTOMERS
// ===============================
export const getAdminUsers = async ({
  search = "",
  status = "all",
  page = 1,
  limit = 20,
  sort = "-createdAt",
} = {}) => {
  const response = await api.get("/admin/users", {
    params: {
      search,
      status,
      page,
      limit,
      sort,
    },
  });

  return response.data;
};

// ===============================
// GET CUSTOMER BY ID
// ===============================
export const getAdminUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);

  return response.data;
};

// ===============================
// TOGGLE CUSTOMER STATUS
// ===============================
export const toggleAdminUserStatus = async (userId) => {
  const response = await api.patch(`/admin/users/${userId}/status`);

  return response.data;
};
