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

const authorApi = {
  getAuthors,
  getAuthorById,
};

export default authorApi;