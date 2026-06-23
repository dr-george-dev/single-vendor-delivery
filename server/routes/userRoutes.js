const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
} = require('../controllers/userController');

// Route for register (POST /api/users)
router.post('/', registerUser);

// Route for login (POST /api/users/login)
router.post('/login', loginUser);

module.exports = router;