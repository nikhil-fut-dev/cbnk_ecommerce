import api from "./axios";

export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

export const addToCart = async ({
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

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/cart/${itemId}`, {
    quantity,
  });

  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/cart/${itemId}`);

  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete("/cart");

  return response.data;
};
