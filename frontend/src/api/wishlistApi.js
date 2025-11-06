/**
 * ==============================================
 * WISHLIST API
 * ==============================================
 */

import axiosInstance from './axiosConfig';

/**
 * Lấy wishlist
 */
export const getWishlist = () => {
  return axiosInstance.get('/wishlist');
};

/**
 * Thêm vào wishlist
 * @param {String} bookId
 */
export const addToWishlist = (bookId) => {
  return axiosInstance.post('/wishlist/items', { bookId });
};

/**
 * Xóa khỏi wishlist
 * @param {String} bookId
 */
export const removeFromWishlist = (bookId) => {
  return axiosInstance.delete(`/wishlist/items/${bookId}`);
};

/**
 * Chuyển tất cả sang giỏ hàng
 */
export const moveAllToCart = () => {
  return axiosInstance.post('/wishlist/move-to-cart');
};

/**
 * Kiểm tra sách có trong wishlist không
 * @param {String} bookId
 */
export const checkInWishlist = (bookId) => {
  return axiosInstance.get(`/wishlist/check/${bookId}`);
};

const wishlistApi = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveAllToCart,
  checkInWishlist,
};

export default wishlistApi;