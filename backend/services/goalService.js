const Goal = require('../models/Goal');
const ApiError = require('../utils/ApiError');

/**
 * Get all goals for a user
 */
const getGoals = async (userId) => {
  return await Goal.find({ userId }).sort({ targetDate: 1 });
};

/**
 * Create a new goal
 */
const createGoal = async (userId, data) => {
  return await Goal.create({
    userId,
    name: data.name,
    targetAmount: data.targetAmount,
    currentAmount: data.currentAmount || 0,
    targetDate: data.targetDate,
  });
};

/**
 * Update a goal
 */
const updateGoal = async (userId, goalId, data) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) throw new ApiError(404, 'Goal not found');

  if (data.name !== undefined) goal.name = data.name;
  if (data.targetAmount !== undefined) goal.targetAmount = data.targetAmount;
  if (data.targetDate !== undefined) goal.targetDate = data.targetDate;

  await goal.save();
  return goal;
};

/**
 * Delete a goal
 */
const deleteGoal = async (userId, goalId) => {
  const goal = await Goal.findOneAndDelete({ _id: goalId, userId });
  if (!goal) throw new ApiError(404, 'Goal not found');
  return { message: 'Goal deleted successfully' };
};

/**
 * Add a contribution to a goal
 */
const addContribution = async (userId, goalId, data) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) throw new ApiError(404, 'Goal not found');

  const contribution = {
    amount: data.amount,
    date: data.date || Date.now(),
    description: data.description || '',
  };

  goal.contributions.push(contribution);
  goal.currentAmount += data.amount;

  await goal.save();
  return goal;
};

/**
 * Withdraw a contribution from a goal
 */
const withdrawContribution = async (userId, goalId, contributionId) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) throw new ApiError(404, 'Goal not found');

  const contributionIndex = goal.contributions.findIndex(c => c._id.toString() === contributionId);
  if (contributionIndex === -1) throw new ApiError(404, 'Contribution not found');

  const amountToWithdraw = goal.contributions[contributionIndex].amount;
  goal.contributions.splice(contributionIndex, 1);
  goal.currentAmount -= amountToWithdraw;

  // Don't let current amount go below 0 due to floating point or weird manual edits
  if (goal.currentAmount < 0) goal.currentAmount = 0;

  await goal.save();
  return goal;
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  withdrawContribution
};
