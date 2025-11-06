/**
 * ==============================================
 * COMBO ROUTES
 * ==============================================
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/role');
const {
  getCombos,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo,
  checkComboAvailability,
} = require('../controllers/comboController');

/**
 * Validation
 */
const comboValidation = [
  body('name').trim().notEmpty().withMessage('Combo name is required'),
  body('books')
    .isArray({ min: 2 })
    .withMessage('Combo must have at least 2 books'),
  body('books.*.book')
    .notEmpty()
    .withMessage('Book ID is required')
    .isMongoId()
    .withMessage('Invalid book ID'),
  body('books.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('comboPrice')
    .isFloat({ min: 0 })
    .withMessage('Combo price must be a positive number'),
];

/**
 * Public routes
 */
router.get('/', getCombos);
router.get('/:id', getComboById);
router.get('/:id/availability', checkComboAvailability);

/**
 * Admin routes
 */
router.post(
  '/',
  protect,
  adminOnly,
  comboValidation,
  validate,
  createCombo
);

router.put(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid combo ID'),
  comboValidation,
  validate,
  updateCombo
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid combo ID'),
  validate,
  deleteCombo
);

module.exports = router;