const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true, // Removes extra spaces at the beginning and end
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a current price'],
    },
    originalPrice: {
      type: Number, // Allows you to show discounts (e.g., $19.90 crossed out)
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      // We restrict this to the exact categories shown in your home screen screenshot
      enum: ['Burgers', 'Pizza', 'Sides', 'Combos', 'Drinks'], 
    },
    image: {
      type: String,
      required: [true, 'Please add an image URL'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 5.0, // Default to 5 stars for new items
    },
    prepTime: {
      type: Number, // Measured in minutes
      required: [true, 'Please add estimated preparation time'],
    },
    calories: {
      type: Number, // e.g., 895 Kcal
    },
    tags: {
      type: [String], // Array of strings so you can add multiple tags like ['Popular', 'First Order']
    },
  },
  {
    timestamps: true, // Automatically track when food items are added or updated
  }
);

module.exports = mongoose.model('Product', productSchema);