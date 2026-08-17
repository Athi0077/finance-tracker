const Subscription = require('../models/Subscription');
const ApiError = require('../utils/ApiError');

/**
 * Get all subscriptions for a user
 */
const getSubscriptions = async (userId) => {
  return await Subscription.find({ userId })
    .populate('categoryId', 'name icon color')
    .sort({ nextBillingDate: 1 });
};

/**
 * Create a new subscription
 */
const createSubscription = async (userId, data) => {
  const subscription = await Subscription.create({
    userId,
    name: data.name,
    amount: data.amount,
    billingCycle: data.billingCycle,
    categoryId: data.categoryId,
    nextBillingDate: data.nextBillingDate,
    paymentMethod: data.paymentMethod || 'Card',
    status: data.status || 'Active',
  });
  
  return await Subscription.findById(subscription._id).populate('categoryId', 'name icon color');
};

/**
 * Update a subscription
 */
const updateSubscription = async (userId, subId, data) => {
  const subscription = await Subscription.findOne({ _id: subId, userId });
  if (!subscription) throw new ApiError(404, 'Subscription not found');

  if (data.name !== undefined) subscription.name = data.name;
  if (data.amount !== undefined) subscription.amount = data.amount;
  if (data.billingCycle !== undefined) subscription.billingCycle = data.billingCycle;
  if (data.categoryId !== undefined) subscription.categoryId = data.categoryId;
  if (data.nextBillingDate !== undefined) subscription.nextBillingDate = data.nextBillingDate;
  if (data.paymentMethod !== undefined) subscription.paymentMethod = data.paymentMethod;
  if (data.status !== undefined) subscription.status = data.status;

  await subscription.save();
  return await Subscription.findById(subscription._id).populate('categoryId', 'name icon color');
};

/**
 * Delete a subscription
 */
const deleteSubscription = async (userId, subId) => {
  const subscription = await Subscription.findOneAndDelete({ _id: subId, userId });
  if (!subscription) throw new ApiError(404, 'Subscription not found');
  return { message: 'Subscription deleted successfully' };
};

module.exports = {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription
};
