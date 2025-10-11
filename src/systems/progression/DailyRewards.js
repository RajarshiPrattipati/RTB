/**
 * DailyRewards System
 * Manages daily login rewards with Soul bonuses
 */

import economyManager from '../economy/EconomyManager';

/**
 * DailyRewards Class
 * Handles daily login bonuses and streak tracking
 */
export class DailyRewards {
  constructor() {
    this.DAILY_LOGIN_REWARDS = this.generateDailyLoginRewards();
    this.MAX_STREAK_DAYS = 30;
  }

  /**
   * Generate Daily Login Rewards
   * @returns {Object} Rewards for each day (1-7, then repeating)
   */
  generateDailyLoginRewards() {
    return {
      day1: {
        gold: 50,
        souls: 3,
        xp: 100,
        message: 'Welcome back! 👋'
      },
      day2: {
        gold: 75,
        souls: 5,
        xp: 150,
        message: 'Day 2 Streak! 🔥'
      },
      day3: {
        gold: 100,
        souls: 7,
        xp: 200,
        message: 'Day 3 Streak! 🔥🔥'
      },
      day4: {
        gold: 125,
        souls: 9,
        xp: 250,
        message: 'Day 4 Streak! 🔥🔥🔥'
      },
      day5: {
        gold: 150,
        souls: 12,
        xp: 300,
        message: 'Day 5 Streak! 🎯'
      },
      day6: {
        gold: 200,
        souls: 15,
        xp: 400,
        message: 'Day 6 Streak! ⭐'
      },
      day7: {
        gold: 500,
        souls: 25,
        gems: 2,
        xp: 1000,
        message: 'Week Complete! 🎉'
      }
    };
  }

  /**
   * Claim Daily Login Reward
   * @param {Object} player - Player state object
   * @param {Object} loginData - Login streak data
   * @returns {Object} Result with rewards
   */
  claimDailyLoginReward(player, loginData) {
    if (!player || !loginData) {
      return { success: false, reason: 'Invalid parameters' };
    }

    // Check if already claimed today
    if (this.hasClaimedToday(loginData.lastClaimTime)) {
      return {
        success: false,
        reason: 'Daily reward already claimed',
        nextRewardAvailable: this.getNextRewardTime(loginData.lastClaimTime)
      };
    }

    // Calculate streak
    const newStreak = this.calculateStreak(loginData);
    const dayIndex = ((newStreak - 1) % 7) + 1; // 1-7 cycle
    const rewardKey = `day${dayIndex}`;
    const reward = this.DAILY_LOGIN_REWARDS[rewardKey];

    if (!reward) {
      return { success: false, reason: 'Reward not found' };
    }

    // Award rewards
    const awarded = {};

    if (reward.souls) {
      economyManager.awardSouls(player, reward.souls, 'daily_login');
      awarded.souls = reward.souls;
    }

    if (reward.gold) {
      economyManager.awardGold(player, reward.gold, 'daily_login');
      awarded.gold = reward.gold;
    }

    if (reward.gems) {
      economyManager.awardGems(player, reward.gems, 'daily_login');
      awarded.gems = reward.gems;
    }

    if (reward.xp && player.xp !== undefined) {
      player.xp += reward.xp;
      awarded.xp = reward.xp;
    }

    // Update login data
    loginData.lastClaimTime = Date.now();
    loginData.currentStreak = newStreak;
    loginData.totalLogins = (loginData.totalLogins || 0) + 1;

    if (newStreak > (loginData.maxStreak || 0)) {
      loginData.maxStreak = newStreak;
    }

    return {
      success: true,
      awarded,
      streak: newStreak,
      dayIndex,
      message: reward.message,
      nextRewardAvailable: this.getNextRewardTime(Date.now())
    };
  }

  /**
   * Calculate Current Streak
   * @param {Object} loginData - Login data with timestamps
   * @returns {number} Current streak days
   */
  calculateStreak(loginData) {
    if (!loginData.lastClaimTime) {
      return 1; // First login
    }

    const now = Date.now();
    const lastClaim = loginData.lastClaimTime;
    const timeSinceLast = now - lastClaim;

    const ONE_DAY = 24 * 60 * 60 * 1000;
    const TWO_DAYS = 2 * ONE_DAY;

    // If less than 48 hours, continue streak
    if (timeSinceLast < TWO_DAYS) {
      return (loginData.currentStreak || 0) + 1;
    }

    // Streak broken, reset to 1
    return 1;
  }

  /**
   * Check if Reward Already Claimed Today
   * @param {number} lastClaimTime - Timestamp of last claim
   * @returns {boolean} True if already claimed today
   */
  hasClaimedToday(lastClaimTime) {
    if (!lastClaimTime) return false;

    const now = Date.now();
    const timeSinceLast = now - lastClaimTime;
    const ONE_DAY = 24 * 60 * 60 * 1000;

    return timeSinceLast < ONE_DAY;
  }

