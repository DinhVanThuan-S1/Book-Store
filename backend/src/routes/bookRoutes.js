/**
 * ==============================================
 * BOOK ROUTES
 * ==============================================
 * Định nghĩa các API endpoints cho sách
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const {
  getBooks,
  getBookById,
  getBookBySlug,
  createBook,
  updateBook,
  deleteBook,
  toggleBookStatus,
  addBookCopies,
  getBookCopies,
} = require('../controllers/bookController');

/**
 * Validation Rules
 */

// Validation cho tạo/cập nhật sách
const bookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Book title is required'),
  body('author')
    .notEmpty()
    .withMessage('Author is required')
    .isMongoId()
    .withMessage('Invalid author ID'),
  body('publisher')
    .notEmpty()
    .withMessage('Publisher is required')
    .isMongoId()
    .withMessage('Invalid publisher ID'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('isbn')
    .optional()
    .trim()
    .isLength({ min: 10, max: 13 })
    .withMessage('ISBN must be 10-13 characters'),
  body('publishYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid publish year'),
  body('pages')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Pages must be a positive number'),
  body('language')
    .optional()
    .isIn(['Vietnamese', 'English', 'Other'])
    .withMessage('Invalid language'),
  body('format')
    .optional()
    .isIn(['hardcover', 'paperback', 'ebook'])
    .withMessage('Invalid format'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('originalPrice')
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  body('salePrice')
    .isFloat({ min: 0 })
    .withMessage('Sale price must be a positive number')
    .custom((value, { req }) => {
      if (value > req.body.originalPrice) {
        throw new Error('Sale price cannot be greater than original price');
      }
      return true;
    }),
];

// Validation cho thêm bản sao
const addCopiesValidation = [
  body('quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Quantity must be between 1 and 1000'),
  body('importPrice')
    .isFloat({ min: 0 })
    .withMessage('Import price must be a positive number'),
  body('condition')
    .optional()
    .isIn(['new', 'like_new', 'good'])
    .withMessage('Invalid condition'),
];

// Validation cho query parameters
const getBookQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
];

/**
 * Public Routes (không cần đăng nhập)
 */

// @route   GET /api/books
// @desc    Lấy danh sách sách (có filter, sort, paginate)
// @access  Public
router.get('/', getBookQueryValidation, validate, getBooks);

// @route   GET /api/books/slug/:slug
// @desc    Lấy sách theo slug
// @access  Public
router.get('/slug/:slug', getBookBySlug);

// @route   GET /api/books/:id
// @desc    Lấy chi tiết 1 sách
// @access  Public
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid book ID'),
  validate,
  getBookById
);

/**
 * Admin Routes (cần đăng nhập admin)
 */

// @route   POST /api/books
// @desc    Tạo sách mới
// @access  Private/Admin
router.post(
  '/',
  protect,
  adminOnly,
  bookValidation,
  validate,
  createBook
);

// @route   PUT /api/books/:id
// @desc    Cập nhật sách
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid book ID'),
  bookValidation,
  validate,
  updateBook
);

// @route   DELETE /api/books/:id
// @desc    Xóa sách (soft delete)
// @access  Private/Admin
router.delete(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid book ID'),
  validate,
  deleteBook
);

// @route   PATCH /api/books/:id/toggle-status
// @desc    Toggle trạng thái active/inactive của sách
// @access  Private/Admin
router.patch(
  '/:id/toggle-status',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid book ID'),
  validate,
  toggleBookStatus
);

// @route   POST /api/books/:id/copies
// @desc    Thêm bản sao sách
// @access  Private/Admin
router.post(
  '/:id/copies',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid book ID'),
  addCopiesValidation,
  validate,
  addBookCopies
);

// @route   GET /api/books/:id/copies
// @desc    Lấy danh sách bản sao của sách
// @access  Private/Admin
router.get(
  '/:id/copies',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid book ID'),
  validate,
  getBookCopies
);

module.exports = router;