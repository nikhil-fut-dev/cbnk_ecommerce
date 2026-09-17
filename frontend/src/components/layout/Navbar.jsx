import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  const navigate = useNavigate();

  // =========================================================
  // MOBILE MENU
  // =========================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    closeMobileMenu();

    await logout();

    navigate("/login");
  };

  // =========================================================
  // NAV LINK STYLE
  // =========================================================

  const navLinkClass = ({ isActive }) =>
    `relative py-2 text-sm font-semibold transition ${
      isActive ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-950"
    }`;

  // =========================================================
  // COMPONENT
  // =========================================================

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* =================================================
            LOGO
        ================================================== */}

        <Link
          to="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-sm font-black text-white transition group-hover:scale-105">
            C
          </span>

          <div className="hidden sm:block">
            <p className="text-lg font-black leading-none tracking-tight text-neutral-950">
              CBNK
            </p>

            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.25em] text-neutral-400">
              Fashion Store
            </p>
          </div>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================== */}

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass}>
            {({ isActive }) => (
              <>
                Home
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-neutral-950" />
                )}
              </>
            )}
          </NavLink>

          <NavLink to="/shop" className={navLinkClass}>
            {({ isActive }) => (
              <>
                Shop
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-neutral-950" />
                )}
              </>
            )}
          </NavLink>

          <NavLink to="/wishlist" className={navLinkClass}>
            {({ isActive }) => (
              <>
                Wishlist
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-neutral-950" />
                )}
              </>
            )}
          </NavLink>

          <NavLink to="/cart" className={navLinkClass}>
            {({ isActive }) => (
              <>
                Cart
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-neutral-950" />
                )}
              </>
            )}
          </NavLink>
        </nav>

        {/* =================================================
            DESKTOP ACTIONS
        ================================================== */}

        <div className="hidden items-center gap-1.5 md:flex">
          {/* Search */}

          <button
            type="button"
            onClick={() => navigate("/shop")}
            aria-label="Search products"
            className="rounded-full p-2.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <Search size={19} strokeWidth={1.8} />
          </button>

          {/* Wishlist */}

          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative rounded-full p-2.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <Heart size={19} strokeWidth={1.8} />
          </Link>

          {/* Cart */}

          <Link
            to="/cart"
            aria-label={`Shopping cart with ${totalItems} items`}
            className="relative rounded-full p-2.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <ShoppingBag size={19} strokeWidth={1.8} />

            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-950 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          <div className="mx-2 h-7 w-px bg-neutral-200" />

          {/* Authenticated */}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/account"
                className="flex max-w-44 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <User size={16} strokeWidth={2} />
                </span>

                <span className="truncate">{user?.fullName || "Account"}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-bold text-neutral-700 transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* =================================================
            MOBILE ACTIONS
        ================================================== */}

        <div className="flex items-center gap-1 md:hidden">
          <Link
            to="/wishlist"
            onClick={closeMobileMenu}
            aria-label="Wishlist"
            className="rounded-full p-2.5 text-neutral-700 transition hover:bg-neutral-100"
          >
            <Heart size={20} strokeWidth={1.8} />
          </Link>

          <Link
            to="/cart"
            onClick={closeMobileMenu}
            aria-label={`Shopping cart with ${totalItems} items`}
            className="relative rounded-full p-2.5 text-neutral-700 transition hover:bg-neutral-100"
          >
            <ShoppingBag size={20} strokeWidth={1.8} />

            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-950 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="rounded-xl p-2.5 text-neutral-700 transition hover:bg-neutral-100"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <div
        className={`overflow-hidden border-t border-neutral-200 bg-white transition-all duration-300 md:hidden ${
          mobileMenuOpen
            ? "max-h-[500px] opacity-100"
            : "max-h-0 border-t-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          {/* Mobile Navigation */}

          <nav className="space-y-1">
            <NavLink
              to="/"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-neutral-100 text-neutral-950"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/shop"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-neutral-100 text-neutral-950"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                }`
              }
            >
              Shop
            </NavLink>

            <NavLink
              to="/wishlist"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-neutral-100 text-neutral-950"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Heart size={17} />
                Wishlist
              </span>
            </NavLink>

            <NavLink
              to="/cart"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-neutral-100 text-neutral-950"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <ShoppingBag size={17} />
                Cart
              </span>
            </NavLink>
          </nav>

          {/* Mobile Divider */}

          <div className="my-4 h-px bg-neutral-200" />

          {/* Mobile Search */}

          <button
            type="button"
            onClick={() => {
              closeMobileMenu();
              navigate("/shop");
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3.5 text-left text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <Search size={18} />
            Search Products
          </button>

          {/* Mobile Auth */}

          <div className="mt-4">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/account"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3.5 text-sm font-bold text-neutral-800 transition hover:bg-neutral-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
                    <User size={17} />
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs text-neutral-400">My Account</p>

                    <p className="truncate">{user?.fullName || "Account"}</p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-neutral-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-neutral-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="rounded-xl border border-neutral-200 px-4 py-3.5 text-center text-sm font-bold text-neutral-800 transition hover:bg-neutral-50"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-neutral-950 px-4 py-3.5 text-center text-sm font-bold text-white transition hover:bg-neutral-800"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
