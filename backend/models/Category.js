const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    monthlyBudget: {
      type: Number,
      required: [true, 'Monthly budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    icon: {
      type: String,
      default: 'circle',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: no duplicate category names per user
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
