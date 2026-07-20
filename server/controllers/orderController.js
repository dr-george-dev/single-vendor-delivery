const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const { orderItems, deliveryAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    // 1. Double-check and calculate prices securely on the server
    // We look up each item in the database to get its true price, preventing tampering
    let subtotal = 0;
    const verifiedOrderItems = [];

    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product);
      
      if (!dbProduct) {
        return res.status(404).json({ message: `Product not found with ID: ${item.product}` });
      }

      // Kitchen sold-out items cannot be ordered
      if (dbProduct.isAvailable === false) {
        return res.status(400).json({
          message: `"${dbProduct.name}" is currently unavailable`,
        });
      }

      const qty = Number(item.qty);
      if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: `Invalid quantity for product ${dbProduct._id}` });
      }

      const itemPrice = dbProduct.price;
      subtotal += itemPrice * qty;

      // Create a snapshot of the item details at purchase time
      verifiedOrderItems.push({
        name: dbProduct.name,
        qty,
        image: dbProduct.image,
        price: itemPrice,
        product: dbProduct._id,
      });
    }

    // 2. Calculate Delivery Fee (Free if subtotal is over $40, otherwise $5.00)
    const deliveryFee = subtotal > 40 ? 0 : 5.0;
    const totalPrice = subtotal + deliveryFee;

    // 3. Create and save the order in MongoDB
    const order = new Order({
      user: req.user._id, // Set by our Auth Middleware
      orderItems: verifiedOrderItems,
      deliveryAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      totalPrice,
      // Payment must be verified by a real provider before marking as paid
      isPaid: false,
      paidAt: undefined,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during order creation' });
  }
};

// @desc    Get logged-in user's orders (Order History)
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    // Find all orders belonging to the logged-in user
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving your orders' });
  }
};

// Allowed kitchen workflow statuses (must match Order model enum)
const VALID_STATUSES = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

// Natural next step for one-tap "Advance" on the kitchen board
const NEXT_STATUS = {
  Pending: 'Preparing',
  Preparing: 'Out for Delivery',
  'Out for Delivery': 'Delivered',
  Delivered: null,
};

// @desc    Get all orders (Kitchen board)
// @route   GET /api/orders
// @access  Private/Admin
// @query   status=Pending|Preparing|...  (optional filter)
// @query   active=true                   (optional: exclude Delivered)
const getOrders = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    } else if (req.query.active === 'true') {
      filter.status = { $ne: 'Delivered' };
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving all orders' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOwner =
      order.user &&
      order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving order' });
  }
};

// @desc    Update order status (Kitchen board)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
// Body: { status: "Preparing" }  OR  { advance: true } to move to next step
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let nextStatus = req.body.status;

    // One-tap advance: Pending → Preparing → Out for Delivery → Delivered
    if (req.body.advance === true) {
      nextStatus = NEXT_STATUS[order.status];
      if (!nextStatus) {
        return res.status(400).json({
          message: 'Order is already Delivered — no further status',
        });
      }
    }

    if (!nextStatus || !VALID_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        message: `Invalid status. Use one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    order.status = nextStatus;
    const updated = await order.save();

    // Re-populate after save for consistent kitchen UI payload
    const hydrated = await Order.findById(updated._id).populate('user', 'name email');
    res.json(hydrated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrders,
  getOrderById,
  updateOrderStatus,
  VALID_STATUSES,
  NEXT_STATUS,
};