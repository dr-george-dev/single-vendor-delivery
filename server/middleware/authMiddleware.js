const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in the Authorization header (must start with 'Bearer')
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (split "Bearer <token_string>" and grab index 1)
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user associated with the token and attach to req.user (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      // 4. Pass control to the next controller function
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token is provided
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };