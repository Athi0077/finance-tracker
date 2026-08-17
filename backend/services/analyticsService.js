const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Goal = require('../models/Goal');
const mongoose = require('mongoose');
const { getMonthRange, computeBudgetStatus } = require('./categoryService');

/**
 * Get date range from filter string
 */
const getDateRange = (filter, customStart, customEnd) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  switch (filter) {
    case '7 Days':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'This Month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'Last Month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case '3 Months':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6 Months':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case '1 Year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'Custom Range':
      startDate = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = customEnd ? new Date(customEnd) : now;
      if (endDate) {
         endDate.setHours(23, 59, 59, 999);
      }
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Default This Month
  }
  return { startDate, endDate };
};

/**
 * Get Advanced Analytics Data
 */
const getAdvancedAnalytics = async (userId, filter, customStart, customEnd) => {
  const { startDate, endDate } = getDateRange(filter, customStart, customEnd);
  
  // 1. Get all transactions in period
  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).populate('categoryId', 'name icon color monthlyBudget');

  // Basic Stats
  let totalIncome = 0;
  let totalExpenses = 0;
  const expensesByCategory = {};
  const expensesByDay = {};
  
  transactions.forEach(tx => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      
      // Category aggregation
      const catId = tx.categoryId ? tx.categoryId._id.toString() : 'uncategorized';
      if (!expensesByCategory[catId]) {
        expensesByCategory[catId] = {
          amount: 0,
          name: tx.categoryId ? tx.categoryId.name : 'Uncategorized',
          color: tx.categoryId ? tx.categoryId.color : '#888888',
          budget: tx.categoryId ? tx.categoryId.monthlyBudget : 0
        };
      }
      expensesByCategory[catId].amount += tx.amount;

      // Daily aggregation
      const dayKey = tx.date.toISOString().split('T')[0];
      expensesByDay[dayKey] = (expensesByDay[dayKey] || 0) + tx.amount;
    }
  });

  const totalSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  
  // Calculate days in period for averages
  const daysInPeriod = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const averageDailySpending = totalExpenses / daysInPeriod;

  // Highest spending category
  let highestCategory = null;
  let maxCatSpent = 0;
  for (const cat in expensesByCategory) {
    if (expensesByCategory[cat].amount > maxCatSpent) {
      maxCatSpent = expensesByCategory[cat].amount;
      highestCategory = expensesByCategory[cat].name;
    }
  }

  // Highest spending day
  let highestDay = null;
  let maxDaySpent = 0;
  for (const day in expensesByDay) {
    if (expensesByDay[day] > maxDaySpent) {
      maxDaySpent = expensesByDay[day];
      highestDay = day;
    }
  }

  // Budget Utilization & Overspending
  let totalBudget = 0;
  let totalOverspending = 0;
  for (const cat in expensesByCategory) {
    totalBudget += expensesByCategory[cat].budget;
    if (expensesByCategory[cat].amount > expensesByCategory[cat].budget) {
      totalOverspending += (expensesByCategory[cat].amount - expensesByCategory[cat].budget);
    }
  }
  const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  // Formatting Daily Chart Data
  const dailySpendingChart = Object.keys(expensesByDay).sort().map(date => ({
    date,
    amount: expensesByDay[date]
  }));

  // Category Pie Chart Data
  const categorySpendingChart = Object.values(expensesByCategory).map(c => ({
    name: c.name,
    value: c.amount,
    color: c.color
  })).sort((a, b) => b.value - a.value);

  // Get Monthly Trend (up to 6 months back from end date)
  const sixMonthsAgo = new Date(endDate);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const trendTransactions = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: sixMonthsAgo, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type"
        },
        total: { $sum: "$amount" }
      }
    }
  ]);

  const monthlyTrendMap = {};
  trendTransactions.forEach(t => {
    const key = `${t._id.year}-${String(t._id.month).padStart(2, '0')}`;
    if (!monthlyTrendMap[key]) monthlyTrendMap[key] = { month: key, income: 0, expense: 0 };
    if (t._id.type === 'income') monthlyTrendMap[key].income = t.total;
    else monthlyTrendMap[key].expense = t.total;
  });

  const monthlyTrendChart = Object.values(monthlyTrendMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => ({
      ...m,
      savings: m.income - m.expense
    }));

  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    savingsRate,
    averageDailySpending,
    highestCategory,
    highestDay,
    budgetUtilization,
    totalOverspending,
    charts: {
      dailySpending: dailySpendingChart,
      categorySpending: categorySpendingChart,
      monthlyTrend: monthlyTrendChart
    }
  };
};

/**
 * Get Financial Health Score
 */
