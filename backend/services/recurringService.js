const RecurringTransaction = require('../models/RecurringTransaction');
const ApiError = require('../utils/ApiError');

/**
 * Get all recurring transactions for a user
 */
const getRecurringTransactions = async (userId) => {
  return await RecurringTransaction.find({ userId })
    .populate('categoryId', 'name icon color')
    .sort({ nextExecutionDate: 1 });
};

/**
 * Create a new recurring transaction
 */
const createRecurringTransaction = async (userId, data) => {
  const recurring = await RecurringTransaction.create({
    userId,
    name: data.name,
    amount: data.amount,
    type: data.type,
    categoryId: data.type === 'expense' ? data.categoryId : null,
    frequency: data.frequency,
    startDate: data.startDate || Date.now(),
    nextExecutionDate: data.nextExecutionDate,
    endDate: data.endDate || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
  });
  
  return await RecurringTransaction.findById(recurring._id).populate('categoryId', 'name icon color');
};

/**
 * Update a recurring transaction
 */
const updateRecurringTransaction = async (userId, recId, data) => {
  const recurring = await RecurringTransaction.findOne({ _id: recId, userId });
  if (!recurring) throw new ApiError(404, 'Recurring transaction not found');

  if (data.name !== undefined) recurring.name = data.name;
  if (data.amount !== undefined) recurring.amount = data.amount;
  if (data.type !== undefined) recurring.type = data.type;
  if (data.categoryId !== undefined) recurring.categoryId = data.type === 'expense' ? data.categoryId : null;
  if (data.frequency !== undefined) recurring.frequency = data.frequency;
  if (data.startDate !== undefined) recurring.startDate = data.startDate;
  if (data.nextExecutionDate !== undefined) recurring.nextExecutionDate = data.nextExecutionDate;
  if (data.endDate !== undefined) recurring.endDate = data.endDate;
  if (data.isActive !== undefined) recurring.isActive = data.isActive;

  await recurring.save();
  return await RecurringTransaction.findById(recurring._id).populate('categoryId', 'name icon color');
};

/**
 * Delete a recurring transaction
 */
const deleteRecurringTransaction = async (userId, recId) => {
  const recurring = await RecurringTransaction.findOneAndDelete({ _id: recId, userId });
  if (!recurring) throw new ApiError(404, 'Recurring transaction not found');
  return { message: 'Recurring transaction deleted successfully' };
};

module.exports = {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction
};
