import api from "../../services/api/axios";

// ======================================================
// GET ALL PROMOTIONAL TICKERS
// ======================================================

export const getAdminPromotionalTickers = async () => {
  const response = await api.get("/admin/home/promotional-ticker");

  return response.data;
};

// ======================================================
// GET SINGLE PROMOTIONAL TICKER
// ======================================================

export const getAdminPromotionalTickerById = async (id) => {
  const response = await api.get(`/admin/home/promotional-ticker/${id}`);

  return response.data;
};

// ======================================================
// CREATE
// ======================================================

export const createAdminPromotionalTicker = async (tickerData) => {
  const response = await api.post("/admin/home/promotional-ticker", tickerData);

  return response.data;
};

// ======================================================
// UPDATE
// ======================================================

export const updateAdminPromotionalTicker = async (id, tickerData) => {
  const response = await api.put(
    `/admin/home/promotional-ticker/${id}`,
    tickerData,
  );

  return response.data;
};

// ======================================================
// DELETE
// ======================================================

export const deleteAdminPromotionalTicker = async (id) => {
  const response = await api.delete(`/admin/home/promotional-ticker/${id}`);

  return response.data;
};

// ======================================================
// TOGGLE STATUS
// ======================================================

export const toggleAdminPromotionalTickerStatus = async (id) => {
  const response = await api.patch(
    `/admin/home/promotional-ticker/${id}/status`,
  );

  return response.data;
};
