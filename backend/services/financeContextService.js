const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Subscription = require('../models/Subscription');

/**
 * Gathers user financial data and structures it for the AI to understand safely.
 */
const getFinancialContext = async (userId) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Categories
  const categories = await Category.find({ userId }).lean();

  // Transactions - Current Month
  const currentMonthTx = await Transaction.find({
    userId,
    date: { $gte: currentMonthStart, $lte: currentMonthEnd }
  }).populate('categoryId').lean();

  // Transactions - Last Month
  const lastMonthTx = await Transaction.find({
    userId,
    date: { $gte: lastMonthStart, $lte: lastMonthEnd }
  }).lean();

  // Summarize Current Month
  let currentIncome = 0;
  let currentExpenses = 0;
  const currentCategorySpending = {};

  currentMonthTx.forEach(tx => {
    if (tx.type === 'income') {
      currentIncome += tx.amount;
    } else {
      currentExpenses += tx.amount;
      const catName = tx.categoryId ? tx.categoryId.name : 'Uncategorized';
      currentCategorySpending[catName] = (currentCategorySpending[catName] || 0) + tx.amount;
    }
  });

  // Summarize Last Month
  let lastIncome = 0;
  let lastExpenses = 0;
  lastMonthTx.forEach(tx => {
    if (tx.type === 'income') lastIncome += tx.amount;
    else lastExpenses += tx.amount;
  });

  // Categories with budgets
  const categoryContext = categories.map(cat => ({
    name: cat.name,
    budget: cat.budget || 0,
    spent: currentCategorySpending[cat.name] || 0,
    remaining: (cat.budget || 0) - (currentCategorySpending[cat.name] || 0)
  }));

  // Goals
  const goals = await Goal.find({ userId }).lean();
  const goalContext = goals.map(g => ({
    name: g.name,
    target: g.targetAmount,
    current: g.currentAmount,
    targetDate: g.targetDate
  }));

  // Subscriptions
  const subs = await Subscription.find({ userId }).lean();
  const subContext = subs.map(s => ({
    name: s.name,
    amount: s.amount,
    cycle: s.billingCycle
  }));

  return {
    currentMonth: {
      monthName: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      income: currentIncome,
      expenses: currentExpenses,
      savings: currentIncome - currentExpenses,
      savingsRate: currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0
    },
    lastMonth: {
      income: lastIncome,
      expenses: lastExpenses,
      savings: lastIncome - lastExpenses
    },
    categories: categoryContext,
    goals: goalContext,
    subscriptions: subContext
  };
};

module.exports = {
  getFinancialContext
};
