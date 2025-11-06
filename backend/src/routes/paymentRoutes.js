/**
 * ==============================================
 * PAYMENT ROUTES
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { customerOnly, adminOnly } = require('../middlewares/role');
const {
  processPayment,
  getPayment,
  paymentWebhook,
  refundPayment,
} = require('../controllers/paymentController');

/**
 * Routes
 */

// Public webhook
router.post('/webhook', paymentWebhook);

// Customer routes
router.post(
  '/:orderId/process',
  protect,
  customerOnly,
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  validate,
  processPayment
);

router.get(
  '/:orderId',
  protect,
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  validate,
  getPayment
);

// Admin routes
router.post(
  '/:orderId/refund',
  protect,
  adminOnly,
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  body('reason').notEmpty().withMessage('Refund reason is required'),
  validate,
  refundPayment
);

module.exports = router;