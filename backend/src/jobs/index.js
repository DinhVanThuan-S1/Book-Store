/**
 * ==============================================
 * JOBS INDEX
 * ==============================================
 * Khởi động tất cả cronjobs
 */

const startCartCleanupJob = require('./cartCleanup');
const startRecommendationCleanupJob = require('./recommendationCleanup');

const startAllJobs = () => {
  console.log('');
  console.log('🚀 Starting background jobs...');
  console.log('='.repeat(50));
  
  startCartCleanupJob();
  startRecommendationCleanupJob();
  
  console.log('='.repeat(50));
  console.log('');
};

module.exports = startAllJobs;