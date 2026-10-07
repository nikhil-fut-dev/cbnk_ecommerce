import api from "../../services/api/axios";

// =========================================================
// GET ALL CBNK ELITE
// =========================================================

export const getAdminCBNKElites = async () => {
  const response = await api.get("/admin/home/elite");

  return response.data;
};

// =========================================================
// GET SINGLE CBNK ELITE
// =========================================================

export const getAdminCBNKEliteById = async (id) => {
  const response = await api.get(`/admin/home/elite/${id}`);

  return response.data;
};

// =========================================================
// CREATE CBNK ELITE
// =========================================================

export const createAdminCBNKElite = async (eliteData) => {
  const response = await api.post("/admin/home/elite", eliteData);

  return response.data;
};

// =========================================================
// UPDATE CBNK ELITE
// =========================================================

export const updateAdminCBNKElite = async (id, eliteData) => {
  const response = await api.put(`/admin/home/elite/${id}`, eliteData);

  return response.data;
};

// =========================================================
// DELETE CBNK ELITE
// =========================================================

export const deleteAdminCBNKElite = async (id) => {
  const response = await api.delete(`/admin/home/elite/${id}`);

  return response.data;
};

// =========================================================
// TOGGLE CBNK ELITE STATUS
// =========================================================

export const toggleAdminCBNKEliteStatus = async (id) => {
  const response = await api.patch(`/admin/home/elite/${id}/status`);

  return response.data;
};
