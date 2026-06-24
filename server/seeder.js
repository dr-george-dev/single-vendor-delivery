const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const products = require('./data/products');

// Load env variables so we have the MONGO_URI
dotenv.config();

// Connect to MongoDB
connectDB();

const importData = async () => {
  try {
    // 1. Wipe the products collection clean so we don't duplicate things
    await Product.deleteMany();

    // 2. Insert the array of dummy products
    await Product.insertMany(products);

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error with data import: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
importData();