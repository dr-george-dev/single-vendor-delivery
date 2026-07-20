const mongoose = require('mongoose');

const CATEGORIES = ['Burgers', 'Pizza', 'Sides', 'Combos', 'Drinks'];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a current price'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: CATEGORIES,
    },
    image: {
      type: String,
      required: [true, 'Please add an image URL'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 5.0,
    },
    prepTime: {
      type: Number,
      required: [true, 'Please add estimated preparation time'],
      min: [1, 'Prep time must be at least 1 minute'],
    },
    calories: {
      type: Number,
    },
    tags: {
      type: [String],
      default: [],
    },
    /**
     * Soft "sold out" flag — kitchen can hide items without deleting history.
     * Public menu only returns isAvailable: true.
     */
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
