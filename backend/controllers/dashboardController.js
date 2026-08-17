const dashboardService = require('../services/dashboardService');
const mongoose = require('mongoose');

/**
 * @desc    Get dashboard summary
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
const getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    // Convert user id to ObjectId for aggregation
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const summary = await dashboardService.getDashboardSummary(userId, month, year);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};
