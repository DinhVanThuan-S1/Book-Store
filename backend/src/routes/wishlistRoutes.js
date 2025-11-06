/**
 * ==============================================
 * WISHLIST ROUTES
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { customerOnly } = require('../middlewares/role');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveAllToCart,
  checkInWishlist,
} = require('../controllers/wishlistController');

/**
 * All routes require customer authentication
 */
router.use(protect, customerOnly);

/**
 * Routes
 */
router.get('/', getWishlist);

router.post(
  '/items',
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isMongoId()
    .withMessage('Invalid book ID'),
  validate,
  addToWishlist
);

router.delete(
  '/items/:bookId',
  param('bookId').isMongoId().withMessage('Invalid book ID'),
  validate,
  removeFromWishlist
);

router.post('/move-to-cart', moveAllToCart);

router.get(
  '/check/:bookId',
  param('bookId').isMongoId().withMessage('Invalid book ID'),
  validate,
  checkInWishlist
);

module.exports = router;