  /**
   * Get Next Reward Available Time
   * @param {number} lastClaimTime - Timestamp of last claim
   * @returns {number} Timestamp when next reward is available
   */
  getNextRewardTime(lastClaimTime) {
    if (!lastClaimTime) return Date.now();

    const ONE_DAY = 24 * 60 * 60 * 1000;
    return lastClaimTime + ONE_DAY;
  }

  /**
   * Get Reward Preview for Next Day
   * @param {number} currentStreak - Current login streak
   * @returns {Object} Next day's reward
   */
  getNextDayReward(currentStreak) {
    const nextDay = ((currentStreak % 7) + 1);
    const rewardKey = `day${nextDay}`;
    return this.DAILY_LOGIN_REWARDS[rewardKey];
  }

  /**
   * Get Reward for Specific Day
   * @param {number} dayIndex - Day index (1-7)
   * @returns {Object} Reward for that day
   */
  getRewardForDay(dayIndex) {
    if (dayIndex < 1 || dayIndex > 7) {
      return null;
    }

    const rewardKey = `day${dayIndex}`;
    return this.DAILY_LOGIN_REWARDS[rewardKey];
  }

  /**
   * Award Achievement-Based Soul Rewards
   * @param {Object} player - Player state object
   * @param {string} achievementId - Achievement ID
   * @returns {Object} Result with rewards
   */
  awardAchievementReward(player, achievementId) {
    const ACHIEVEMENT_REWARDS = {
      revive_first_time: {
        souls: 50,
        title: 'Survivor',
        message: 'Back from the Dead! Achievement unlocked!'
      },
      kill_100_enemies: {
        souls: 100,
        title: 'Soul Collector',
        message: '100 Kills! Achievement unlocked!'
      },
      win_streak_10: {
        souls: 75,
        gems: 3,
        title: 'Unstoppable',
        message: '10 Win Streak! Achievement unlocked!'
      },
      complete_all_daily: {
        souls: 30,
        gems: 2,
        title: 'Completionist',
        message: 'All Daily Missions Complete!'
      },
      login_streak_30: {
        souls: 200,
        gems: 10,
        title: 'Dedicated',
        message: '30 Day Login Streak! Achievement unlocked!'
      }
    };

    const reward = ACHIEVEMENT_REWARDS[achievementId];

    if (!reward) {
      return { success: false, reason: 'Achievement not found' };
    }

    const awarded = {};

    if (reward.souls) {
      economyManager.awardSouls(player, reward.souls, `achievement_${achievementId}`);
      awarded.souls = reward.souls;
    }

    if (reward.gems) {
      economyManager.awardGems(player, reward.gems, `achievement_${achievementId}`);
      awarded.gems = reward.gems;
    }

    return {
      success: true,
      achievement: achievementId,
      awarded,
      title: reward.title,
      message: reward.message
    };
  }

  /**
   * Get Login Streak Bonus
   * @param {number} streak - Current streak
   * @returns {Object} Bonus rewards for maintaining streak
   */
  getStreakBonus(streak) {
    if (streak < 7) return null;

    // Bonus for every 7 days
    const weekCount = Math.floor(streak / 7);
    const bonusMultiplier = Math.min(weekCount, 4); // Cap at 4x

    return {
      souls: 10 * bonusMultiplier,
      gold: 100 * bonusMultiplier,
      message: `${weekCount} week${weekCount > 1 ? 's' : ''} streak bonus!`
    };
  }

  /**
   * Get Daily Rewards Summary
   * @param {Object} loginData - Player's login data
   * @returns {Object} Summary information
   */
  getDailyRewardsSummary(loginData) {
    if (!loginData) {
      return {
        currentStreak: 0,
        maxStreak: 0,
        totalLogins: 0,
        canClaimToday: true,
        nextReward: this.getRewardForDay(1)
      };
    }

    const canClaim = !this.hasClaimedToday(loginData.lastClaimTime);
    const currentStreak = loginData.currentStreak || 0;
    const nextDayIndex = ((currentStreak % 7) + 1);

    return {
      currentStreak,
      maxStreak: loginData.maxStreak || 0,
      totalLogins: loginData.totalLogins || 0,
      canClaimToday: canClaim,
      nextReward: this.getRewardForDay(nextDayIndex),
      nextRewardTime: this.getNextRewardTime(loginData.lastClaimTime),
      streakBonus: this.getStreakBonus(currentStreak)
    };
  }
}

// Export singleton instance
export default new DailyRewards();
