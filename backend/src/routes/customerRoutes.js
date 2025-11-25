/**
 * ==============================================
 * CUSTOMER ROUTES (Admin)
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { param, body } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  toggleCustomerActive,
  deleteCustomer,
  getCustomerOrders,
  getCustomerReviews,
} = require('../controllers/customerController');

/**
 * All routes require admin authentication
 */
router.use(protect, adminOnly);

/**
 * Validation rules
 */
const createCustomerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('phone')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Please provide a valid phone number (10-11 digits)'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
];

const updateCustomerValidation = [
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Please provide a valid phone number (10-11 digits)'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

/**
 * Routes
 */
router.get('/', getAllCustomers);

router.post(
  '/',
  createCustomerValidation,
  validate,
  createCustomer
);

router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid customer ID'),
  validate,
  getCustomerById
);

router.get(
  '/:id/orders',
  param('id').isMongoId().withMessage('Invalid customer ID'),
  validate,
  getCustomerOrders
);

router.get(
  '/:id/reviews',
  param('id').isMongoId().withMessage('Invalid customer ID'),
  validate,
  getCustomerReviews
);

router.put(
  '/:id',
  param('id').isMongoId().withMessage('Invalid customer ID'),
  updateCustomerValidation,
  validate,
  updateCustomer
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