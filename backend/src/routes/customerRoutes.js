/**
 * ==============================================
 * CUSTOMER ROUTES (Admin)
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const {
  getAllCustomers,
  getCustomerById,
  toggleCustomerActive,
  deleteCustomer,
} = require('../controllers/customerController');

/**
 * All routes require admin authentication
 */
router.use(protect, adminOnly);

/**
 * Routes
 */
router.get('/', getAllCustomers);

router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid customer ID'),
  validate,
  getCustomerById
);

router.put(
  '/:id/toggle-active',
  param('id').isMongoId().withMessage('Invalid customer ID'),
  validate,
  toggleCustomerActive
);

router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Invalid customer ID'),
  validate,
  deleteCustomer
);

module.exports = router;