/**
 * ==============================================
 * CATEGORY API
 * ==============================================
 */

import axiosInstance from './axiosConfig';
import { API_ENDPOINTS } from '@constants/apiEndpoints';

export const getCategories = () => {
  return axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
};

export const getCategoryById = (id) => {
  return axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
};

const categoryApi = {
  getCategories,
  getCategoryById,
};

export default categoryApi;