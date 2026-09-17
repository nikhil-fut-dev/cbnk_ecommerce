import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import AdminRoutes from "./admin/routes/AdminRoutes";

const App = () => {
  return (
    <>
      <Navbar />
      <AppRoutes />
      <AdminRoutes />
    </>
  );
};

export default App;
