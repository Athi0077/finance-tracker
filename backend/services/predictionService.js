const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Prediction = require('../models/Prediction');

/**
 * Generate expense predictions for next month based on simple moving average
 * (averaging the last 3 months).
 */
const generatePredictions = async (userId) => {
    const now = new Date();
    const nextMonth = now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2;
    const nextYear = now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear();

    // Clean up old predictions
    await Prediction.deleteMany({ userId, month: nextMonth, year: nextYear });

    const categories = await Category.find({ userId });
    let totalPredictedExpense = 0;

    for (const cat of categories) {
        // Find expenses in this category for the last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        threeMonthsAgo.setDate(1);
        threeMonthsAgo.setHours(0,0,0,0);

        const txs = await Transaction.find({
            userId,
            categoryId: cat._id,
            type: 'expense',
            date: { $gte: threeMonthsAgo }
        });

        if (txs.length === 0) continue;

        // Group by month to find monthly totals
        const monthlyTotals = {};
        txs.forEach(t => {
            const m = t.date.getMonth();
            monthlyTotals[m] = (monthlyTotals[m] || 0) + t.amount;
        });

        const monthsWithData = Object.keys(monthlyTotals).length;
        if (monthsWithData < 2) continue; // Need at least 2 months to predict

        const totalSpent = Object.values(monthlyTotals).reduce((a, b) => a + b, 0);
        const avgSpent = totalSpent / monthsWithData;
        
        totalPredictedExpense += avgSpent;

        await Prediction.create({
            userId,
            type: 'category_expense',
            categoryId: cat._id,
            predictedAmount: Math.round(avgSpent),
            rangeMin: Math.round(avgSpent * 0.9), // +/- 10% range
            rangeMax: Math.round(avgSpent * 1.1),
            confidence: monthsWithData === 3 ? 'High' : 'Moderate',
            month: nextMonth,
            year: nextYear,
            explanation: `Based on your average spending over the last ${monthsWithData} months in ${cat.name}.`
        });
    }

    if (totalPredictedExpense > 0) {
        await Prediction.create({
            userId,
            type: 'total_expense',
            predictedAmount: Math.round(totalPredictedExpense),
            rangeMin: Math.round(totalPredictedExpense * 0.9),
            rangeMax: Math.round(totalPredictedExpense * 1.1),
            confidence: 'Moderate',
            month: nextMonth,
            year: nextYear,
            explanation: 'Based on the aggregate predictions of your individual categories.'
        });
    }

    return await Prediction.find({ userId, month: nextMonth, year: nextYear }).populate('categoryId');
};

const getPredictions = async (userId) => {
    return await Prediction.find({ userId }).populate('categoryId').sort({ createdAt: -1 });
};

module.exports = {
    generatePredictions,
    getPredictions
};
