const goalService = require('../services/goalService');

const getGoals = async (req, res, next) => {
  try {
    const goals = await goalService.getGoals(req.user._id);
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const goal = await goalService.createGoal(req.user._id, req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const goal = await goalService.updateGoal(req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const response = await goalService.deleteGoal(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: response.message });
  } catch (error) {
    next(error);
  }
};

const addContribution = async (req, res, next) => {
  try {
    const goal = await goalService.addContribution(req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

const withdrawContribution = async (req, res, next) => {
  try {
    const goal = await goalService.withdrawContribution(req.user._id, req.params.id, req.params.contributionId);
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  withdrawContribution
};
