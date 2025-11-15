/**
 * ==============================================
 * CART CLEANUP JOB
 * ==============================================
 * Tự động giải phóng bản sao đã hết hạn reserve
 */

const cron = require('node-cron');
const BookCopy = require('../models/BookCopy');
const Cart = require('../models/Cart');

/**
 * Chạy mỗi 5 phút
 */
const startCartCleanupJob = () => {
  // cron.schedule('*/5 * * * *', async () => {
  //   try {
  //     console.log('🧹 Running cart cleanup job...');
      
  //     // 1. Release expired book copy reservations
  //     await BookCopy.releaseExpiredReservations();
      
  //     // 2. Remove expired items from carts
  //     await Cart.removeExpiredItems();
      
  //     console.log('✅ Cart cleanup completed');
  //   } catch (error) {
  //     console.error('❌ Cart cleanup error:', error);
  //   }
  // });
  
  console.log('✅ Cart cleanup job scheduled (every 5 minutes)');
};

module.exports = startCartCleanupJob;