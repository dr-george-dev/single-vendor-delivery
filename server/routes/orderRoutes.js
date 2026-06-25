const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getMyOrders,
  getOrders,
  getOrderById
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Route for creating an order (POST /api/orders) and fetching all orders (GET /api/orders)
// Note: We'll put our protection middleware on both, but ideally, getOrders should have an admin check too!
router.route('/')
  .post(protect, addOrderItems)
  .get(protect, getOrders);

// Route for getting the logged-in user's orders (GET /api/orders/myorders)
router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

module.exports = router;