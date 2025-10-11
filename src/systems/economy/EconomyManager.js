/**
 * EconomyManager System
 * Manages all economy-related operations: currencies, conversions, purchases
 */

/**
 * EconomyManager Class
 * Centralized system for handling game economy
 */
export class EconomyManager {
  constructor() {
    this.CONVERSION_RATES = {
      GOLD_TO_SOULS: 100, // 100 Gold = 1 Soul
      GEMS_TO_SPELL_UNLOCKER: 100 // 100 Gems = 1 Spell Unlocker
    };

    this.SOUL_PACKAGES = [
      { souls: 1, gold: 100, discount: 0 },
      { souls: 10, gold: 900, discount: 10 },
      { souls: 50, gold: 4000, discount: 20 },
      { souls: 100, gold: 7000, discount: 30 }
    ];
  }

  /**
   * Convert Gold to Souls
   * @param {Object} player - Player state object
   * @param {number} goldAmount - Amount of Gold to convert
   * @returns {Object} Result with success status and souls gained
   */
  convertGoldToSouls(player, goldAmount) {
    if (!player || !player.currencies) {
      return { success: false, reason: 'Invalid player state' };
    }

    if (goldAmount <= 0) {
      return { success: false, reason: 'Invalid gold amount' };
    }

    const soulsToGain = Math.floor(goldAmount / this.CONVERSION_RATES.GOLD_TO_SOULS);

    if (soulsToGain === 0) {
      return {
        success: false,
        reason: `Minimum ${this.CONVERSION_RATES.GOLD_TO_SOULS} Gold required`
      };
    }

    if (player.currencies.gold < goldAmount) {
      return {
        success: false,
        reason: 'Insufficient Gold',
        shortfall: goldAmount - player.currencies.gold
      };
    }

    // Execute transaction
    player.currencies.gold -= goldAmount;
    player.currencies.souls += soulsToGain;

    return {
      success: true,
      goldSpent: goldAmount,
      soulsGained: soulsToGain,
      newGoldBalance: player.currencies.gold,
      newSoulBalance: player.currencies.souls
    };
  }

  /**
   * Purchase Spell Unlocker with Gems
   * @param {Object} player - Player state object
   * @returns {Object} Result with success status
   */
  purchaseSpellUnlocker(player) {
    if (!player || !player.currencies || !player.inventory) {
      return { success: false, reason: 'Invalid player state' };
    }

    const COST = this.CONVERSION_RATES.GEMS_TO_SPELL_UNLOCKER;

    if (player.currencies.gems < COST) {
      return {
        success: false,
        reason: 'Insufficient Gems',
        shortfall: COST - player.currencies.gems
      };
    }

    // Execute transaction
    player.currencies.gems -= COST;
    player.inventory.spell_unlocker = (player.inventory.spell_unlocker || 0) + 1;

    return {
      success: true,
      gemsSpent: COST,
      itemsOwned: player.inventory.spell_unlocker,
      newGemBalance: player.currencies.gems
    };
  }

  /**
   * Use Spell Unlocker Item
   * @param {Object} player - Player state object
   * @param {Object} hero - Hero object
   * @param {string} buildType - 'primary' or 'secondary'
   * @param {number} slotIndex - Index of slot to unlock
   * @param {Function} unlockCallback - Callback to execute unlock (from SpellLockManager)
   * @returns {Object} Result with success status
   */
  useSpellUnlocker(player, hero, buildType, slotIndex, unlockCallback) {
    if (!player || !player.inventory) {
      return { success: false, reason: 'Invalid player state' };
    }

    if (!player.inventory.spell_unlocker || player.inventory.spell_unlocker <= 0) {
      return {
        success: false,
        reason: 'No Spell Unlockers available'
      };
    }

    // Execute unlock via callback
    const unlockResult = unlockCallback(hero, buildType, slotIndex, Infinity);

    if (unlockResult.success) {
      // Deduct item from inventory
      player.inventory.spell_unlocker--;

      return {
        success: true,
        returnedSpell: unlockResult.returnedSpell,
        itemsRemaining: player.inventory.spell_unlocker
      };
    }

    return {
      success: false,
      reason: unlockResult.reason || 'Failed to unlock spell'
    };
  }

