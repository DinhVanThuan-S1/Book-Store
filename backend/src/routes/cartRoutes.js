/**
 * ==============================================
 * CART ROUTES
 * ==============================================
 * Định nghĩa các API endpoints cho giỏ hàng
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { customerOnly } = require('../middlewares/role');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');

/**
 * Validation Rules
 */

// Validation cho thêm vào giỏ
const addToCartValidation = [
  body('type')
    .isIn(['book', 'combo'])
    .withMessage('Type must be "book" or "combo"'),
  body('bookId')
    .if(body('type').equals('book'))
    .notEmpty()
    .withMessage('Book ID is required')
    .isMongoId()
    .withMessage('Invalid book ID'),
  body('comboId')
    .if(body('type').equals('combo'))
    .notEmpty()
    .withMessage('Combo ID is required')
    .isMongoId()
    .withMessage('Invalid combo ID'),
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
];

// Validation cho cập nhật item
const updateCartItemValidation = [
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
];

/**
 * Routes (tất cả routes đều yêu cầu customer login)
 */

// Áp dụng middleware cho tất cả routes
router.use(protect, customerOnly);

// @route   GET /api/cart
// @desc    Lấy giỏ hàng của customer hiện tại
// @access  Private/Customer
router.get('/', getCart);

// @route   POST /api/cart/items
// @desc    Thêm sách/combo vào giỏ hàng
// @access  Private/Customer
router.post('/items', addToCartValidation, validate, addToCart);

// @route   PUT /api/cart/items/:itemId
// @desc    Cập nhật số lượng item trong giỏ
// @access  Private/Customer
router.put(
  '/items/:itemId',
  param('itemId').isMongoId().withMessage('Invalid item ID'),
  updateCartItemValidation,
  validate,
  updateCartItem
);

// @route   DELETE /api/cart/items/:itemId
// @desc    Xóa item khỏi giỏ hàng
// @access  Private/Customer
router.delete(
  '/items/:itemId',
  param('itemId').isMongoId().withMessage('Invalid item ID'),
  validate,
  removeCartItem
);

// @route   DELETE /api/cart/clear
// @desc    Xóa tất cả items trong giỏ
// @access  Private/Customer
router.delete('/clear', clearCart);

module.exports = router;