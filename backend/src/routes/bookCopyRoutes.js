/**
 * ==============================================
 * BOOK COPY ROUTES
 * ==============================================
 * Định nghĩa các API endpoints cho quản lý bản sao sách
 * Author: DinhVanThuan-S1
 * Date: 2025-11-28
 */

const express = require('express');
const router = express.Router();
const { param, body, query } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const {
  getAllBookCopies,
  getBookCopyById,
  updateBookCopy,
  deleteBookCopy,
  getBookCopyStatsByBook,
} = require('../controllers/bookCopyController');

/**
 * Validation Rules
 */

// Validation cho query parameters
const getBookCopiesQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['available', 'reserved', 'sold', 'damaged', 'returned'])
    .withMessage('Invalid status'),
  query('condition')
    .optional()
    .isIn(['new', 'like_new', 'good'])
    .withMessage('Invalid condition'),
];

// Validation cho update book copy
const updateBookCopyValidation = [
  body('status')
    .optional()
    .isIn(['available', 'reserved', 'sold', 'damaged', 'returned'])
    .withMessage('Invalid status'),
  body('condition')
    .optional()
    .isIn(['new', 'like_new', 'good'])
    .withMessage('Invalid condition'),
  body('warehouseLocation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Warehouse location must not exceed 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

/**
 * Routes (Tất cả đều yêu cầu Admin)
 */

// @route   GET /api/book-copies
// @desc    Lấy danh sách tất cả bản sao
// @access  Private/Admin
router.get(
  '/',
  protect,
  adminOnly,
  getBookCopiesQueryValidation,
  validate,
  getAllBookCopies
);

// @route   GET /api/book-copies/stats/by-book
// @desc    Thống kê bản sao theo sách
// @access  Private/Admin
router.get(
  '/stats/by-book',
  protect,
  adminOnly,
  getBookCopyStatsByBook
);

// @route   GET /api/book-copies/:id
// @desc    Lấy chi tiết 1 bản sao
// @access  Private/Admin
router.get(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid book copy ID'),
  validate,
  getBookCopyById
);

// @route   PUT /api/book-copies/:id
// @desc    Cập nhật bản sao
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid book copy ID'),
  updateBookCopyValidation,
  validate,
  updateBookCopy
);

// @route   DELETE /api/book-copies/:id
// @desc    Xóa bản sao
// @access  Private/Admin
router.delete(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid book copy ID'),
  validate,
  deleteBookCopy
);

module.exports = router;
