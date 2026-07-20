const Product = require('../models/Product');
const { CATEGORIES } = require('../models/Product');

const DEFAULT_IMAGE =
  'https://cdn-icons-png.flaticon.com/512/3075/3075977.png';

/** Normalize tags from array or comma-separated string */
const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((t) => String(t).trim()).filter(Boolean);
  }
  return String(tags)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
};

const pickProductFields = (body) => {
  const fields = {};

  if (body.name !== undefined) fields.name = String(body.name).trim();
  if (body.description !== undefined) fields.description = String(body.description).trim();
  if (body.price !== undefined) fields.price = Number(body.price);
  if (body.originalPrice !== undefined && body.originalPrice !== '' && body.originalPrice !== null) {
    fields.originalPrice = Number(body.originalPrice);
  } else if (body.originalPrice === '' || body.originalPrice === null) {
    fields.originalPrice = undefined;
  }
  if (body.category !== undefined) fields.category = body.category;
  if (body.image !== undefined) {
    fields.image = String(body.image).trim() || DEFAULT_IMAGE;
  }
  if (body.prepTime !== undefined) fields.prepTime = Number(body.prepTime);
  if (body.calories !== undefined && body.calories !== '' && body.calories !== null) {
    fields.calories = Number(body.calories);
  }
  if (body.rating !== undefined && body.rating !== '' && body.rating !== null) {
    fields.rating = Number(body.rating);
  }
  if (body.tags !== undefined) fields.tags = parseTags(body.tags);
  if (body.isAvailable !== undefined) {
    fields.isAvailable = Boolean(body.isAvailable);
  }

  return fields;
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
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching products' });
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
    if (req.query.available === 'true') filter.isAvailable = true;
    if (req.query.available === 'false') filter.isAvailable = false;

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching admin products' });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public (hidden if sold out, unless admin)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Customers cannot open sold-out items; kitchen admin can (for editing)
    const isAdmin = req.user && req.user.role === 'admin';
    if (product.isAvailable === false && !isAdmin) {
      return res.status(404).json({ message: 'Product is currently unavailable' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching product' });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const fields = pickProductFields(req.body);

    if (!fields.name || !fields.description || fields.price === undefined || !fields.category) {
      return res.status(400).json({
        message: 'Name, description, price, and category are required',
      });
    }
    if (fields.prepTime === undefined || Number.isNaN(fields.prepTime)) {
      return res.status(400).json({ message: 'Prep time (minutes) is required' });
    }
    if (!fields.image) fields.image = DEFAULT_IMAGE;
    if (fields.isAvailable === undefined) fields.isAvailable = true;

    if (!CATEGORIES.includes(fields.category)) {
      return res.status(400).json({
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      });
    }

    const product = await Product.create(fields);
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error creating product' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const fields = pickProductFields(req.body);

    if (fields.category && !CATEGORIES.includes(fields.category)) {
      return res.status(400).json({
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      });
    }

    Object.assign(product, fields);

    // Allow clearing originalPrice
    if (req.body.originalPrice === '' || req.body.originalPrice === null) {
      product.originalPrice = undefined;
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error updating product' });
  }
};

// @desc    Toggle sold-out / available
// @route   PUT /api/products/:id/availability
// @access  Private/Admin
const updateProductAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (typeof req.body.isAvailable === 'boolean') {
      product.isAvailable = req.body.isAvailable;
    } else {
      // Toggle if no explicit value
      product.isAvailable = !product.isAvailable;
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error updating availability' });
  }
};

// @desc    Delete product permanently
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed', _id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error deleting product' });
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
