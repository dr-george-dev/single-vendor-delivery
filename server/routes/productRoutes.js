const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
} = require('../controllers/productController');

// @route   GET /api/products
// @desc    Fetch all products
router.route('/').get(getProducts);

// @route   GET /api/products/:id
// @desc    Fetch single product by ID
router.route('/:id').get(getProductById);

module.exports = router;