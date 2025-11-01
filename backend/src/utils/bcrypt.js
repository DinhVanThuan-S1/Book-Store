/**
 * ==============================================
 * BCRYPT UTILITY
 * ==============================================
 * Helper functions cho hash và compare password
 */

const bcrypt = require('bcryptjs');

/**
 * Hash password
 * @param {String} password - Plain text password
 * @returns {Promise<String>} - Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * So sánh password
 * @param {String} enteredPassword - Password người dùng nhập
 * @param {String} hashedPassword - Password đã hash trong DB
 * @returns {Promise<Boolean>}
 */
const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};