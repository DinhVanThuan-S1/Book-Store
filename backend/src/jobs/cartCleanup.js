/**
 * ==============================================
 * CART CLEANUP JOB
 * ==============================================
 * ⚠️ DISABLED - Không còn reserve trong giỏ hàng
 * Reserve chỉ diễn ra khi Order = confirmed
 */

const cron = require('node-cron');
const BookCopy = require('../models/BookCopy');
const Cart = require('../models/Cart');

/**
 * Chạy mỗi 5 phút (DISABLED)
 */
const startCartCleanupJob = () => {
  // ⚠️ DISABLED - Không cần cleanup giỏ hàng nữa
  // Vì không reserve khi thêm vào giỏ
  
  console.log('⚠️  Cart cleanup job DISABLED (no reserve in cart)');
};

module.exports = startCartCleanupJob;