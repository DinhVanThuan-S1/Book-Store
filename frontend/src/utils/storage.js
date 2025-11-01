/**
 * ==============================================
 * STORAGE UTILITY
 * ==============================================
 * Wrapper cho localStorage với error handling
 */

/**
 * Lưu vào localStorage
 * @param {String} key
 * @param {Any} value
 */
export const setStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Lấy từ localStorage
 * @param {String} key
 * @param {Any} defaultValue
 * @returns {Any}
 */
export const getStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Xóa khỏi localStorage
 * @param {String} key
 */
export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Xóa tất cả localStorage
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

export default {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
};