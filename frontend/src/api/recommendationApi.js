/**
 * ==============================================
 * RECOMMENDATION API
 * ==============================================
 * API calls cho recommendation system
 */

import axiosInstance from './axiosConfig';

/**
 * Lấy gợi ý cá nhân hóa (Sách phù hợp với bạn)
 * Yêu cầu: Đã đăng nhập
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Số lượng sách gợi ý (default: 8)
 * @returns {Promise} Response với danh sách sách gợi ý
 * 
 * VÍ DỤ SỬ DỤNG:
 * const result = await recommendationApi.getPersonalizedRecommendations({ limit: 8 });
 * console.log(result.data.recommendations); // Array of books
 */
export const getPersonalizedRecommendations = async (params = {}) => {
  return await axiosInstance.get('/recommendations/personalized', { params });
};

/**
 * Lấy sách liên quan (Similar books)
 * Không yêu cầu đăng nhập
 * 
 * @param {string} bookId - ID của sách gốc
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Số lượng sách gợi ý (default: 8)
 * @returns {Promise} Response với danh sách sách tương tự
 * 
 * VÍ DỤ SỬ DỤNG:
 * const result = await recommendationApi.getSimilarBooks('507f1f77bcf86cd799439011', { limit: 8 });
 * console.log(result.data.recommendations); // Array of similar books
 */
export const getSimilarBooks = async (bookId, params = {}) => {
  return await axiosInstance.get(`/recommendations/similar/${bookId}`, { params });
};

/**
 * Lấy sách trending (Popular books)
 * Không yêu cầu đăng nhập
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Số lượng sách gợi ý (default: 8)
 * @returns {Promise} Response với danh sách sách trending
 * 
 * VÍ DỤ SỬ DỤNG:
 * const result = await recommendationApi.getTrendingBooks({ limit: 8 });
 * console.log(result.data.recommendations); // Array of trending books
 */
export const getTrendingBooks = async (params = {}) => {
  return await axiosInstance.get('/recommendations/trending', { params });
};

/**
 * Xóa cache recommendation (for testing/debugging)
 * Yêu cầu: Đã đăng nhập
 * 
 * @returns {Promise} Response xác nhận xóa cache
 */
export const clearRecommendationCache = async () => {
  return await axiosInstance.delete('/recommendations/cache');
};

export default {
  getPersonalizedRecommendations,
  getSimilarBooks,
  getTrendingBooks,
  clearRecommendationCache,
};
