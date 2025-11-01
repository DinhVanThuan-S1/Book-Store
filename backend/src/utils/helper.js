/**
 * ==============================================
 * HELPER UTILITY
 * ==============================================
 * Các hàm tiện ích chung
 */

/**
 * Format số tiền VND
 * @param {Number} amount - Số tiền
 * @returns {String} - VD: "50,000đ"
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format ngày tháng
 * @param {Date} date - Ngày
 * @returns {String} - VD: "31/10/2025"
 */
const formatDate = (date) => {
  return new Intl.DateFormat('vi-VN').format(new Date(date));
};

/**
 * Tạo slug từ string
 * @param {String} str - String cần chuyển
 * @returns {String} - Slug
 */
const createSlug = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
    .replace(/[đĐ]/g, 'd') // Chuyển đ thành d
    .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // Thay space bằng -
    .replace(/-+/g, '-'); // Loại bỏ - trùng
};

/**
 * Tạo mã ngẫu nhiên
 * @param {Number} length - Độ dài mã
 * @returns {String}
 */
const generateCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Phân trang
 * @param {Number} page - Trang hiện tại
 * @param {Number} limit - Số item/trang
 * @returns {Object} - { skip, limit }
 */
const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

/**
 * Tính % giảm giá
 * @param {Number} originalPrice - Giá gốc
 * @param {Number} salePrice - Giá bán
 * @returns {Number} - %
 */
const calculateDiscount = (originalPrice, salePrice) => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

module.exports = {
  formatCurrency,
  formatDate,
  createSlug,
  generateCode,
  paginate,
  calculateDiscount,
};