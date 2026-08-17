const Transaction = require('../models/Transaction');
const Anomaly = require('../models/Anomaly');
const notificationService = require('./notificationService');

/**
 * Detect anomalies based on statistical deviations (Z-score)
 * This runs when a new transaction is created or via daily cron.
 */
const detectAnomalyForTransaction = async (userId, transactionId, amount, categoryId) => {
    // Need at least 5 previous transactions in this category to establish a baseline
    const previousTx = await Transaction.find({
        userId,
        categoryId,
        _id: { $ne: transactionId },
        type: 'expense'
    }).sort({ date: -1 }).limit(30);

    if (previousTx.length < 5) return null; // Not enough data

    const amounts = previousTx.map(t => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / amounts.length);

    // If standard deviation is 0 (all transactions same amount), use a nominal buffer
    const buffer = stdDev === 0 ? mean * 0.1 : stdDev;

    // We consider an amount anomalous if it's > 2.5 standard deviations above mean
    // OR if it's significantly higher than their average (e.g., > 2x mean + buffer)
    const zScore = stdDev > 0 ? (amount - mean) / stdDev : 0;
    
    if (zScore > 2.5 || (amount > mean * 2.5 && amount > 500)) {
        const severity = zScore > 4 ? 'High' : (zScore > 3 ? 'Medium' : 'Low');
        
        const anomaly = await Anomaly.create({
            userId,
            transactionId,
            reason: `Transaction amount is significantly higher than your typical expenses in this category. (Avg: ₹${Math.round(mean)})`,
            expectedRangeMin: Math.max(0, Math.round(mean - buffer)),
            expectedRangeMax: Math.round(mean + buffer * 2),
            severity,
            status: 'unresolved'
        });

        // Notify user
        await notificationService.createNotification(
            userId,
            '🚨 Unusual Expense Detected',
            `An unusually high transaction of ₹${amount} was recorded.`,
            'alert'
        );

        return anomaly;
    }

    return null;
};

const getAnomalies = async (userId) => {
    return await Anomaly.find({ userId }).populate('transactionId').sort({ createdAt: -1 }).limit(20);
};

module.exports = {
    detectAnomalyForTransaction,
    getAnomalies
};
