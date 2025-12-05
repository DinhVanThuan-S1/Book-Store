/**
 * ==============================================
 * RECOMMENDATION CONTROLLER
 * ==============================================
 * Xử lý API requests cho recommendation system
 */

const {
  getPersonalizedRecommendations,
  getSimilarBooks,
  getTrendingBooks,
  saveRecommendationCache,
  getRecommendationCache,
} = require('../services/recommendationService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @desc    Lấy gợi ý cá nhân hóa cho customer (Sách phù hợp với bạn)
 * @route   GET /api/recommendations/personalized
 * @access  Private/Customer
 * 
 * VÍ DỤ REQUEST:
 * GET /api/recommendations/personalized?limit=8
 * Headers: { Authorization: "Bearer <token>" }
 * 
 * VÍ DỤ RESPONSE:
 * {
 *   success: true,
 *   data: {
 *     recommendations: [
 *       {
 *         book: { _id, title, images, salePrice, ... },
 *         score: 0.8523,
 *         reason: "Based on your interests"
 *       }
 *     ],
 *     algorithm: "hybrid",
 *     isCached: false
 *   }
 * }
 */
const getPersonalizedRecommendationsController = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const { limit = 8 } = req.query;
  
  try {
    // 1. Kiểm tra cache
    const cached = await getRecommendationCache(customerId, 'personalized');
    
    if (cached && cached.recommendedBooks.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          recommendations: cached.recommendedBooks,
          algorithm: cached.algorithm,
          isCached: true,
          cachedAt: cached.generatedAt,
        },
      });
    }
    
    // 2. Generate mới
    const recommendations = await getPersonalizedRecommendations(
      customerId, 
      parseInt(limit)
    );
    
    // 3. Lưu cache (nếu có kết quả)
    if (recommendations.length > 0) {
      await saveRecommendationCache(customerId, 'personalized', null, recommendations);
    }
    
    // 4. Format response
    const formattedRecommendations = recommendations.map(rec => ({
      book: rec.bookData,
      score: rec.score,
      reason: rec.reason,
    }));
    
    res.status(200).json({
      success: true,
      data: {
        recommendations: formattedRecommendations,
        algorithm: 'hybrid',
        isCached: false,
      },
    });
    
  } catch (error) {
    console.error('Error in getPersonalizedRecommendationsController:', error);
    
    // Fallback: trả về trending books
    const trending = await getTrendingBooks(parseInt(limit));
    const formattedTrending = trending.map(rec => ({
      book: rec.bookData,
      score: rec.score,
      reason: rec.reason,
    }));
    
    res.status(200).json({
      success: true,
      data: {
        recommendations: formattedTrending,
        algorithm: 'trending',
        isCached: false,
      },
    });
  }
});

/**
 * @desc    Lấy sách liên quan (Similar books)
 * @route   GET /api/recommendations/similar/:bookId
 * @access  Public
 * 
 * VÍ DỤ REQUEST:
 * GET /api/recommendations/similar/507f1f77bcf86cd799439011?limit=8
 * 
 * VÍ DỤ RESPONSE:
 * {
 *   success: true,
 *   data: {
 *     recommendations: [
 *       {
 *         book: { ... },
 *         score: 0.9234,
 *         reason: "Same category and author"
 *       }
 *     ]
 *   }
 * }
 */
const getSimilarBooksController = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { limit = 8 } = req.query;
  
  try {
    // 1. Kiểm tra cache (public cache)
    const cached = await getRecommendationCache(null, 'similar', bookId);
    
    if (cached && cached.recommendedBooks.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          recommendations: cached.recommendedBooks,
          isCached: true,
        },
      });
    }
    
    // 2. Generate mới
    const recommendations = await getSimilarBooks(bookId, parseInt(limit));
    
    // 3. Lưu cache
    if (recommendations.length > 0) {
      await saveRecommendationCache(null, 'similar', bookId, recommendations);
    }
    
    // 4. Format response
    const formattedRecommendations = recommendations.map(rec => ({
      book: rec.bookData,
      score: rec.score,
      reason: rec.reason,
    }));
    
    res.status(200).json({
      success: true,
      data: {
        recommendations: formattedRecommendations,
        isCached: false,
      },
    });
    
  } catch (error) {
    console.error('Error in getSimilarBooksController:', error);
    
    res.status(200).json({
      success: true,
      data: {
        recommendations: [],
      },
    });
  }
});

/**
 * @desc    Lấy sách trending (Popular books)
 * @route   GET /api/recommendations/trending
 * @access  Public
 * 
 * VÍ DỤ REQUEST:
 * GET /api/recommendations/trending?limit=8
 * 
 * VÍ DỤ RESPONSE:
 * {
 *   success: true,
 *   data: {
 *     recommendations: [
 *       {
 *         book: { ... },
 *         score: 45.2341,
 *         reason: "Trending book"
 *       }
 *     ]
 *   }
 * }
 */
const getTrendingBooksController = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  
  try {
    // Kiểm tra cache (public, no customer)
    const cached = await getRecommendationCache(null, 'trending');
    
    if (cached && cached.recommendedBooks.length > 0) {
      return res.status(200).json({
        success: true,
        data: {
          recommendations: cached.recommendedBooks,
          isCached: true,
        },
      });
    }
    
    // Generate mới
    const recommendations = await getTrendingBooks(parseInt(limit));
    
    // Lưu cache (24 giờ)
    if (recommendations.length > 0) {
      await saveRecommendationCache(null, 'trending', null, recommendations);
    }
    
    // Format response
    const formattedRecommendations = recommendations.map(rec => ({
      book: rec.bookData,
      score: rec.score,
      reason: rec.reason,
    }));
    
    res.status(200).json({
      success: true,
      data: {
        recommendations: formattedRecommendations,
        isCached: false,
      },
    });
    
  } catch (error) {
    console.error('Error in getTrendingBooksController:', error);
    
    res.status(200).json({
      success: true,
      data: {
        recommendations: [],
      },
    });
  }
});

/**
 * @desc    Xóa cache recommendation của customer (for testing/debugging)
 * @route   DELETE /api/recommendations/cache
 * @access  Private/Customer
 */
const clearRecommendationCache = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  
  const Recommendation = require('../models/Recommendation');
  await Recommendation.deleteMany({ customer: customerId });
  
  res.status(200).json({
    success: true,
    message: 'Recommendation cache cleared',
  });
});

module.exports = {
  getPersonalizedRecommendationsController,
  getSimilarBooksController,
  getTrendingBooksController,
  clearRecommendationCache,
};
