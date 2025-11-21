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

/**
 * Tạo nhà xuất bản mới
 */
export const createPublisher = (data) => {
  return axiosInstance.post('/publishers', data);
};

/**
 * Cập nhật nhà xuất bản
 */
export const updatePublisher = (id, data) => {
  return axiosInstance.put(`/publishers/${id}`, data);
};

/**
 * Xóa nhà xuất bản
 */
export const deletePublisher = (id) => {
  return axiosInstance.delete(`/publishers/${id}`);
};

/**
 * Lấy danh sách sách theo nhà xuất bản
 */
export const getPublisherBooks = (id) => {
  return axiosInstance.get(`/publishers/${id}/books`);
};

const publisherApi = {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
  getPublisherBooks,
};

export default publisherApi;