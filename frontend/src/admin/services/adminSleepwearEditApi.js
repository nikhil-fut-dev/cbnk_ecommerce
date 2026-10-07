import api from "../../services/api/axios";

// Get all sleepwear edits
export const getAdminSleepwearEdits = async () => {
  const response = await api.get("/admin/home/sleepwear");

  return response.data;
};

// Get single sleepwear edit
export const getAdminSleepwearEditById = async (id) => {
  const response = await api.get(`/admin/home/sleepwear/${id}`);

  return response.data;
};

// Create sleepwear edit
export const createAdminSleepwearEdit = async (sleepwearData) => {
  const formData = new FormData();

  Object.entries(sleepwearData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "desktopImage" || key === "mobileImage") {
      if (value instanceof File) {
        formData.append(key, value);
      }

      return;
    }

    formData.append(key, value);
  });

  const response = await api.post("/admin/home/sleepwear", formData);

  return response.data;
};

// Update sleepwear edit
export const updateAdminSleepwearEdit = async (id, sleepwearData) => {
  const formData = new FormData();

  Object.entries(sleepwearData).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "desktopImage" || key === "mobileImage") {
      if (value instanceof File) {
        formData.append(key, value);
      }

      return;
    }

    formData.append(key, value);
  });

  const response = await api.put(`/admin/home/sleepwear/${id}`, formData);

  return response.data;
};

// Delete sleepwear edit
export const deleteAdminSleepwearEdit = async (id) => {
  const response = await api.delete(`/admin/home/sleepwear/${id}`);

  return response.data;
};

// Toggle status
export const toggleAdminSleepwearEditStatus = async (id) => {
  const response = await api.patch(`/admin/home/sleepwear/${id}/status`);

  return response.data;
};
