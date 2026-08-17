const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const { enrichCategoryWithBudget } = require('./categoryService');

/**
 * Create a transaction with automatic category budget recalculation
 */
const createTransaction = async (userId, data) => {
  // If expense with category, validate category belongs to user
  if (data.type === 'expense' && data.categoryId) {
    const category = await Category.findOne({ _id: data.categoryId, userId });
    if (!category) {
      throw new ApiError(400, 'Category not found or does not belong to you');
    }
  }

  // If income, categoryId should be null
  if (data.type === 'income') {
    data.categoryId = null;
  }

  const transaction = await Transaction.create({
    userId,
    amount: data.amount,
    type: data.type,
    categoryId: data.categoryId || null,
    description: data.description,
    date: data.date || new Date(),
    paymentMethod: data.paymentMethod || 'Cash',
    notes: data.notes || '',
  });

  // Populate category info
  await transaction.populate('categoryId', 'name icon color');

  // If expense with category, return updated category budget
  let updatedCategory = null;
  if (data.type === 'expense' && transaction.categoryId) {
    const category = await Category.findById(transaction.categoryId);
    const txDate = new Date(transaction.date);
    updatedCategory = await enrichCategoryWithBudget(
      category,
      txDate.getMonth() + 1,
      txDate.getFullYear()
    );
  }

  return { transaction, updatedCategory };
};

/**
 * Get transactions with search, filter, sort, pagination
 */
const getTransactions = async (userId, query) => {
  const {
    search,
    type,
    categoryId,
    paymentMethod,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = query;

  const filter = { userId };

  // Search by description
  if (search) {
    filter.description = { $regex: search, $options: 'i' };
  }

  // Filter by type
  if (type && ['income', 'expense'].includes(type)) {
    filter.type = type;
  }

  // Filter by category
  if (categoryId) {
    filter.categoryId = categoryId;
  }

  // Filter by payment method
  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  // Filter by date range
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Transaction.countDocuments(filter);

  const transactions = await Transaction.find(filter)
    .populate('categoryId', 'name icon color')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  return {
    transactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get a single transaction
 */
const getTransactionById = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({ _id: transactionId, userId })
    .populate('categoryId', 'name icon color monthlyBudget');

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  return transaction;
};

/**
 * Update a transaction
 */
const updateTransaction = async (userId, transactionId, data) => {
  const transaction = await Transaction.findOne({ _id: transactionId, userId });
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  // If changing category, validate new category
  if (data.categoryId && data.categoryId !== String(transaction.categoryId)) {
    const category = await Category.findOne({ _id: data.categoryId, userId });
    if (!category) {
      throw new ApiError(400, 'Category not found or does not belong to you');
    }
  }

  // Update fields
  if (data.amount !== undefined) transaction.amount = data.amount;
  if (data.type !== undefined) transaction.type = data.type;
  if (data.categoryId !== undefined) transaction.categoryId = data.categoryId;
  if (data.description !== undefined) transaction.description = data.description;
  if (data.date !== undefined) transaction.date = data.date;
  if (data.paymentMethod !== undefined) transaction.paymentMethod = data.paymentMethod;
  if (data.notes !== undefined) transaction.notes = data.notes;

  // If income, clear category
  if (transaction.type === 'income') {
    transaction.categoryId = null;
  }

  await transaction.save();
  await transaction.populate('categoryId', 'name icon color');

  // Return updated category budget data if expense
  let updatedCategory = null;
  if (transaction.type === 'expense' && transaction.categoryId) {
    const category = await Category.findById(transaction.categoryId);
    const txDate = new Date(transaction.date);
    updatedCategory = await enrichCategoryWithBudget(
      category,
      txDate.getMonth() + 1,
      txDate.getFullYear()
    );
  }

  return { transaction, updatedCategory };
};

/**
 * Delete a transaction
 */
const deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({ _id: transactionId, userId });
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  const categoryId = transaction.categoryId;
  const txDate = new Date(transaction.date);

  await Transaction.deleteOne({ _id: transactionId });

  // Return updated category budget if it was an expense with a category
  let updatedCategory = null;
  if (transaction.type === 'expense' && categoryId) {
    const category = await Category.findById(categoryId);
    if (category) {
      updatedCategory = await enrichCategoryWithBudget(
        category,
        txDate.getMonth() + 1,
        txDate.getFullYear()
      );
    }
  }

  return { message: 'Transaction deleted successfully', updatedCategory };
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
