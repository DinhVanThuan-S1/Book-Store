/**
 * ==============================================
 * ORDER API
 * ==============================================
 */

import axiosInstance from './axiosConfig';
import { API_ENDPOINTS } from '@constants/apiEndpoints';

/**
 * Tạo đơn hàng
 * @param {Object} data - { shippingAddress, paymentMethod, notes }
 */
export const createOrder = (data) => {
  return axiosInstance.post(API_ENDPOINTS.ORDERS.CREATE, data);
};

/**
 * Lấy danh sách đơn hàng của tôi
 * @param {Object} params - { page, limit, status }
 */
export const getMyOrders = (params = {}) => {
  return axiosInstance.get(API_ENDPOINTS.ORDERS.GET_MY_ORDERS, { params });
};

/**
 * Lấy chi tiết đơn hàng
 * @param {String} id
 */
export const getOrderById = (id) => {
  return axiosInstance.get(API_ENDPOINTS.ORDERS.GET_BY_ID(id));
};

/**
 * Hủy đơn hàng
 * @param {String} id
 * @param {String} cancelReason
 */
export const cancelOrder = (id, cancelReason) => {
  return axiosInstance.put(API_ENDPOINTS.ORDERS.CANCEL(id), {
    cancelReason,
  });
};

/**
 * Lấy tất cả đơn hàng (Admin)
 * @param {Object} params
 */
export const getAllOrders = (params = {}) => {
  return axiosInstance.get(API_ENDPOINTS.ORDERS.GET_ALL, { params });
};

/**
 * Cập nhật trạng thái đơn hàng (Admin)
 * @param {String} id
 * @param {String} status
 * @param {String} cancelReason - Lý do hủy (optional, chỉ khi status = cancelled)
 */
export const updateOrderStatus = (id, status, cancelReason = null) => {
  const data = { status };
  if (cancelReason) {
    data.cancelReason = cancelReason;
  }
  return axiosInstance.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), data);
};

/**
 * Lấy danh sách sách có thể review từ đơn hàng
 * @param {String} id - Order ID
 */
export const getReviewableItems = (id) => {
  return axiosInstance.get(API_ENDPOINTS.ORDERS.GET_REVIEWABLE_ITEMS(id));
};

/**
 * Yêu cầu hoàn trả đơn hàng
 * @param {String} id - Order ID
 * @param {String} returnReason - Lý do hoàn trả
 */
export const requestReturn = (id, returnReason) => {
  return axiosInstance.put(API_ENDPOINTS.ORDERS.REQUEST_RETURN(id), {
    returnReason,
  });
};

/**
 * Xác nhận hoàn trả đơn hàng (Admin)
 * @param {String} id - Order ID
 */
export const confirmReturn = (id) => {
  return axiosInstance.put(`/admin/orders/${id}/confirm-return`);
};

const orderApi = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getReviewableItems,
  requestReturn,
  confirmReturn,
};

export default orderApi;