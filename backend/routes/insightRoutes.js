const express = require('express');
const { protect } = require('../middleware/auth');
const { getInsights, generateManualInsights } = require('../controllers/insightController');

const router = express.Router();

router.use(protect);

router.get('/', getInsights);
router.post('/generate', generateManualInsights);

module.exports = router;
