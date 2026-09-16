import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";

import { getProductBySlug } from "../../services/api/productApi";
import { addToCart } from "../../services/api/cartApi";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../services/api/wishlistApi";

const ProductDetails = () => {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState(null);

  // Selected product options
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Wishlist UI state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

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

  // ========================================
  // VARIANT LOGIC
  // ========================================

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
  }, [product, selectedSize, selectedColor, hasVariants]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid animate-pulse gap-10 lg:grid-cols-2">
            <div className="aspect-square rounded-3xl bg-neutral-200" />

            <div className="space-y-6">
              <div className="h-4 w-24 rounded bg-neutral-200" />
              <div className="h-10 w-3/4 rounded bg-neutral-200" />
              <div className="h-6 w-32 rounded bg-neutral-200" />
              <div className="h-20 w-full rounded bg-neutral-200" />
              <div className="h-12 w-full rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <ShoppingBag size={28} className="text-neutral-400" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900">
            Product Not Found
          </h1>

          <p className="mt-2 max-w-md text-neutral-500">
            {error || "The product you are looking for is unavailable."}
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const images = product.images || [];

  const variantImage = selectedVariant?.image?.url;

  const currentImage = variantImage || images[selectedImage]?.url;

  // ========================================
  // SIZE / COLOR AVAILABILITY
  // ========================================

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

  const price = Number(selectedVariant?.price ?? product.price ?? 0);
  const compareAtPrice = Number(product.compareAtPrice || 0);
  const discount = Number(product.discount || 0);
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.reviewCount || 0);

  const selectedInventoryVariant = selectedVariant
    ? inventoryVariants.find(
        (inventoryVariant) =>
          inventoryVariant.variant?.toString() ===
          selectedVariant._id?.toString(),
      )
    : null;

  const availableStock = hasVariants
    ? Math.max(
        Number(selectedInventoryVariant?.stock || 0) -
          Number(selectedInventoryVariant?.reservedStock || 0),
        0,
      )
    : Number(product.availableStock || 0);

  const sizes = product.sizes || [];
  const colors = product.colors || [];

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(availableStock || 1, current + 1));
  };

  const handleAddToCart = async () => {
    try {
      // Variant product requires a valid variant
      if (hasVariants && !selectedVariant) {
        console.error("Please select an available size and color.");
        return;
      }

      // Prevent adding unavailable stock
      if (availableStock <= 0) {
        console.error("Selected product is out of stock.");
        return;
      }

      // Prevent quantity exceeding stock
      if (quantity > availableStock) {
        console.error("Requested quantity exceeds available stock.");
        return;
      }

      setAddingToCart(true);

      const response = await addToCart({
        productId: product._id,

        // Actual MongoDB variant ID
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

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Product Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* ================= IMAGE GALLERY ================= */}
          <div>
            <div className="relative overflow-hidden rounded-3xl bg-neutral-100">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={images[selectedImage]?.alt || product.name}
                  className="aspect-square h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center">
                  <ShoppingBag
                    size={70}
                    strokeWidth={1}
                    className="text-neutral-300"
                  />
                </div>
              )}

              {discount > 0 && (
                <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-bold text-neutral-950 shadow-sm">
                  {discount}% OFF
                </span>
              )}

              {product.isNewArrival && (
                <span className="absolute right-5 top-5 rounded-full bg-neutral-950 px-4 py-2 text-xs font-bold text-white">
                  New Arrival
                </span>
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
                    className={`overflow-hidden rounded-xl border-2 bg-neutral-100 transition ${
                      selectedImage === index
                        ? "border-neutral-950"
                        : "border-transparent hover:border-neutral-300"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= PRODUCT INFO ================= */}
          <div className="flex flex-col">
            {/* Brand */}
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
              {product.brand || "CBNK"}
            </p>

            {/* Product Name */}
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {rating > 0 ? (
                <div className="flex items-center gap-1">
                  <Star
                    size={17}
                    fill="currentColor"
                    className="text-neutral-900"
                  />

                  <span className="font-semibold text-neutral-900">
                    {rating.toFixed(1)}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-neutral-400">No rating yet</span>
              )}

              {reviewCount > 0 && (
                <span className="text-sm text-neutral-500">
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-neutral-950">
                ₹{price.toLocaleString("en-IN")}
              </span>

              {compareAtPrice > price && (
                <>
                  <span className="text-lg text-neutral-400 line-through">
                    ₹{compareAtPrice.toLocaleString("en-IN")}
                  </span>

                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                    Save ₹{(compareAtPrice - price).toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="mt-6 leading-7 text-neutral-600">
                {product.shortDescription}
              </p>
            )}

            {/* Divider */}
            <div className="my-7 border-t border-neutral-200" />

            {/* Stock */}
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  availableStock > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              />

              <span
                className={`text-sm font-semibold ${
                  availableStock > 0 ? "text-green-700" : "text-red-600"
                }`}
              >
                {availableStock > 0
                  ? availableStock <= 5
                    ? `Only ${availableStock} left in stock`
                    : "In stock"
                  : "Out of stock"}
              </span>
            </div>

            {/* ================= SIZE ================= */}
            {sizes.length > 0 && (
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutral-950">
                    Select Size
                  </h2>

                  <span className="text-xs text-neutral-400">Required</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((size, index) => {
                    const sizeValue =
                      typeof size === "string"
                        ? size
                        : size?.name || size?.value || "";

                    if (!sizeValue) return null;

                    const available = isSizeAvailable(sizeValue);

                    return (
                      <button
                        key={size._id || index}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedSize(sizeValue)}
                        className={`relative min-w-12 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                          selectedSize === sizeValue
                            ? "border-neutral-950 bg-neutral-950 text-white"
                            : available
                              ? "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-500"
                              : "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300 line-through"
                        }`}
                      >
                        {sizeValue}

                        {!available && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="h-px w-full rotate-[-20deg] bg-neutral-300" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= COLOR ================= */}
            {colors.length > 0 && (
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutral-950">
                    Select Color
                  </h2>

                  {selectedColor && (
                    <span className="text-sm text-neutral-500">
                      {selectedColor}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {colors.map((color, index) => {
                    const colorValue =
                      typeof color === "string"
                        ? color
                        : color?.name || color?.value || "";

                    if (!colorValue) return null;

                    const available = isColorAvailable(colorValue);

                    return (
                      <button
                        key={color._id || index}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedColor(colorValue)}
                        className={`relative rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                          selectedColor === colorValue
                            ? "border-neutral-950 bg-neutral-950 text-white"
                            : available
                              ? "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-500"
                              : "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300 line-through"
                        }`}
                      >
                        {colorValue}

                        {!available && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="h-px w-full rotate-[-20deg] bg-neutral-300" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= QUANTITY ================= */}
            <div className="mt-7">
              <h2 className="mb-3 text-sm font-semibold text-neutral-950">
                Quantity
              </h2>

              <div className="flex w-fit items-center overflow-hidden rounded-xl border border-neutral-200">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="p-3 text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={17} />
                </button>

                <span className="min-w-12 text-center text-sm font-bold text-neutral-950">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={availableStock <= 0 || quantity >= availableStock}
                  className="p-3 text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={17} />
                </button>
              </div>
            </div>

            {/* ================= ACTIONS ================= */}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={
                  addingToCart ||
                  availableStock <= 0 ||
                  (hasVariants && !selectedVariant)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
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
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-500"
                } ${wishlistLoading ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Product meta */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-7 sm:grid-cols-3">
              {product.gender && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-400">
                    Gender
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {product.gender}
                  </p>
                </div>
              )}

              {product.material && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-400">
                    Material
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {product.material}
                  </p>
                </div>
              )}

              {product.SKU && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-400">
                    SKU
                  </p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {product.SKU}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= DESCRIPTION ================= */}
      {product.description && (
        <section className="border-t border-neutral-100 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
                Product Information
              </p>

              <h2 className="mt-2 text-2xl font-bold text-neutral-950">
                Description
              </h2>

              <p className="mt-5 whitespace-pre-line leading-8 text-neutral-600">
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
