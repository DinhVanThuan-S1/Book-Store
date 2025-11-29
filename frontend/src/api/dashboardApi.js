/**
 * ==============================================
 * DASHBOARD API (Admin)
 * ==============================================
 */

import axiosInstance from './axiosConfig';

/**
 * Lấy thống kê tổng quan
 */
export const getOverviewStats = () => {
  return axiosInstance.get('/admin/dashboard/overview');
};

/**
 * Lấy dữ liệu doanh thu
 * @param {Object} params - { startDate, endDate, groupBy }
 */
export const getRevenueStats = (params = {}) => {
  return axiosInstance.get('/admin/dashboard/revenue', { params });
};

/**
 * Lấy sách bán chạy
 * @param {Number} limit
 */
export const getTopBooks = (limit = 10) => {
  return axiosInstance.get('/admin/dashboard/top-books', {
    params: { limit },
  });
};

/**
 * Lấy thống kê đơn hàng
 */
export const getOrderStats = () => {
  return axiosInstance.get('/admin/dashboard/order-stats');
};

/**
 * Lấy số khách hàng mới
 */
export const getNewCustomers = () => {
  return axiosInstance.get('/admin/dashboard/new-customers');
};

/**
 * Lấy báo cáo chi tiết
 * @param {Object} params - { startDate, endDate }
 */
export const getDetailedReports = (params = {}) => {
  return axiosInstance.get('/admin/dashboard/reports', { params });
};

const dashboardApi = {
  getOverviewStats,
  getRevenueStats,
  getTopBooks,
  getOrderStats,
  getNewCustomers,
  getDetailedReports,
};

export default dashboardApi;