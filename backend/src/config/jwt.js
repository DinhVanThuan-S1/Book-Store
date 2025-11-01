/**
 * ==============================================
 * JWT CONFIGURATION
 * ==============================================
 * File này chứa cấu hình JWT (JSON Web Token)
 * Dùng để xác thực người dùng
 */

module.exports = {
  // Secret key để mã hóa JWT (lấy từ .env)
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
  
  // Thời gian hết hạn token
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Issuer (tên ứng dụng)
  issuer: 'bookstore-api',
};