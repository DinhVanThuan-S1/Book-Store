/**
 * ==============================================
 * PAYMENT API
 * ==============================================
 */

import axiosInstance from './axiosConfig';

/**
 * Xử lý thanh toán
 * @param {String} orderId
 * @param {Object} data - { paymentMethod }
 */
export const processPayment = (orderId, data) => {
  return axiosInstance.post(`/payments/${orderId}/process`, data);
};

/**
 * Lấy thông tin payment
 * @param {String} orderId
 */
export const getPayment = (orderId) => {
  return axiosInstance.get(`/payments/${orderId}`);
};

const paymentApi = {
  processPayment,
  getPayment,
};

export default paymentApi;