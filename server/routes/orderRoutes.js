const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getMyOrders,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Customer places order | Kitchen lists all orders
router
  .route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

// Customer order history (must be registered BEFORE /:id)
router.route('/myorders').get(protect, getMyOrders);

// Kitchen advances status (must be before bare /:id if you add more sub-routes)
router.route('/:id/status').put(protect, admin, updateOrderStatus);

// Customer or admin can view a single order
router.route('/:id').get(protect, getOrderById);

module.exports = router;
