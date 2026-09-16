import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

import { getProductBySlug } from "../../services/api/productApi";
import { addToCart } from "../../services/api/cartApi";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../services/api/wishlistApi";

import { getProductReviews } from "../../services/api/reviewApi";

const ProductDetails = () => {
  const { slug } = useParams();

  // =========================================================
  // PRODUCT STATE
  // =========================================================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // CART STATE
  // =========================================================

  const [addingToCart, setAddingToCart] = useState(false);

  // =========================================================
  // PRODUCT OPTION STATE
  // =========================================================

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  // =========================================================
  // WISHLIST STATE
  // =========================================================

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // =========================================================
  // REVIEW STATE
  // =========================================================

  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewPagination, setReviewPagination] = useState(null);

  // =========================================================
  // FETCH PRODUCT
  // =========================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProductBySlug(slug);

        if (response?.success) {
          setProduct(response.product);
        } else {
          setError(response?.message || "Product not found.");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to load product. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // =========================================================
  // REVIEWS CHECK
  // =========================================================

  useEffect(() => {
    if (!product?._id) return;

    const loadReviews = async () => {
      try {
        setReviewLoading(true);
        setReviewError("");

        const response = await getProductReviews(product._id, {
          page: 1,
          limit: 10,
        });

        if (!response?.success) {
          throw new Error(response?.message || "Failed to load reviews");
        }

        setReviews(response.data || []);
        setReviewPagination(response.pagination || null);
      } catch (error) {
        console.error("Load reviews error:", error);

        setReviewError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load reviews",
        );
      } finally {
        setReviewLoading(false);
      }
    };

    loadReviews();
  }, [product?._id]);

  // =========================================================
  // CHECK WISHLIST
  // =========================================================

  useEffect(() => {
    const checkWishlist = async () => {
      if (!product?._id) return;

      try {
        const response = await getWishlist();

        if (response?.success) {
          const wishlistProducts = response.wishlist?.products || [];

          const exists = wishlistProducts.some(
            (item) => item?._id?.toString() === product._id?.toString(),
          );

          setIsWishlisted(exists);
        }
      } catch (err) {
        console.error(
          "Wishlist fetch error:",
          err?.response?.data?.message || err.message,
        );
      }
    };

    checkWishlist();
  }, [product]);

  // =========================================================
  // VARIANT LOGIC
  // =========================================================

  const variants = product?.variants || [];

  const hasVariants = variants.length > 0;

  const activeVariants = variants.filter(
    (variant) => variant.isActive !== false,
  );

  const inventoryVariants = product?.inventory?.variants || [];

  useEffect(() => {
    if (!product || !hasVariants) {
      setSelectedVariant(null);
      return;
    }

    const variant = activeVariants.find((item) => {
      const sizeMatches = !selectedSize || item.size === selectedSize;
      const colorMatches = !selectedColor || item.color === selectedColor;

      return sizeMatches && colorMatches;
    });

    setSelectedVariant(variant || null);
  }, [product, selectedSize, selectedColor, hasVariants, activeVariants]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  // =========================================================
  // PRODUCT DATA
  // =========================================================

  const images = product?.images || [];

  const variantImage = selectedVariant?.image?.url;

  const currentImage = variantImage || images[selectedImage]?.url || "";

  const sizes = product?.sizes || [];

  const colors = product?.colors || [];

  const rating = Number(product?.rating || 0);

  const productReviewCount = Number(product?.reviewCount || 0);

  const compareAtPrice = Number(product?.compareAtPrice || 0);

  const discount = Number(product?.discount || 0);

  // =========================================================
  // SELECTED INVENTORY VARIANT
  // =========================================================

  const selectedInventoryVariant = selectedVariant
    ? inventoryVariants.find(
        (inventoryVariant) =>
          inventoryVariant.variant?.toString() ===
          selectedVariant._id?.toString(),
      )
    : null;

  const reviewCount = reviews.length;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce(
          (total, review) => total + Number(review.rating || 0),
          0,
        ) / reviewCount
      : 0;

  // =========================================================
  // AVAILABLE STOCK
  // =========================================================

  const availableStock = hasVariants
    ? Math.max(
        Number(selectedInventoryVariant?.stock || 0) -
          Number(selectedInventoryVariant?.reservedStock || 0),
        0,
      )
    : Number(product?.availableStock || 0);

  // =========================================================
  // PRICE
  // =========================================================

  const price = Number(selectedVariant?.price ?? product?.price ?? 0);

  const savings = compareAtPrice > price ? compareAtPrice - price : 0;

  // =========================================================
  // SIZE AVAILABILITY
  // =========================================================

  const isSizeAvailable = (size) => {
    if (!hasVariants) {
      return availableStock > 0;
    }

    return activeVariants.some((variant) => {
      const sizeMatches = variant.size === size;

      const colorMatches = !selectedColor || variant.color === selectedColor;

      if (!sizeMatches || !colorMatches) {
        return false;
      }

      const inventoryVariant = inventoryVariants.find(
        (item) => item.variant?.toString() === variant._id?.toString(),
      );

      const stock =
        Number(inventoryVariant?.stock || 0) -
        Number(inventoryVariant?.reservedStock || 0);

      return stock > 0;
    });
  };

  // =========================================================
  // COLOR AVAILABILITY
  // =========================================================

  const isColorAvailable = (color) => {
    if (!hasVariants) {
      return availableStock > 0;
    }

    return activeVariants.some((variant) => {
      const colorMatches = variant.color === color;

      const sizeMatches = !selectedSize || variant.size === selectedSize;

      if (!colorMatches || !sizeMatches) {
        return false;
      }

      const inventoryVariant = inventoryVariants.find(
        (item) => item.variant?.toString() === variant._id?.toString(),
      );

      const stock =
        Number(inventoryVariant?.stock || 0) -
        Number(inventoryVariant?.reservedStock || 0);

      return stock > 0;
    });
  };

  // =========================================================
  // AVAILABLE OPTIONS
  // =========================================================

  const availableSizes = useMemo(() => {
    return sizes
      .map((size) =>
        typeof size === "string" ? size : size?.name || size?.value || "",
      )
      .filter(Boolean);
  }, [sizes]);

  const availableColors = useMemo(() => {
    return colors
      .map((color) =>
        typeof color === "string" ? color : color?.name || color?.value || "",
      )
      .filter(Boolean);
  }, [colors]);

  // =========================================================
  // IMAGE CONTROLS
  // =========================================================

  const nextImage = () => {
    if (images.length <= 1) return;

    setSelectedImage((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  };

  const previousImage = () => {
    if (images.length <= 1) return;

    setSelectedImage((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  // =========================================================
  // QUANTITY
  // =========================================================

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(availableStock || 1, current + 1));
  };

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart = async () => {
    try {
      if (hasVariants && !selectedVariant) {
        console.error("Please select an available size and color.");
        return;
      }

      if (availableStock <= 0) {
        console.error("Selected product is out of stock.");
        return;
      }

      if (quantity > availableStock) {
        console.error("Requested quantity exceeds available stock.");
        return;
      }

      setAddingToCart(true);

      const response = await addToCart({
        productId: product._id,
        variantId: selectedVariant?._id || null,
        size: selectedSize,
        color: selectedColor,
        quantity,
      });

      if (response?.success) {
        console.log("Product added to cart:", response.cart);
      }
    } catch (err) {
      console.error(
        "Add to cart error:",
        err?.response?.data?.message || err.message,
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // =========================================================
  // WISHLIST
  // =========================================================

  const handleWishlistToggle = async () => {
    if (!product?._id || wishlistLoading) return;

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        const response = await removeFromWishlist(product._id);

        if (response?.success) {
          setIsWishlisted(false);
          console.log("Product removed from wishlist");
        }

        return;
      }

      const response = await addToWishlist(product._id);

      if (response?.success) {
        setIsWishlisted(true);
        console.log("Product added to wishlist");
      }
    } catch (err) {
      console.error(
        "Wishlist error:",
        err?.response?.data?.message || err.message,
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // =========================================================
  // LOADING UI
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-8 h-4 w-40 animate-pulse rounded bg-neutral-200" />

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="animate-pulse">
              <div className="aspect-square rounded-[2rem] bg-neutral-200" />

              <div className="mt-4 grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-xl bg-neutral-200"
                  />
                ))}
              </div>
            </div>

            <div className="animate-pulse space-y-6 py-2">
              <div className="h-4 w-28 rounded bg-neutral-200" />
              <div className="h-10 w-4/5 rounded bg-neutral-200" />
              <div className="h-5 w-48 rounded bg-neutral-200" />
              <div className="h-10 w-52 rounded bg-neutral-200" />
              <div className="h-20 rounded bg-neutral-200" />
              <div className="h-px bg-neutral-200" />
              <div className="h-12 rounded bg-neutral-200" />
              <div className="h-14 rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR UI
  // =========================================================

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
            <ShoppingBag
              size={34}
              strokeWidth={1.5}
              className="text-neutral-400"
            />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            CBNK Store
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950">
            Product Not Found
          </h1>

          <p className="mt-3 leading-7 text-neutral-500">
            {error || "The product you are looking for is unavailable."}
          </p>

          <Link
            to="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <main className="min-h-screen bg-white">
      {/* =====================================================
          BREADCRUMB
      ====================================================== */}

      <div className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-neutral-400 transition hover:text-neutral-950"
            >
              Home
            </Link>

            <span className="text-neutral-300">/</span>

            <Link
              to="/shop"
              className="text-neutral-400 transition hover:text-neutral-950"
            >
              Shop
            </Link>

            <span className="text-neutral-300">/</span>

            <span className="max-w-40 truncate font-medium text-neutral-900 sm:max-w-none">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          PRODUCT MAIN SECTION
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 xl:gap-20">
          {/* =================================================
              IMAGE GALLERY
          ================================================== */}

          <div className="min-w-0">
            <div className="group relative overflow-hidden rounded-[2rem] bg-neutral-100">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={images[selectedImage]?.alt || product.name}
                  className="aspect-square w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center">
                  <ShoppingBag
                    size={72}
                    strokeWidth={1}
                    className="text-neutral-300"
                  />
                </div>
              )}

              {/* Discount Badge */}

              {discount > 0 && (
                <div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-bold text-neutral-950 shadow-lg shadow-black/5">
                  {discount}% OFF
                </div>
              )}

              {/* New Arrival */}

              {product.isNewArrival && (
                <div className="absolute right-5 top-5 rounded-full bg-neutral-950 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-black/10">
                  New Arrival
                </div>
              )}

              {/* Image Counter */}

              {images.length > 1 && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                  {selectedImage + 1} / {images.length}
                </div>
              )}

              {/* Previous */}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-900 opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100 hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Next */}

                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-900 opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100 hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.map((image, index) => (
                  <button
                    key={image._id || image.publicId || index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`group overflow-hidden rounded-2xl border-2 bg-neutral-100 transition ${
                      selectedImage === index
                        ? "border-neutral-950"
                        : "border-transparent hover:border-neutral-300"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Service Cards */}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 p-4">
                <Truck size={19} className="text-neutral-900" />

                <p className="mt-3 text-sm font-bold text-neutral-950">
                  Fast Delivery
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Reliable delivery to your doorstep.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 p-4">
                <ShieldCheck size={19} className="text-neutral-900" />

                <p className="mt-3 text-sm font-bold text-neutral-950">
                  Secure Shopping
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Your shopping experience stays protected.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 p-4">
                <RotateCcw size={19} className="text-neutral-900" />

                <p className="mt-3 text-sm font-bold text-neutral-950">
                  Easy Returns
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Simple and convenient return experience.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================== */}

          <div className="flex min-w-0 flex-col">
            {/* Brand */}

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
              {product.brand || "CBNK"}
            </p>

            {/* Name */}

            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-neutral-950 sm:text-4xl xl:text-[2.7rem]">
              {product.name}
            </h1>

            {/* Rating */}

            <div className="mt-5 flex flex-wrap items-center gap-4">
              {rating > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-neutral-950 px-3 py-1.5 text-white">
                    <Star size={14} fill="currentColor" />

                    <span className="text-xs font-bold">
                      {rating.toFixed(1)}
                    </span>
                  </div>

                  {productReviewCount > 0 && (
                    <span className="text-sm text-neutral-500">
                      {productReviewCount}{" "}
                      {productReviewCount === 1 ? "review" : "reviews"}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-neutral-400">No rating yet</span>
              )}

              {product.isBestSeller && (
                <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-700">
                  Best Seller
                </span>
              )}
            </div>

            {/* Price */}

            <div className="mt-7 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                ₹{price.toLocaleString("en-IN")}
              </span>

              {compareAtPrice > price && (
                <span className="mb-1 text-lg text-neutral-400 line-through">
                  ₹{compareAtPrice.toLocaleString("en-IN")}
                </span>
              )}

              {savings > 0 && (
                <span className="mb-1 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-700">
                  Save ₹{savings.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Description */}

            {product.shortDescription && (
              <p className="mt-6 max-w-xl leading-7 text-neutral-600">
                {product.shortDescription}
              </p>
            )}

            <div className="my-7 h-px bg-neutral-200" />

            {/* Stock */}

            <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    availableStock > 0 ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />

                <span
                  className={`text-sm font-bold ${
                    availableStock > 0 ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {availableStock > 0
                    ? availableStock <= 5
                      ? `Only ${availableStock} left in stock`
                      : "In stock"
                    : "Out of stock"}
                </span>
              </div>

              {availableStock > 0 && (
                <span className="text-xs font-medium text-neutral-400">
                  Ready to order
                </span>
              )}
            </div>

            {/* SIZE */}

            {availableSizes.length > 0 && (
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-neutral-950">
                    Select Size
                  </h2>

                  {selectedSize && (
                    <span className="text-xs font-semibold text-neutral-500">
                      Selected: {selectedSize}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {availableSizes.map((size, index) => {
                    const available = isSizeAvailable(size);

                    return (
                      <button
                        key={`${size}-${index}`}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedSize(size)}
                        className={`relative min-w-14 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                          selectedSize === size
                            ? "border-neutral-950 bg-neutral-950 text-white shadow-md"
                            : available
                              ? "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-500 hover:bg-neutral-50"
                              : "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300"
                        }`}
                      >
                        {size}

                        {!available && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="h-px w-full rotate-[-18deg] bg-neutral-300" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COLOR */}

            {availableColors.length > 0 && (
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-neutral-950">
                    Select Color
                  </h2>

                  {selectedColor && (
                    <span className="text-xs font-semibold text-neutral-500">
                      Selected: {selectedColor}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map((color, index) => {
                    const available = isColorAvailable(color);

                    return (
                      <button
                        key={`${color}-${index}`}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedColor(color)}
                        className={`relative rounded-xl border px-4 py-3 text-sm font-bold transition ${
                          selectedColor === color
                            ? "border-neutral-950 bg-neutral-950 text-white shadow-md"
                            : available
                              ? "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-500 hover:bg-neutral-50"
                              : "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300"
                        }`}
                      >
                        {color}

                        {!available && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="h-px w-full rotate-[-18deg] bg-neutral-300" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SELECTED VARIANT INFO */}

            {hasVariants && selectedVariant && (
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-3">
                <Check size={17} className="shrink-0 text-neutral-950" />

                <span className="text-sm text-neutral-600">
                  Selected option is available
                </span>
              </div>
            )}

            {/* QUANTITY */}

            <div className="mt-7">
              <h2 className="mb-3 text-sm font-bold text-neutral-950">
                Quantity
              </h2>

              <div className="flex w-fit items-center overflow-hidden rounded-xl border border-neutral-200">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-12 w-12 items-center justify-center text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={17} />
                </button>

                <span className="flex h-12 min-w-14 items-center justify-center border-x border-neutral-200 px-3 text-sm font-bold text-neutral-950">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={availableStock <= 0 || quantity >= availableStock}
                  aria-label="Increase quantity"
                  className="flex h-12 w-12 items-center justify-center text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={
                  addingToCart ||
                  availableStock <= 0 ||
                  (hasVariants && !selectedVariant)
                }
                className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
              >
                <ShoppingBag size={19} />

                {addingToCart
                  ? "Adding..."
                  : hasVariants && !selectedVariant
                    ? "Select Options"
                    : availableStock > 0
                      ? "Add to Cart"
                      : "Out of Stock"}
              </button>

              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border transition ${
                  isWishlisted
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-500 hover:bg-neutral-50"
                } ${wishlistLoading ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* PRODUCT META */}

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-neutral-200 pt-7 sm:grid-cols-3">
              {product.gender && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                    Gender
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-neutral-900">
                    {product.gender}
                  </p>
                </div>
              )}

              {product.material && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                    Material
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-neutral-900">
                    {product.material}
                  </p>
                </div>
              )}

              {product.SKU && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                    SKU
                  </p>

                  <p className="mt-1.5 break-all text-sm font-semibold text-neutral-900">
                    {product.SKU}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          REVIEWS & RATINGS
      ====================================================== */}

      <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Customer Reviews
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-neutral-950">
              Reviews & Ratings
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              See what verified customers are saying about this product.
            </p>
          </div>

          {reviewCount > 0 && (
            <div className="rounded-xl bg-neutral-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-neutral-950">
                  {averageRating.toFixed(1)}
                </span>

                <span className="text-amber-500">
                  {"★".repeat(Math.round(averageRating))}
                </span>
              </div>

              <p className="mt-1 text-xs text-neutral-500">
                {reviewCount} review{reviewCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {reviewLoading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-xl border border-neutral-100 p-4"
              >
                <div className="h-4 w-32 rounded bg-neutral-200" />
                <div className="mt-3 h-3 w-24 rounded bg-neutral-200" />
                <div className="mt-4 h-3 w-full rounded bg-neutral-200" />
                <div className="mt-2 h-3 w-4/5 rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : reviewError ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{reviewError}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-neutral-300 p-8 text-center">
            <p className="font-medium text-neutral-900">No reviews yet</p>

            <p className="mt-1 text-sm text-neutral-500">
              Be the first customer to review this product.
            </p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-neutral-100">
            {reviews.map((review) => {
              const reviewerName =
                review.user?.fullName || review.user?.username || "Customer";

              return (
                <article key={review._id} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-neutral-900">
                          {reviewerName}
                        </h3>

                        {review.isVerifiedPurchase && (
                          <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm tracking-wide text-amber-500">
                          {"★".repeat(Number(review.rating))}
                          {"☆".repeat(5 - Number(review.rating))}
                        </span>

                        <span className="text-xs text-neutral-400">
                          {Number(review.rating)}/5
                        </span>
                      </div>
                    </div>

                    <time className="text-xs text-neutral-400">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : ""}
                    </time>
                  </div>

                  {review.title && (
                    <h4 className="mt-4 font-medium text-neutral-950">
                      {review.title}
                    </h4>
                  )}

                  {review.comment && (
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {review.comment}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {reviewPagination?.totalPages > 1 && (
          <div className="mt-6 border-t border-neutral-100 pt-4 text-center text-sm text-neutral-500">
            Page {reviewPagination.page} of {reviewPagination.totalPages}
          </div>
        )}
      </section>

      {/* =====================================================
          DESCRIPTION
      ====================================================== */}

      {product.description && (
        <section className="border-t border-neutral-100 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
                Product Information
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                Description
              </h2>

              <p className="mt-5 whitespace-pre-line text-[15px] leading-8 text-neutral-600">
                {product.description}
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetails;
