import { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";

import { getAdminDashboard } from "../services/adminDashboardApi";

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await getAdminDashboard();

      if (response?.success) {
        setDashboard(response.data);
      }

      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Unable to load admin dashboard";

      toast.error(message);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        dashboard,
        loading,
        fetchDashboard,
        setDashboard,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdmin must be used inside AdminProvider");
  }

  return context;
};
