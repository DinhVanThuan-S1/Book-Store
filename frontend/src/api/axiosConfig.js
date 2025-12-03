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
      
      // Log error để debug
      console.error('API Error Response:', {
        status,
        data,
        url: error.config?.url,
        method: error.config?.method,
      });
      
      // 401: Unauthorized - Token hết hạn hoặc không hợp lệ
      if (status === 401) {
        // Chỉ redirect về login nếu KHÔNG PHẢI đang ở trang login/register
        const isAuthPage = window.location.pathname.includes('/login') || 
                          window.location.pathname.includes('/register');
        
        if (!isAuthPage) {
          // Token hết hạn - xóa và redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      
      // 403: Forbidden - Không có quyền truy cập
      if (status === 403) {
        console.error('Access denied');
      }
      
      // Tạo error object với structure nhất quán
      const errorObj = new Error(data.message || 'Something went wrong');
      errorObj.response = error.response;
      errorObj.data = data;
      errorObj.errors = data.errors || [];
      
      return Promise.reject(errorObj);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      const errorObj = new Error('Network error. Please check your connection.');
      errorObj.request = error.request;
      return Promise.reject(errorObj);
    } else {
      // Lỗi khác
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;