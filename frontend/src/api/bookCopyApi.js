import axiosInstance from './axiosConfig';

/**
 * Book Copy API
 */
const bookCopyApi = {
  /**
   * Lấy danh sách tất cả bản sao (Admin)
   * @param {Object} params - Query parameters { page, limit, status, condition, search, bookId }
   * @returns {Promise}
   */
  getAllBookCopies: (params = {}) => {
    return axiosInstance.get('/book-copies', { params });
  },

  /**
   * Lấy chi tiết 1 bản sao (Admin)
   * @param {String} id - ID bản sao
   * @returns {Promise}
   */
  getBookCopyById: (id) => {
    return axiosInstance.get(`/book-copies/${id}`);
  },

  /**
   * Cập nhật bản sao (Admin)
   * @param {String} id - ID bản sao
   * @param {Object} data - { status, condition, warehouseLocation, notes }
   * @returns {Promise}
   */
  updateBookCopy: (id, data) => {
    return axiosInstance.put(`/book-copies/${id}`, data);
  },

  /**
   * Xóa bản sao (Admin)
   * @param {String} id - ID bản sao
   * @returns {Promise}
   */
  deleteBookCopy: (id) => {
    return axiosInstance.delete(`/book-copies/${id}`);
  },

  /**
   * Thống kê bản sao theo sách (Admin)
   * @returns {Promise}
   */
  getBookCopyStatsByBook: () => {
    return axiosInstance.get('/book-copies/stats/by-book');
  },

  /**
   * Cập nhật trạng thái bản sao (Admin)
   * @param {String} id - ID bản sao
   * @param {String} status - Trạng thái mới
   * @returns {Promise}
   */
  updateBookCopyStatus: (id, status) => {
    return axiosInstance.put(`/book-copies/${id}/status`, { status });
  },
};

export default bookCopyApi;
