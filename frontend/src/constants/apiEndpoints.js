/**
 * ==============================================
 * API ENDPOINTS
 * ==============================================
 * Định nghĩa tất cả API endpoints
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGIN_ADMIN: '/auth/admin/login',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    UPDATE_PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },
  
  // Books
  BOOKS: {
    GET_ALL: '/books',
    GET_BY_ID: (id) => `/books/${id}`,
    GET_BY_SLUG: (slug) => `/books/slug/${slug}`,
    CREATE: '/books',
    UPDATE: (id) => `/books/${id}`,
    DELETE: (id) => `/books/${id}`,
    ADD_COPIES: (id) => `/books/${id}/copies`,
    GET_COPIES: (id) => `/books/${id}/copies`,
  },
  
  // Categories
  CATEGORIES: {
    GET_ALL: '/categories',
    GET_BY_ID: (id) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },
  
  // Authors
  AUTHORS: {
    GET_ALL: '/authors',
    GET_BY_ID: (id) => `/authors/${id}`,
    CREATE: '/authors',
    UPDATE: (id) => `/authors/${id}`,
    DELETE: (id) => `/authors/${id}`,
  },
  
  // Publishers
  PUBLISHERS: {
    GET_ALL: '/publishers',
    GET_BY_ID: (id) => `/publishers/${id}`,
    CREATE: '/publishers',
    UPDATE: (id) => `/publishers/${id}`,
    DELETE: (id) => `/publishers/${id}`,
  },
  
  // Cart
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: (itemId) => `/cart/items/${itemId}`,
    REMOVE_ITEM: (itemId) => `/cart/items/${itemId}`,
    CLEAR: '/cart/clear',
  },
  
  // Orders
  ORDERS: {
    CREATE: '/orders',
    GET_MY_ORDERS: '/orders',
    GET_BY_ID: (id) => `/orders/${id}`,
    CANCEL: (id) => `/orders/${id}/cancel`,
    GET_REVIEWABLE_ITEMS: (id) => `/orders/${id}/reviewable-items`,
    REQUEST_RETURN: (id) => `/orders/${id}/request-return`,
    // Admin
    GET_ALL: '/admin/orders',
    UPDATE_STATUS: (id) => `/admin/orders/${id}/status`,
  },
};

export default API_ENDPOINTS;