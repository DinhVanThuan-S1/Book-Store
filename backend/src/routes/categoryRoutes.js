/**
 * ==============================================
 * CATEGORY ROUTES - UPDATED
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  getCategoryBooks,
} = require('../controllers/categoryController');

/**
 * Validation
 */
const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional({ nullable: true, checkFalsy: true }).trim(),
  body('image').optional({ nullable: true, checkFalsy: true }),
];

/**
 * Public routes
 */
router.get('/', getCategories);
router.get('/stats', getCategoryStats);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id/books', getCategoryBooks);
router.get('/:id', getCategoryById);

/**
 * Admin routes
 */
router.post(
  '/',
  protect,
  adminOnly,
  categoryValidation,
  validate,
  createCategory
);

router.put(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid category ID'),
  categoryValidation,
  validate,
  updateCategory
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid category ID'),
  validate,
  deleteCategory
);

module.exports = router;