import axiosInstance from './axiosConfig';

/**
 * Tạo đánh giá
 * @param {Object} data - { bookId, orderId, rating, title, comment, images }
 */
export const createReview = (data) => {
  console.log('reviewApi.createReview called with:', data);
  return axiosInstance.post('/reviews', data);
};

/**
 * Lấy reviews của sách
 * @param {String} bookId
 * @param {Object} params - { page, limit, sortBy }
 */
export const getBookReviews = (bookId, params = {}) => {
  return axiosInstance.get(`/reviews/book/${bookId}`, { params });
};

/**
 * Lấy rating statistics
 * @param {String} bookId
 */
export const getBookRatingStats = (bookId) => {
  return axiosInstance.get(`/reviews/book/${bookId}/stats`);
};

/**
 * Cập nhật review
 * @param {String} id
 * @param {Object} data
 */
export const updateReview = (id, data) => {
  return axiosInstance.put(`/reviews/${id}`, data);
};

/**
 * Xóa review
 * @param {String} id
 */
export const deleteReview = (id) => {
  return axiosInstance.delete(`/reviews/${id}`);
};

/**
 * Like review
 * @param {String} id
 */
export const likeReview = (id) => {
  return axiosInstance.put(`/reviews/${id}/like`);
};

const reviewApi = {
  createReview,
  getBookReviews,
  getBookRatingStats,
  updateReview,
  deleteReview,
  likeReview,
};

export default reviewApi;