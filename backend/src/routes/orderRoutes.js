/**
 * ==============================================
 * ORDER ROUTES
 * ==============================================
 * Định nghĩa các API endpoints cho đơn hàng
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { customerOnly, adminOnly } = require('../middlewares/role');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

/**
 * Validation Rules
 */

// Validation cho tạo đơn hàng
const createOrderValidation = [
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shippingAddress.recipientName')
    .trim()
    .notEmpty()
    .withMessage('Recipient name is required'),
  body('shippingAddress.phone')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Invalid phone number'),
  body('shippingAddress.province')
    .trim()
    .notEmpty()
    .withMessage('Province is required'),
  body('shippingAddress.district')
    .trim()
    .notEmpty()
    .withMessage('District is required'),
  body('shippingAddress.ward')
    .trim()
    .notEmpty()
    .withMessage('Ward is required'),
  body('shippingAddress.detailAddress')
    .trim()
    .notEmpty()
    .withMessage('Detail address is required'),
  body('paymentMethod')
    .isIn(['COD', 'bank_transfer', 'momo', 'zalopay', 'credit_card'])
    .withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

// Validation cho hủy đơn
const cancelOrderValidation = [
  body('cancelReason')
    .trim()
    .notEmpty()
    .withMessage('Cancel reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Cancel reason must be between 10 and 500 characters'),
];

// Validation cho cập nhật trạng thái (admin)
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
];

/**
 * Customer Routes
 */

// @route   POST /api/orders
// @desc    Tạo đơn hàng từ giỏ hàng
// @access  Private/Customer
router.post(
  '/',
  protect,
  customerOnly,
  createOrderValidation,
  validate,
  createOrder
);

// @route   GET /api/orders
// @desc    Lấy danh sách đơn hàng của customer
// @access  Private/Customer
router.get('/', protect, customerOnly, getMyOrders);

// @route   GET /api/orders/:id
// @desc    Lấy chi tiết 1 đơn hàng
// @access  Private/Customer hoặc Admin
router.get(
  '/:id',
  protect,
  param('id').isMongoId().withMessage('Invalid order ID'),
  validate,
  getOrderById
);

// @route   PUT /api/orders/:id/cancel
// @desc    Hủy đơn hàng
// @access  Private/Customer
router.put(
  '/:id/cancel',
  protect,
  customerOnly,
  param('id').isMongoId().withMessage('Invalid order ID'),
  cancelOrderValidation,
  validate,
  cancelOrder
);

/**
 * Admin Routes
 */

// @route   GET /api/admin/orders
// @desc    Lấy tất cả đơn hàng (Admin)
// @access  Private/Admin
router.get('/admin/all', protect, adminOnly, getAllOrders);

// @route   PUT /api/admin/orders/:id/status
// @desc    Cập nhật trạng thái đơn hàng (Admin)
// @access  Private/Admin
router.put(
  '/admin/:id/status',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid order ID'),
  updateStatusValidation,
  validate,
  updateOrderStatus
);

module.exports = router;