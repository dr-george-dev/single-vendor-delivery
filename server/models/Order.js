const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // 1. Who placed the order? (Links to the User schema)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    
    // 2. What did they buy? (An array of item snapshots)
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        // Link to the original product just in case we need it
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],

    // 3. Where is it going?
    deliveryAddress: {
      type: String,
      required: [true, 'Please add a delivery address'], // e.g., "172 Grand St, NY"
    },

    // 4. Payment & Pricing Details
    paymentMethod: {
      type: String,
      required: true,
      default: 'Card',
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0.0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 0.0, // Shows as "Free" in your screenshot
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    // 5. Order Tracking State
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'],
      default: 'Pending',
    },
    estimatedTime: {
      type: String,
      default: '25-35 min', // Matches your success screenshot
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);