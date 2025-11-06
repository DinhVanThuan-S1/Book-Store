/**
 * ==============================================
 * REVIEW ROUTES
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { customerOnly, adminOnly } = require('../middlewares/role');
const {
  createReview,
  getBookReviews,
  getBookRatingStats,
  updateReview,
  deleteReview,
  likeReview,
  toggleReviewVisibility,
} = require('../controllers/reviewController');

/**
 * Validation
 */
const createReviewValidation = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isMongoId()
    .withMessage('Invalid book ID'),
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters'),
  body('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 images allowed'),
];

/**
 * Routes
 */

// Public routes
router.get('/book/:bookId', getBookReviews);
router.get('/book/:bookId/stats', getBookRatingStats);

// Customer routes
router.post(
  '/',
  protect,
  customerOnly,
  createReviewValidation,
  validate,
  createReview
);

router.put(
  '/:id',
  protect,
  customerOnly,
  param('id').isMongoId().withMessage('Invalid review ID'),
  validate,
  updateReview
);

router.delete(
  '/:id',
  protect,
  customerOnly,
  param('id').isMongoId().withMessage('Invalid review ID'),
  validate,
  deleteReview
);

router.put(
  '/:id/like',
  protect,
  param('id').isMongoId().withMessage('Invalid review ID'),
  validate,
  likeReview
);

// Admin routes
router.put(
  '/admin/:id/toggle-visibility',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid review ID'),
  validate,
  toggleReviewVisibility
);

module.exports = router;