  /**
   * Award Souls from Various Sources
   * @param {Object} player - Player state object
   * @param {number} amount - Amount of Souls to award
   * @param {string} source - Source of Souls (kill, mission, daily, etc.)
   * @returns {Object} Result with success status
   */
  awardSouls(player, amount, source = 'unknown') {
    if (!player || !player.currencies) {
      return { success: false, reason: 'Invalid player state' };
    }

    if (amount <= 0) {
      return { success: false, reason: 'Invalid amount' };
    }

    player.currencies.souls += amount;

    return {
      success: true,
      soulsAwarded: amount,
      source,
      newBalance: player.currencies.souls
    };
  }

  /**
   * Award Gems from Various Sources
   * @param {Object} player - Player state object
   * @param {number} amount - Amount of Gems to award
   * @param {string} source - Source of Gems
   * @returns {Object} Result with success status
   */
  awardGems(player, amount, source = 'unknown') {
    if (!player || !player.currencies) {
      return { success: false, reason: 'Invalid player state' };
    }

    if (amount <= 0) {
      return { success: false, reason: 'Invalid amount' };
    }

    player.currencies.gems += amount;

    return {
      success: true,
      gemsAwarded: amount,
      source,
      newBalance: player.currencies.gems
    };
  }

  /**
   * Award Gold from Various Sources
   * @param {Object} player - Player state object
   * @param {number} amount - Amount of Gold to award
   * @param {string} source - Source of Gold
   * @returns {Object} Result with success status
   */
  awardGold(player, amount, source = 'unknown') {
    if (!player || !player.currencies) {
      return { success: false, reason: 'Invalid player state' };
    }

    if (amount <= 0) {
      return { success: false, reason: 'Invalid amount' };
    }

    player.currencies.gold += amount;

    return {
      success: true,
      goldAwarded: amount,
      source,
      newBalance: player.currencies.gold
    };
  }

  /**
   * Get Soul Package by ID
   * @param {string} packageId - Package ID
   * @returns {Object|null} Package object or null
   */
  getSoulPackage(packageId) {
    return this.SOUL_PACKAGES.find(pkg => pkg.id === packageId) || null;
  }

  /**
   * Calculate Revival Cost based on death count
   * @param {number} deathCount - Number of times hero has died
   * @returns {number} Cost in Souls
   */
  calculateRevivalCost(deathCount) {
    if (deathCount === 0) return 10;
    if (deathCount === 1) return 25;
    return 50; // Caps at 50
  }

  /**
   * Validate Transaction
   * @param {Object} player - Player state object
   * @param {string} currency - Currency type (gold, gems, souls)
   * @param {number} amount - Amount required
   * @returns {Object} Validation result
   */
  validateTransaction(player, currency, amount) {
    if (!player || !player.currencies) {
      return { valid: false, reason: 'Invalid player state' };
    }

    const balance = player.currencies[currency];

    if (balance === undefined) {
      return { valid: false, reason: 'Invalid currency type' };
    }

    if (balance < amount) {
      return {
        valid: false,
        reason: 'Insufficient funds',
        balance,
        required: amount,
        shortfall: amount - balance
      };
    }

    return {
      valid: true,
      balance,
      required: amount
    };
  }

  /**
   * Get Transaction History Entry
   * @param {string} type - Transaction type
   * @param {Object} details - Transaction details
   * @returns {Object} Transaction record
   */
  createTransactionRecord(type, details) {
    return {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      details,
      date: new Date().toISOString()
    };
  }

  /**
   * Get Economy Stats Summary
   * @param {Object} player - Player state object
   * @returns {Object} Economy statistics
   */
  getEconomyStats(player) {
    if (!player || !player.currencies) {
      return null;
    }

    return {
      currencies: {
        gold: player.currencies.gold || 0,
        souls: player.currencies.souls || 0,
        gems: player.currencies.gems || 0,
        shards: player.currencies.shards || 0,
        wildcards: player.currencies.wildcards || 0
      },
      inventory: {
        spell_unlocker: player.inventory?.spell_unlocker || 0
      },
      conversionRates: this.CONVERSION_RATES
    };
  }
}

// Export singleton instance
export default new EconomyManager();
