const express = require('express');
const router = express.Router();
const {
  getProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductAvailability,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');
const { upload, uploadImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public menu (available items only)
// Image upload endpoint for admin (accepts multipart/form-data with field name `image`)
router.post('/upload', protect, admin, upload.single('image'), uploadImage);
//
router.route('/').get(getProducts).post(protect, admin, createProduct);

// Static paths BEFORE /:id
router.route('/meta/categories').get(getCategories);
router.route('/admin').get(protect, admin, getAdminProducts);

// Optional auth: if Bearer token is admin, sold-out items can still load for editing
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  return next();
};

router
  .route('/:id')
  .get(optionalProtect, getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/availability').put(protect, admin, updateProductAvailability);

module.exports = router;
