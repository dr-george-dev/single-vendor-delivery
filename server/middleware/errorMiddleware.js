// @desc    Handles 404 Not Found requests globally
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// @desc    Handles unexpected server errors globally
const errorHandler = (err, req, res, next) => {
  // If the status code is 200 (which means success), force it to 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message,
    // Only show stack trace in development mode for easy debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};