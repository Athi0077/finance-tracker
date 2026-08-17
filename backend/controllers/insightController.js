const insightEngine = require('../services/insightEngine');

const getInsights = async (req, res, next) => {
  try {
    const data = await insightEngine.getInsights(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const generateManualInsights = async (req, res, next) => {
  try {
    const data = await insightEngine.generateInsights(req.user._id);
    res.status(200).json({ success: true, data, message: 'Insights generated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInsights,
  generateManualInsights
};
