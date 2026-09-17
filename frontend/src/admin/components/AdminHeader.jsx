import { Menu, Bell, ExternalLink } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/users": "Customers",
  "/admin/categories": "Categories",
  "/admin/coupons": "Coupons",
  "/admin/inventory": "Inventory",
};

const AdminHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getPageTitle = () => {
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }

    if (location.pathname.startsWith("/admin/products/")) {
      return "Product Details";
    }

    if (location.pathname.startsWith("/admin/orders/")) {
      return "Order Details";
    }

    if (location.pathname.startsWith("/admin/users/")) {
      return "Customer Details";
    }

    if (location.pathname.startsWith("/admin/categories/")) {
      return "Category";
    }

    if (location.pathname.startsWith("/admin/coupons/")) {
      return "Coupon";
    }

    if (location.pathname.startsWith("/admin/inventory/")) {
      return "Inventory Details";
    }

    return "Admin";
  };

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="flex h-20 items-center justify-between px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl border border-neutral-200 p-2.5 text-neutral-700 transition hover:bg-neutral-100 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
              Admin Console
            </p>

            <h1 className="mt-0.5 text-lg font-bold text-neutral-900 md:text-xl">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Store */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="hidden items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 sm:flex"
          >
            <ExternalLink size={16} />
            <span>Store</span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-xl border border-neutral-200 p-2.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Notifications"
          >
            <Bell size={19} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          {/* Admin */}
          <div className="hidden items-center gap-3 border-l border-neutral-200 pl-4 md:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-neutral-900">
                {user?.fullName || "Administrator"}
              </p>

              <p className="text-xs text-neutral-500">Administrator</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
              {(user?.fullName || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
