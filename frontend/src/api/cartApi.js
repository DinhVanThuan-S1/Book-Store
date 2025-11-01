/**
 * ==============================================
 * CART API
 * ==============================================
 */

import axiosInstance from './axiosConfig';
import { API_ENDPOINTS } from '@constants/apiEndpoints';

/**
 * Lấy giỏ hàng
 */
export const getCart = () => {
  return axiosInstance.get(API_ENDPOINTS.CART.GET);
};

/**
 * Thêm vào giỏ hàng
 * @param {Object} data - { type, bookId/comboId, quantity }
 */
export const addToCart = (data) => {
  return axiosInstance.post(API_ENDPOINTS.CART.ADD_ITEM, data);
};

/**
 * Cập nhật số lượng item
 * @param {String} itemId
 * @param {Number} quantity
 */
export const updateCartItem = (itemId, quantity) => {
  return axiosInstance.put(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), {
    quantity,
  });
};

/**
 * Xóa item khỏi giỏ
 * @param {String} itemId
 */
export const removeCartItem = (itemId) => {
  return axiosInstance.delete(API_ENDPOINTS.CART.REMOVE_ITEM(itemId));
};

/**
 * Xóa toàn bộ giỏ hàng
 */
export const clearCart = () => {
  return axiosInstance.delete(API_ENDPOINTS.CART.CLEAR);
};

const cartApi = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};

export default cartApi;