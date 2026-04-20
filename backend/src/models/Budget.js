const mongoose = require('mongoose');
const { CATEGORIES } = require('./Expense');

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: CATEGORIES, required: true },
    monthlyLimit: { type: Number, required: true, min: 0 },
    // YYYY-MM, e.g. "2025-04"
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },
  },
  { timestamps: true }
);

budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
