const { sendError } = require('../utils/apiResponse');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, messages.join(', '), 422);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`, 409);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return sendError(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File size too large.', 413);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') return sendError(res, 'Invalid token.', 401);
  if (err.name === 'TokenExpiredError') return sendError(res, 'Token expired.', 401);

  // Default
  return sendError(res, err.message || 'Internal server error', err.status || 500);
};

// 404 handler
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
