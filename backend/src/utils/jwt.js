/**
 * ==============================================
 * JWT UTILITY
 * ==============================================
 * Helper functions cho generate và verify JWT token
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Generate JWT token
 * @param {Object} payload - Dữ liệu cần mã hóa (user info)
 * @returns {String} - JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
    }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token
 * @returns {Object} - Decoded payload
 * @throws {Error} - Nếu token không hợp lệ
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode JWT token (không verify)
 * @param {String} token - JWT token
 * @returns {Object} - Decoded payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};