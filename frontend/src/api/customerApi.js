/**
 * ==============================================
 * CUSTOMER API
 * ==============================================
 * API endpoints cho quản lý khách hàng (Admin)
 */

import axiosInstance from './axiosConfig';

const customerApi = {
  /**
   * Lấy danh sách khách hàng (Admin)
   * @param {Object} params - { page, limit, search, isActive, sortBy }
   * @returns {Promise}
   */
  getCustomers: (params = {}) => {
    return axiosInstance.get('/admin/customers', { params });
  },

  /**
   * Lấy chi tiết khách hàng (Admin)
   * @param {String} customerId
   * @returns {Promise}
   */
  getCustomerById: (customerId) => {
    return axiosInstance.get(`/admin/customers/${customerId}`);
  },

  /**
   * Tạo khách hàng mới (Admin)
   * @param {Object} customerData
   * @returns {Promise}
   */
  createCustomer: (customerData) => {
    return axiosInstance.post('/admin/customers', customerData);
  },

  /**
   * Cập nhật thông tin khách hàng (Admin)
   * @param {String} customerId
   * @param {Object} customerData
   * @returns {Promise}
   */
  updateCustomer: (customerId, customerData) => {
    return axiosInstance.put(`/admin/customers/${customerId}`, customerData);
  },

  /**
   * Bật/Tắt trạng thái khách hàng (Admin)
   * @param {String} customerId
   * @returns {Promise}
   */
  toggleCustomerActive: (customerId) => {
    return axiosInstance.put(`/admin/customers/${customerId}/toggle-active`);
  },

  /**
   * Xóa khách hàng (Admin)
   * @param {String} customerId
   * @returns {Promise}
   */
  deleteCustomer: (customerId) => {
    return axiosInstance.delete(`/admin/customers/${customerId}`);
  },

  /**
   * Lấy lịch sử đơn hàng của khách hàng (Admin)
   * @param {String} customerId
   * @param {Object} params - { page, limit, status }
   * @returns {Promise}
   */
  getCustomerOrders: (customerId, params = {}) => {
    return axiosInstance.get(`/admin/customers/${customerId}/orders`, { params });
  },

  /**
   * Lấy lịch sử đánh giá của khách hàng (Admin)
   * @param {String} customerId
   * @param {Object} params - { page, limit }
   * @returns {Promise}
   */
  getCustomerReviews: (customerId, params = {}) => {
    return axiosInstance.get(`/admin/customers/${customerId}/reviews`, { params });
  },
};

export default customerApi;
