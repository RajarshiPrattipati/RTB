/**
 * Revival Manager
 * Handles hero death and revival logic with Soul currency
 */

import { HERO_STATUS } from '../../models/Hero';

/**
 * RevivalManager class
 * Manages hero death states and revival with scaling Soul costs
 */
export class RevivalManager {
  constructor(eventBus = null) {
    this.eventBus = eventBus;
  }

  /**
   * Check if a hero can be revived with available Souls
   * @param {Hero} hero - The hero to check
   * @param {number} availableSouls - Player's available Souls
   * @returns {boolean}
   */
  canRevive(hero, availableSouls) {
    if (!hero) {
      return false;
    }

    return (
      hero.status === HERO_STATUS.DEAD &&
      availableSouls >= hero.revivalCost
    );
  }

  /**
   * Revive a hero by spending Souls
   * @param {Hero} hero - The hero to revive
   * @param {Object} player - Player object with currencies
   * @returns {Object} Result object { success, message, soulsSpent, hero }
   */
  reviveHero(hero, player) {
    // Validation: Check hero exists
    if (!hero) {
      return {
        success: false,
        message: 'Hero not found',
        soulsSpent: 0,
      };
    }

    // Validation: Check hero is dead
    if (hero.status !== HERO_STATUS.DEAD) {
      return {
        success: false,
        message: 'Hero is already alive',
        soulsSpent: 0,
      };
    }

    // Validation: Check sufficient Souls
    if (player.souls < hero.revivalCost) {
      return {
        success: false,
        message: `Insufficient Souls. Need ${hero.revivalCost}, have ${player.souls}`,
        soulsSpent: 0,
        requiredSouls: hero.revivalCost,
        availableSouls: player.souls,
      };
    }

    // Spend Souls
    const soulsSpent = hero.revivalCost;
    player.souls -= soulsSpent;

    // Revive hero (updates status, deathCount, revivalCost)
    hero.revive();

    // Emit revival event if event bus available
    if (this.eventBus) {
      this.eventBus.emit('hero:revived', {
        heroId: hero.id,
        heroName: hero.name,
        soulsSpent,
        newDeathCount: hero.deathCount,
        nextRevivalCost: hero.revivalCost,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      message: `${hero.name} has been revived!`,
      soulsSpent,
      remainingSouls: player.souls,
      nextRevivalCost: hero.revivalCost,
      hero,
    };
  }

  /**
   * Handle hero death (called when HP reaches 0)
   * @param {Hero} hero - The hero that died
   * @param {Object} battleContext - Context about the battle
   * @returns {Object} Death result
   */
  handleHeroDeath(hero, battleContext = {}) {
    if (!hero) {
      return { success: false, message: 'Hero not found' };
    }

    // Mark hero as dead
    hero.die();

    // Emit death event
    if (this.eventBus) {
      this.eventBus.emit('hero:death', {
        heroId: hero.id,
        heroName: hero.name,
        deathCount: hero.deathCount,
        revivalCost: hero.revivalCost,
        timestamp: hero.lastDeathTime,
        battleContext,
      });
    }

    return {
      success: true,
      message: `${hero.name} has fallen!`,
      hero,
      revivalCost: hero.revivalCost,
    };
  }

  /**
   * Calculate revival cost for a given death count
   * @param {number} deathCount - Number of deaths
   * @returns {number} Cost in Souls
   */
  calculateRevivalCost(deathCount) {
    if (deathCount === 0) return 10;  // First death: 10 Souls
    if (deathCount === 1) return 25;  // Second death: 25 Souls
    return 50;                        // Third+ death: 50 Souls (caps)
  }

  /**
   * Get revival cost for next death
   * @param {Hero} hero - The hero to check
   * @returns {number} Cost in Souls for next revival
   */
  getNextRevivalCost(hero) {
    if (!hero) return 10;
    return this.calculateRevivalCost(hero.deathCount);
  }

  /**
   * Check if hero is in death state
   * @param {Hero} hero - The hero to check
   * @returns {boolean}
   */
  isHeroDead(hero) {
    return hero && hero.status === HERO_STATUS.DEAD;
  }

  /**
   * Get revival info for UI display
   * @param {Hero} hero - The hero
   * @param {number} availableSouls - Player's available Souls
   * @returns {Object} Revival info
   */
  getRevivalInfo(hero, availableSouls) {
    if (!hero) {
      return {
        canRevive: false,
        isDead: false,
        revivalCost: 0,
        availableSouls: 0,
      };
    }

    return {
      canRevive: this.canRevive(hero, availableSouls),
      isDead: hero.status === HERO_STATUS.DEAD,
      revivalCost: hero.revivalCost,
      availableSouls,
      shortfall: Math.max(0, hero.revivalCost - availableSouls),
      deathCount: hero.deathCount,
      nextRevivalCost: this.getNextRevivalCost(hero),
      lastDeathTime: hero.lastDeathTime,
    };
  }

  /**
   * Estimate total Souls needed for multiple revivals
   * @param {number} currentDeathCount - Current death count
   * @param {number} numberOfRevivals - How many revivals to calculate
   * @returns {number} Total Souls needed
   */
  estimateSoulCost(currentDeathCount, numberOfRevivals) {
    let totalCost = 0;
    let deathCount = currentDeathCount;

    for (let i = 0; i < numberOfRevivals; i++) {
      totalCost += this.calculateRevivalCost(deathCount);
      deathCount++;
    }

    return totalCost;
  }

  /**
   * Get statistics about hero deaths/revivals
   * @param {Hero} hero - The hero
   * @returns {Object} Statistics
   */
  getHeroDeathStats(hero) {
    if (!hero) {
      return {
        totalDeaths: 0,
        currentStatus: 'unknown',
        soulsSpentOnRevivals: 0,
      };
    }

    // Calculate total Souls spent on all past revivals
    let soulsSpent = 0;
    for (let i = 0; i < hero.deathCount; i++) {
      soulsSpent += this.calculateRevivalCost(i);
    }

    return {
      totalDeaths: hero.deathCount,
      currentStatus: hero.status,
      soulsSpentOnRevivals: soulsSpent,
      nextRevivalCost: hero.revivalCost,
      lastDeathTime: hero.lastDeathTime,
      isDead: hero.status === HERO_STATUS.DEAD,
    };
  }
}

export default RevivalManager;
