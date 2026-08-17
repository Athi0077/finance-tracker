const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Recommendation = require('../models/Recommendation');

/**
 * Generate smart recommendations based on user spending habits.
 */
const generateRecommendations = async (userId) => {
    // 1. Budget Recommendations (Category overspending or unused budget)
    const now = new Date();
    const categories = await Category.find({ userId });
    
    for (const cat of categories) {
        // Get last 3 months expenses for this category
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        
        const txs = await Transaction.aggregate([
            { $match: { userId: cat.userId, categoryId: cat._id, type: 'expense', date: { $gte: threeMonthsAgo } } },
            { $group: { _id: { month: { $month: "$date" } }, total: { $sum: "$amount" } } }
        ]);

        if (txs.length >= 2) {
            const avgSpent = txs.reduce((acc, curr) => acc + curr.total, 0) / txs.length;
            
            if (cat.budget > 0 && avgSpent > cat.budget * 1.1) { // Consistently overspending by 10%
                const recommendedBudget = Math.round(avgSpent * 1.05); // Add 5% buffer
                const existingRec = await Recommendation.findOne({ userId, type: 'budget', relatedId: cat._id, status: 'new' });
                
                if (!existingRec) {
                    await Recommendation.create({
                        userId,
                        title: `Adjust budget for ${cat.name}`,
                        explanation: `Your average spending in ${cat.name} over the last few months is ₹${Math.round(avgSpent)}. A budget of ₹${recommendedBudget} gives you a realistic buffer while remaining close to historical spending.`,
                        type: 'budget',
                        actionType: 'modify_budget',
                        relatedId: cat._id
                    });
                }
            }
        }
    }

    // 2. Goal Recommendations
    const goals = await Goal.find({ userId });
    for (const goal of goals) {
        if (goal.currentAmount < goal.targetAmount) {
            const remaining = goal.targetAmount - goal.currentAmount;
            const monthsLeft = Math.max(1, (new Date(goal.targetDate) - now) / (1000 * 60 * 60 * 24 * 30));
            const requiredPerMonth = remaining / monthsLeft;

            if (requiredPerMonth > 0) {
                const existingRec = await Recommendation.findOne({ userId, type: 'goal', relatedId: goal._id, status: 'new' });
                if (!existingRec) {
                    await Recommendation.create({
                        userId,
                        title: `Speed up your "${goal.name}" goal`,
                        explanation: `To reach your target by ${new Date(goal.targetDate).toLocaleDateString()}, consider contributing approximately ₹${Math.round(requiredPerMonth)} per month.`,
                        type: 'goal',
                        actionType: 'add_funds',
                        relatedId: goal._id
                    });
                }
            }
        }
    }

    return await Recommendation.find({ userId, status: 'new' });
};

const getRecommendations = async (userId) => {
    return await Recommendation.find({ userId }).populate('relatedId').sort({ createdAt: -1 });
};

module.exports = {
    generateRecommendations,
    getRecommendations
};
