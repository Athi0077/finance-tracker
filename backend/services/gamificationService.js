const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

const BADGE_DEFINITIONS = {
  first_step: {
    id: 'first_step',
    name: 'First Step',
    icon: 'Footprints',
    description: 'Logged your very first transaction.'
  },
  consistent_3: {
    id: 'consistent_3',
    name: 'Getting Started',
    icon: 'Flame',
    description: 'Maintained a 3-day tracking streak.'
  },
  consistent_7: {
    id: 'consistent_7',
    name: 'Consistent Tracker',
    icon: 'Award',
    description: 'Maintained a 7-day tracking streak.'
  },
  frugal_friday: {
    id: 'frugal_friday',
    name: 'Frugal Friday',
    icon: 'CalendarHeart',
    description: 'Completed a Friday with absolutely no expenses!'
  },
  savings_master: {
    id: 'savings_master',
    name: 'Savings Master',
    icon: 'PiggyBank',
    description: 'Kept monthly expenses under 80% of your total budget.'
  }
};

const updateStreakAndBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let isStreakUpdated = false;

    if (user.streak && user.streak.lastTransactionDate) {
      const lastTx = new Date(user.streak.lastTransactionDate);
      const lastTxDay = new Date(lastTx.getFullYear(), lastTx.getMonth(), lastTx.getDate());
      
      const diffTime = Math.abs(today - lastTxDay);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        user.streak.current += 1;
        isStreakUpdated = true;
      } else if (diffDays > 1) {
        // Streak broken
        user.streak.current = 1;
        isStreakUpdated = true;
      } else if (diffDays === 0) {
        // Already logged today
        // No action needed for streak, but if it's 0 because they just created their account, ensure it's at least 1
        if (user.streak.current === 0) {
           user.streak.current = 1;
           isStreakUpdated = true;
        }
      }
    } else {
      // First ever transaction
      if (!user.streak) {
        user.streak = { current: 1, longest: 1, lastTransactionDate: now };
      } else {
        user.streak.current = 1;
      }
      isStreakUpdated = true;
    }

    if (isStreakUpdated) {
      user.streak.lastTransactionDate = now;
      user.streak.longest = Math.max(user.streak.longest || 0, user.streak.current);
    }

    // Check Badges
    const existingBadgeIds = user.badges.map(b => b.id);
    let badgesAwarded = false;

    const awardBadge = (badgeKey) => {
      if (!existingBadgeIds.includes(badgeKey)) {
        user.badges.push(BADGE_DEFINITIONS[badgeKey]);
        badgesAwarded = true;
      }
    };

    // Rule 1: First Step
    awardBadge('first_step');

    // Rule 2: 3-Day Streak
    if (user.streak.current >= 3) {
      awardBadge('consistent_3');
    }

    // Rule 3: 7-Day Streak
    if (user.streak.current >= 7) {
      awardBadge('consistent_7');
    }

    // Rule 4: Frugal Friday (Evaluated on Saturday or later if last active was Friday)
    // A simplified approach: if it's currently Friday and they log an *income*, or if it's Saturday and we check Friday.
    // For immediate reward: if it's Friday, and we check their expenses for today, and it's 0.
    if (today.getDay() === 5 && !existingBadgeIds.includes('frugal_friday')) { // Friday
      const fridayExpenses = await Transaction.countDocuments({
        userId,
        type: 'expense',
        date: {
          $gte: new Date(now.setHours(0,0,0,0)),
          $lt: new Date(now.setHours(23,59,59,999))
        }
      });
      // We'll optimistically award it if they haven't spent anything yet today
      if (fridayExpenses === 0) {
        awardBadge('frugal_friday');
      }
    }

    // Rule 5: Savings Master
    if (!existingBadgeIds.includes('savings_master')) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const [expenseData] = await Transaction.aggregate([
        { $match: { userId: user._id, type: 'expense', date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalExpenses = expenseData?.total || 0;

      const [budgetData] = await Category.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, total: { $sum: '$budget' } } }
      ]);
      const totalBudget = budgetData?.total || 0;

      if (totalBudget > 0 && totalExpenses > 0 && totalExpenses < (totalBudget * 0.8)) {
        awardBadge('savings_master');
      }
    }

    if (isStreakUpdated || badgesAwarded) {
      await user.save();
    }

  } catch (error) {
    console.error('Error updating gamification:', error);
  }
};

module.exports = {
  updateStreakAndBadges
};
