import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  createAdminProduct,
  getAdminProductById,
  updateAdminProduct,
} from "../../services/adminProductApi";

import { getAdminCategories } from "../../services/adminCategoryApi";

/* =========================================================
   DEFAULT DATA
========================================================= */

const createEmptyVariant = () => ({
  size: "",
  color: "",
  colorCode: "",
  SKU: "",
  price: "",
  stock: 0,
  isActive: true,
});

const initialForm = {
  name: "",
  description: "",
  shortDescription: "",

  category: "",
  subCategory: "",

  brand: "CBNK",
  gender: "WOMEN",
  ageGroup: "ADULT",

  price: "",
  compareAtPrice: "",
  discount: 0,

  SKU: "",
  stock: 0,

  sizes: [],
  colors: [],
  variants: [],
  tags: [],

  material: "",
  specifications: {},

  isFeatured: false,
  isNewArrival: true,
  isBestSeller: false,
};

/* =========================================================
   COMPONENT
========================================================= */

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /*
    /admin/products/new
    => create mode

    /admin/products/:id/edit
    => edit mode
  */
  const isEditMode = Boolean(id && id !== "new");

  /* =========================================================
     STATE
  ========================================================= */

  const [form, setForm] = useState(initialForm);

  const [categories, setCategories] = useState([]);

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  const fetchCategories = async () => {
    try {
      const response = await getAdminCategories({
        page: 1,
        limit: 100,
      });

      if (!response?.success) {
        return;
      }

      const categoryData = response.data || response.categories || [];

      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  /* =========================================================
     LOAD PRODUCT
     IMPORTANT:
     NEVER FETCH PRODUCT WHEN id === "new"
  ========================================================= */

  const fetchProduct = async () => {
    if (!isEditMode || !id || id === "new") {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getAdminProductById(id);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load product");
      }

      const product = response.product || response.data;

      if (!product) {
        throw new Error("Product not found");
      }

      /* -----------------------------------------
         PRODUCT DATA
      ----------------------------------------- */

      setForm({
        name: product.name || "",

        description: product.description || "",

        shortDescription: product.shortDescription || "",

        category: product.category?._id || product.category || "",

        subCategory: product.subCategory?._id || product.subCategory || "",

        brand: product.brand || "CBNK",

        gender: product.gender || "WOMEN",

        ageGroup: product.ageGroup || "ADULT",

        price: product.price ?? "",

        compareAtPrice: product.compareAtPrice ?? "",

        discount: product.discount ?? 0,

        SKU: product.SKU || "",

        stock: product.stock ?? 0,

        sizes: Array.isArray(product.sizes) ? product.sizes : [],

        colors: Array.isArray(product.colors) ? product.colors : [],

        variants: Array.isArray(product.variants) ? product.variants : [],

        tags: Array.isArray(product.tags) ? product.tags : [],

        material: product.material || "",

        specifications:
          product.specifications && typeof product.specifications === "object"
            ? product.specifications
            : {},

        isFeatured: Boolean(product.isFeatured),

        isNewArrival:
          product.isNewArrival !== undefined
            ? Boolean(product.isNewArrival)
            : true,

        isBestSeller: Boolean(product.isBestSeller),
      });

      setExistingImages(Array.isArray(product.images) ? product.images : []);
    } catch (err) {
      console.error("Failed to load product:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load product",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchCategories();

    /*
      Only edit mode can load a product.

      /admin/products/new
      => NO fetchProduct()
    */
    if (isEditMode) {
      fetchProduct();
    }
  }, [id, isEditMode]);

  /* =========================================================
     BASIC INPUT HANDLER
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     CHECKBOX HANDLER
  ========================================================= */

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: checked,
    }));
  };

  /* =========================================================
     SIZE
  ========================================================= */

  const addSize = () => {
    const value = sizeInput.trim();

    if (!value) {
      return;
    }

    if (form.sizes.some((size) => size.toLowerCase() === value.toLowerCase())) {
      setSizeInput("");
      return;
    }

    setForm((previous) => ({
      ...previous,
      sizes: [...previous.sizes, value],
    }));

    setSizeInput("");
  };

  const removeSize = (sizeToRemove) => {
    setForm((previous) => ({
      ...previous,
      sizes: previous.sizes.filter((size) => size !== sizeToRemove),
    }));
  };

  /* =========================================================
     COLOR
  ========================================================= */

  const addColor = () => {
    const value = colorInput.trim();

    if (!value) {
      return;
    }

    if (
      form.colors.some((color) => color.toLowerCase() === value.toLowerCase())
    ) {
      setColorInput("");
      return;
    }

    setForm((previous) => ({
      ...previous,
      colors: [...previous.colors, value],
    }));

    setColorInput("");
  };

  const removeColor = (colorToRemove) => {
    setForm((previous) => ({
      ...previous,
      colors: previous.colors.filter((color) => color !== colorToRemove),
    }));
  };

  /* =========================================================
     TAG
  ========================================================= */

  const addTag = () => {
    const value = tagInput.trim();

    if (!value) {
      return;
    }

    if (form.tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setTagInput("");
      return;
    }

    setForm((previous) => ({
      ...previous,
      tags: [...previous.tags, value],
    }));

    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setForm((previous) => ({
      ...previous,
      tags: previous.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  /* =========================================================
     VARIANTS
  ========================================================= */

  const addVariant = () => {
    setForm((previous) => ({
      ...previous,
      variants: [...previous.variants, createEmptyVariant()],
    }));
  };

  const updateVariant = (index, field, value) => {
    setForm((previous) => {
      const variants = [...previous.variants];

      variants[index] = {
        ...variants[index],
        [field]: value,
      };

      return {
        ...previous,
        variants,
      };
    });
  };

  const removeVariant = (index) => {
    setForm((previous) => ({
      ...previous,
      variants: previous.variants.filter(
        (_, variantIndex) => variantIndex !== index,
      ),
    }));
  };

  /* =========================================================
     SPECIFICATIONS
  ========================================================= */

  const addSpecification = () => {
    const key = specKey.trim();
    const value = specValue.trim();

    if (!key || !value) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      specifications: {
        ...previous.specifications,
        [key]: value,
      },
    }));

    setSpecKey("");
    setSpecValue("");
  };

  const removeSpecification = (keyToRemove) => {
    setForm((previous) => {
      const specifications = {
        ...previous.specifications,
      };

      delete specifications[keyToRemove];

      return {
        ...previous,
        specifications,
      };
    });
  };

  /* =========================================================
     EXISTING IMAGE REMOVE
  ========================================================= */

  const removeExistingImage = (index) => {
    setExistingImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  /* =========================================================
     NEW IMAGE SELECT
  ========================================================= */

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      const isImage = file.type.startsWith("image/");

      const isUnderLimit = file.size <= 5 * 1024 * 1024;

      return isImage && isUnderLimit;
    });

    setNewImages((previous) => {
      const combined = [...previous, ...validFiles];

      return combined.slice(0, 10);
    });

    event.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Product name is required";
    }

    if (!form.description.trim()) {
      return "Product description is required";
    }

    if (!form.category) {
      return "Category is required";
    }

    if (form.price === "" || Number(form.price) < 0) {
      return "Valid product price is required";
    }

    if (!form.SKU.trim()) {
      return "SKU is required";
    }

    if (Number(form.discount) < 0) {
      return "Discount cannot be negative";
    }

    if (Number(form.stock) < 0) {
      return "Stock cannot be negative";
    }

    for (const variant of form.variants) {
      if (!variant.size) {
        return "Every variant must have a size";
      }

      if (!variant.color) {
        return "Every variant must have a color";
      }

      if (!variant.SKU?.trim()) {
        return "Every variant must have a SKU";
      }

      if (Number(variant.stock) < 0) {
        return "Variant stock cannot be negative";
      }
    }

    return "";
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      /* -----------------------------------------
         PREPARE BACKEND DATA
      ----------------------------------------- */

      const productData = {
        name: form.name.trim(),

        description: form.description.trim(),

        shortDescription: form.shortDescription.trim(),

        category: form.category,

        subCategory: form.subCategory.trim(),

        brand: form.brand.trim() || "CBNK",

        gender: form.gender,

        ageGroup: form.ageGroup,

        price: Number(form.price),

        compareAtPrice:
          form.compareAtPrice === "" ? null : Number(form.compareAtPrice),

        discount: Number(form.discount) || 0,

        SKU: form.SKU.trim().toUpperCase(),

        stock: Number(form.stock) || 0,

        sizes: form.sizes,

        colors: form.colors,

        variants: form.variants.map((variant) => ({
          ...(variant._id ? { _id: variant._id } : {}),

          size: variant.size?.trim() || "",

          color: variant.color?.trim() || "",

          colorCode: variant.colorCode?.trim() || "",

          SKU: variant.SKU?.trim().toUpperCase() || "",

          price:
            variant.price === "" || variant.price === null
              ? null
              : Number(variant.price),

          stock: Number(variant.stock) || 0,

          isActive: variant.isActive !== false,
        })),

        tags: form.tags,

        material: form.material.trim(),

        specifications: form.specifications,

        isFeatured: Boolean(form.isFeatured),

        isNewArrival: Boolean(form.isNewArrival),

        isBestSeller: Boolean(form.isBestSeller),

        /*
          Backend expects uploaded files
          under "images".
        */
        images: newImages,
      };

      /* -----------------------------------------
         EDIT MODE
         Backend updateProduct supports keepImages
      ----------------------------------------- */

      if (isEditMode) {
        productData.keepImages = existingImages;
      }

      /* -----------------------------------------
         CREATE
      ----------------------------------------- */

      if (!isEditMode) {
        const response = await createAdminProduct(productData);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to create product");
        }

        setSuccess("Product created successfully.");
      }

      /* -----------------------------------------
         UPDATE
      ----------------------------------------- */

      if (isEditMode) {
        const response = await updateAdminProduct(id, productData);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to update product");
        }

        setSuccess("Product updated successfully.");
      }

      /* -----------------------------------------
         GO BACK TO PRODUCTS
      ----------------------------------------- */

      setTimeout(() => {
        navigate("/admin/products");
      }, 700);
    } catch (err) {
      console.error("Product save error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save product",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading product...
        </div>
      </div>
    );
  }

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="p-4 md:p-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Product" : "Add Product"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Update product information and inventory-related data."
              : "Create a new CBNK product."}
          </p>
        </div>

        <Link
          to="/admin/products"
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Back to Products
        </Link>
      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Basic Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Product Name *
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">SKU *</label>

              <input
                type="text"
                name="SKU"
                value={form.SKU}
                onChange={handleChange}
                placeholder="CBNK-TSHIRT-001"
                className="w-full rounded-lg border px-3 py-2.5 uppercase outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Brand</label>

              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Short Description
              </label>

              <input
                type="text"
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="Short product description"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              Description *
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Enter complete product description"
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
            />
          </div>
        </section>

        {/* ===================================================
            CATEGORY & AUDIENCE
        =================================================== */}

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">Category & Audience</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category *
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Sub Category ID
              </label>

              <input
                type="text"
                name="subCategory"
                value={form.subCategory}
                onChange={handleChange}
                placeholder="MongoDB SubCategory ID"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />

              <p className="mt-1 text-xs text-gray-500">
                Backend currently expects the sub-category ID.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Gender</label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              >
                <option value="WOMEN">Women</option>

                <option value="MEN">Men</option>

                <option value="UNISEX">Unisex</option>

                <option value="KIDS">Kids</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Age Group
              </label>

              <select
                name="ageGroup"
                value={form.ageGroup}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              >
                <option value="ADULT">Adult</option>

                <option value="TEEN">Teen</option>

                <option value="KIDS">Kids</option>
              </select>
            </div>
          </div>
        </section>

        {/* ===================================================
            PRICING & INVENTORY
        =================================================== */}

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">Pricing & Inventory</h2>

          <div className="grid gap-5 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Price *</label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Compare At Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="compareAtPrice"
                value={form.compareAtPrice}
                onChange={handleChange}
                placeholder="0"
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Discount %
              </label>

              <input
                type="number"
                min="0"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Initial Stock
              </label>

              <input
                type="number"
                min="0"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            Product stock is used during product creation. Inventory
            management/restocking should be handled through the dedicated
            inventory system.
          </div>
        </section>

        {/* ===================================================
            SIZES
        =================================================== */}

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Sizes</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={sizeInput}
              onChange={(event) => setSizeInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addSize();
                }
              }}
              placeholder="Example: S, M, L, XL"
              className="flex-1 rounded-lg border px-3 py-2.5 outline-none focus:border-black"
            />

            <button
              type="button"
              onClick={addSize}
              className="rounded-lg bg-black px-5 py-2.5 text-white"
            >
              Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {form.sizes.map((size) => (
              <span
                key={size}
                className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm"
              >
                {size}

                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="font-bold text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* ===================================================
            COLORS
        =================================================== */}

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Colors</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={colorInput}
              onChange={(event) => setColorInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addColor();
                }
              }}
              placeholder="Example: Black, White"
              className="flex-1 rounded-lg border px-3 py-2.5 outline-none focus:border-black"
            />

            <button
              type="button"
              onClick={addColor}
              className="rounded-lg bg-black px-5 py-2.5 text-white"
            >
              Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {form.colors.map((color) => (
              <span
                key={color}
                className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm"
              >
                {color}

                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="font-bold text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* ===================================================
            VARIANTS
        =================================================== */}

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Product Variants</h2>

              <p className="mt-1 text-xs text-gray-500">
                Size + color + SKU + variant stock.
              </p>
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white"
            >
              + Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {form.variants.map((variant, index) => (
              <div
                key={variant._id || `variant-${index}`}
                className="rounded-lg border bg-gray-50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">Variant {index + 1}</h3>

                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-sm font-medium text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <input
                    type="text"
                    placeholder="Size"
                    value={variant.size || ""}
                    onChange={(event) =>
                      updateVariant(index, "size", event.target.value)
                    }
                    className="rounded-lg border px-3 py-2"
                  />

                  <input
                    type="text"
                    placeholder="Color"
                    value={variant.color || ""}
                    onChange={(event) =>
                      updateVariant(index, "color", event.target.value)
                    }
                    className="rounded-lg border px-3 py-2"
                  />

                  <input
                    type="text"
                    placeholder="Color Code #000000"
                    value={variant.colorCode || ""}
                    onChange={(event) =>
                      updateVariant(index, "colorCode", event.target.value)
                    }
                    className="rounded-lg border px-3 py-2"
                  />

                  <input
                    type="text"
                    placeholder="Variant SKU"
                    value={variant.SKU || ""}
                    onChange={(event) =>
                      updateVariant(index, "SKU", event.target.value)
                    }
                    className="rounded-lg border px-3 py-2 uppercase"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Variant Price"
                    value={variant.price ?? ""}
                    onChange={(event) =>
                      updateVariant(index, "price", event.target.value)
                    }
                    className="rounded-lg border px-3 py-2"
                  />

                  <input
                    type="number"
                    min="0"
                    placeholder="Variant Stock"
                    value={variant.stock ?? 0}
                    onChange={(event) =>
                      updateVariant(index, "stock", event.target.value)
                    }
                    className="rounded-lg border px-3 py-2"
                  />

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={variant.isActive !== false}
                      onChange={(event) =>
                        updateVariant(index, "isActive", event.target.checked)
                      }
                    />
                    Active
                  </label>
                </div>
              </div>
            ))}

            {form.variants.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                No variants added.
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            TAGS
        =================================================== */}

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Tags</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag();
                }
              }}
              placeholder="Example: summer, cotton, casual"
              className="flex-1 rounded-lg border px-3 py-2.5 outline-none focus:border-black"
            />

            <button
              type="button"
              onClick={addTag}
              className="rounded-lg bg-black px-5 py-2.5 text-white"
            >
              Add
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="font-bold text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* ===================================================
            MATERIAL
        =================================================== */}

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Material</h2>

          <input
            type="text"
            name="material"
            value={form.material}
            onChange={handleChange}
            placeholder="Example: 100% Cotton"
            className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
          />
        </section>

        {/* ===================================================
            SPECIFICATIONS
        =================================================== */}

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Specifications</h2>

          <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <input
              type="text"
              value={specKey}
              onChange={(event) => setSpecKey(event.target.value)}
              placeholder="Key e.g. Fabric"
              className="rounded-lg border px-3 py-2.5"
            />

            <input
              type="text"
              value={specValue}
              onChange={(event) => setSpecValue(event.target.value)}
              placeholder="Value e.g. Cotton"
              className="rounded-lg border px-3 py-2.5"
            />

            <button
              type="button"
              onClick={addSpecification}
              className="rounded-lg bg-black px-5 py-2.5 text-white"
            >
              Add
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {Object.entries(form.specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
              >
                <div>
                  <span className="font-medium">{key}</span>

                  <span className="mx-2 text-gray-400">:</span>

                  <span className="text-gray-600">{value}</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeSpecification(key)}
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            IMAGES
        =================================================== */}

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Product Images</h2>

          <p className="mb-5 text-sm text-gray-500">
            Maximum 10 images. Each image must be an image file and maximum 5MB.
          </p>

          {/* Existing images */}

          {isEditMode && existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold">Existing Images</h3>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {existingImages.map((image, index) => (
                  <div
                    key={image.publicId || image._id || index}
                    className="relative overflow-hidden rounded-lg border"
                  >
                    <img
                      src={image.url}
                      alt={image.alt || form.name}
                      className="h-32 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload */}

          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full rounded-lg border p-3 text-sm"
            />
          </div>

          {/* New images */}

          {newImages.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold">New Images</h3>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {newImages.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative overflow-hidden rounded-lg border"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-32 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white"
                    >
                      ×
                    </button>

                    <div className="truncate px-2 py-1 text-xs">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ===================================================
            PRODUCT FLAGS
        =================================================== */}

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold">Product Flags</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex items-center gap-3 rounded-lg border p-4">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleCheckboxChange}
              />

              <span className="text-sm font-medium">Featured Product</span>
            </label>

            <label className="flex items-center gap-3 rounded-lg border p-4">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={form.isNewArrival}
                onChange={handleCheckboxChange}
              />

              <span className="text-sm font-medium">New Arrival</span>
            </label>

            <label className="flex items-center gap-3 rounded-lg border p-4">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={form.isBestSeller}
                onChange={handleCheckboxChange}
              />

              <span className="text-sm font-medium">Best Seller</span>
            </label>
          </div>
        </section>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/products"
            className="rounded-lg border px-6 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : isEditMode
                ? "Update Product"
                : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
