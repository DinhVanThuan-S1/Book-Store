/**
 * ==============================================
 * ERROR HANDLER MIDDLEWARE
 * ==============================================
 * Middleware xử lý lỗi tập trung
 * Catch tất cả errors và trả về response thống nhất
 */

/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    const errors = Object.values(err.errors).map(e => e.message);
    
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
    const field = Object.keys(err.keyPattern)[0];
    
    return res.status(statusCode).json({
      success: false,
      message: `${field} already exists`,
    });
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Async Handler Wrapper
 * Bọc async functions để tự động catch errors
 * @param {Function} fn - Async function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
};