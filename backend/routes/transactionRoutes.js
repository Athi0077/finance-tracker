const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getTransactions);
router.get('/:id', getTransaction);

router.post(
  '/',
  [
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('Type must be income or expense'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid date'),
    body('paymentMethod')
      .optional()
      .isIn(['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'])
      .withMessage('Invalid payment method'),
    body('categoryId').optional(),
    body('notes').optional().trim(),
  ],
  validate,
  createTransaction
);

router.put(
  '/:id',
  [
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('type')
      .optional()
      .isIn(['income', 'expense'])
      .withMessage('Type must be income or expense'),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid date'),
    body('paymentMethod')
      .optional()
      .isIn(['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'])
      .withMessage('Invalid payment method'),
    body('categoryId').optional(),
    body('notes').optional().trim(),
  ],
  validate,
  updateTransaction
);

router.delete('/:id', deleteTransaction);

module.exports = router;
