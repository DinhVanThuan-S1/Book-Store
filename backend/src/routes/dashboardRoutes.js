/**
 * ==============================================
 * DASHBOARD ROUTES (Admin)
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const {
  getOverviewStats,
  getRevenueStats,
  getTopBooks,
  getOrderStats,
  getNewCustomers,
} = require('../controllers/dashboardController');

/**
 * All routes require admin authentication
 */
router.use(protect, adminOnly);

/**
 * Routes
 */
router.get('/overview', getOverviewStats);
router.get('/revenue', getRevenueStats);
router.get('/top-books', getTopBooks);
router.get('/order-stats', getOrderStats);
router.get('/new-customers', getNewCustomers);

module.exports = router;