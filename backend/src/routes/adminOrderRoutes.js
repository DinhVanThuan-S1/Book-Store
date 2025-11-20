/**
 * ==============================================
 * ADMIN ORDER ROUTES
 * ==============================================
 * Định nghĩa các API endpoints cho quản lý đơn hàng (Admin)
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const {
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  confirmReturn,
} = require('../controllers/orderController');

/**
 * Validation Rules
 */

// Validation cho cập nhật trạng thái
const updateStatusValidation = [
  body('status')
    .isIn([
      'pending',
      'confirmed',
      'preparing',
      'shipping',
      'delivered',
      'cancelled',
      'returned',
    ])
    .withMessage('Invalid status'),
  body('cancelReason')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Cancel reason must be between 10 and 500 characters'),
];

/**
 * Admin Routes
 */

// @route   GET /api/admin/orders
// @desc    Lấy tất cả đơn hàng (Admin)
// @access  Private/Admin
router.get('/', protect, adminOnly, getAllOrders);

// @route   GET /api/admin/orders/:id
// @desc    Lấy chi tiết 1 đơn hàng (Admin)
// @access  Private/Admin
router.get(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid order ID'),
  validate,
  getOrderById
);

// @route   PUT /api/admin/orders/:id/status
// @desc    Cập nhật trạng thái đơn hàng (Admin)
// @access  Private/Admin
router.put(
  '/:id/status',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid order ID'),
  updateStatusValidation,
  validate,
  updateOrderStatus
);

// @route   PUT /api/admin/orders/:id/confirm-return
// @desc    Xác nhận hoàn trả đơn hàng (Admin)
// @access  Private/Admin
router.put(
  '/:id/confirm-return',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid order ID'),
  validate,
  confirmReturn
);

module.exports = router;
