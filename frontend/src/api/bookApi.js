/**
 * ==============================================
 * BOOK API
 * ==============================================
 * API calls liên quan đến sách
 */

import axiosInstance from './axiosConfig';
import { API_ENDPOINTS } from '@constants/apiEndpoints';

/**
 * Lấy danh sách sách
 * @param {Object} params - { page, limit, category, author, search, sortBy, ... }
 * @returns {Promise}
 */
export const getBooks = (params = {}) => {
  return axiosInstance.get(API_ENDPOINTS.BOOKS.GET_ALL, { params });
};

/**
 * Lấy chi tiết sách theo ID
 * @param {String} id - Book ID
 * @returns {Promise}
 */
export const getBookById = (id) => {
  return axiosInstance.get(API_ENDPOINTS.BOOKS.GET_BY_ID(id));
};

/**
 * Lấy sách theo slug
 * @param {String} slug - Book slug
 * @returns {Promise}
 */
export const getBookBySlug = (slug) => {
  return axiosInstance.get(API_ENDPOINTS.BOOKS.GET_BY_SLUG(slug));
};

/**
 * Tạo sách mới (Admin)
 * @param {Object} data - Book data
 * @returns {Promise}
 */
export const createBook = (data) => {
  return axiosInstance.post(API_ENDPOINTS.BOOKS.CREATE, data);
};

/**
 * Cập nhật sách (Admin)
 * @param {String} id - Book ID
 * @param {Object} data - Updated data
 * @returns {Promise}
 */
export const updateBook = (id, data) => {
  return axiosInstance.put(API_ENDPOINTS.BOOKS.UPDATE(id), data);
};

/**
 * Xóa sách (Admin)
 * @param {String} id - Book ID
 * @returns {Promise}
 */
export const deleteBook = (id) => {
  return axiosInstance.delete(API_ENDPOINTS.BOOKS.DELETE(id));
};

/**
 * Toggle trạng thái active/inactive của sách (Admin)
 * @param {String} id - Book ID
 * @returns {Promise}
 */
export const toggleBookStatus = (id) => {
  return axiosInstance.patch(`/books/${id}/toggle-status`);
};

/**
 * Thêm bản sao sách (Admin)
 * @param {String} id - Book ID
 * @param {Object} data - { quantity, importPrice, condition }
 * @returns {Promise}
 */
export const addBookCopies = (id, data) => {
  return axiosInstance.post(API_ENDPOINTS.BOOKS.ADD_COPIES(id), data);
};

const bookApi = {
  getBooks,
  getBookById,
  getBookBySlug,
  createBook,
  updateBook,
  deleteBook,
  toggleBookStatus,
  addBookCopies,
};

export default bookApi;