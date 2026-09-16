import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { getCategories } from "../../services/api/categoryApi";
import { getProducts } from "../../services/api/productApi";

import ProductCard from "../../components/product/ProductCard";

const Home = () => {
  // ==============================
  // Categories State
  // ==============================
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // ==============================
  // Featured Products State
  // ==============================
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  // ==============================
  // Fetch Categories
  // ==============================
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

  // ==============================
  // Fetch Featured Products
  // ==============================
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError("");

        const response = await getProducts({
          featured: true,
          limit: 8,
        });

        if (response.success) {
          setFeaturedProducts(response.products || []);
        } else {
          setProductsError(response.message || "Failed to load products");
        }
      } catch (error) {
        setProductsError(
          error.response?.data?.message ||
            "Unable to load products. Please try again.",
        );
      } finally {
        setProductsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <main>
      {/* =====================================================
          HERO SECTION
      ====================================================== */}
      <section className="bg-neutral-950 text-white">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          {/* Hero Content */}
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">
              CBNK Collection
            </p>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Modern style.
              <br />
              Made for you.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-400 sm:text-lg">
              Discover carefully selected products designed to bring quality,
              comfort and style into your everyday life.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-neutral-950 transition hover:bg-neutral-200"
              >
                Shop Collection
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-neutral-900"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-neutral-800 bg-neutral-900">
              <div className="text-center">
                <ShoppingBag
                  size={72}
                  strokeWidth={1}
                  className="mx-auto text-neutral-500"
                />

                <p className="mt-5 text-sm font-medium text-neutral-500">
                  Featured Collection
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES SECTION
      ====================================================== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
                Explore
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                Shop by Category
              </h2>
            </div>

            <Link
              to="/shop"
              className="hidden items-center gap-2 text-sm font-semibold text-neutral-700 transition hover:text-neutral-950 sm:flex"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Categories Content */}
          <div className="mt-10">
            {/* Loading */}
            {categoriesLoading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="min-h-52 animate-pulse rounded-2xl bg-neutral-100"
                  />
                ))}
              </div>
            )}

            {/* Error */}
            {!categoriesLoading && categoriesError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-medium text-red-700">
                  {categoriesError}
                </p>
              </div>
            )}

            {/* Empty */}
            {!categoriesLoading &&
              !categoriesError &&
              categories.length === 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                  <p className="text-sm text-neutral-500">
                    No categories available right now.
                  </p>
                </div>
              )}

            {/* Real Categories */}
            {!categoriesLoading &&
              !categoriesError &&
              categories.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/shop?category=${category.slug}`}
                      className="group relative flex min-h-52 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* Category Image */}
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-200">
                          <span className="text-sm text-neutral-500">
                            No image
                          </span>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/30 transition duration-300 group-hover:bg-black/45" />

                      {/* Category Content */}
                      <div className="relative z-10 mt-auto">
                        <h3 className="text-xl font-bold text-white">
                          {category.name}
                        </h3>

                        <p className="mt-2 flex items-center gap-2 text-sm text-white/80 transition group-hover:text-white">
                          Explore
                          <ArrowRight size={15} />
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED PRODUCTS SECTION
      ====================================================== */}
      <section className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
                Handpicked
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                Featured Products
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                Explore some of our carefully selected products.
              </p>
            </div>

            <Link
              to="/shop"
              className="hidden items-center gap-2 text-sm font-semibold text-neutral-700 transition hover:text-neutral-950 sm:flex"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Products Content */}
          <div className="mt-10">
            {/* Loading */}
            {productsLoading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                  >
                    <div className="aspect-square animate-pulse bg-neutral-100" />

                    <div className="space-y-3 p-5">
                      <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
                      <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-100" />
                      <div className="h-5 w-1/3 animate-pulse rounded bg-neutral-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {!productsLoading && productsError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-medium text-red-700">
                  {productsError}
                </p>
              </div>
            )}

            {/* Empty */}
            {!productsLoading &&
              !productsError &&
              featuredProducts.length === 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                  <ShoppingBag
                    size={40}
                    strokeWidth={1.5}
                    className="mx-auto text-neutral-400"
                  />

                  <p className="mt-4 text-sm font-medium text-neutral-700">
                    No featured products available right now.
                  </p>

                  <Link
                    to="/shop"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:underline"
                  >
                    Browse all products
                    <ArrowRight size={15} />
                  </Link>
                </div>
              )}

            {/* Real Products */}
            {!productsLoading &&
              !productsError &&
              featuredProducts.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA SECTION
      ====================================================== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-neutral-950 px-6 py-14 text-center text-white sm:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
              CBNK
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to discover something new?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-400">
              Explore our complete collection and find products made for your
              everyday lifestyle.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-neutral-950 transition hover:bg-neutral-200"
            >
              Start Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
