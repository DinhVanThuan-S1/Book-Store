/**
 * ==============================================
 * AUTH MIDDLEWARE
 * ==============================================
 * Middleware kiểm tra JWT token
 * Xác thực người dùng trước khi access protected routes
 */

const { verifyToken } = require('../utils/jwt');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');

/**
 * Middleware: Xác thực token
 * Gắn user vào req.user để sử dụng trong controller
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Lấy token từ header Authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Format: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Kiểm tra token có tồn tại không
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Lấy thông tin user từ DB (dựa vào role trong token)
    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.role === 'customer') {
      user = await Customer.findById(decoded.id).select('-password');
    }
    
    // Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Kiểm tra user có active không (chỉ cho customer)
    if (decoded.role === 'customer' && !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }
    
    // Gắn user vào request
    req.user = user;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    return res.status(401).json({
      success: false,
      message: error.message || 'Not authorized, token failed',
    });
  }
};

module.exports = { protect };