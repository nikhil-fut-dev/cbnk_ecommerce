import { useEffect, useState } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../../services/api/wishlistApi";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingProduct, setRemovingProduct] = useState(null);
  const [clearing, setClearing] = useState(false);

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const data = await getWishlist();

      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);

      toast.error(error.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      setRemovingProduct(productId);

      const data = await removeFromWishlist(productId);

      if (data.success) {
        setWishlist(data.wishlist);
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Remove wishlist error:", error);

      toast.error(error.response?.data?.message || "Failed to remove product");
    } finally {
      setRemovingProduct(null);
    }
  };

  const handleClear = async () => {
    try {
      setClearing(true);

      const data = await clearWishlist();

      if (data.success) {
        setWishlist(data.wishlist || { products: [] });
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Clear wishlist error:", error);

      toast.error(error.response?.data?.message || "Failed to clear wishlist");
    } finally {
      setClearing(false);
    }
  };

  const products = wishlist?.products || [];

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="h-10 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border"
              >
                <div className="h-72 bg-gray-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Heart className="h-7 w-7 fill-red-500 text-red-500" />

              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>

          {products.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={clearing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />

              {clearing ? "Clearing..." : "Clear Wishlist"}
            </button>
          )}
        </div>

        {/* Empty */}
        {products.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <Heart className="h-10 w-10 text-red-400" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Your wishlist is empty
            </h2>

            <p className="mt-2 max-w-md text-gray-500">
              Save products you love and come back to them later.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              <ShoppingBag className="h-5 w-5" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          /* Products */
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const image =
                product.images?.[0]?.url ||
                product.images?.[0] ||
                "/placeholder-product.png";

              const hasDiscount =
                product.compareAtPrice &&
                Number(product.compareAtPrice) > Number(product.price);

              return (
                <article
                  key={product._id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <Link to={`/product/${product.slug}`}>
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemove(product._id)}
                      disabled={removingProduct === product._id}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-md transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Remove from wishlist"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </button>

                    {product.isNew && (
                      <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                        New
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <Link to={`/product/${product.slug}`}>
                      <h2 className="line-clamp-2 min-h-12 font-semibold text-gray-900 transition hover:text-gray-600">
                        {product.name}
                      </h2>
                    </Link>

                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>

                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹
                          {Number(product.compareAtPrice).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/product/${product.slug}`}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      View Product
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Wishlist;
