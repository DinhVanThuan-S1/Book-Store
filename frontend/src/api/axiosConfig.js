/**
 * ==============================================
 * AXIOS CONFIGURATION
 * ==============================================
 * Cấu hình Axios instance với interceptors
 */

import axios from 'axios';

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Tự động thêm token vào header mỗi request
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Xử lý response và errors tập trung
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Trả về data từ response
    return response.data;
  },
  (error) => {
    // Xử lý errors
    if (error.response) {
      // Server trả về error (4xx, 5xx)
      const { status, data } = error.response;
      
      // 401: Unauthorized - Token hết hạn hoặc không hợp lệ
      if (status === 401) {
        // Xóa token và redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // 403: Forbidden - Không có quyền truy cập
      if (status === 403) {
        console.error('Access denied');
      }
      
      // Trả về error message từ server
      return Promise.reject({
        message: data.message || 'Something went wrong',
        errors: data.errors || [],
      });
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Lỗi khác
      return Promise.reject({
        message: error.message || 'Something went wrong',
      });
    }
  }
);

export default axiosInstance;