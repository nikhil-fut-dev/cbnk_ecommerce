import React from "react";
import { Heart, ShoppingBag, Star, ArrowUpRight } from "lucide-react";

import styles from "./ProductCard.module.css";

const ProductCard = ({ product, onAddToCart, onWishlist, onClick }) => {
  const image = product?.images?.[0]?.url;

  const price = Number(product?.price || 0);
  const compareAtPrice = Number(product?.compareAtPrice || 0);

  const discount =
    compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  const rating = Number(product?.rating || 0);

  const isOutOfStock =
    Number(product?.availableStock ?? product?.stock ?? 0) <= 0;

  return (
    <article className={styles.card}>
      <div
        className={styles.imageWrapper}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onClick?.();
          }
        }}
      >
        <img
          src={image || "/placeholder-product.jpg"}
          alt={product?.images?.[0]?.alt || product?.name || "Product"}
          className={styles.image}
          loading="lazy"
        />

        <div className={styles.topActions}>
          {discount > 0 && (
            <span className={styles.discountBadge}>{discount}% OFF</span>
          )}

          <button
            type="button"
            className={styles.wishlistButton}
            aria-label={`Add ${product?.name || "product"} to wishlist`}
            onClick={(event) => {
              event.stopPropagation();
              onWishlist?.(product);
            }}
          >
            <Heart size={18} strokeWidth={1.8} />
          </button>
        </div>

        {product?.isNewArrival && <span className={styles.newBadge}>NEW</span>}

        {isOutOfStock && <div className={styles.outOfStock}>Out of Stock</div>}

        <button
          type="button"
          className={styles.quickAdd}
          disabled={isOutOfStock}
          onClick={(event) => {
            event.stopPropagation();
            onAddToCart?.(product);
          }}
        >
          <ShoppingBag size={17} />
          {isOutOfStock ? "Unavailable" : "Add to Bag"}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.brandRow}>
          <span className={styles.brand}>{product?.brand || "CBNK"}</span>

          {rating > 0 && (
            <span className={styles.rating}>
              <Star size={13} fill="currentColor" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <h3 className={styles.name} onClick={onClick}>
          {product?.name}
        </h3>

        {product?.shortDescription && (
          <p className={styles.description}>{product.shortDescription}</p>
        )}

        <div className={styles.priceRow}>
          <span className={styles.price}>₹{price.toLocaleString("en-IN")}</span>

          {compareAtPrice > price && (
            <span className={styles.comparePrice}>
              ₹{compareAtPrice.toLocaleString("en-IN")}
            </span>
          )}

          {discount > 0 && (
            <span className={styles.save}>Save {discount}%</span>
          )}
        </div>

        {product?.sizes?.length > 0 && (
          <div className={styles.metaRow}>
            <span>{product.sizes.length} sizes</span>

            <ArrowUpRight size={14} />
          </div>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
