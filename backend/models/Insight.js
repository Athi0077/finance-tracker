const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['trend', 'opportunity', 'warning'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// We usually want the latest insights first
insightSchema.index({ userId: 1, generatedAt: -1 });

module.exports = mongoose.model('Insight', insightSchema);
