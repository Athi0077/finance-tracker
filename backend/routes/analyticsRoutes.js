const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getAnalytics,
  getHealthScore,
  getCategoryAnalysis
} = require('../controllers/analyticsController');
const anomalyService = require('../services/anomalyService');
const predictionService = require('../services/predictionService');
const recommendationService = require('../services/recommendationService');

const router = express.Router();

router.use(protect);

router.get('/', getAnalytics);
router.get('/health', getHealthScore);
router.get('/category/:id', getCategoryAnalysis);

router.get('/anomalies', async (req, res, next) => {
    try {
        const data = await anomalyService.getAnomalies(req.user._id);
        res.status(200).json({ success: true, data });
    } catch(err) { next(err); }
});

router.get('/predictions', async (req, res, next) => {
    try {
        const data = await predictionService.getPredictions(req.user._id);
        res.status(200).json({ success: true, data });
    } catch(err) { next(err); }
});

router.get('/recommendations', async (req, res, next) => {
    try {
        const data = await recommendationService.getRecommendations(req.user._id);
        res.status(200).json({ success: true, data });
    } catch(err) { next(err); }
});

module.exports = router;
