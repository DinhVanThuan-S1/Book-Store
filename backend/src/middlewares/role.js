/**
 * ==============================================
 * ROLE MIDDLEWARE
 * ==============================================
 * Middleware kiểm tra quyền truy cập
 * Phân quyền Admin/Customer
 */

/**
 * Middleware: Chỉ cho phép Admin truy cập
 */
const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }
  next();
};

/**
 * Middleware: Chỉ cho phép Customer truy cập
 */
const customerOnly = (req, res, next) => {
  if (req.userRole !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer only.',
    });
  }
  next();
};

/**
 * Middleware: Cho phép cả Admin và Customer
 * (Dùng khi cả 2 role đều có thể truy cập)
 */
const authenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }
  next();
};

module.exports = {
  adminOnly,
  customerOnly,
  authenticated,
};