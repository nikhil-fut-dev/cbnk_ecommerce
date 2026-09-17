import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  TicketPercent,
  Boxes,
  ChevronLeft,
  ChevronRight,
  X,
  Store,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Customers",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Coupons",
    path: "/admin/coupons",
    icon: TicketPercent,
  },
  {
    label: "Inventory",
    path: "/admin/inventory",
    icon: Boxes,
  },
];

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();

      toast.success("Logged out successfully");

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Admin logout error:", error);

      toast.error(error.response?.data?.message || "Failed to logout");
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-neutral-800 bg-neutral-950 text-white
          transition-all duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "lg:w-20" : "w-72"}
        `}
      >
        {/* Brand */}
        <div
          className={`flex h-20 shrink-0 items-center border-b border-neutral-800 ${
            collapsed ? "justify-center px-3" : "justify-between px-5"
          }`}
        >
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-neutral-950">
              C
            </div>

            {!collapsed && (
              <div className="text-left">
                <p className="text-base font-bold tracking-wide">CBNK</p>

                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                  Admin Console
                </p>
              </div>
            )}
          </button>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p
            className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 ${
              collapsed ? "text-center" : ""
            }`}
          >
            {collapsed ? "•" : "Management"}
          </p>

          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : ""}
                  className={({ isActive }) =>
                    `
                    group flex items-center rounded-xl
                    px-3 py-3 text-sm font-medium
                    transition-all duration-200
                    ${collapsed ? "justify-center" : "gap-3"}
                    ${
                      isActive
                        ? "bg-white text-neutral-950 shadow-sm"
                        : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={19}
                        strokeWidth={isActive ? 2.3 : 2}
                        className="shrink-0"
                      />

                      {!collapsed && <span>{item.label}</span>}

                      {!collapsed && isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neutral-950" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Store Link */}
        <div className="border-t border-neutral-800 p-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            title={collapsed ? "View Store" : ""}
            className={`
              flex w-full items-center rounded-xl px-3 py-3
              text-sm font-medium text-neutral-400
              transition hover:bg-neutral-900 hover:text-white
              ${collapsed ? "justify-center" : "gap-3"}
            `}
          >
            <Store size={19} />

            {!collapsed && <span>View Store</span>}
          </button>
        </div>

        {/* Admin Profile */}
        <div className="border-t border-neutral-800 p-3">
          <div
            className={`
              flex items-center rounded-xl bg-neutral-900 p-3
              ${collapsed ? "justify-center" : "gap-3"}
            `}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-neutral-950">
              {(user?.fullName || "A").charAt(0).toUpperCase()}
            </div>

            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.fullName || "Administrator"}
                  </p>

                  <p className="truncate text-xs text-neutral-500">
                    {user?.email || "Admin Account"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
                >
                  <LogOut size={17} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-24 hidden h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-100 lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </aside>
    </>
  );
};

export default AdminSidebar;
