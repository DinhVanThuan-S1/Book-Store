/**
 * ==============================================
 * DATABASE CONFIGURATION
 * ==============================================
 * File này chứa cấu hình kết nối MongoDB
 * Sử dụng Mongoose ODM
 */

const mongoose = require('mongoose');

/**
 * Kết nối đến MongoDB
 * @returns {Promise<void>}
 */
const connectDatabase = async () => {
  try {
    // Kết nối với MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Thoát app nếu không kết nối được DB
  }
};

/**
 * Xử lý sự kiện khi kết nối MongoDB bị ngắt
 */
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB Disconnected');
});

/**
 * Xử lý sự kiện khi kết nối MongoDB thành công
 */
mongoose.connection.on('connected', () => {
  console.log('🔌 MongoDB Connected Successfully');
});

module.exports = connectDatabase;