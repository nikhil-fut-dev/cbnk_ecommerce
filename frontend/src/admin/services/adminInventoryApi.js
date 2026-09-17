import api from "../../services/api/axios";

/*
 * Get all inventory
 *
 * Supported filters:
 * search
 * lowStock
 * page
 * limit
 */
export const getAdminInventory = async ({
  search = "",
  lowStock = false,
  page = 1,
  limit = 20,
} = {}) => {
  const response = await api.get("/inventory", {
    params: {
      search,
      lowStock,
      page,
      limit,
    },
  });

  return response.data;
};

/*
 * Get low-stock products
 */
export const getLowStockProducts = async () => {
  const response = await api.get("/inventory/low-stock");

  return response.data;
};

/*
 * Get inventory of a single product
 */
export const getProductInventory = async (productId) => {
  const response = await api.get(`/inventory/product/${productId}`);

  return response.data;
};

/*
 * Sync product inventory
 */
export const syncProductInventory = async (productId) => {
  const response = await api.post(`/inventory/product/${productId}/sync`);

  return response.data;
};

/*
 * Restock product / variant
 *
 * For simple product:
 * {
 *   quantity,
 *   lowStockThreshold
 * }
 *
 * For variant:
 * {
 *   quantity,
 *   variantId,
 *   lowStockThreshold
 * }
 */
export const restockProduct = async (
  productId,
  { quantity, variantId = null, lowStockThreshold },
) => {
  const response = await api.patch(`/inventory/product/${productId}/restock`, {
    quantity,
    ...(variantId ? { variantId } : {}),
    ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
  });

  return response.data;
};
