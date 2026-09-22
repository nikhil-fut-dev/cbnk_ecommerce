import { useLocation } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AdminRoutes from "./admin/routes/AdminRoutes";

const App = () => {
  const location = useLocation();

  // Admin routes ke liye customer Navbar hide rahega
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <AppRoutes />
      <AdminRoutes />
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
