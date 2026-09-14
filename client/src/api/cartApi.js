import api from "./axios";

export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

export const addToCartApi = async ({
  productId,
  variantId = null,
  size = "",
  color = "",
  quantity = 1,
}) => {
  const response = await api.post("/cart", {
    productId,
    variantId,
    size,
    color,
    quantity,
  });

  return response.data;
};

export const updateCartItemApi = async ({ itemId, quantity }) => {
  const response = await api.put(`/cart/${itemId}`, {
    quantity,
  });

  return response.data;
};

export const removeCartItemApi = async (itemId) => {
  const response = await api.delete(`/cart/${itemId}`);
  return response.data;
};

export const clearCartApi = async () => {
  const response = await api.delete("/cart");
  return response.data;
};
