const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: function() { return this.type === 'expense'; },
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    nextExecutionDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date, // Optional, null means indefinite
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly find due transactions
recurringTransactionSchema.index({ isActive: 1, nextExecutionDate: 1 });

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);
