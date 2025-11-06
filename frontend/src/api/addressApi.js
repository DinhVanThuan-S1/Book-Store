/**
 * ==============================================
 * ADDRESS API
 * ==============================================
 */

import axiosInstance from './axiosConfig';

/**
 * Lấy tất cả địa chỉ
 */
export const getMyAddresses = () => {
  return axiosInstance.get('/addresses');
};

/**
 * Lấy địa chỉ mặc định
 */
export const getDefaultAddress = () => {
  return axiosInstance.get('/addresses/default');
};

/**
 * Tạo địa chỉ mới
 * @param {Object} data
 */
export const createAddress = (data) => {
  return axiosInstance.post('/addresses', data);
};

/**
 * Cập nhật địa chỉ
 * @param {String} id
 * @param {Object} data
 */
export const updateAddress = (id, data) => {
  return axiosInstance.put(`/addresses/${id}`, data);
};

/**
 * Xóa địa chỉ
 * @param {String} id
 */
export const deleteAddress = (id) => {
  return axiosInstance.delete(`/addresses/${id}`);
};

/**
 * Set địa chỉ mặc định
 * @param {String} id
 */
export const setDefaultAddress = (id) => {
  return axiosInstance.put(`/addresses/${id}/set-default`);
};

const addressApi = {
  getMyAddresses,
  getDefaultAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

export default addressApi;