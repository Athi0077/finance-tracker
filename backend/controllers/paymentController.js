const crypto = require('crypto');

/**
 * @desc    Create a mock payment intent / order
 * @route   POST /api/payments/create-intent
 * @access  Private
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, categoryId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    // Mock an order creation with a random reference ID
    const referenceId = `PAY_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    // Normally we would save this to a Payment/Order collection, 
    // but for mock purposes we just return it to the frontend.
    res.status(200).json({
      success: true,
      data: {
        referenceId,
        amount,
        categoryId,
        status: 'pending',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify a mock payment
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { referenceId, amount } = req.body;

    if (!referenceId) {
      return res.status(400).json({ success: false, message: 'Reference ID is required' });
    }

    // Mock payment verification (always succeeds for this simulation)
    // Normally we would call a payment gateway API (like Razorpay signature verification) here.

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        referenceId,
        amount,
        status: 'success',
        verifiedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  verifyPayment,
};
