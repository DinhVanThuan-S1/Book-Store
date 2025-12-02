/**
 * ==============================================
 * CATEGORY API
 * ==============================================
 */

import axiosInstance from './axiosConfig';
import { API_ENDPOINTS } from '@constants/apiEndpoints';

export const getCategories = (params) => {
  return axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_ALL, { params });
};

export const getCategoryById = (id) => {
  return axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
};

export const createCategory = (data) => {
  return axiosInstance.post('/categories', data);
};

export const updateCategory = (id, data) => {
  return axiosInstance.put(`/categories/${id}`, data);
};

export const deleteCategory = (id) => {
  return axiosInstance.delete(`/categories/${id}`);
};

export const toggleCategoryStatus = (id) => {
  return axiosInstance.patch(`/categories/${id}/toggle-status`);
};

export const getCategoryBooks = (id, params) => {
  return axiosInstance.get(`/categories/${id}/books`, { params });
};

const categoryApi = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getCategoryBooks,
};

export default categoryApi;