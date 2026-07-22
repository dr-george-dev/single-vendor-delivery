const Product = require("../models/Product");
const { CATEGORIES } = require("../models/Product");

const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/3075/3075977.png";

/** Normalize tags from array or comma-separated string */
const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean);
  }
  return String(tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

const pickProductFields = (body) => {
  const fields = {};

  const parseBoolean = (v) => {
    if (v === true || v === "true" || v === 1 || v === "1") return true;
    if (v === false || v === "false" || v === 0 || v === "0") return false;
    return undefined;
  };

  if (body.name !== undefined) fields.name = String(body.name).trim();
  if (body.description !== undefined)
    fields.description = String(body.description).trim();
  if (body.price !== undefined && body.price !== "") {
    const v = Number(body.price);
    fields.price = Number.isFinite(v) ? v : NaN;
  }
  if (
    body.originalPrice !== undefined &&
    body.originalPrice !== "" &&
    body.originalPrice !== null
  ) {
    const v = Number(body.originalPrice);
    fields.originalPrice = Number.isFinite(v) ? v : NaN;
  } else if (body.originalPrice === "" || body.originalPrice === null) {
    fields.originalPrice = undefined;
  }
  if (body.category !== undefined) fields.category = body.category;
  if (body.image !== undefined) {
    fields.image = String(body.image).trim() || DEFAULT_IMAGE;
  }
  if (body.imageId !== undefined) {
    fields.imageId = String(body.imageId).trim() || undefined;
  }
  if (body.prepTime !== undefined && body.prepTime !== "") {
    const v = Number(body.prepTime);
    fields.prepTime = Number.isFinite(v) ? v : NaN;
  }
  if (
    body.calories !== undefined &&
    body.calories !== "" &&
    body.calories !== null
  ) {
    const v = Number(body.calories);
    fields.calories = Number.isFinite(v) ? v : NaN;
  }
  if (body.rating !== undefined && body.rating !== "" && body.rating !== null) {
    const v = Number(body.rating);
    fields.rating = Number.isFinite(v) ? v : NaN;
  }
  if (body.tags !== undefined) fields.tags = parseTags(body.tags);
  if (body.isAvailable !== undefined) {
    const parsed = parseBoolean(body.isAvailable);
    if (parsed !== undefined) fields.isAvailable = parsed;
    else fields.isAvailable = Boolean(body.isAvailable);
  }

  return fields;
};

const makeImageUrl = (req, imageVal) => {
  if (!imageVal) return DEFAULT_IMAGE;
  const s = String(imageVal).trim();
  if (!s) return DEFAULT_IMAGE;
  // Absolute remote / local URLs
  if (/^https?:\/\//i.test(s)) return s;
  // Relative upload paths (e.g. /uploads/filename or uploads/filename)
  if (s.startsWith("/uploads/") || s.startsWith("uploads/")) {
    const protocol = req?.protocol || "http";
    const host = req?.get?.("host") || "localhost:5000";
    const path = s.startsWith("/") ? s : `/${s}`;
    return `${protocol}://${host}${path}`;
  }
  // Already a data URI or other scheme — pass through
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s;
  return DEFAULT_IMAGE;
};

// @desc    Fetch products for customer menu (available only)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    // $ne: false keeps legacy docs that predate the isAvailable field
    const products = await Product.find({ isAvailable: { $ne: false } }).sort({
      category: 1,
      name: 1,
    });
    const out = products.map((p) => {
      const obj = p.toObject({ getters: true });
      obj.image = makeImageUrl(req, obj.image);
      return obj;
    });
    res.json(out);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error fetching products" });
  }
};

// @desc    Kitchen: list all products including sold out
// @route   GET /api/products/admin
// @access  Private/Admin
const getAdminProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && CATEGORIES.includes(req.query.category)) {
      filter.category = req.query.category;
    }
    if (req.query.available === "true") filter.isAvailable = true;
    if (req.query.available === "false") filter.isAvailable = false;

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    const out = products.map((p) => {
      const obj = p.toObject({ getters: true });
      obj.image = makeImageUrl(req, obj.image);
      return obj;
    });
    res.json(out);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error fetching admin products" });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public (hidden if sold out, unless admin)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Customers cannot open sold-out items; kitchen admin can (for editing)
    const isAdmin = req.user && req.user.role === "admin";
    if (product.isAvailable === false && !isAdmin) {
      return res
        .status(404)
        .json({ message: "Product is currently unavailable" });
    }

    const obj = product.toObject({ getters: true });
    obj.image = makeImageUrl(req, obj.image);
    res.json(obj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error fetching product" });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const fields = pickProductFields(req.body);

    if (
      !fields.name ||
      !fields.description ||
      fields.price === undefined ||
      !fields.category
    ) {
      return res.status(400).json({
        message: "Name, description, price, and category are required",
      });
    }
    // Validate numeric fields parsed above
    if (!Number.isFinite(fields.price) || fields.price < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a valid non-negative number" });
    }
    if (fields.prepTime === undefined || Number.isNaN(fields.prepTime)) {
      return res
        .status(400)
        .json({ message: "Prep time (minutes) is required" });
    }
    if (!fields.image) fields.image = DEFAULT_IMAGE;
    if (fields.isAvailable === undefined) fields.isAvailable = true;

    if (!CATEGORIES.includes(fields.category)) {
      return res.status(400).json({
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      });
    }

    const product = await Product.create(fields);
    const obj = product.toObject({ getters: true });
    obj.image = makeImageUrl(req, obj.image);
    res.status(201).json(obj);
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error creating product" });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const fields = pickProductFields(req.body);

    if (fields.price !== undefined && !Number.isFinite(fields.price)) {
      return res.status(400).json({ message: "Price must be a valid number" });
    }
    if (fields.prepTime !== undefined && !Number.isFinite(fields.prepTime)) {
      return res
        .status(400)
        .json({ message: "Prep time must be a valid number" });
    }

    if (fields.category && !CATEGORIES.includes(fields.category)) {
      return res.status(400).json({
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      });
    }

    Object.assign(product, fields);

    // Allow clearing originalPrice / imageId (Object.assign skips meaningful unset)
    if (req.body.originalPrice === "" || req.body.originalPrice === null) {
      product.originalPrice = undefined;
    }
    if (req.body.imageId === "" || req.body.imageId === null) {
      product.imageId = undefined;
    }

    const updated = await product.save();
    // Normalize image URL for clients (same as list endpoints)
    const obj = updated.toObject({ getters: true });
    obj.image = makeImageUrl(req, obj.image);
    res.json(obj);
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error updating product" });
  }
};

// @desc    Toggle sold-out / available
// @route   PUT /api/products/:id/availability
// @access  Private/Admin
const updateProductAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (typeof req.body.isAvailable === "boolean") {
      product.isAvailable = req.body.isAvailable;
    } else {
      // Toggle if no explicit value
      product.isAvailable = !product.isAvailable;
    }

    const updated = await product.save();
    const obj = updated.toObject({ getters: true });
    obj.image = makeImageUrl(req, obj.image);
    res.json(obj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error updating availability" });
  }
};

// @desc    Delete product permanently
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product removed", _id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error deleting product" });
  }
};

// @desc    Category list for forms
// @route   GET /api/products/meta/categories
// @access  Public
const getCategories = async (_req, res) => {
  res.json(CATEGORIES);
};

module.exports = {
  getProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductAvailability,
  deleteProduct,
  getCategories,
  CATEGORIES,
};
