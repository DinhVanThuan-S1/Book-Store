/**
 * ==============================================
 * RECOMMENDATION CLEANUP JOB
 * ==============================================
 * Xóa recommendations đã hết hạn
 */

const cron = require('node-cron');
const Recommendation = require('../models/Recommendation');

/**
 * Chạy mỗi ngày lúc 2:00 AM
 */
const startRecommendationCleanupJob = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🧹 Running recommendation cleanup job...');
      
      await Recommendation.removeExpired();
      
      console.log('✅ Recommendation cleanup completed');
    } catch (error) {
      console.error('❌ Recommendation cleanup error:', error);
    }
  });
  
  console.log('✅ Recommendation cleanup job scheduled (daily at 2:00 AM)');
};

module.exports = startRecommendationCleanupJob;