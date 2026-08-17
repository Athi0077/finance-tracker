const transactionService = require('../services/transactionService');
const gamificationService = require('../services/gamificationService');

/**
 * @desc    Get all transactions (with filters, search, sort, pagination)
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const result = await transactionService.getTransactions(req.user._id, req.query);

    res.status(200).json({
      success: true,
      ...result,
      data: result.transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = async (req, res, next) => {
  try {
    const result = await transactionService.createTransaction(req.user._id, req.body);

    // Run gamification logic asynchronously without blocking response
    gamificationService.updateStreakAndBadges(req.user._id).catch(err => console.error(err));

    res.status(201).json({
      success: true,
      data: result.transaction,
      updatedCategory: result.updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = async (req, res, next) => {
  try {
    const result = await transactionService.updateTransaction(
      req.user._id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: result.transaction,
      updatedCategory: result.updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const result = await transactionService.deleteTransaction(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
