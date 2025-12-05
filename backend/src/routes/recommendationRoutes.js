/**
 * ==============================================
 * RECOMMENDATION ROUTES
 * ==============================================
 * API endpoints cho recommendation system
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { customerOnly } = require('../middlewares/role');
const {
  getPersonalizedRecommendationsController,
  getSimilarBooksController,
  getTrendingBooksController,
  clearRecommendationCache,
} = require('../controllers/recommendationController');

/**
 * @route   GET /api/recommendations/personalized
 * @desc    Lấy gợi ý cá nhân hóa (Sách phù hợp với bạn)
 * @access  Private/Customer
 * @params  ?limit=8 (optional)
 */
router.get('/personalized', protect, customerOnly, getPersonalizedRecommendationsController);

/**
 * @route   GET /api/recommendations/similar/:bookId
 * @desc    Lấy sách liên quan
 * @access  Public
 * @params  :bookId (required), ?limit=8 (optional)
 */
router.get('/similar/:bookId', getSimilarBooksController);

/**
 * @route   GET /api/recommendations/trending
 * @desc    Lấy sách trending
 * @access  Public
 * @params  ?limit=8 (optional)
 */
router.get('/trending', getTrendingBooksController);

/**
 * @route   DELETE /api/recommendations/cache
 * @desc    Xóa cache recommendation (for testing)
 * @access  Private/Customer
 */
router.delete('/cache', protect, customerOnly, clearRecommendationCache);

module.exports = router;
