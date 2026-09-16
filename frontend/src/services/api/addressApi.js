import api from "./axios";

// Get all addresses
export const getAddresses = async () => {
  const response = await api.get("/addresses");
  return response.data;
};

// Get single address
export const getAddressById = async (id) => {
  const response = await api.get(`/addresses/${id}`);
  return response.data;
};

// Create address
export const createAddress = async (addressData) => {
  const response = await api.post("/addresses", addressData);
  return response.data;
};

// Update address
export const updateAddress = async (id, addressData) => {
  const response = await api.put(`/addresses/${id}`, addressData);
  return response.data;
};

// Set default address
export const setDefaultAddress = async (id) => {
  const response = await api.patch(`/addresses/${id}/default`);
  return response.data;
};

// Delete address
export const deleteAddress = async (id) => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};
