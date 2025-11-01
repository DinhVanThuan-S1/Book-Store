/**
 * ==============================================
 * FORMAT DATE UTILITY
 * ==============================================
 * Format ngày tháng với dayjs
 */

import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import Vietnamese locale
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

// Extend dayjs với plugins
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Set locale mặc định
dayjs.locale('vi');

/**
 * Format ngày tháng
 * @param {Date|String} date
 * @param {String} format - Default: 'DD/MM/YYYY'
 * @returns {String}
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

/**
 * Format ngày giờ
 * @param {Date|String} date
 * @returns {String} - VD: "31/10/2025 16:30"
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

/**
 * Format thời gian tương đối
 * @param {Date|String} date
 * @returns {String} - VD: "2 giờ trước", "3 ngày trước"
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

/**
 * Kiểm tra ngày có phải hôm nay không
 * @param {Date|String} date
 * @returns {Boolean}
 */
export const isToday = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * Kiểm tra ngày có phải hôm qua không
 * @param {Date|String} date
 * @returns {Boolean}
 */
export const isYesterday = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
};

/**
 * Format ngày thân thiện
 * @param {Date|String} date
 * @returns {String} - VD: "Hôm nay", "Hôm qua", "31/10/2025"
 */
export const formatFriendlyDate = (date) => {
  if (!date) return '';
  
  if (isToday(date)) return 'Hôm nay';
  if (isYesterday(date)) return 'Hôm qua';
  
  return formatDate(date);
};

export default formatDate;