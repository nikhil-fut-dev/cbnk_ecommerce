import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
} from "lucide-react";

import { getCategories } from "../../services/api/categoryApi";
import { getProducts } from "../../services/api/productApi";
import ProductCard from "../../components/product/ProductCard";

const Home = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState("");

  const [newArrivals, setNewArrivals] = useState([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [newArrivalsError, setNewArrivalsError] = useState("");

  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);
  const [bestSellersError, setBestSellersError] = useState("");

  const [categoryStart, setCategoryStart] = useState(0);

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const response = await getCategories();

        if (response.success) {
          setCategories(response.data || []);
        } else {
          setCategoriesError(response.message || "Failed to load categories");
        }
      } catch (error) {
        setCategoriesError(
          error.response?.data?.message ||
            "Unable to load categories. Please try again.",
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // =========================================================
  // FETCH FEATURED PRODUCTS
  // =========================================================

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setFeaturedLoading(true);
        setFeaturedError("");

        const response = await getProducts({
          featured: true,
          limit: 8,
        });

        if (response.success) {
          setFeaturedProducts(response.products || []);
        } else {
          setFeaturedError(
            response.message || "Failed to load featured products",
          );
        }
      } catch (error) {
        setFeaturedError(
          error.response?.data?.message || "Unable to load featured products.",
        );
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // =========================================================
  // FETCH NEW ARRIVALS
  // =========================================================

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setNewArrivalsLoading(true);
        setNewArrivalsError("");

        const response = await getProducts({
          newArrivals: true,
          limit: 8,
        });

        if (response.success) {
          setNewArrivals(response.products || []);
        } else {
          setNewArrivalsError(
            response.message || "Failed to load new arrivals",
          );
        }
      } catch (error) {
        setNewArrivalsError(
          error.response?.data?.message || "Unable to load new arrivals.",
        );
      } finally {
        setNewArrivalsLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // =========================================================
  // FETCH BEST SELLERS
  // =========================================================

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setBestSellersLoading(true);
        setBestSellersError("");

        const response = await getProducts({
          bestSeller: true,
          limit: 8,
        });

        if (response.success) {
          setBestSellers(response.products || []);
        } else {
          setBestSellersError(
            response.message || "Failed to load best sellers",
          );
        }
      } catch (error) {
        setBestSellersError(
          error.response?.data?.message || "Unable to load best sellers.",
        );
      } finally {
        setBestSellersLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  // =========================================================
  // CATEGORY CAROUSEL
  // =========================================================

  const visibleCategories = categories.slice(categoryStart, categoryStart + 4);

  const canGoCategoryPrev = categoryStart > 0;
  const canGoCategoryNext = categoryStart + 4 < categories.length;

  const nextCategories = () => {
    if (canGoCategoryNext) {
      setCategoryStart((prev) => prev + 1);
    }
  };

  const previousCategories = () => {
    if (canGoCategoryPrev) {
      setCategoryStart((prev) => prev - 1);
    }
  };

  // =========================================================
  // PRODUCT SECTION
  // =========================================================

  const ProductSection = ({
    eyebrow,
    title,
    description,
    products,
    loading,
    error,
    emptyMessage,
  }) => {
    return (
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          {/* Header */}
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles
                  size={15}
                  strokeWidth={2}
                  className="text-neutral-500"
                />

                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-neutral-500">
                  {eyebrow}
                </p>
              </div>

              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-4xl">
                {title}
              </h2>

              {description && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                  {description}
                </p>
              )}
            </div>

            <Link
              to="/shop"
              className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-neutral-900 transition hover:gap-3 sm:flex"
            >
              View all
              <ArrowRight size={17} />
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="overflow-hidden">
                  <div className="aspect-[4/5] animate-pulse bg-neutral-100" />

                  <div className="space-y-3 pt-4">
                    <div className="h-3 w-1/3 animate-pulse bg-neutral-100" />
                    <div className="h-4 w-4/5 animate-pulse bg-neutral-100" />
                    <div className="h-4 w-1/4 animate-pulse bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-8 text-center">
              <p className="text-sm text-neutral-600">{error}</p>

              <Link
                to="/shop"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950"
              >
                Continue shopping
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && products.length === 0 && (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
              <p className="text-sm text-neutral-500">{emptyMessage}</p>
            </div>
          )}

          {/* Products */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                {products.slice(0, 8).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Mobile View All */}
              <div className="mt-10 text-center sm:hidden">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 border-b border-neutral-900 pb-1 text-sm font-semibold text-neutral-950"
                >
                  View all products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="overflow-hidden bg-white">
      {/* =====================================================
          ANNOUNCEMENT BAR
      ====================================================== */}

      <div className="bg-neutral-950 px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white sm:text-xs">
        Discover the latest CBNK collection
      </div>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative bg-[#f3f1ed]">
        <div className="mx-auto grid min-h-[620px] max-w-[1440px] lg:grid-cols-2">
          {/* Hero Content */}
          <div className="flex items-center px-5 py-16 sm:px-10 lg:px-16 xl:px-20">
            <div className="max-w-xl">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-neutral-900" />

                <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-neutral-700">
                  CBNK New Season
                </span>
              </div>

              <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-neutral-950 sm:text-6xl lg:text-7xl xl:text-[84px]">
                Style that
                <br />
                feels like
                <br />
                <span className="italic font-normal">you.</span>
              </h1>

              <p className="mt-7 max-w-md text-sm leading-7 text-neutral-600 sm:text-base">
                Discover carefully selected pieces made for everyday style,
                comfort and confidence.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/shop"
                  className="group inline-flex items-center justify-center gap-3 bg-neutral-950 px-7 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Shop Collection
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/shop?newArrivals=true"
                  className="inline-flex items-center justify-center border border-neutral-300 bg-white px-7 py-4 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950"
                >
                  New Arrivals
                </Link>
              </div>

              {/* Small trust line */}
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-medium text-neutral-500">
                <span>Curated Collection</span>
                <span>•</span>
                <span>Quality First</span>
                <span>•</span>
                <span>Made for Everyday</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative min-h-[500px] overflow-hidden bg-neutral-200 lg:min-h-full">
            {/* Editorial visual */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-300 via-neutral-200 to-neutral-100" />

            {/* Decorative panels */}
            <div className="absolute -right-24 top-16 h-80 w-80 rounded-full border-[60px] border-white/30" />

            <div className="absolute bottom-[-80px] left-[-60px] h-72 w-72 rounded-full bg-white/30 blur-2xl" />

            <div className="absolute inset-0 flex items-center justify-center p-10 sm:p-16">
              <div className="relative h-full w-full max-w-[520px] overflow-hidden bg-neutral-100">
                {/* Fashion-style composition */}
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-300 via-neutral-200 to-neutral-400" />

                <div className="absolute left-1/2 top-[8%] h-[82%] w-[52%] -translate-x-1/2 rounded-t-[45%] bg-neutral-800/90" />

                <div className="absolute left-1/2 top-[17%] h-[18%] w-[20%] -translate-x-1/2 rounded-full bg-neutral-300" />

                <div className="absolute left-[22%] top-[37%] h-[45%] w-[20%] -rotate-[12deg] bg-neutral-700/90" />

                <div className="absolute right-[22%] top-[37%] h-[45%] w-[20%] rotate-[12deg] bg-neutral-700/90" />

                <div className="absolute bottom-[4%] left-1/2 h-[35%] w-[30%] -translate-x-1/2 bg-neutral-800" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white">
                    CBNK / 01
                  </span>

                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/80">
                    Collection
                  </span>
                </div>
              </div>
            </div>

            {/* Floating label */}
            <div className="absolute bottom-8 left-5 hidden bg-white px-5 py-4 shadow-xl sm:block lg:left-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                Featured
              </p>

              <p className="mt-1 text-sm font-semibold text-neutral-950">
                The New Edit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY SECTION
      ====================================================== */}

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mb-10 flex items-end justify-between gap-5">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-neutral-500">
                Explore
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.035em] text-neutral-950 sm:text-4xl">
                Shop by category
              </h2>
            </div>

            {categories.length > 4 && (
              <div className="hidden gap-2 sm:flex">
                <button
                  type="button"
                  onClick={previousCategories}
                  disabled={!canGoCategoryPrev}
                  className="flex h-10 w-10 items-center justify-center border border-neutral-200 text-neutral-900 transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Previous categories"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={nextCategories}
                  disabled={!canGoCategoryNext}
                  className="flex h-10 w-10 items-center justify-center border border-neutral-200 text-neutral-900 transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Next categories"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <Link
              to="/shop"
              className="flex items-center gap-2 text-sm font-semibold text-neutral-900 sm:hidden"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Loading */}
          {categoriesLoading && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="aspect-[3/4] animate-pulse bg-neutral-100"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {!categoriesLoading && categoriesError && (
            <div className="border border-neutral-200 bg-neutral-50 p-8 text-center">
              <p className="text-sm text-neutral-600">{categoriesError}</p>
            </div>
          )}

          {/* Empty */}
          {!categoriesLoading &&
            !categoriesError &&
            categories.length === 0 && (
              <div className="border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-sm text-neutral-500">
                  No categories available right now.
                </p>
              </div>
            )}

          {/* Categories */}
          {!categoriesLoading && !categoriesError && categories.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {visibleCategories.map((category, index) => (
                <Link
                  key={category._id}
                  to={`/shop?category=${category.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden bg-neutral-100"
                >
                  {/* Image */}
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      loading={index > 1 ? "lazy" : "eager"}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-400" />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/70">
                      CBNK Collection
                    </p>

                    <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                      {category.name}
                    </h3>

                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-white">
                      Shop now
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          FEATURED
      ====================================================== */}

      <div className="bg-[#f7f7f5]">
        <ProductSection
          eyebrow="Handpicked for you"
          title="Featured products"
          description="A selection of products from the CBNK collection."
          products={featuredProducts}
          loading={featuredLoading}
          error={featuredError}
          emptyMessage="No featured products available right now."
        />
      </div>

      {/* =====================================================
          EDITORIAL BANNER
      ====================================================== */}

      <section className="bg-[#f7f7f5] pb-20 sm:pb-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="relative min-h-[430px] overflow-hidden bg-neutral-900">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-neutral-900/80 to-transparent" />

            <div className="absolute right-[-10%] top-[-30%] h-[600px] w-[600px] rounded-full border-[100px] border-white/5" />

            <div className="relative z-10 flex min-h-[430px] max-w-xl items-center px-7 py-14 sm:px-12 lg:px-16">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                  CBNK / The Edit
                </p>

                <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
                  Less noise.
                  <br />
                  More style.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-neutral-400">
                  Explore a collection designed around pieces you can actually
                  wear, combine and make your own.
                </p>

                <Link
                  to="/shop"
                  className="group mt-8 inline-flex items-center gap-3 bg-white px-7 py-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
                >
                  Explore collection
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>

            <div className="absolute bottom-7 right-7 hidden text-right lg:block">
              <p className="text-5xl font-light tracking-[-0.05em] text-white/10">
                CBNK
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          NEW ARRIVALS
      ====================================================== */}

      <ProductSection
        eyebrow="Just dropped"
        title="New arrivals"
        description="Fresh additions to the collection, selected for the new season."
        products={newArrivals}
        loading={newArrivalsLoading}
        error={newArrivalsError}
        emptyMessage="No new arrivals available right now."
      />

      {/* =====================================================
          BEST SELLERS
      ====================================================== */}

      <div className="bg-[#f7f7f5]">
        <ProductSection
          eyebrow="Customer favourites"
          title="Best sellers"
          description="Discover products that are already getting attention."
          products={bestSellers}
          loading={bestSellersLoading}
          error={bestSellersError}
          emptyMessage="No best sellers available right now."
        />
      </div>

      {/* =====================================================
          SERVICE / TRUST STRIP
      ====================================================== */}

      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-y divide-neutral-200 sm:grid-cols-4 sm:divide-y-0">
          <div className="flex items-center gap-4 px-5 py-7 sm:px-7 lg:px-10">
            <Truck
              size={23}
              strokeWidth={1.5}
              className="shrink-0 text-neutral-700"
            />

            <div>
              <p className="text-xs font-bold text-neutral-950">
                Easy Shopping
              </p>

              <p className="mt-1 text-[11px] text-neutral-500">
                Simple and seamless
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-7 sm:px-7 lg:px-10">
            <ShieldCheck
              size={23}
              strokeWidth={1.5}
              className="shrink-0 text-neutral-700"
            />

            <div>
              <p className="text-xs font-bold text-neutral-950">
                Secure Checkout
              </p>

              <p className="mt-1 text-[11px] text-neutral-500">
                Protected payments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-7 sm:px-7 lg:px-10">
            <RotateCcw
              size={23}
              strokeWidth={1.5}
              className="shrink-0 text-neutral-700"
            />

            <div>
              <p className="text-xs font-bold text-neutral-950">Easy Returns</p>

              <p className="mt-1 text-[11px] text-neutral-500">
                Hassle-free experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-7 sm:px-7 lg:px-10">
            <Headphones
              size={23}
              strokeWidth={1.5}
              className="shrink-0 text-neutral-700"
            />

            <div>
              <p className="text-xs font-bold text-neutral-950">
                Customer Support
              </p>

              <p className="mt-1 text-[11px] text-neutral-500">
                We're here to help
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-[1000px] text-center">
          <Heart
            size={24}
            strokeWidth={1.4}
            className="mx-auto text-neutral-400"
          />

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            Your next favourite piece
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.045em] text-neutral-950 sm:text-5xl lg:text-6xl">
            Find something that feels
            <span className="italic font-normal"> right.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-500">
            Browse the complete CBNK collection and discover pieces made for
            your everyday style.
          </p>

          <Link
            to="/shop"
            className="group mt-8 inline-flex items-center gap-3 bg-neutral-950 px-8 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Shop all products
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
