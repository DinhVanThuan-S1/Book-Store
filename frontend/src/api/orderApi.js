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
 */
export const updateOrderStatus = (id, status) => {
  return axiosInstance.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), {
    status,
  });
};

const orderApi = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};

export default orderApi;