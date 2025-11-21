/**
 * ==============================================
 * AUTHOR API
 * ==============================================
 */

import axiosInstance from './axiosConfig';

/**
 * Lấy tất cả tác giả
 */
export const getAuthors = (params = {}) => {
  return axiosInstance.get('/authors', { params });
};

/**
 * Lấy chi tiết tác giả
 */
export const getAuthorById = (id) => {
  return axiosInstance.get(`/authors/${id}`);
};

/**
 * Tạo tác giả mới
 */
export const createAuthor = (data) => {
  return axiosInstance.post('/authors', data);
};

/**
 * Cập nhật tác giả
 */
export const updateAuthor = (id, data) => {
  return axiosInstance.put(`/authors/${id}`, data);
};

/**
 * Xóa tác giả
 */
export const deleteAuthor = (id) => {
  return axiosInstance.delete(`/authors/${id}`);
};

/**
 * Lấy danh sách sách của tác giả
 */
export const getAuthorBooks = (id, params) => {
  return axiosInstance.get(`/authors/${id}/books`, { params });
};

const authorApi = {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorBooks,
};

export default authorApi;