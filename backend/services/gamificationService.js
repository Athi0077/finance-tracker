const User = require('../models/User');

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
