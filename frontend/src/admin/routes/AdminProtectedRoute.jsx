import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Auth status check hone tak wait
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">Checking access...</p>
      </div>
    );
  }

  // User login nahi hai
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // User logged in hai, lekin ADMIN nahi hai
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // ADMIN hai → requested admin page open karo
  return <Outlet />;
};

export default AdminProtectedRoute;
