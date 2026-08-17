const mongoose = require('mongoose');

const AnomalySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  expectedRangeMin: {
    type: Number
  },
  expectedRangeMax: {
    type: Number
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['unresolved', 'reviewed'],
    default: 'unresolved'
  }
}, { timestamps: true });

module.exports = mongoose.model('Anomaly', AnomalySchema);
