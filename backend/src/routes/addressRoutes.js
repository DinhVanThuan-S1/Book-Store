/**
 * ==============================================
 * ADDRESS ROUTES
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { customerOnly } = require('../middlewares/role');
const {
  getMyAddresses,
  getDefaultAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');

/**
 * Validation
 */
const addressValidation = [
  body('recipientName')
    .trim()
    .notEmpty()
    .withMessage('Recipient name is required'),
  body('phone')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Invalid phone number'),
  body('province').trim().notEmpty().withMessage('Province is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('ward').trim().notEmpty().withMessage('Ward is required'),
  body('detailAddress')
    .trim()
    .notEmpty()
    .withMessage('Detail address is required'),
];

/**
 * All routes require customer authentication
 */
router.use(protect, customerOnly);

/**
 * Routes
 */
router.get('/', getMyAddresses);
router.get('/default', getDefaultAddress);

router.post('/', addressValidation, validate, createAddress);

router.put(
  '/:id',
  param('id').isMongoId().withMessage('Invalid address ID'),
  addressValidation,
  validate,
  updateAddress
);

router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Invalid address ID'),
  validate,
  deleteAddress
);

router.put(
  '/:id/set-default',
  param('id').isMongoId().withMessage('Invalid address ID'),
  validate,
  setDefaultAddress
);

module.exports = router;