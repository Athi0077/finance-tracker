const Insight = require('../models/Insight');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const { getFinancialContext } = require('./financeContextService');
const { generateMonthlySummary } = require('./aiService');

/**
 * Generate rule-based financial insights for a user
 * Can be called daily by cron or manually
 */
const generateInsights = async (userId) => {
  const insightsGenerated = [];
  const now = new Date();
  
  // Clean up old insights for this user (keep last 30 days)
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  await Insight.deleteMany({ userId, generatedAt: { $lt: thirtyDaysAgo } });

  // 1. Month-over-Month Category Spending Trend
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const categories = await Category.find({ userId });
  
  for (const cat of categories) {
    const currTx = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), categoryId: cat._id, date: { $gte: currentStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const currSpent = currTx.length > 0 ? currTx[0].total : 0;

    const prevTx = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), categoryId: cat._id, date: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const prevSpent = prevTx.length > 0 ? prevTx[0].total : 0;

    // Insight: Significant increase
    if (prevSpent > 0 && currSpent > prevSpent * 1.2) {
      const percentIncrease = Math.round(((currSpent - prevSpent) / prevSpent) * 100);
      const msg = `Your ${cat.name} expenses increased by ${percentIncrease}% compared with last month.`;
      
      // Avoid duplicate insights on same day
      const existing = await Insight.findOne({ userId, type: 'warning', message: msg, generatedAt: { $gte: new Date(now.setHours(0,0,0,0)) } });
      if (!existing) {
        const insight = await Insight.create({ userId, type: 'warning', message: msg });
        insightsGenerated.push(insight);
      }
    }
  }

  // 2. Savings Opportunity
  const lastMonthTx = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: prevStart, $lte: prevEnd } } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } }
  ]);
  
  let lmIncome = 0, lmExpense = 0;
  lastMonthTx.forEach(t => {
    if (t._id === 'income') lmIncome = t.total;
    else lmExpense = t.total;
  });

  const lmSavings = lmIncome - lmExpense;

  const currentMonthTx = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: currentStart } } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } }
  ]);

  let cmIncome = 0, cmExpense = 0;
  currentMonthTx.forEach(t => {
    if (t._id === 'income') cmIncome = t.total;
    else cmExpense = t.total;
  });

  const cmSavings = cmIncome - cmExpense;

  // Insight: Positive Trend
  if (cmSavings > lmSavings && lmSavings > 0) {
    const diff = cmSavings - lmSavings;
    const msg = `Your savings increased by ₹${diff} compared with last month.`;
    const existing = await Insight.findOne({ userId, type: 'trend', message: msg, generatedAt: { $gte: new Date(now.setHours(0,0,0,0)) } });
    if (!existing) {
      const insight = await Insight.create({ userId, type: 'trend', message: msg });
      insightsGenerated.push(insight);
    }
  }

  return insightsGenerated;
};

/**
 * Get insights for user
 */
const getInsights = async (userId) => {
  return await Insight.find({ userId }).sort({ generatedAt: -1 }).limit(10);
};

module.exports = {
  generateInsights,
  getInsights
};
