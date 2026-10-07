import api from "./api/axios";

export const getHomeData = async () => {
  const response = await api.get("/home");

  return response.data;
};
