const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile, // <-- 1. Import profile controller
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // <-- 2. Import security middleware

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Protected routes (Only authorized users with valid JWTs can hit this)
router.route('/profile').get(protect, getUserProfile);

module.exports = router;