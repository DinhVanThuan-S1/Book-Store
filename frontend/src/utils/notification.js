/**
 * ==============================================
 * NOTIFICATION UTILITY
 * ==============================================
 * Wrapper cho Ant Design message/notification
 */

import { message, notification } from 'antd';

/**
 * Hiển thị success message
 * @param {String} content
 */
export const showSuccess = (content) => {
  message.success(content);
};

/**
 * Hiển thị error message
 * @param {String} content
 */
export const showError = (content) => {
  message.error(content);
};

/**
 * Hiển thị warning message
 * @param {String} content
 */
export const showWarning = (content) => {
  message.warning(content);
};

/**
 * Hiển thị info message
 * @param {String} content
 */
export const showInfo = (content) => {
  message.info(content);
};

/**
 * Hiển thị loading message
 * @param {String} content
 * @param {Number} duration - Duration in seconds (0 = không tự đóng)
 * @returns {Function} - Function để close message
 */
export const showLoading = (content, duration = 0) => {
  return message.loading(content, duration);
};

/**
 * Hiển thị notification (phức tạp hơn message)
 * @param {String} type - 'success' | 'error' | 'warning' | 'info'
 * @param {String} title
 * @param {String} description
 */
export const showNotification = (type, title, description) => {
  notification[type]({
    message: title,
    description: description,
    placement: 'topRight',
  });
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  showNotification,
};