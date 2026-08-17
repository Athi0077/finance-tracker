const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['category_expense', 'total_expense', 'goal_completion'],
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  },
  predictedAmount: {
    type: Number
  },
  predictedDate: {
    type: Date
  },
  rangeMin: {
    type: Number
  },
  rangeMax: {
    type: Number
  },
  confidence: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
    default: 'Moderate'
  },
  month: {
    type: Number // 1-12
  },
  year: {
    type: Number
  },
  explanation: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Prediction', PredictionSchema);
