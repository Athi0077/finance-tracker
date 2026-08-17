const recurringService = require('../services/recurringService');

const getRecurringTransactions = async (req, res, next) => {
  try {
    const data = await recurringService.getRecurringTransactions(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createRecurringTransaction = async (req, res, next) => {
  try {
    const data = await recurringService.createRecurringTransaction(req.user._id, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateRecurringTransaction = async (req, res, next) => {
  try {
    const data = await recurringService.updateRecurringTransaction(req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteRecurringTransaction = async (req, res, next) => {
  try {
    const response = await recurringService.deleteRecurringTransaction(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: response.message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction
};
