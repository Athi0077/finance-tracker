const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createPaymentIntent, verifyPayment } = require('../controllers/paymentController');

// All payment routes require authentication
router.use(protect);

router.post('/create-intent', createPaymentIntent);
router.post('/verify', verifyPayment);

module.exports = router;
