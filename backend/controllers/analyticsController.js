const analyticsService = require('../services/analyticsService');

/**
 * @desc    Get advanced analytics dashboard data
 * @route   GET /api/analytics
 * @access  Private
 */
const getAnalytics = async (req, res, next) => {
  try {
    const { filter, customStart, customEnd } = req.query;
    const data = await analyticsService.getAdvancedAnalytics(req.user._id, filter, customStart, customEnd);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get financial health score
 * @route   GET /api/analytics/health
 * @access  Private
 */
const getHealthScore = async (req, res, next) => {
  try {
    const data = await analyticsService.getFinancialHealthScore(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get category spending analysis
 * @route   GET /api/analytics/category/:id
 * @access  Private
 */
const getCategoryAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getCategoryAnalysis(req.user._id, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getHealthScore,
  getCategoryAnalysis
};
