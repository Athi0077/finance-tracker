const subscriptionService = require('../services/subscriptionService');

const getSubscriptions = async (req, res, next) => {
  try {
    const subs = await subscriptionService.getSubscriptions(req.user._id);
    res.status(200).json({ success: true, data: subs });
  } catch (error) {
    next(error);
  }
};

const createSubscription = async (req, res, next) => {
  try {
    const sub = await subscriptionService.createSubscription(req.user._id, req.body);
    res.status(201).json({ success: true, data: sub });
  } catch (error) {
    next(error);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const sub = await subscriptionService.updateSubscription(req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, data: sub });
  } catch (error) {
    next(error);
  }
};

const deleteSubscription = async (req, res, next) => {
  try {
    const response = await subscriptionService.deleteSubscription(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: response.message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription
};
