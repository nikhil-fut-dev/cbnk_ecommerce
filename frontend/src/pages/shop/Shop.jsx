import { useEffect, useState } from "react";
import { Filter, Search, X } from "lucide-react";

import { getProducts } from "../../services/api/productApi";
import { getCategories } from "../../services/api/categoryApi";
import ProductCard from "../../components/product/ProductCard";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [sort, setSort] = useState("newest");
  const [inStock, setInStock] = useState(false);

  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const [selectedGender, setSelectedGender] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [featured, setFeatured] = useState(false);
  const [newArrivals, setNewArrivals] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);

  const [categoryLoading, setCategoryLoading] = useState(false);

  const limit = 12;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
        sort,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (inStock) {
        params.inStock = "true";
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (selectedSubCategory) {
        params.subCategory = selectedSubCategory;
      }

      if (selectedGender) {
        params.gender = selectedGender;
      }

      if (selectedSize) {
        params.size = selectedSize;
      }

      if (selectedColor) {
        params.color = selectedColor;
      }

      if (minPrice !== "") {
        params.minPrice = minPrice;
      }

      if (maxPrice !== "") {
        params.maxPrice = maxPrice;
      }

      if (featured) {
        params.featured = "true";
      }

      if (newArrivals) {
        params.newArrivals = "true";
      }

      if (bestSeller) {
        params.bestSeller = "true";
      }

      const response = await getProducts(params);

      if (response?.success) {
        setProducts(response.products || []);

        const fetchedProducts = response.products || [];

        setProducts(fetchedProducts);

        const sizes = [
          ...new Set(fetchedProducts.flatMap((product) => product.sizes || [])),
        ];

        const colors = [
          ...new Set(
            fetchedProducts.flatMap((product) => product.colors || []),
          ),
        ];

        setAvailableSizes(sizes);
        setAvailableColors(colors);

        setPagination(response.pagination);

        setPagination(response.pagination || null);
      } else {
        setError(response?.message || "Failed to fetch products.");
      }
    } catch (err) {
      console.error("Fetch products error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load products. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    page,
    search,
    sort,
    inStock,
    selectedCategory,
    selectedSubCategory,
    selectedGender,
    selectedSize,
    selectedColor,
    minPrice,
    maxPrice,
    featured,
    newArrivals,
    bestSeller,
  ]);

  const handleFeaturedChange = (event) => {
    setFeatured(event.target.checked);
    setPage(1);
  };

  const handleNewArrivalsChange = (event) => {
    setNewArrivals(event.target.checked);
    setPage(1);
  };

  const handleBestSellerChange = (event) => {
    setBestSeller(event.target.checked);
    setPage(1);
  };

  const handlePriceChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput);
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;

    setSelectedCategory(value);
    setSelectedSubCategory("");
    setPage(1);
  };

  const handleSubCategoryChange = (event) => {
    const value = event.target.value;

    setSelectedSubCategory(value);
    setPage(1);
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
    setPage(1);
  };

  const handleSizeChange = (event) => {
    setSelectedSize(event.target.value);
    setPage(1);
  };

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategory !== "" ||
    selectedSubCategory !== "" ||
    selectedGender !== "" ||
    selectedSize !== "" ||
    selectedColor !== "" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    inStock ||
    featured ||
    newArrivals ||
    bestSeller ||
    sort !== "newest";

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");

    setSelectedCategory("");
    setSelectedSubCategory("");

    setSelectedGender("");
    setSelectedSize("");
    setSelectedColor("");

    setMinPrice("");
    setMaxPrice("");

    setInStock(false);
    setFeatured(false);
    setNewArrivals(false);
    setBestSeller(false);

    setSort("newest");
    setPage(1);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);

        const response = await getCategories("root");

        if (response?.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error(
          "Category fetch error:",
          error?.response?.data?.message || error.message,
        );
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) {
        setSubCategories([]);
        setSelectedSubCategory("");
        return;
      }

      try {
        const response = await getCategories(selectedCategory);

        if (response?.success) {
          setSubCategories(response.data || []);
        }
      } catch (error) {
        console.error(
          "Sub-category fetch error:",
          error?.response?.data?.message || error.message,
        );

        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [selectedCategory]);

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const handleStockChange = (event) => {
    setInStock(event.target.checked);
    setPage(1);
  };

  const goToPage = (nextPage) => {
    if (!pagination) return;

    if (nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }

    setPage(nextPage);
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* ================= HEADER ================= */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            CBNK Store
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Shop All Products
          </h1>

          <p className="mt-3 max-w-2xl text-neutral-500">
            Explore our latest collection and find products that match your
            style.
          </p>
        </div>
      </section>

      {/* ================= CONTROLS ================= */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search products, brands, SKU..."
                className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-11 text-sm outline-none transition focus:border-neutral-500 focus:bg-white"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="ml-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Search
            </button>
          </form>

          {/* Stock */}
          <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={inStock}
              onChange={handleStockChange}
              className="h-4 w-4"
            />
            <Filter size={16} />
            In Stock
          </label>

          {/* Sort */}
          <select
            value={sort}
            onChange={handleSortChange}
            className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 outline-none focus:border-neutral-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
            <option value="rating">Top Rated</option>
          </select>

          {hasActiveFilters && (
            <button type="button" onClick={handleClearFilters}>
              Clear All Filters
            </button>
          )}
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          {/* Category */}
          <div className="shop-filter-group">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              disabled={categoryLoading}
            >
              <option value="">
                {categoryLoading ? "Loading categories..." : "All Categories"}
              </option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {/* SubCategories */}
          {subCategories.length > 0 && (
            <div className="shop-filter-group">
              <label htmlFor="subCategory">Sub-category</label>

              <select
                id="subCategory"
                value={selectedSubCategory}
                onChange={handleSubCategoryChange}
              >
                <option value="">All Sub-categories</option>

                {subCategories.map((subCategory) => (
                  <option key={subCategory._id} value={subCategory._id}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="shop-filter-group">
            <label htmlFor="gender">Gender</label>

            <select
              id="gender"
              value={selectedGender}
              onChange={handleGenderChange}
            >
              <option value="">All Genders</option>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="UNISEX">Unisex</option>
              <option value="KIDS">Kids</option>
            </select>
          </div>

          <div className="shop-filter-group">
            <label htmlFor="size">Size</label>

            <select id="size" value={selectedSize} onChange={handleSizeChange}>
              <option value="">All Sizes</option>

              {availableSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="shop-filter-group">
            <label htmlFor="color">Color</label>

            <select
              id="color"
              value={selectedColor}
              onChange={handleColorChange}
            >
              <option value="">All Colors</option>

              {availableColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div className="shop-filter-group">
            <label htmlFor="minPrice">Min Price</label>

            <input
              id="minPrice"
              type="number"
              min="0"
              value={minPrice}
              onChange={handlePriceChange(setMinPrice)}
              placeholder="₹ Min"
            />
          </div>

          <div className="shop-filter-group">
            <label htmlFor="maxPrice">Max Price</label>

            <input
              id="maxPrice"
              type="number"
              min="0"
              value={maxPrice}
              onChange={handlePriceChange(setMaxPrice)}
              placeholder="₹ Max"
            />
          </div>

          <div className="shop-filter-group">
            <label>
              <input
                type="checkbox"
                checked={featured}
                onChange={handleFeaturedChange}
              />
              Featured
            </label>
          </div>

          <div className="shop-filter-group">
            <label>
              <input
                type="checkbox"
                checked={newArrivals}
                onChange={handleNewArrivalsChange}
              />
              New Arrivals
            </label>
          </div>

          <div className="shop-filter-group">
            <label>
              <input
                type="checkbox"
                checked={bestSeller}
                onChange={handleBestSellerChange}
              />
              Best Seller
            </label>
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!loading && !error && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              {pagination?.totalProducts || 0} products
            </p>

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-sm font-semibold text-neutral-700 underline underline-offset-4"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
              >
                <div className="aspect-square animate-pulse bg-neutral-200" />

                <div className="space-y-3 p-4">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200" />
                  <div className="h-5 animate-pulse rounded bg-neutral-200" />
                  <div className="h-5 w-1/2 animate-pulse rounded bg-neutral-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <h2 className="text-xl font-bold text-red-900">
              Unable to Load Products
            </h2>

            <p className="mt-2 text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={fetchProducts}
              className="mt-5 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-20 text-center">
            <Search size={42} className="mx-auto text-neutral-300" />

            <h2 className="mt-5 text-xl font-bold text-neutral-900">
              No Products Found
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try changing your search or filters.
            </p>

            {(search || inStock) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setInStock(false);
                  setPage(1);
                }}
                className="mt-5 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {!loading && !error && pagination && pagination.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrev}
              onClick={() => goToPage(page - 1)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-4 text-sm font-semibold text-neutral-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={!pagination.hasNext}
              onClick={() => goToPage(page + 1)}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Shop;
