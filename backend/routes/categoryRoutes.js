const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getCategories);
router.get('/:id', getCategory);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('monthlyBudget')
      .isFloat({ min: 0 })
      .withMessage('Monthly budget must be a positive number'),
    body('icon').optional().trim(),
    body('color').optional().trim(),
    body('description').optional().trim(),
  ],
  validate,
  createCategory
);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
    body('monthlyBudget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Monthly budget must be a positive number'),
    body('icon').optional().trim(),
    body('color').optional().trim(),
    body('description').optional().trim(),
  ],
  validate,
  updateCategory
);

router.delete('/:id', deleteCategory);

module.exports = router;
