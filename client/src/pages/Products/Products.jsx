import React, { useEffect, useMemo, useState } from "react";
import { Filter, SlidersHorizontal, X } from "lucide-react";

import { getProducts } from "../../api/productApi";
import ProductGrid from "../../components/Product/ProductGrid";

import styles from "./Products.module.css";

const DEFAULT_FILTERS = {
  search: "",
  category: "",
  gender: "",
  size: "",
  color: "",
  minPrice: "",
  maxPrice: "",
  inStock: "",
  sort: "-createdAt",
};

const Products = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      ...filters,
      page,
      limit: 12,
    }),
    [filters, page],
  );

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProducts(params);

        setProducts(response?.products || []);
        setPagination(response?.pagination || null);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [params]);

  const updateFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));

    setPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== "sort" && value !== "",
  ).length;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>CBNK STORE</span>

            <h1>Shop All</h1>

            <p>Discover the latest styles from the CBNK collection.</p>
          </div>

          <div className={styles.resultCount}>
            {pagination?.totalProducts ?? 0} products
          </div>
        </header>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.filterButton}
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={17} />
            Filters
            {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          </button>

          <div className={styles.sortWrapper}>
            <label htmlFor="product-sort">Sort by</label>

            <select
              id="product-sort"
              value={filters.sort}
              onChange={(event) => updateFilter("sort", event.target.value)}
            >
              <option value="-createdAt">Newest</option>

              <option value="price">Price: Low to High</option>

              <option value="-price">Price: High to Low</option>

              <option value="-rating">Top Rated</option>

              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Desktop Filters */}
          <aside className={styles.sidebar}>
            <FilterPanel
              filters={filters}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
            />
          </aside>

          {/* Products */}
          <section className={styles.productsArea}>
            {error ? (
              <div className={styles.error}>
                <p>{error}</p>

                <button type="button" onClick={() => setPage(page)}>
                  Try again
                </button>
              </div>
            ) : (
              <ProductGrid
                products={products}
                loading={loading}
                onProductClick={(product) => {
                  window.location.href = `/product/${product.slug}`;
                }}
              />
            )}

            {/* Pagination */}
            {!loading && pagination && pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileFiltersOpen(false)}
        >
          <aside
            className={styles.mobileDrawer}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.mobileHeader}>
              <h2>Filters</h2>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X size={21} />
              </button>
            </div>

            <FilterPanel
              filters={filters}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
            />

            <button
              type="button"
              className={styles.applyButton}
              onClick={() => setMobileFiltersOpen(false)}
            >
              Apply Filters
            </button>
          </aside>
        </div>
      )}
    </main>
  );
};

const FilterPanel = ({ filters, updateFilter, clearFilters }) => {
  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterTop}>
        <div>
          <span>FILTERS</span>
          <h2>Refine your search</h2>
        </div>

        <button type="button" onClick={clearFilters}>
          Clear all
        </button>
      </div>

      {/* Search */}
      <div className={styles.filterGroup}>
        <label htmlFor="product-search">Search</label>

        <input
          id="product-search"
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search products..."
        />
      </div>

      {/* Gender */}
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Gender</span>

        <div className={styles.options}>
          {["MEN", "WOMEN", "BOYS", "GIRLS", "UNISEX"].map((gender) => (
            <button
              type="button"
              key={gender}
              className={
                filters.gender === gender ? styles.optionActive : styles.option
              }
              onClick={() =>
                updateFilter("gender", filters.gender === gender ? "" : gender)
              }
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Price</span>

        <div className={styles.priceInputs}>
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(event) => updateFilter("minPrice", event.target.value)}
            placeholder="Min ₹"
          />

          <span>—</span>

          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) => updateFilter("maxPrice", event.target.value)}
            placeholder="Max ₹"
          />
        </div>
      </div>

      {/* Stock */}
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Availability</span>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={filters.inStock === "true"}
            onChange={(event) =>
              updateFilter("inStock", event.target.checked ? "true" : "")
            }
          />

          <span>In stock only</span>
        </label>
      </div>

      {/* Size */}
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Size</span>

        <div className={styles.sizeGrid}>
          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
            <button
              type="button"
              key={size}
              className={
                filters.size === size ? styles.sizeActive : styles.size
              }
              onClick={() =>
                updateFilter("size", filters.size === size ? "" : size)
              }
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
