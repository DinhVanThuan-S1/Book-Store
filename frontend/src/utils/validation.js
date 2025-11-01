/**
 * ==============================================
 * VALIDATION UTILITY
 * ==============================================
 * Các hàm validation form
 */

/**
 * Validate email
 * @param {String} email
 * @returns {Boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate số điện thoại Việt Nam
 * @param {String} phone
 * @returns {Boolean}
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password (ít nhất 6 ký tự)
 * @param {String} password
 * @returns {Boolean}
 */
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate password mạnh (ít nhất 8 ký tự, có chữ hoa, chữ thường, số)
 * @param {String} password
 * @returns {Boolean}
 */
export const validateStrongPassword = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

/**
 * Validate required field
 * @param {Any} value
 * @returns {Boolean}
 */
export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate độ dài tối thiểu
 * @param {String} value
 * @param {Number} min
 * @returns {Boolean}
 */
export const validateMinLength = (value, min) => {
  return value && value.length >= min;
};

/**
 * Validate độ dài tối đa
 * @param {String} value
 * @param {Number} max
 * @returns {Boolean}
 */
export const validateMaxLength = (value, max) => {
  return !value || value.length <= max;
};

/**
 * Validate số
 * @param {Any} value
 * @returns {Boolean}
 */
export const validateNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Validate số dương
 * @param {Any} value
 * @returns {Boolean}
 */
export const validatePositiveNumber = (value) => {
  return validateNumber(value) && parseFloat(value) > 0;
};

/**
 * Get validation error message
 * @param {String} field - Tên trường
 * @param {String} rule - Loại validation
 * @param {Any} params - Tham số (VD: min length)
 * @returns {String}
 */
export const getValidationMessage = (field, rule, params) => {
  const messages = {
    required: `${field} là bắt buộc`,
    email: `${field} không hợp lệ`,
    phone: `${field} không hợp lệ (10-11 số)`,
    password: `${field} phải có ít nhất 6 ký tự`,
    strongPassword: `${field} phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số`,
    minLength: `${field} phải có ít nhất ${params} ký tự`,
    maxLength: `${field} không được vượt quá ${params} ký tự`,
    number: `${field} phải là số`,
    positiveNumber: `${field} phải là số dương`,
  };
  
  return messages[rule] || `${field} không hợp lệ`;
};

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateStrongPassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumber,
  validatePositiveNumber,
  getValidationMessage,
};