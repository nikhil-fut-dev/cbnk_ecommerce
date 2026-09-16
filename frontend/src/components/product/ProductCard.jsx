import { Link } from "react-router-dom";
import { ArrowUpRight, Heart, ShoppingBag, Star } from "lucide-react";

const ProductCard = ({ product }) => {
  if (!product) {
    return null;
  }

  // =========================================================
  // PRODUCT DATA
  // =========================================================

  const imageUrl = product.images?.[0]?.url;
  const imageAlt = product.images?.[0]?.alt || product.name;

  const secondImageUrl = product.images?.[1]?.url;

  const price = Number(product.price || 0);
  const compareAtPrice = Number(product.compareAtPrice || 0);
  const discount = Number(product.discount || 0);

  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.reviewCount || 0);

  const availableStock = Number(product.availableStock || 0);

  const isOutOfStock = availableStock <= 0;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <article className="group relative min-w-0">
      {/* =====================================================
          PRODUCT IMAGE
      ====================================================== */}

      <Link
        to={`/product/${product.slug}`}
        className="relative block overflow-hidden bg-neutral-100"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          {/* Main Image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              loading="lazy"
              className={`h-full w-full object-cover transition-all duration-700 ease-out ${
                secondImageUrl
                  ? "group-hover:scale-[1.03] group-hover:opacity-0"
                  : "group-hover:scale-[1.04]"
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100">
              <ShoppingBag
                size={42}
                strokeWidth={1.2}
                className="text-neutral-300"
              />
            </div>
          )}

          {/* =================================================
              SECOND PRODUCT IMAGE
          ================================================= */}

          {secondImageUrl && (
            <img
              src={secondImageUrl}
              alt={imageAlt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
            />
          )}

          {/* =================================================
              IMAGE OVERLAY
          ================================================= */}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* =================================================
              TOP BADGES
          ================================================= */}

          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-2 sm:left-4 sm:top-4">
            {product.isNewArrival && (
              <span className="bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-950 shadow-sm">
                New
              </span>
            )}

            {product.isBestSeller && (
              <span className="bg-neutral-950 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white">
                Bestseller
              </span>
            )}

            {discount > 0 && (
              <span className="bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-950 shadow-sm">
                -{discount}%
              </span>
            )}
          </div>

          {/* =================================================
              WISHLIST BUTTON
              
              UI only for now.
              Actual wishlist action remains on ProductDetails.
          ================================================== */}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            aria-label="Add to wishlist"
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-neutral-800 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-red-500 group-hover:opacity-100 sm:right-4 sm:top-4"
          >
            <Heart size={17} strokeWidth={1.6} />
          </button>

          {/* =================================================
              QUICK SHOP BUTTON
          ================================================== */}

          {!isOutOfStock && (
            <div className="absolute bottom-3 left-3 right-3 z-20 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-4 sm:left-4 sm:right-4">
              <div className="flex items-center justify-center gap-2 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-neutral-950 shadow-lg">
                View Product
                <ArrowUpRight size={15} />
              </div>
            </div>
          )}

          {/* =================================================
              OUT OF STOCK
          ================================================== */}

          {isOutOfStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
              <span className="bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-950">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* =====================================================
          PRODUCT INFORMATION
      ====================================================== */}

      <div className="pt-4 sm:pt-5">
        {/* Brand */}
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          {product.brand || "CBNK"}
        </p>

        {/* Product Name */}
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.7rem] text-sm font-medium leading-5 text-neutral-900 transition-colors group-hover:text-neutral-600 sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        {/* =================================================
            RATING
        ================================================== */}

        {rating > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <Star
                size={12}
                fill="currentColor"
                className="text-neutral-800"
              />

              <span className="text-[11px] font-semibold text-neutral-800">
                {rating.toFixed(1)}
              </span>
            </div>

            {reviewCount > 0 && (
              <span className="text-[11px] text-neutral-400">
                ({reviewCount})
              </span>
            )}
          </div>
        )}

        {/* =================================================
            PRICE
        ================================================== */}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="text-sm font-semibold text-neutral-950 sm:text-base">
            ₹{price.toLocaleString("en-IN")}
          </span>

          {compareAtPrice > price && (
            <span className="text-xs text-neutral-400 line-through">
              ₹{compareAtPrice.toLocaleString("en-IN")}
            </span>
          )}

          {discount > 0 && (
            <span className="text-[10px] font-semibold text-neutral-500">
              Save {discount}%
            </span>
          )}
        </div>

        {/* =================================================
            COLOR INFORMATION
        ================================================== */}

        {product.colors?.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-1">
              {product.colors.slice(0, 4).map((color, index) => (
                <span
                  key={`${color}-${index}`}
                  title={color}
                  className="flex h-4 w-4 items-center justify-center rounded-full border border-white bg-neutral-200 ring-1 ring-neutral-200"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-500" />
                </span>
              ))}
            </div>

            {product.colors.length > 4 && (
              <span className="text-[10px] text-neutral-400">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* =================================================
            STOCK STATUS
        ================================================== */}

        {!isOutOfStock && availableStock > 0 && availableStock <= 5 && (
          <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-500">
            Only {availableStock} left
          </p>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
