/**
 * Soul Manager
 * Manages Soul currency acquisition, conversion, and tracking
 */

/**
 * Soul Source Types
 */
export const SOUL_SOURCE = {
  KILL: 'kill',
  MISSION: 'mission',
  DAILY_LOGIN: 'daily_login',
  ACHIEVEMENT: 'achievement',
  SHOP_PURCHASE: 'shop_purchase',
  EVENT: 'event',
  GIFT: 'gift',
};

/**
 * SoulManager class
 * Handles all Soul currency operations
 */
export class SoulManager {
  constructor(eventBus = null) {
    this.eventBus = eventBus;
    this.goldToSoulConversionRate = 100; // 100 Gold = 1 Soul
  }

  /**
   * Award Souls to player
   * @param {Object} player - Player object with currencies
   * @param {number} amount - Amount of Souls to award
   * @param {string} source - Source of the Souls (from SOUL_SOURCE enum)
   * @param {Object} metadata - Additional context
   * @returns {Object} Result object
   */
  awardSouls(player, amount, source = SOUL_SOURCE.GIFT, metadata = {}) {
    if (!player || !player.currencies) {
      return {
        success: false,
        message: 'Invalid player object',
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        message: 'Amount must be positive',
      };
    }

    // Initialize souls if not present
    if (typeof player.currencies.souls !== 'number') {
      player.currencies.souls = 0;
    }

    // Award Souls
    player.currencies.souls += amount;

    // Emit event
    if (this.eventBus) {
      this.eventBus.emit('soul:gained', {
        amount,
        source,
        metadata,
        newTotal: player.currencies.souls,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      message: `+${amount} Souls from ${source}`,
      amount,
      newTotal: player.currencies.souls,
    };
  }

  /**
   * Award Soul for killing an opponent
   * @param {Object} player - Player object
   * @param {Object} opponent - Opponent that was defeated
   * @returns {Object} Result
   */
  awardSoulForKill(player, opponent) {
    const SOULS_PER_KILL = 1;
    return this.awardSouls(player, SOULS_PER_KILL, SOUL_SOURCE.KILL, {
      opponentName: opponent.name || 'Unknown',
      opponentId: opponent.id || null,
    });
  }

  /**
   * Award Souls for mission completion
   * @param {Object} player - Player object
   * @param {number} amount - Soul reward amount
   * @param {Object} mission - Mission data
   * @returns {Object} Result
   */
  awardMissionSouls(player, amount, mission) {
    return this.awardSouls(player, amount, SOUL_SOURCE.MISSION, {
      missionId: mission.id,
      missionName: mission.name || mission.desc,
    });
  }

  /**
   * Award daily login Souls
   * @param {Object} player - Player object
   * @param {number} dayStreak - Current login streak
   * @returns {Object} Result
   */
  awardDailyLoginSouls(player, dayStreak = 1) {
    let amount = 3; // Base daily reward

    // Bonus for streaks
    if (dayStreak >= 7) amount = 10;
    else if (dayStreak >= 3) amount = 5;

    return this.awardSouls(player, amount, SOUL_SOURCE.DAILY_LOGIN, {
      dayStreak,
    });
  }

  /**
   * Award Souls for achievement
   * @param {Object} player - Player object
   * @param {number} amount - Soul reward
   * @param {Object} achievement - Achievement data
   * @returns {Object} Result
   */
  awardAchievementSouls(player, amount, achievement) {
    return this.awardSouls(player, amount, SOUL_SOURCE.ACHIEVEMENT, {
      achievementId: achievement.id,
      achievementName: achievement.name,
    });
  }

  /**
   * Convert Gold to Souls
   * @param {Object} player - Player object with currencies
   * @param {number} goldAmount - Amount of Gold to convert
   * @returns {Object} Result object
   */
  convertGoldToSouls(player, goldAmount) {
    if (!player || !player.currencies) {
      return {
        success: false,
        message: 'Invalid player object',
      };
    }

    if (goldAmount <= 0) {
      return {
        success: false,
        message: 'Gold amount must be positive',
      };
    }

    // Check if player has enough Gold
    if (player.currencies.gold < goldAmount) {
      return {
        success: false,
        message: `Insufficient Gold. Need ${goldAmount}, have ${player.currencies.gold}`,
        goldRequired: goldAmount,
        goldAvailable: player.currencies.gold,
      };
    }

    // Calculate Souls to receive
    const soulsToGain = Math.floor(goldAmount / this.goldToSoulConversionRate);

    if (soulsToGain === 0) {
      return {
        success: false,
        message: `Minimum ${this.goldToSoulConversionRate} Gold required for 1 Soul`,
      };
    }

    // Calculate actual Gold spent (in case goldAmount doesn't divide evenly)
    const goldSpent = soulsToGain * this.goldToSoulConversionRate;

    // Perform conversion
    player.currencies.gold -= goldSpent;
    player.currencies.souls = (player.currencies.souls || 0) + soulsToGain;

    // Emit event
    if (this.eventBus) {
      this.eventBus.emit('soul:purchased', {
        goldSpent,
        soulsGained: soulsToGain,
        newGoldTotal: player.currencies.gold,
        newSoulTotal: player.currencies.souls,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      message: `Converted ${goldSpent} Gold to ${soulsToGain} Souls`,
      goldSpent,
      soulsGained: soulsToGain,
      remainingGold: player.currencies.gold,
      newSoulTotal: player.currencies.souls,
    };
  }

  /**
   * Get Soul packages available in shop
   * @returns {Array<Object>} Soul packages
   */
  getSoulPackages() {
    return [
      {
        id: 'soul_pack_1',
        souls: 1,
        gold: 100,
        discount: 0,
      },
      {
        id: 'soul_pack_10',
        souls: 10,
        gold: 900, // 10% discount
        discount: 10,
      },
      {
        id: 'soul_pack_50',
        souls: 50,
        gold: 4000, // 20% discount
        discount: 20,
      },
      {
        id: 'soul_pack_100',
        souls: 100,
        gold: 7000, // 30% discount
        discount: 30,
      },
    ];
  }

  /**
   * Purchase a Soul package
   * @param {Object} player - Player object
   * @param {string} packageId - Package ID from getSoulPackages()
   * @returns {Object} Result
   */
  purchaseSoulPackage(player, packageId) {
    const packages = this.getSoulPackages();
    const pkg = packages.find(p => p.id === packageId);

    if (!pkg) {
      return {
        success: false,
        message: 'Invalid package',
      };
    }

    return this.convertGoldToSouls(player, pkg.gold);
  }

  /**
   * Spend Souls
   * @param {Object} player - Player object
   * @param {number} amount - Amount to spend
   * @param {string} purpose - What the Souls are being spent on
   * @returns {Object} Result
   */
  spendSouls(player, amount, purpose = 'unknown') {
    if (!player || !player.currencies) {
      return {
        success: false,
        message: 'Invalid player object',
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        message: 'Amount must be positive',
      };
    }

    if (player.currencies.souls < amount) {
      return {
        success: false,
        message: `Insufficient Souls. Need ${amount}, have ${player.currencies.souls}`,
        required: amount,
        available: player.currencies.souls,
      };
    }

    // Spend Souls
    player.currencies.souls -= amount;

    // Emit event
    if (this.eventBus) {
      this.eventBus.emit('soul:spent', {
        amount,
        purpose,
        newTotal: player.currencies.souls,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      message: `Spent ${amount} Souls on ${purpose}`,
      amount,
      remainingSouls: player.currencies.souls,
    };
  }

  /**
   * Check if player has enough Souls
   * @param {Object} player - Player object
   * @param {number} amount - Amount to check
   * @returns {boolean}
   */
  hasSufficientSouls(player, amount) {
    return player && player.currencies && player.currencies.souls >= amount;
  }

  /**
   * Get player's Soul balance
   * @param {Object} player - Player object
   * @returns {number} Soul balance
   */
  getSoulBalance(player) {
    if (!player || !player.currencies) {
      return 0;
    }
    return player.currencies.souls || 0;
  }

  /**
   * Calculate how much Gold is needed for specific Soul amount
   * @param {number} soulsNeeded - Target Soul amount
   * @returns {number} Gold required
   */
  calculateGoldForSouls(soulsNeeded) {
    return soulsNeeded * this.goldToSoulConversionRate;
  }

  /**
   * Calculate how many Souls can be bought with Gold
   * @param {number} goldAvailable - Available Gold
   * @returns {number} Maximum Souls that can be purchased
   */
  calculateSoulsFromGold(goldAvailable) {
    return Math.floor(goldAvailable / this.goldToSoulConversionRate);
  }

  /**
   * Get Soul transaction history (if tracking is enabled)
   * @param {Object} player - Player object
   * @returns {Array<Object>} Transaction history
   */
  getSoulHistory(player) {
    if (!player.soulHistory) {
      return [];
    }
    return player.soulHistory;
  }

  /**
   * Track a Soul transaction (optional feature)
   * @param {Object} player - Player object
   * @param {string} type - 'gain' or 'spend'
   * @param {number} amount - Amount
   * @param {string} source - Source or purpose
   */
  trackSoulTransaction(player, type, amount, source) {
    if (!player.soulHistory) {
      player.soulHistory = [];
    }

    player.soulHistory.push({
      type,
      amount,
      source,
      balance: player.currencies.souls,
      timestamp: Date.now(),
    });

    // Keep only last 100 transactions
    if (player.soulHistory.length > 100) {
      player.soulHistory = player.soulHistory.slice(-100);
    }
  }
}

export default SoulManager;
