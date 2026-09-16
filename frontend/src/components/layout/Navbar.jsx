import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    closeMobileMenu();

    await logout();

    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="text-xl font-black tracking-tight text-neutral-900"
        >
          CBNK
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>

          <NavLink to="/wishlist" className={navLinkClass}>
            Wishlist
          </NavLink>

          <NavLink to="/cart" className={navLinkClass}>
            Cart
          </NavLink>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/wishlist"
            className="relative rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Wishlist"
          >
            <Heart size={20} strokeWidth={1.8} />
          </Link>

          <Link
            to="/cart"
            className="relative rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Shopping cart"
          >
            <ShoppingBag size={20} strokeWidth={1.8} />
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/account"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                <User size={18} strokeWidth={1.8} />

                <span>{user?.fullName || "Account"}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-900 hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((previous) => !previous)}
          className="rounded-xl p-2 text-neutral-700 transition hover:bg-neutral-100 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">
            <NavLink to="/" onClick={closeMobileMenu} className={navLinkClass}>
              Home
            </NavLink>

            <NavLink
              to="/shop"
              onClick={closeMobileMenu}
              className={`${navLinkClass} py-3`}
            >
              Shop
            </NavLink>

            <NavLink
              to="/wishlist"
              onClick={closeMobileMenu}
              className={`${navLinkClass} py-3`}
            >
              Wishlist
            </NavLink>

            <NavLink
              to="/cart"
              onClick={closeMobileMenu}
              className={`${navLinkClass} py-3`}
            >
              Cart
            </NavLink>

            <div className="mt-3 border-t border-neutral-200 pt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/account"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    <User size={18} />

                    {user?.fullName || "Account"}
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm font-semibold text-neutral-800"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
