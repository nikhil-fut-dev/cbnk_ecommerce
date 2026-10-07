import api from "../../services/api/axios";

/**
 * Get all Kids Sets
 */
export const getAdminKidsSets = async () => {
  const response = await api.get("/admin/home/kids-sets");

  return response.data;
};

/**
 * Get single Kids Set
 */
export const getAdminKidsSetById = async (id) => {
  const response = await api.get(`/admin/home/kids-sets/${id}`);

  return response.data;
};

/**
 * Create Kids Set
 */
export const createAdminKidsSet = async (kidsSetData) => {
  const formData = new FormData();

  Object.entries(kidsSetData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "image") {
      if (value instanceof File) {
        formData.append("image", value);
      }

      return;
    }

    formData.append(key, value);
  });

  const response = await api.post("/admin/home/kids-sets", formData);

  return response.data;
};

/**
 * Update Kids Set
 */
export const updateAdminKidsSet = async (id, kidsSetData) => {
  const formData = new FormData();

  Object.entries(kidsSetData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "image") {
      if (value instanceof File) {
        formData.append("image", value);
      }

      return;
    }

    formData.append(key, value);
  });

  const response = await api.put(`/admin/home/kids-sets/${id}`, formData);

  return response.data;
};

/**
 * Delete Kids Set
 */
export const deleteAdminKidsSet = async (id) => {
  const response = await api.delete(`/admin/home/kids-sets/${id}`);

  return response.data;
};

/**
 * Toggle Kids Set status
 */
export const toggleAdminKidsSetStatus = async (id) => {
  const response = await api.patch(`/admin/home/kids-sets/${id}/status`);

  return response.data;
};
