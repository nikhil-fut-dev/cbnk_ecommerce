import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Menu,
  MoreVertical,
  Search,
  ShoppingBag,
  Truck,
  Gift,
  MapPin,
  Download,
  HelpCircle,
  RotateCcw,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getCategories } from "../../services/api/categoryApi";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getCategories();

      if (response?.success && response?.data?.length > 0) {
        setCategories(response.data);
      }
    };

    fetchCategories();
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    setMobileMenuOpen(false);

    await logout();

    navigate("/login");
  };

  // =========================================================
  // CLOSE MOBILE MENU
  // =========================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = () => {
    navigate("/shop");
    closeMobileMenu();
  };

  // =========================================================
  // CATEGORY IMAGE
  // =========================================================

  const getCategoryImage = (category) => {
    if (category?.image) {
      if (typeof category.image === "string") {
        return category.image;
      }

      if (category.image.url) {
        return category.image.url;
      }
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <header className="relative z-50 w-full bg-white">
      {/* =====================================================
          TOP BLACK UTILITY BAR
      ====================================================== */}

      <div className="hidden bg-black text-white md:block">
        <div className="mx-auto flex h-[38px] max-w-[1105px] items-center justify-between px-4 text-[11px] font-semibold">
          {/* Left */}

          <div className="flex items-center gap-7">
            <Link
              to="/"
              className="flex items-center gap-1.5 transition hover:text-neutral-300"
            >
              <Truck size={13} strokeWidth={2.2} />
              Free Shipping
            </Link>

            <Link
              to="/"
              className="flex items-center gap-1.5 transition hover:text-neutral-300"
            >
              <RotateCcw size={13} strokeWidth={2.2} />
              Return To Store
            </Link>

            <Link
              to="/"
              className="flex items-center gap-1.5 transition hover:text-neutral-300"
            >
              <Gift size={13} strokeWidth={2.2} />
              Online Gift Card
            </Link>
          </div>

          {/* Right */}

          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-5 transition hover:text-neutral-300"
            >
              <MapPin size={13} strokeWidth={2} />
              Delivering To
            </Link>

            <span className="h-4 w-px bg-white/50" />

            <Link
              to="/"
              className="flex items-center gap-1.5 px-5 transition hover:text-neutral-300"
            >
              <Download size={13} strokeWidth={2} />
              Download Our Apps
            </Link>

            <span className="h-4 w-px bg-white/50" />

            <Link to="/" className="px-5 transition hover:text-neutral-300">
              Store Locator
            </Link>

            <span className="h-4 w-px bg-white/50" />

            <Link
              to="/"
              className="flex items-center gap-1.5 pl-5 transition hover:text-neutral-300"
            >
              <HelpCircle size={13} strokeWidth={2} />
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN NAVIGATION
      ====================================================== */}

      <div className="border-b border-neutral-100 bg-[#f8f9f9]">
        <div className="mx-auto flex h-[76px] max-w-[1105px] items-center gap-7 px-4 md:h-[72px]">
          {/* =================================================
              LOGO
          ================================================== */}

          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex h-[60px] w-[130px] shrink-0 items-center justify-center overflow-hidden"
          >
            <img
              src="/logo.png"
              alt="CBNK E-Commerce"
              className="h-full w-full object-contain"
            />
          </Link>

          {/* =================================================
              DESKTOP SEARCH
          ================================================== */}

          <button
            type="button"
            onClick={handleSearch}
            className="hidden h-[42px] flex-1 items-center gap-3 bg-[#eeeeee] px-4 text-left transition hover:bg-[#e7e7e7] md:flex"
          >
            <Search
              size={18}
              strokeWidth={2}
              className="shrink-0 text-neutral-500"
            />

            <span className="text-[13px] text-neutral-500">
              What are you looking for?
            </span>
          </button>

          {/* =================================================
              DESKTOP ACTIONS
          ================================================== */}

          <div className="hidden shrink-0 items-center gap-5 md:flex">
            {/* Auth */}

            {isAuthenticated ? (
              <Link
                to="/account"
                className="flex min-w-[135px] items-center justify-center border border-neutral-300 bg-white px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-neutral-800 transition hover:border-neutral-800"
              >
                {user?.fullName || "My Account"}
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex min-w-[135px] items-center justify-center bg-[#d8b28a] px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-white transition hover:bg-[#cba277]"
              >
                SIGN UP / SIGN IN
              </Link>
            )}

            {/* Wishlist */}

            <Link
              to="/wishlist"
              className="group flex min-w-[42px] flex-col items-center gap-1 text-black"
            >
              <Heart
                size={21}
                strokeWidth={1.8}
                className="transition group-hover:scale-110"
              />

              <span className="text-[9px] font-medium">Favourites</span>
            </Link>

            {/* Cart */}

            <Link
              to="/cart"
              className="group relative flex min-w-[42px] flex-col items-center gap-1 text-black"
            >
              <ShoppingBag
                size={21}
                strokeWidth={1.8}
                className="transition group-hover:scale-110"
              />

              <span className="text-[9px] font-medium">Basket</span>

              {totalItems > 0 && (
                <span className="absolute -right-1 top-[-5px] flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[8px] font-bold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* More */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex min-w-[42px] flex-col items-center gap-1 text-black"
            >
              <MoreVertical
                size={21}
                strokeWidth={2}
                className="transition group-hover:scale-110"
              />

              <span className="text-[9px] font-medium">More</span>
            </button>
          </div>

          {/* =================================================
              MOBILE ACTIONS
          ================================================== */}

          <div className="ml-auto flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={handleSearch}
              aria-label="Search"
              className="rounded-full p-2 text-neutral-800"
            >
              <Search size={21} strokeWidth={1.8} />
            </button>

            <Link
              to="/wishlist"
              onClick={closeMobileMenu}
              aria-label="Wishlist"
              className="rounded-full p-2 text-neutral-800"
            >
              <Heart size={21} strokeWidth={1.8} />
            </Link>

            <Link
              to="/cart"
              onClick={closeMobileMenu}
              aria-label="Cart"
              className="relative rounded-full p-2 text-neutral-800"
            >
              <ShoppingBag size={21} strokeWidth={1.8} />

              {totalItems > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[8px] font-bold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Menu"
              className="rounded-full p-2 text-neutral-800"
            >
              {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
           CATEGORY NAVIGATION
      ====================================================== */}

      <div className="relative border-b border-neutral-100 bg-white">
        <div
          className="
      mx-auto
      flex
      w-full
      items-start
      gap-5
      overflow-x-auto
      px-4
      py-3
      sm:gap-6
      sm:px-5
      md:max-w-[850px]
      md:justify-center
      md:gap-7
      md:overflow-x-hidden
      md:px-2
      md:py-3
      [&::-webkit-scrollbar]:hidden
      [scrollbar-width:none]
    "
        >
          {categories.map((category, index) => (
            <Link
              key={category._id || category.slug || index}
              to={`/shop?category=${category.slug || ""}`}
              onClick={closeMobileMenu}
              onMouseEnter={() => {
                const categoryName = category.name?.toLowerCase();

                if (categoryName === "women") {
                  setActiveMegaMenu("women");
                }

                if (categoryName === "men") {
                  setActiveMegaMenu("men");
                }

                if (categoryName === "kids") {
                  setActiveMegaMenu("kids");
                }
              }}
              className={`
    group
    flex
    w-[65px]
    shrink-0
    flex-col
    items-center
    sm:w-[70px]
    md:w-[75px]
    relative
  `}
            >
              {/* Category Image */}

              <div
                className="
            h-[55px]
            w-[55px]
            shrink-0
            overflow-hidden
            bg-neutral-100
            sm:h-[58px]
            sm:w-[58px]
          "
              >
                <img
                  src={getCategoryImage(category)}
                  alt={category.name}
                  className="
              h-full
              w-full
              object-cover
              transition
              duration-500
              group-hover:scale-105
            "
                />
              </div>

              {/* Category Name */}

              <span
                className="
            mt-2
            w-full
            overflow-hidden
            text-center
            text-[9.5px]
            font-bold
            text-neutral-900
            sm:text-[10px]
            md:text-[11px]
          "
              >
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {activeMegaMenu === "women" && (
        <div
          onMouseEnter={() => setActiveMegaMenu("women")}
          onMouseLeave={() => setActiveMegaMenu(null)}
          className="
      absolute
      left-1/2
      top-full
      z-50
      hidden
      w-[min(900px,calc(100vw-32px))]
      -translate-x-1/2
      md:block
    "
        >
          <div className="border border-neutral-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.12)]">
            {/* Header */}
            <div className="border-b border-neutral-100 px-7 py-4">
              <Link
                to="/shop?gender=WOMEN"
                className="text-[13px] font-bold uppercase tracking-wide text-black hover:underline"
              >
                Women
              </Link>
            </div>

            {/* Menu */}
            <div className="grid grid-cols-4 gap-x-8 px-7 py-6">
              {/* Column 1 */}
              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">
                  Topwear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=tops"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Tops & Tees
                  </Link>

                  <Link
                    to="/shop?category=shirts"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Shirts
                  </Link>

                  <Link
                    to="/shop?category=tunics"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Tunics
                  </Link>

                  <Link
                    to="/shop?category=shrugs"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Shrugs
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Bottomwear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=jeans"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Jeans
                  </Link>

                  <Link
                    to="/shop?category=trousers"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Trousers
                  </Link>

                  <Link
                    to="/shop?category=skirts"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Skirts
                  </Link>
                </div>
              </div>

              {/* Column 2 */}
              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">
                  Dresses
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=dresses"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Dresses
                  </Link>

                  <Link
                    to="/shop?category=jumpsuits"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Jumpsuits
                  </Link>

                  <Link
                    to="/shop?category=gowns"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Gowns
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Sleepwear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=sleepwear"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sets
                  </Link>

                  <Link
                    to="/shop?category=nightwear"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Nightwear
                  </Link>
                </div>
              </div>

              {/* Column 3 */}
              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">
                  Indian Wear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=kurtas"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Kurtas
                  </Link>

                  <Link
                    to="/shop?category=dresses"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Dresses
                  </Link>

                  <Link
                    to="/shop?category=suits"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Suits & Sets
                  </Link>

                  <Link
                    to="/shop?category=skirts"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Skirts
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Accessories
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=bags"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Bags
                  </Link>

                  <Link
                    to="/shop?category=jewellery"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Jewellery
                  </Link>
                </div>
              </div>

              {/* Column 4 */}
              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">
                  Footwear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=flats"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Flats
                  </Link>

                  <Link
                    to="/shop?category=sneakers"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sneakers
                  </Link>

                  <Link
                    to="/shop?category=heels"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Heels
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Trending
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?newArrivals=true"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    New Arrivals
                  </Link>

                  <Link
                    to="/shop?bestSeller=true"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Best Sellers
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-7 py-3">
              <span className="text-[10px] text-neutral-500">
                Explore the latest women's collection
              </span>

              <Link
                to="/shop?gender=WOMEN"
                className="text-[10px] font-bold uppercase tracking-wide text-black hover:underline"
              >
                Shop Women →
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeMegaMenu === "men" && (
        <div
          onMouseEnter={() => setActiveMegaMenu("men")}
          onMouseLeave={() => setActiveMegaMenu(null)}
          className="
      absolute
      left-1/2
      top-full
      z-50
      hidden
      w-[min(900px,calc(100vw-32px))]
      -translate-x-1/2
      md:block
    "
        >
          <div className="border border-neutral-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.12)]">
            {/* HEADER */}

            <div className="border-b border-neutral-100 px-7 py-4">
              <Link
                to="/shop?gender=MEN"
                className="text-[13px] font-bold uppercase tracking-wide text-black hover:underline"
              >
                Men
              </Link>
            </div>

            {/* MENU */}

            <div className="grid grid-cols-4 gap-x-8 px-7 py-6">
              {/* COLUMN 1 */}

              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">
                  Topwear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=tshirts"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    T-Shirts
                  </Link>

                  <Link
                    to="/shop?category=shirts"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Shirts
                  </Link>

                  <Link
                    to="/shop?category=polos"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Polo T-Shirts
                  </Link>

                  <Link
                    to="/shop?category=sweatshirts"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sweatshirts
                  </Link>

                  <Link
                    to="/shop?category=hoodies"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Hoodies
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Bottomwear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=jeans"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Jeans
                  </Link>

                  <Link
                    to="/shop?category=trousers"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Trousers
                  </Link>

                  <Link
                    to="/shop?category=shorts"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Shorts
                  </Link>

                  <Link
                    to="/shop?category=joggers"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Joggers
                  </Link>
                </div>
              </div>

              {/* COLUMN 2 */}

              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">
                  Ethnic Wear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=kurta"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Kurtas
                  </Link>

                  <Link
                    to="/shop?category=kurta-sets"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Kurta Sets
                  </Link>

                  <Link
                    to="/shop?category=nehru-jackets"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Nehru Jackets
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Innerwear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=vests"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Vests
                  </Link>

                  <Link
                    to="/shop?category=briefs"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Briefs
                  </Link>

                  <Link
                    to="/shop?category=boxers"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Boxers
                  </Link>
                </div>
              </div>

              {/* COLUMN 3 */}

              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">
                  Footwear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=sneakers"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sneakers
                  </Link>

                  <Link
                    to="/shop?category=casual-shoes"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Casual Shoes
                  </Link>

                  <Link
                    to="/shop?category=formal-shoes"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Formal Shoes
                  </Link>

                  <Link
                    to="/shop?category=sandals"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sandals
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Accessories
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=watches"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Watches
                  </Link>

                  <Link
                    to="/shop?category=belts"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Belts
                  </Link>

                  <Link
                    to="/shop?category=wallets"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Wallets
                  </Link>
                </div>
              </div>

              {/* COLUMN 4 */}

              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">
                  Collections
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?newArrivals=true&gender=MEN"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    New Arrivals
                  </Link>

                  <Link
                    to="/shop?bestSeller=true&gender=MEN"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Best Sellers
                  </Link>

                  <Link
                    to="/shop?gender=MEN"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Trending
                  </Link>

                  <Link
                    to="/shop?gender=MEN"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Curated For You
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Winterwear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=jackets"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Jackets
                  </Link>

                  <Link
                    to="/shop?category=sweaters"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sweaters
                  </Link>
                </div>
              </div>
            </div>

            {/* FOOTER CTA */}

            <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-7 py-3">
              <span className="text-[10px] text-neutral-500">
                Discover the latest men's collection
              </span>

              <Link
                to="/shop?gender=MEN"
                className="text-[10px] font-bold uppercase tracking-wide text-black hover:underline"
              >
                Shop Men →
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeMegaMenu === "kids" && (
        <div
          onMouseEnter={() => setActiveMegaMenu("kids")}
          onMouseLeave={() => setActiveMegaMenu(null)}
          className="
      absolute
      left-1/2
      top-full
      z-50
      hidden
      w-[min(900px,calc(100vw-32px))]
      -translate-x-1/2
      md:block
    "
        >
          <div className="border border-neutral-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.12)]">
            {/* HEADER */}

            <div className="border-b border-neutral-100 px-7 py-4">
              <Link
                to="/shop?gender=KIDS"
                className="text-[13px] font-bold uppercase tracking-wide text-black hover:underline"
              >
                Kids
              </Link>
            </div>

            {/* MENU */}

            <div className="grid grid-cols-4 gap-x-8 px-7 py-6">
              {/* COLUMN 1 */}

              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">Girls</h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=girls-dresses"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Dresses
                  </Link>

                  <Link
                    to="/shop?category=girls-tops"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Tops & T-Shirts
                  </Link>

                  <Link
                    to="/shop?category=girls-bottomwear"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Bottomwear
                  </Link>

                  <Link
                    to="/shop?category=girls-ethnic"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Ethnic Wear
                  </Link>

                  <Link
                    to="/shop?category=girls-sleepwear"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sleepwear
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Girls Footwear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=girls-sandals"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sandals
                  </Link>

                  <Link
                    to="/shop?category=girls-sneakers"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sneakers
                  </Link>
                </div>
              </div>

              {/* COLUMN 2 */}

              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">Boys</h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=boys-tshirts"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    T-Shirts
                  </Link>

                  <Link
                    to="/shop?category=boys-shirts"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Shirts
                  </Link>

                  <Link
                    to="/shop?category=boys-bottomwear"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Jeans & Trousers
                  </Link>

                  <Link
                    to="/shop?category=boys-shorts"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Shorts
                  </Link>

                  <Link
                    to="/shop?category=boys-ethnic"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Ethnic Wear
                  </Link>

                  <Link
                    to="/shop?category=boys-sleepwear"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sleepwear
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Boys Footwear
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=boys-sneakers"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sneakers
                  </Link>

                  <Link
                    to="/shop?category=boys-sandals"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sandals
                  </Link>
                </div>
              </div>

              {/* COLUMN 3 */}

              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">Baby</h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=baby-clothing"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Baby Clothing
                  </Link>

                  <Link
                    to="/shop?category=rompers"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Rompers
                  </Link>

                  <Link
                    to="/shop?category=baby-sets"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sets & Outfits
                  </Link>

                  <Link
                    to="/shop?category=baby-sleepwear"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Sleepwear
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Accessories
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=kids-bags"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Bags
                  </Link>

                  <Link
                    to="/shop?category=kids-caps"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Caps
                  </Link>

                  <Link
                    to="/shop?category=kids-accessories"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Accessories
                  </Link>
                </div>
              </div>

              {/* COLUMN 4 */}

              <div>
                <h3 className="mb-3 text-[12px] font-bold text-black">
                  Collections
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?gender=KIDS&newArrivals=true"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    New Arrivals
                  </Link>

                  <Link
                    to="/shop?gender=KIDS&bestSeller=true"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Best Sellers
                  </Link>

                  <Link
                    to="/shop?gender=KIDS"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Trending
                  </Link>

                  <Link
                    to="/shop?gender=KIDS"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Festive Collection
                  </Link>
                </div>

                <h3 className="mb-3 mt-6 text-[12px] font-bold text-black">
                  Seasonal
                </h3>

                <div className="space-y-1.5">
                  <Link
                    to="/shop?category=winterwear"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Winterwear
                  </Link>

                  <Link
                    to="/shop?category=rainwear"
                    className="block text-[11px] text-neutral-600 hover:text-black hover:underline"
                  >
                    Rainwear
                  </Link>
                </div>
              </div>
            </div>

            {/* FOOTER CTA */}

            <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-7 py-3">
              <span className="text-[10px] text-neutral-500">
                Discover the latest collection for kids
              </span>

              <Link
                to="/shop?gender=KIDS"
                className="text-[10px] font-bold uppercase tracking-wide text-black hover:underline"
              >
                Shop Kids →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MOBILE MENU
      ====================================================== */}

      <div
        className={`border-b border-neutral-200 bg-white md:hidden ${
          mobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="px-4 py-4">
          {/* Mobile Search */}

          <button
            type="button"
            onClick={handleSearch}
            className="flex w-full items-center gap-3 bg-[#f4f4f4] px-4 py-3.5 text-left"
          >
            <Search size={18} className="text-neutral-500" />

            <span className="text-sm text-neutral-500">
              What are you looking for?
            </span>
          </button>

          {/* Mobile Links */}

          <div className="mt-4 space-y-1">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="block border-b border-neutral-100 px-2 py-3.5 text-sm font-semibold"
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={closeMobileMenu}
              className="block border-b border-neutral-100 px-2 py-3.5 text-sm font-semibold"
            >
              Shop
            </Link>

            <Link
              to="/wishlist"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 border-b border-neutral-100 px-2 py-3.5 text-sm font-semibold"
            >
              <Heart size={17} />
              Favourites
            </Link>

            <Link
              to="/cart"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 border-b border-neutral-100 px-2 py-3.5 text-sm font-semibold"
            >
              <ShoppingBag size={17} />
              Basket
              {totalItems > 0 && (
                <span className="rounded-full bg-black px-2 py-0.5 text-[9px] text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  onClick={closeMobileMenu}
                  className="block border-b border-neutral-100 px-2 py-3.5 text-sm font-semibold"
                >
                  My Account
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-2 py-3.5 text-left text-sm font-semibold text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="border border-neutral-300 px-4 py-3 text-center text-sm font-bold"
                >
                  SIGN IN
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="bg-[#d8b28a] px-4 py-3 text-center text-sm font-bold text-white"
                >
                  SIGN UP
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Categories */}

          <div className="mt-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Shop Categories
            </p>

            {/* Horizontal Scroll Categories */}
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {categories.map((category, index) => (
                <Link
                  key={category._id || category.slug || index}
                  to={`/shop?category=${category.slug || ""}`}
                  onClick={closeMobileMenu}
                  className="group flex w-[68px] shrink-0 flex-col items-center"
                >
                  {/* Category Image */}
                  <div className="h-[60px] w-[60px] overflow-hidden rounded-full bg-neutral-100">
                    <img
                      src={getCategoryImage(category)}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Category Name */}
                  <span className="mt-2 w-full overflow-hidden text-center text-[9px] font-semibold text-neutral-900">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
