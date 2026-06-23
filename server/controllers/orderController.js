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

      const itemPrice = dbProduct.price;
      subtotal += itemPrice * item.qty;

      // Create a snapshot of the item details at purchase time
      verifiedOrderItems.push({
        name: dbProduct.name,
        qty: item.qty,
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
      isPaid: true, // Assuming card payment went through successfully on the mobile end
      paidAt: Date.now(),
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

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    // Find all orders in the system, populate user details (name and email)
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving all orders' });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrders,
};