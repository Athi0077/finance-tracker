const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['budget', 'savings', 'goal', 'general'],
    required: true
  },
  actionType: {
    type: String,
    enum: ['modify_budget', 'add_funds', 'review_subscriptions', 'info'],
    default: 'info'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId // Can be CategoryId, GoalId, etc. depending on actionType
  },
  status: {
    type: String,
    enum: ['new', 'accepted', 'ignored'],
    default: 'new'
  }
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', RecommendationSchema);
