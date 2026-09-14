import React from "react";
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";

const ProductGrid = ({
  products = [],
  onAddToCart,
  onWishlist,
  onProductClick,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={styles.skeletonCard}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonShort} />
            <div className={styles.skeletonPrice} />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className={styles.empty}>
        <h3>No products found</h3>
        <p>We couldn't find products for this collection.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          onWishlist={onWishlist}
          onClick={() => onProductClick?.(product)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
