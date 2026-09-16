import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  PackageOpen,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import { getProducts } from "../../services/api/productApi";
import { getCategories } from "../../services/api/categoryApi";
import ProductCard from "../../components/product/ProductCard";

const Shop = () => {
  // =========================================================
  // PRODUCTS
  // =========================================================

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // SEARCH
  // =========================================================

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // =========================================================
  // SORT / STOCK
  // =========================================================

  const [sort, setSort] = useState("newest");
  const [inStock, setInStock] = useState(false);

  const [page, setPage] = useState(1);

  // =========================================================
  // CATEGORY
  // =========================================================

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  const [categoryLoading, setCategoryLoading] = useState(false);

  // =========================================================
  // PRODUCT FILTERS
  // =========================================================

  const [selectedGender, setSelectedGender] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  // =========================================================
  // PRICE
  // =========================================================

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // =========================================================
  // COLLECTION FILTERS
  // =========================================================

  const [featured, setFeatured] = useState(false);
  const [newArrivals, setNewArrivals] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);

  // =========================================================
  // MOBILE FILTER DRAWER
  // =========================================================

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const limit = 12;

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
        sort,
      };

      // Search
      if (search.trim()) {
        params.search = search.trim();
      }

      // Stock
      if (inStock) {
        params.inStock = "true";
      }

      // Category
      if (selectedCategory) {
        params.category = selectedCategory;
      }

      // Sub-category
      if (selectedSubCategory) {
        params.subCategory = selectedSubCategory;
      }

      // Gender
      if (selectedGender) {
        params.gender = selectedGender;
      }

      // Size
      if (selectedSize) {
        params.size = selectedSize;
      }

      // Color
      if (selectedColor) {
        params.color = selectedColor;
      }

      // Price
      if (minPrice !== "") {
        params.minPrice = minPrice;
      }

      if (maxPrice !== "") {
        params.maxPrice = maxPrice;
      }

      // Collection
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
        const fetchedProducts = response.products || [];

        setProducts(fetchedProducts);
        setPagination(response.pagination || null);

        // Build filter options from fetched products
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

  // =========================================================
  // FETCH WHEN FILTERS CHANGE
  // =========================================================

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

  // =========================================================
  // FETCH ROOT CATEGORIES
  // =========================================================

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

  // =========================================================
  // FETCH SUB-CATEGORIES
  // =========================================================

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

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  // =========================================================
  // FILTER HANDLERS
  // =========================================================

  const handleCategoryChange = (event) => {
    const value = event.target.value;

    setSelectedCategory(value);
    setSelectedSubCategory("");
    setPage(1);
  };

  const handleSubCategoryChange = (event) => {
    setSelectedSubCategory(event.target.value);
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

  const handlePriceChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const handleStockChange = (event) => {
    setInStock(event.target.checked);
    setPage(1);
  };

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

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  // =========================================================
  // ACTIVE FILTERS
  // =========================================================

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

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (search.trim()) count++;
    if (selectedCategory) count++;
    if (selectedSubCategory) count++;
    if (selectedGender) count++;
    if (selectedSize) count++;
    if (selectedColor) count++;
    if (minPrice !== "") count++;
    if (maxPrice !== "") count++;
    if (inStock) count++;
    if (featured) count++;
    if (newArrivals) count++;
    if (bestSeller) count++;
    if (sort !== "newest") count++;

    return count;
  }, [
    search,
    selectedCategory,
    selectedSubCategory,
    selectedGender,
    selectedSize,
    selectedColor,
    minPrice,
    maxPrice,
    inStock,
    featured,
    newArrivals,
    bestSeller,
    sort,
  ]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

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

    setMobileFiltersOpen(false);
  };

  // =========================================================
  // PAGINATION
  // =========================================================

  const goToPage = (nextPage) => {
    if (!pagination) return;

    if (nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // FILTER SELECT COMPONENT
  // =========================================================

  const FilterSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
  }) => {
    return (
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {label}
        </label>

        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-800 outline-none transition hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
        >
          <option value="">{disabled ? "Loading..." : placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // =========================================================
  // CHECKBOX FILTER
  // =========================================================

  const CheckFilter = ({ checked, onChange, icon, title, description }) => {
    return (
      <label
        className={`group flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
          checked
            ? "border-neutral-900 bg-neutral-950 text-white"
            : "border-neutral-200 bg-white hover:border-neutral-300"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />

        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
            checked
              ? "border-white bg-white text-neutral-950"
              : "border-neutral-300 bg-white"
          }`}
        >
          {checked && <Check size={13} strokeWidth={3} />}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`flex items-center gap-2 text-sm font-semibold ${
              checked ? "text-white" : "text-neutral-900"
            }`}
          >
            {icon}
            {title}
          </span>

          {description && (
            <span
              className={`mt-0.5 block text-xs ${
                checked ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              {description}
            </span>
          )}
        </span>
      </label>
    );
  };

  // =========================================================
  // FILTER CONTENT
  // =========================================================

  const FilterContent = () => {
    return (
      <div className="space-y-7">
        {/* Category */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-neutral-950">Category</p>

            <p className="mt-1 text-xs text-neutral-500">
              Browse products by category
            </p>
          </div>

          <FilterSelect
            label="Category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder={
              categoryLoading ? "Loading categories..." : "All Categories"
            }
            disabled={categoryLoading}
            options={categories.map((category) => ({
              value: category._id,
              label: category.name,
            }))}
          />

          {subCategories.length > 0 && (
            <FilterSelect
              label="Sub-category"
              value={selectedSubCategory}
              onChange={handleSubCategoryChange}
              placeholder="All Sub-categories"
              options={subCategories.map((subCategory) => ({
                value: subCategory._id,
                label: subCategory.name,
              }))}
            />
          )}
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Gender */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-neutral-950">Gender</p>
          </div>

          <FilterSelect
            label="Gender"
            value={selectedGender}
            onChange={handleGenderChange}
            placeholder="All Genders"
            options={[
              { value: "MEN", label: "Men" },
              { value: "WOMEN", label: "Women" },
              { value: "UNISEX", label: "Unisex" },
              { value: "KIDS", label: "Kids" },
            ]}
          />
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Size & Color */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-neutral-950">Size & Color</p>
          </div>

          <FilterSelect
            label="Size"
            value={selectedSize}
            onChange={handleSizeChange}
            placeholder="All Sizes"
            options={availableSizes.map((size) => ({
              value: size,
              label: size,
            }))}
          />

          <FilterSelect
            label="Color"
            value={selectedColor}
            onChange={handleColorChange}
            placeholder="All Colors"
            options={availableColors.map((color) => ({
              value: color,
              label: color,
            }))}
          />
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Price */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-neutral-950">Price Range</p>

            <p className="mt-1 text-xs text-neutral-500">
              Set your preferred price range
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={handlePriceChange(setMinPrice)}
                placeholder="Min"
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-sm font-medium outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5"
              />
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={handlePriceChange(setMaxPrice)}
                placeholder="Max"
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-sm font-medium outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Availability */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-neutral-950">Availability</p>

          <CheckFilter
            checked={inStock}
            onChange={handleStockChange}
            icon={<PackageOpen size={15} />}
            title="In Stock"
            description="Show only available products"
          />
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Collections */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-bold text-neutral-950">Collections</p>

            <p className="mt-1 text-xs text-neutral-500">
              Discover our special collections
            </p>
          </div>

          <CheckFilter
            checked={featured}
            onChange={handleFeaturedChange}
            icon={<Sparkles size={15} />}
            title="Featured"
            description="Hand-picked products"
          />

          <CheckFilter
            checked={newArrivals}
            onChange={handleNewArrivalsChange}
            icon={<Tag size={15} />}
            title="New Arrivals"
            description="Recently added products"
          />

          <CheckFilter
            checked={bestSeller}
            onChange={handleBestSellerChange}
            icon={<PackageOpen size={15} />}
            title="Best Sellers"
            description="Popular customer choices"
          />
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-800 transition hover:border-neutral-900 hover:bg-neutral-950 hover:text-white"
          >
            <RotateCcw size={15} />
            Clear All Filters
          </button>
        )}
      </div>
    );
  };

  // =========================================================
  // ACTIVE FILTER CHIPS
  // =========================================================

  const activeFilterChips = [];

  if (search.trim()) {
    activeFilterChips.push({
      label: `Search: ${search}`,
      onRemove: clearSearch,
    });
  }

  const selectedCategoryName = categories.find(
    (item) => item._id === selectedCategory,
  )?.name;

  if (selectedCategoryName) {
    activeFilterChips.push({
      label: selectedCategoryName,
      onRemove: () => {
        setSelectedCategory("");
        setSelectedSubCategory("");
        setPage(1);
      },
    });
  }

  const selectedSubCategoryName = subCategories.find(
    (item) => item._id === selectedSubCategory,
  )?.name;

  if (selectedSubCategoryName) {
    activeFilterChips.push({
      label: selectedSubCategoryName,
      onRemove: () => {
        setSelectedSubCategory("");
        setPage(1);
      },
    });
  }

  if (selectedGender) {
    activeFilterChips.push({
      label: selectedGender.charAt(0) + selectedGender.slice(1).toLowerCase(),
      onRemove: () => {
        setSelectedGender("");
        setPage(1);
      },
    });
  }

  if (selectedSize) {
    activeFilterChips.push({
      label: `Size: ${selectedSize}`,
      onRemove: () => {
        setSelectedSize("");
        setPage(1);
      },
    });
  }

  if (selectedColor) {
    activeFilterChips.push({
      label: `Color: ${selectedColor}`,
      onRemove: () => {
        setSelectedColor("");
        setPage(1);
      },
    });
  }

  if (minPrice !== "") {
    activeFilterChips.push({
      label: `Min ₹${minPrice}`,
      onRemove: () => {
        setMinPrice("");
        setPage(1);
      },
    });
  }

  if (maxPrice !== "") {
    activeFilterChips.push({
      label: `Max ₹${maxPrice}`,
      onRemove: () => {
        setMaxPrice("");
        setPage(1);
      },
    });
  }

  if (inStock) {
    activeFilterChips.push({
      label: "In Stock",
      onRemove: () => {
        setInStock(false);
        setPage(1);
      },
    });
  }

  if (featured) {
    activeFilterChips.push({
      label: "Featured",
      onRemove: () => {
        setFeatured(false);
        setPage(1);
      },
    });
  }

  if (newArrivals) {
    activeFilterChips.push({
      label: "New Arrivals",
      onRemove: () => {
        setNewArrivals(false);
        setPage(1);
      },
    });
  }

  if (bestSeller) {
    activeFilterChips.push({
      label: "Best Seller",
      onRemove: () => {
        setBestSeller(false);
        setPage(1);
      },
    });
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-[#fafafa] text-neutral-950">
      {/* =====================================================
          HERO / PAGE HEADER
      ====================================================== */}

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                CBNK Collection
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-[-0.04em] text-neutral-950 sm:text-5xl lg:text-6xl">
              Shop our collection
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
              Discover carefully selected products, new arrivals, best sellers
              and everyday essentials designed to fit your style.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH BAR
      ====================================================== */}

      <section className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row">
            <form onSubmit={handleSearch} className="flex min-w-0 flex-1">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search products, brands, SKU..."
                  className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-11 text-sm font-medium outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/5"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-900"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="ml-2 hidden h-12 rounded-xl bg-neutral-950 px-6 text-sm font-bold text-white transition hover:bg-neutral-800 sm:block"
              >
                Search
              </button>
            </form>

            {/* Mobile Filter */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 text-sm font-bold text-neutral-900 transition hover:border-neutral-900 lg:hidden"
            >
              <SlidersHorizontal size={17} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE FILTER DRAWER
      ====================================================== */}

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 flex h-full w-[88%] max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold">Filters</h2>

                <p className="mt-0.5 text-xs text-neutral-500">
                  {activeFilterCount > 0
                    ? `${activeFilterCount} active filter${
                        activeFilterCount > 1 ? "s" : ""
                      }`
                    : "Refine your products"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-xl border border-neutral-200 p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <FilterContent />
            </div>

            <div className="border-t border-neutral-200 p-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white transition hover:bg-neutral-800"
              >
                View {pagination?.totalProducts || 0} Products
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* =====================================================
          MAIN SHOP AREA
      ====================================================== */}

      <div className="mx-auto flex max-w-[1440px] gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* ===================================================
            DESKTOP SIDEBAR
        ==================================================== */}

        <aside className="hidden w-[270px] shrink-0 lg:block">
          <div className="sticky top-[88px] rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={17} />

                  <h2 className="text-base font-bold">Filters</h2>
                </div>

                <p className="mt-1 text-xs text-neutral-500">
                  Refine your search
                </p>
              </div>

              {activeFilterCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-neutral-950 px-1.5 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <FilterContent />
          </div>
        </aside>

        {/* ===================================================
            PRODUCTS AREA
        ==================================================== */}

        <section className="min-w-0 flex-1">
          {/* Toolbar */}
          {!loading && !error && (
            <div className="mb-5">
              <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold text-neutral-950">
                    {pagination?.totalProducts || 0}{" "}
                    {pagination?.totalProducts === 1 ? "product" : "products"}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {hasActiveFilters
                      ? "Showing results based on your filters"
                      : "Explore our complete collection"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden text-xs font-semibold text-neutral-400 sm:block">
                    Sort by
                  </span>

                  <select
                    value={sort}
                    onChange={handleSortChange}
                    className="h-10 min-w-[170px] rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-semibold text-neutral-800 outline-none transition hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5"
                  >
                    <option value="newest">Newest</option>

                    <option value="oldest">Oldest</option>

                    <option value="price-low">Price: Low to High</option>

                    <option value="price-high">Price: High to Low</option>

                    <option value="name-asc">Name: A-Z</option>

                    <option value="name-desc">Name: Z-A</option>

                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Active filter chips */}
              {activeFilterChips.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs font-semibold text-neutral-400">
                    Active:
                  </span>

                  {activeFilterChips.map((chip, index) => (
                    <button
                      key={`${chip.label}-${index}`}
                      type="button"
                      onClick={chip.onRemove}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-900 hover:bg-neutral-950 hover:text-white"
                    >
                      {chip.label}

                      <X
                        size={12}
                        className="transition-transform group-hover:rotate-90"
                      />
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="ml-1 text-xs font-bold text-neutral-500 underline underline-offset-4 transition hover:text-neutral-950"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================== */}

          {loading && (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >
                  <div className="aspect-[4/5] animate-pulse bg-neutral-200" />

                  <div className="space-y-3 p-4">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />

                    <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200" />

                    <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />

                    <div className="flex gap-2">
                      <div className="h-3 w-10 animate-pulse rounded bg-neutral-200" />

                      <div className="h-3 w-16 animate-pulse rounded bg-neutral-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================== */}

          {!loading && error && (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-neutral-200 bg-white p-8">
              <div className="max-w-md text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <PackageOpen size={28} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-neutral-950">
                  Unable to load products
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchProducts}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white transition hover:bg-neutral-800"
                >
                  <RotateCcw size={15} />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* =================================================
              EMPTY STATE
          ================================================== */}

          {!loading && !error && products.length === 0 && (
            <div className="flex min-h-[480px] items-center justify-center rounded-2xl border border-neutral-200 bg-white p-8">
              <div className="max-w-md text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-100 text-neutral-400">
                  <Search size={34} />
                </div>

                <h2 className="mt-6 text-2xl font-bold tracking-tight text-neutral-950">
                  No products found
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  We couldn't find products matching your current search or
                  filters. Try adjusting your selection.
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white transition hover:bg-neutral-800"
                  >
                    <RotateCcw size={15} />
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* =================================================
              PRODUCT GRID
          ================================================== */}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* =================================================
                    PAGINATION
                ================================================== */}

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center gap-4 border-t border-neutral-200 pt-8 sm:flex-row sm:justify-between">
                  <p className="text-xs font-medium text-neutral-500">
                    Page{" "}
                    <span className="font-bold text-neutral-950">
                      {pagination.page}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-neutral-950">
                      {pagination.totalPages}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!pagination.hasPrev}
                      onClick={() => goToPage(page - 1)}
                      className="flex h-10 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-bold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-neutral-950 px-3 text-sm font-bold text-white">
                      {pagination.page}
                    </div>

                    <button
                      type="button"
                      disabled={!pagination.hasNext}
                      onClick={() => goToPage(page + 1)}
                      className="flex h-10 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 text-sm font-bold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default Shop;
