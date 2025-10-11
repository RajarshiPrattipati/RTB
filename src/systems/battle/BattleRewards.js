/**
 * BattleRewards System
 * Manages rewards for battle victories including Soul gains
 */

import economyManager from '../economy/EconomyManager';

/**
 * BattleRewards Class
 * Handles reward calculation and distribution after battles
 */
export class BattleRewards {
  constructor() {
    this.SOUL_REWARD_PER_KILL = 1;
    this.GOLD_BASE_REWARD = 50;
    this.XP_BASE_REWARD = 100;
  }

  /**
   * Calculate and Award Battle Victory Rewards
   * @param {Object} player - Player state object
   * @param {Object} battleResult - Battle outcome data
   * @returns {Object} Rewards breakdown
   */
  awardBattleVictory(player, battleResult) {
    if (!player || !battleResult) {
      return { success: false, reason: 'Invalid parameters' };
    }

    const rewards = {
      souls: 0,
      gold: 0,
      xp: 0,
      gems: 0
    };

    // Award Souls for kill
    if (battleResult.playerVictory) {
      rewards.souls = this.SOUL_REWARD_PER_KILL;
      economyManager.awardSouls(player, rewards.souls, 'battle_kill');
    }

    // Calculate Gold reward based on battle difficulty
    const difficultyMultiplier = this.getDifficultyMultiplier(battleResult.difficulty || 'normal');
    rewards.gold = Math.floor(this.GOLD_BASE_REWARD * difficultyMultiplier);
    economyManager.awardGold(player, rewards.gold, 'battle_victory');

    // Calculate XP reward
    rewards.xp = Math.floor(this.XP_BASE_REWARD * difficultyMultiplier);
    if (player.xp !== undefined) {
      player.xp += rewards.xp;
    }

    // Bonus rewards for special conditions
    if (battleResult.perfectVictory) {
      rewards.gems = 1;
      economyManager.awardGems(player, rewards.gems, 'perfect_victory');
    }

    if (battleResult.combo > 5) {
      const bonusSouls = Math.floor(battleResult.combo / 5);
      rewards.souls += bonusSouls;
      economyManager.awardSouls(player, bonusSouls, 'combo_bonus');
    }

    return {
      success: true,
      rewards,
      message: this.generateRewardMessage(rewards)
    };
  }

  /**
   * Handle Battle Defeat
   * @param {Object} player - Player state object
   * @param {Object} hero - Hero object
   * @param {Object} battleResult - Battle outcome data
   * @returns {Object} Result with hero death status
   */
  handleBattleDefeat(player, hero, battleResult) {
    if (!player || !hero) {
      return { success: false, reason: 'Invalid parameters' };
    }

    // Check if hero should die
    const heroDied = battleResult.playerHp <= 0;

    if (heroDied) {
      // Hero enters death state
      hero.status = 'dead';
      hero.lastDeathTime = Date.now();

      // Calculate next revival cost
      const revivalCost = economyManager.calculateRevivalCost(hero.deathCount);
      hero.revivalCost = revivalCost;

      return {
        success: true,
        heroDied: true,
        hero,
        revivalCost,
        message: `${hero.name} has been defeated! Revival cost: ${revivalCost} Souls 👻`
      };
    }

    return {
      success: true,
      heroDied: false,
      message: 'You lost, but your hero survived!'
    };
  }

  /**
   * Award Souls for Kill
   * @param {Object} player - Player state object
   * @param {Object} enemyDefeated - Enemy data
   * @returns {Object} Result
   */
  awardSoulForKill(player, enemyDefeated) {
    if (!player) {
      return { success: false, reason: 'Invalid player' };
    }

    const soulsAwarded = this.SOUL_REWARD_PER_KILL;
    const result = economyManager.awardSouls(player, soulsAwarded, 'battle_kill');

    return {
      ...result,
      enemy: enemyDefeated?.name || 'Enemy',
      message: `+${soulsAwarded} Soul 👻 from ${enemyDefeated?.name || 'Enemy'}!`
    };
  }

  /**
   * Get Difficulty Multiplier
   * @param {string} difficulty - Battle difficulty (easy, normal, hard, extreme)
   * @returns {number} Multiplier
   */
  getDifficultyMultiplier(difficulty) {
    const multipliers = {
      easy: 0.5,
      normal: 1.0,
      hard: 1.5,
      extreme: 2.0,
      boss: 3.0
    };

    return multipliers[difficulty] || 1.0;
  }

  /**
   * Generate Reward Message
   * @param {Object} rewards - Rewards breakdown
   * @returns {string} Formatted message
   */
  generateRewardMessage(rewards) {
    const parts = [];

    if (rewards.souls > 0) parts.push(`+${rewards.souls} Souls 👻`);
    if (rewards.gold > 0) parts.push(`+${rewards.gold} Gold 💰`);
    if (rewards.xp > 0) parts.push(`+${rewards.xp} XP ⭐`);
    if (rewards.gems > 0) parts.push(`+${rewards.gems} Gems 💎`);

    return parts.length > 0 ? parts.join(', ') : 'No rewards';
  }

  /**
   * Calculate Ranked Battle Rewards
   * @param {Object} player - Player state object
   * @param {Object} battleResult - Battle result with rank info
   * @returns {Object} Rewards
   */
  awardRankedBattleVictory(player, battleResult) {
    if (!player || !battleResult) {
      return { success: false, reason: 'Invalid parameters' };
    }

    // Base rewards
    const baseRewards = this.awardBattleVictory(player, battleResult);

    if (!baseRewards.success) {
      return baseRewards;
    }

    // Ranked bonus
    const rankBonus = {
      souls: Math.floor(baseRewards.rewards.souls * 0.5),
      gold: Math.floor(baseRewards.rewards.gold * 0.5),
      gems: 1
    };

    // Award bonuses
    if (rankBonus.souls > 0) {
      economyManager.awardSouls(player, rankBonus.souls, 'ranked_bonus');
    }
    if (rankBonus.gold > 0) {
      economyManager.awardGold(player, rankBonus.gold, 'ranked_bonus');
    }
    if (rankBonus.gems > 0) {
      economyManager.awardGems(player, rankBonus.gems, 'ranked_bonus');
    }

    return {
      success: true,
      rewards: {
        souls: baseRewards.rewards.souls + rankBonus.souls,
        gold: baseRewards.rewards.gold + rankBonus.gold,
        xp: baseRewards.rewards.xp,
        gems: baseRewards.rewards.gems + rankBonus.gems
      },
      rankBonus,
      message: `${baseRewards.message} + Ranked Bonus!`
    };
  }

  /**
   * Award First Win of the Day Bonus
   * @param {Object} player - Player state object
   * @returns {Object} Bonus rewards
   */
  awardFirstWinBonus(player) {
    if (!player) {
      return { success: false, reason: 'Invalid player' };
    }

    const bonus = {
      souls: 5,
      gold: 100,
      xp: 200
    };

    economyManager.awardSouls(player, bonus.souls, 'first_win_bonus');
    economyManager.awardGold(player, bonus.gold, 'first_win_bonus');

    if (player.xp !== undefined) {
      player.xp += bonus.xp;
    }

    return {
      success: true,
      bonus,
      message: `First Win Bonus: +${bonus.souls} Souls 👻, +${bonus.gold} Gold 💰, +${bonus.xp} XP ⭐`
    };
  }
}

// Export singleton instance
export default new BattleRewards();
