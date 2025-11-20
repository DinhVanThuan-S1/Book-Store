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
const { customerOnly } = require('../middlewares/role');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getReviewableItems,
  requestReturn,
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
    .trim()
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

// Validation cho hoàn trả
const returnOrderValidation = [
  body('returnReason')
    .trim()
    .notEmpty()
    .withMessage('Return reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Return reason must be between 10 and 500 characters'),
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

// @route   GET /api/orders/:id/reviewable-items
// @desc    Lấy danh sách sách có thể review
// @access  Private/Customer
router.get(
  '/:id/reviewable-items',
  protect,
  customerOnly,
  param('id').isMongoId().withMessage('Invalid order ID'),
  validate,
  getReviewableItems
);

// @route   PUT /api/orders/:id/request-return
// @desc    Yêu cầu hoàn trả đơn hàng
// @access  Private/Customer
router.put(
  '/:id/request-return',
  protect,
  customerOnly,
  param('id').isMongoId().withMessage('Invalid order ID'),
  returnOrderValidation,
  validate,
  requestReturn
);

module.exports = router;