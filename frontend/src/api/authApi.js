/**
 * ==============================================
 * AUTH API
 * ==============================================
 * API calls liên quan đến authentication
 */

import axiosInstance from './axiosConfig';
import { API_ENDPOINTS } from '@constants/apiEndpoints';

/**
 * Đăng ký customer
 * @param {Object} data - { email, password, fullName, phone }
 * @returns {Promise}
 */
export const register = (data) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, data);
};

/**
 * Đăng nhập customer
 * @param {Object} credentials - { email, password }
 * @returns {Promise}
 */
export const login = (credentials) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
};

/**
 * Đăng nhập admin
 * @param {Object} credentials - { email, password }
 * @returns {Promise}
 */
export const loginAdmin = (credentials) => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN_ADMIN, credentials);
};

/**
 * Lấy thông tin user hiện tại
 * @returns {Promise}
 */
export const getMe = () => {
  return axiosInstance.get(API_ENDPOINTS.AUTH.ME);
};

/**
 * Đổi mật khẩu
 * @param {Object} data - { currentPassword, newPassword }
 * @returns {Promise}
 */
export const changePassword = (data) => {
  return axiosInstance.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
};

/**
 * Đăng xuất
 * @returns {Promise}
 */
export const logout = () => {
  return axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
};

// Export tất cả
const authApi = {
  register,
  login,
  loginAdmin,
  getMe,
  changePassword,
  logout,
};

export default authApi;