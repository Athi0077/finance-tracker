const cron = require('node-cron');
const RecurringTransaction = require('../models/RecurringTransaction');
const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { generateInsights } = require('../services/insightEngine');
const notificationService = require('../services/notificationService');

const initCronJobs = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cron jobs...');
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 1. Process Recurring Transactions
      const dueTransactions = await RecurringTransaction.find({
        isActive: true,
        nextExecutionDate: { $lte: now }
      });

      for (const rt of dueTransactions) {
        if (rt.endDate && now > rt.endDate) {
          rt.isActive = false;
          await rt.save();
          continue;
        }

        // Create transaction
        await Transaction.create({
          userId: rt.userId,
          amount: rt.amount,
          type: rt.type,
          categoryId: rt.categoryId,
          description: rt.name,
          paymentMethod: 'Auto', // Or generic
          date: new Date()
        });

        // Update next execution date
        const nextDate = new Date(rt.nextExecutionDate);
        switch (rt.frequency) {
          case 'Daily': nextDate.setDate(nextDate.getDate() + 1); break;
          case 'Weekly': nextDate.setDate(nextDate.getDate() + 7); break;
          case 'Monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
          case 'Yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
        }
        rt.nextExecutionDate = nextDate;
        await rt.save();

        await notificationService.createNotification(
          rt.userId,
          'Recurring Transaction Processed',
          `Your recurring transaction "${rt.name}" for ₹${rt.amount} was processed.`,
          'info'
        );
      }

      // 2. Subscription Renewals (Warning 3 days before)
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const dueSubscriptions = await Subscription.find({
        status: 'Active',
        nextBillingDate: { $lte: threeDaysFromNow, $gt: now }
      });

      for (const sub of dueSubscriptions) {
        // Find if we already notified for this exact date to avoid spam
        // Simplified for this phase
        await notificationService.createNotification(
          sub.userId,
          'Upcoming Subscription Renewal',
          `Your subscription "${sub.name}" for ₹${sub.amount} renews in a few days.`,
          'warning'
        );
      }

      // 3. Generate Insights for all users
      const users = await User.find({}, '_id');
      for (const user of users) {
        await generateInsights(user._id);
      }

      console.log('Daily cron jobs completed successfully.');
    } catch (error) {
      console.error('Error in daily cron jobs:', error);
    }
  });
};

module.exports = initCronJobs;
