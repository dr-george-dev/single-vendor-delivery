const express = require('express');
const cors = require('cors'); // <-- 1. Import CORS middleware
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); // <-- 2. Import global error handlers

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) so your Expo React Native app can access your API
app.use(cors());

// Middleware to parse incoming JSON data
app.use(express.json());

// Mount the route files to their respective API paths
app.use('/api/products', productRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/orders', orderRoutes);

// Simple root test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Fallback error middlewares (Must be declared at the bottom, after all routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});