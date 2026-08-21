const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const User = require('../models/User');
const { getMonthRange, computeBudgetStatus } = require('./categoryService');

/**
 * Get dashboard summary for a given month/year
 */
const getDashboardSummary = async (userId, month, year) => {
  const { startOfMonth, startOfNextMonth } = getMonthRange(month, year);

  // Monthly income and expense totals
  const monthlyTotals = await Transaction.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startOfMonth, $lt: startOfNextMonth },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  monthlyTotals.forEach((item) => {
    if (item._id === 'income') monthlyIncome = item.total;
    if (item._id === 'expense') monthlyExpenses = item.total;
  });

  const monthlySavings = monthlyIncome - monthlyExpenses;

  // Total balance (all time income - all time expenses)
  const allTimeTotals = await Transaction.aggregate([
    {
      $match: { userId },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let allTimeIncome = 0;
  let allTimeExpense = 0;
  allTimeTotals.forEach((item) => {
    if (item._id === 'income') allTimeIncome = item.total;
    if (item._id === 'expense') allTimeExpense = item.total;
  });
  const totalBalance = allTimeIncome - allTimeExpense;

  // Recent transactions (last 5)
  const recentTransactions = await Transaction.find({
    userId,
  })
    .populate('categoryId', 'name icon color')
    .sort({ date: -1, createdAt: -1 })
    .limit(5);

  const recentIncome = await Transaction.find({
    userId,
    type: 'income',
  })
    .populate('categoryId', 'name icon color')
    .sort({ date: -1, createdAt: -1 })
    .limit(5);

  const recentExpenses = await Transaction.find({
    userId,
    type: 'expense',
  })
    .populate('categoryId', 'name icon color')
    .sort({ date: -1, createdAt: -1 })
    .limit(5);

  // Category spending breakdown for current month
  const categorySpending = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: 'expense',
        categoryId: { $ne: null },
        date: { $gte: startOfMonth, $lt: startOfNextMonth },
      },
    },
    {
      $group: {
        _id: '$categoryId',
        spent: { $sum: '$amount' },
      },
    },
  ]);

  // Enrich category spending with category details
  const categories = await Category.find({ userId });
  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat._id.toString()] = cat;
  });

  const categorySpendingData = categorySpending
    .filter((item) => categoryMap[item._id.toString()])
    .map((item) => {
      const cat = categoryMap[item._id.toString()];
      const percentage = cat.monthlyBudget > 0
        ? Math.round((item.spent / cat.monthlyBudget) * 1000) / 10
        : 0;
      return {
        _id: cat._id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        spent: item.spent,
        budget: cat.monthlyBudget,
        remaining: cat.monthlyBudget - item.spent,
        percentage,
        status: computeBudgetStatus(percentage),
      };
    })
    .sort((a, b) => b.spent - a.spent);

  // Income vs Expense chart — last 6 months
  const incomeVsExpense = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const { startOfMonth: sm, startOfNextMonth: snm } = getMonthRange(m, y);

    const totals = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sm, $lt: snm },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let inc = 0;
    let exp = 0;
    totals.forEach((item) => {
      if (item._id === 'income') inc = item.total;
      if (item._id === 'expense') exp = item.total;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    incomeVsExpense.push({
      month: monthNames[d.getMonth()],
      year: y,
      income: inc,
      expense: exp,
    });
  }

  // Format month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const currentMonth = `${monthNames[month - 1]} ${year}`;

  const user = await User.findById(userId).select('streak badges');

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    currentMonth,
    recentTransactions,
    recentIncome,
    recentExpenses,
    categorySpending: categorySpendingData,
    incomeVsExpense,
    streak: user?.streak || { current: 0, longest: 0 },
    badges: user?.badges || []
  };
};

module.exports = {
  getDashboardSummary,
};
