import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { getProducts } from "../../api/productApi";
import ProductGrid from "../../components/Product/ProductGrid";

import styles from "./ProductSection.module.css";

const ProductSection = ({
  title,
  subtitle,
  filters = {},
  onProductClick,
  onAddToCart,
  onWishlist,
  viewAllLabel = "View all",
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProducts({
          ...filters,
          page: 1,
          limit: 8,
        });

        if (!isMounted) return;

        setProducts(response?.products || []);
      } catch (err) {
        console.error(`Failed to load products for ${title}:`, err);

        if (isMounted) {
          setError("Unable to load products.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [title, JSON.stringify(filters)]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.heading}>
            <span className={styles.eyebrow}>CBNK COLLECTION</span>

            <h2>{title}</h2>

            {subtitle && <p>{subtitle}</p>}
          </div>

          <button
            type="button"
            className={styles.viewAll}
            onClick={() => {
              // Products listing page will be connected
              // in the next stage.
              onProductClick?.();
            }}
          >
            {viewAllLabel}
            <ArrowRight size={16} />
          </button>
        </div>

        {error ? (
          <div className={styles.error}>
            <p>{error}</p>

            <button type="button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : (
          <ProductGrid
            products={products}
            loading={loading}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
            onWishlist={onWishlist}
          />
        )}
      </div>
    </section>
  );
};

export default ProductSection;
