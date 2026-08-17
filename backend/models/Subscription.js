const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a subscription name'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Yearly', 'Weekly'],
      required: true,
      default: 'Monthly',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    nextBillingDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: 'Card',
    },
    status: {
      type: String,
      enum: ['Active', 'Cancelled', 'Paused'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
