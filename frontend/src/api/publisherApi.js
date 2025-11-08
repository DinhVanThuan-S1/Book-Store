/**
 * ==============================================
 * PUBLISHER API
 * ==============================================
 */

import axiosInstance from './axiosConfig';

/**
 * Lấy tất cả nhà xuất bản
 */
export const getPublishers = (params = {}) => {
  return axiosInstance.get('/publishers', { params });
};

/**
 * Lấy chi tiết NXB
 */
export const getPublisherById = (id) => {
  return axiosInstance.get(`/publishers/${id}`);
};

const publisherApi = {
  getPublishers,
  getPublisherById,
};

export default publisherApi;