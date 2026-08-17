const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const ApiError = require('../utils/ApiError');

/**
 * Compute budget status label from percentage
 */
const computeBudgetStatus = (percentage) => {
  if (percentage > 100) return 'overspent';
  if (percentage >= 100) return 'reached';
  if (percentage >= 90) return 'almost_exceeded';
  if (percentage >= 70) return 'getting_close';
  return 'healthy';
};

/**
 * Get start and end of a month
 */
const getMonthRange = (month, year) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const startOfNextMonth = new Date(year, month, 1);
  return { startOfMonth, startOfNextMonth };
};

/**
 * Enrich a category with spent/remaining/status for a given month
 */
const enrichCategoryWithBudget = async (category, month, year) => {
  const { startOfMonth, startOfNextMonth } = getMonthRange(month, year);

  // Aggregate total spent for this category in the given month
  const result = await Transaction.aggregate([
    {
      $match: {
        userId: category.userId,
        categoryId: category._id,
        type: 'expense',
        date: { $gte: startOfMonth, $lt: startOfNextMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' },
      },
    },
  ]);

  const spent = result.length > 0 ? result[0].totalSpent : 0;
  const remaining = category.monthlyBudget - spent;
  const percentage = category.monthlyBudget > 0
    ? Math.round((spent / category.monthlyBudget) * 1000) / 10
    : 0;
  const status = computeBudgetStatus(percentage);

  return {
    ...category.toObject(),
    spent,
    remaining,
    percentage,
    status,
  };
};

/**
 * Get all categories for a user with budget data
 */
const getCategories = async (userId, month, year) => {
  const categories = await Category.find({ userId }).sort({ createdAt: -1 });

  const enriched = await Promise.all(
    categories.map((cat) => enrichCategoryWithBudget(cat, month, year))
  );

  return enriched;
};

/**
 * Get a single category with budget data
 */
const getCategoryById = async (userId, categoryId, month, year) => {
  const category = await Category.findOne({ _id: categoryId, userId });
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return enrichCategoryWithBudget(category, month, year);
};

/**
 * Create a new category
 */
const createCategory = async (userId, data) => {
  const category = await Category.create({
    userId,
    name: data.name,
    monthlyBudget: data.monthlyBudget,
    icon: data.icon || 'circle',
    color: data.color || '#6366f1',
    description: data.description || '',
  });

  return {
    ...category.toObject(),
    spent: 0,
    remaining: category.monthlyBudget,
    percentage: 0,
    status: 'healthy',
  };
};

/**
 * Update a category
 */
const updateCategory = async (userId, categoryId, data) => {
  const category = await Category.findOne({ _id: categoryId, userId });
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (data.name !== undefined) category.name = data.name;
  if (data.monthlyBudget !== undefined) category.monthlyBudget = data.monthlyBudget;
  if (data.icon !== undefined) category.icon = data.icon;
  if (data.color !== undefined) category.color = data.color;
  if (data.description !== undefined) category.description = data.description;

  await category.save();

  // Return enriched with current month budget data
  const now = new Date();
  return enrichCategoryWithBudget(category, now.getMonth() + 1, now.getFullYear());
};

/**
 * Delete a category
 */
const deleteCategory = async (userId, categoryId) => {
  const category = await Category.findOne({ _id: categoryId, userId });
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Remove category reference from transactions (set to null)
  await Transaction.updateMany(
    { userId, categoryId: category._id },
    { $set: { categoryId: null } }
  );

  await Category.deleteOne({ _id: categoryId });

  return { message: 'Category deleted successfully' };
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  enrichCategoryWithBudget,
  computeBudgetStatus,
  getMonthRange,
};
