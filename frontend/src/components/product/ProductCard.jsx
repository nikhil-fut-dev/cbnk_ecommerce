import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const ProductCard = ({ product }) => {
  if (!product) {
    return null;
  }

  const imageUrl = product.images?.[0]?.url;
  const imageAlt = product.images?.[0]?.alt || product.name;

  const price = Number(product.price || 0);
  const compareAtPrice = Number(product.compareAtPrice || 0);
  const discount = Number(product.discount || 0);
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.reviewCount || 0);

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag
              size={40}
              strokeWidth={1.5}
              className="text-neutral-300"
            />
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-neutral-900 shadow-sm">
            {discount}% OFF
          </span>
        )}

        {/* New Arrival Badge */}
        {product.isNewArrival && (
          <span className="absolute right-4 top-4 rounded-full bg-neutral-950 px-3 py-1 text-xs font-bold text-white">
            New
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="p-5">
        {/* Brand */}
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-neutral-500">
          {product.brand || "CBNK"}
        </p>

        {/* Product Name */}
        <h3 className="line-clamp-2 min-h-10 text-base font-semibold text-neutral-900">
          {product.name}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="mt-2 flex items-center gap-1 text-sm">
            <span className="font-medium text-neutral-700">
              ★ {rating.toFixed(1)}
            </span>

            {reviewCount > 0 && (
              <span className="text-neutral-400">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-lg font-bold text-neutral-950">
            ₹{price.toLocaleString("en-IN")}
          </span>

          {compareAtPrice > price && (
            <span className="text-sm text-neutral-400 line-through">
              ₹{compareAtPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
