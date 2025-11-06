/**
 * ==============================================
 * COMBO API
 * ==============================================
 */

import axiosInstance from './axiosConfig';

/**
 * Lấy danh sách combo
 * @param {Object} params
 */
export const getCombos = (params = {}) => {
  return axiosInstance.get('/combos', { params });
};

/**
 * Lấy chi tiết combo
 * @param {String} id
 */
export const getComboById = (id) => {
  return axiosInstance.get(`/combos/${id}`);
};

/**
 * Kiểm tra combo available
 * @param {String} id
 */
export const checkComboAvailability = (id) => {
  return axiosInstance.get(`/combos/${id}/availability`);
};

/**
 * Tạo combo mới (Admin)
 * @param {Object} data
 */
export const createCombo = (data) => {
  return axiosInstance.post('/combos', data);
};

/**
 * Cập nhật combo (Admin)
 * @param {String} id
 * @param {Object} data
 */
export const updateCombo = (id, data) => {
  return axiosInstance.put(`/combos/${id}`, data);
};

/**
 * Xóa combo (Admin)
 * @param {String} id
 */
export const deleteCombo = (id) => {
  return axiosInstance.delete(`/combos/${id}`);
};

const comboApi = {
  getCombos,
  getComboById,
  checkComboAvailability,
  createCombo,
  updateCombo,
  deleteCombo,
};

export default comboApi;