const getFinancialHealthScore = async (userId) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // 1. Savings Rate (30 points)
  // Need 3 months data to get a stable picture
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  
  const recentTransactions = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: threeMonthsAgo } } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } }
  ]);

  let income = 0, expense = 0;
  recentTransactions.forEach(t => {
    if (t._id === 'income') income = t.total;
    else expense = t.total;
  });

  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
  
  let savingsScore = 0;
  if (savingsRate >= 20) savingsScore = 30; // 20%+ is excellent
  else if (savingsRate >= 10) savingsScore = 20; // 10-20% is good
  else if (savingsRate > 0) savingsScore = 10; // Positive is okay
  else savingsScore = 0; // Negative is bad

  // 2. Budget Adherence (30 points)
  // Calculate total overspending this month
  const categories = await Category.find({ userId });
  let totalBudget = 0;
  categories.forEach(c => totalBudget += c.monthlyBudget);

  const thisMonthExpenses = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'expense', date: { $gte: currentMonthStart } } },
    { $group: { _id: "$categoryId", total: { $sum: "$amount" } } }
  ]);

  let totalOverspent = 0;
  thisMonthExpenses.forEach(exp => {
    const cat = categories.find(c => c._id.toString() === exp._id?.toString());
    if (cat && exp.total > cat.monthlyBudget) {
      totalOverspent += (exp.total - cat.monthlyBudget);
    }
  });

  let budgetScore = 30;
  if (totalBudget > 0) {
    const overspendRatio = totalOverspent / totalBudget;
    if (overspendRatio > 0.5) budgetScore = 0;
    else if (overspendRatio > 0.2) budgetScore = 10;
    else if (overspendRatio > 0) budgetScore = 20;
  }

  // 3. Expense Growth (20 points)
  const prevMonthExpenses = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'expense', date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const currentMonthTotal = thisMonthExpenses.reduce((sum, curr) => sum + curr.total, 0);
  const prevMonthTotal = prevMonthExpenses.length > 0 ? prevMonthExpenses[0].total : 0;

  let expenseScore = 20;
  if (prevMonthTotal > 0) {
    const growth = (currentMonthTotal - prevMonthTotal) / prevMonthTotal;
    // Note: Comparing current month (partial) to previous month (full) isn't perfect unless pro-rated, 
    // but simplified for this phase.
    if (growth > 0.1) expenseScore = 5;
    else if (growth > 0) expenseScore = 15;
  }

  // 4. Goal Progress (20 points)
  const goals = await Goal.find({ userId });
  let goalScore = 20;
  if (goals.length > 0) {
    let totalGoalTarget = 0;
    let totalGoalCurrent = 0;
    goals.forEach(g => {
      totalGoalTarget += g.targetAmount;
      totalGoalCurrent += g.currentAmount;
    });
    const goalRatio = totalGoalTarget > 0 ? totalGoalCurrent / totalGoalTarget : 0;
    if (goalRatio < 0.1) goalScore = 5;
    else if (goalRatio < 0.5) goalScore = 10;
    else if (goalRatio < 0.8) goalScore = 15;
  } else {
    // If no goals, maybe give partial score
    goalScore = 10;
  }

  const totalScore = savingsScore + budgetScore + expenseScore + goalScore;
  let status = 'POOR';
  if (totalScore >= 80) status = 'EXCELLENT';
  else if (totalScore >= 60) status = 'GOOD';
  else if (totalScore >= 40) status = 'FAIR';

  // Generate an explanation string
  const explanation = `Your score is ${status}. Savings rate contributed ${savingsScore}/30, budget adherence ${budgetScore}/30, expense control ${expenseScore}/20, and goal progress ${goalScore}/20.`;

  return {
    score: totalScore,
    status,
    breakdown: {
      savings: savingsScore,
      budget: budgetScore,
      expenses: expenseScore,
      goals: goalScore
    },
    explanation
  };
};

/**
 * Category Spending Analysis
 */
const getCategoryAnalysis = async (userId, categoryId) => {
  const category = await Category.findOne({ _id: categoryId, userId });
  if (!category) throw new Error('Category not found');

  const now = new Date();
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Current Month Spending
  const currTx = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), categoryId: category._id, date: { $gte: currentStart } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const currentMonthSpending = currTx.length > 0 ? currTx[0].total : 0;

  // Previous Month Spending
  const prevTx = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), categoryId: category._id, date: { $gte: prevStart, $lte: prevEnd } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const previousMonthSpending = prevTx.length > 0 ? prevTx[0].total : 0;

  // All Time Average
  const allTx = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), categoryId: category._id } },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        total: { $sum: "$amount" }
      }
    },
    { $group: { _id: null, avg: { $avg: "$total" } } }
  ]);
  const averageSpending = allTx.length > 0 ? allTx[0].avg : 0;

  let percentageChange = 0;
  if (previousMonthSpending > 0) {
    percentageChange = ((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100;
  } else if (currentMonthSpending > 0) {
    percentageChange = 100;
  }

  const budgetUsage = category.monthlyBudget > 0 ? (currentMonthSpending / category.monthlyBudget) * 100 : 0;
  const overspent = currentMonthSpending > category.monthlyBudget ? currentMonthSpending - category.monthlyBudget : 0;

  return {
    category,
    currentMonthSpending,
    previousMonthSpending,
    averageSpending,
    budgetUsage,
    overspent,
    percentageChange
  };
};

module.exports = {
  getAdvancedAnalytics,
  getFinancialHealthScore,
  getCategoryAnalysis
};
