/**
 * MissionManager System
 * Manages daily and weekly missions with Soul rewards
 */

import economyManager from '../economy/EconomyManager';

/**
 * MissionManager Class
 * Handles mission creation, tracking, and reward distribution
 */
export class MissionManager {
  constructor() {
    this.DAILY_MISSIONS = this.generateDailyMissions();
    this.WEEKLY_MISSIONS = this.generateWeeklyMissions();
  }

  /**
   * Generate Daily Missions
   * @returns {Array} Daily missions with Soul rewards
   */
  generateDailyMissions() {
    return [
      {
        id: 'daily_win_3_battles',
        title: 'Win 3 Battles',
        description: 'Achieve 3 battle victories',
        type: 'battle_wins',
        target: 3,
        current: 0,
        reward: {
          gold: 100,
          souls: 5,
          xp: 150
        },
        duration: 'daily',
        icon: '⚔️'
      },
      {
        id: 'daily_deal_fire_damage',
        title: 'Pyromaniac',
        description: 'Deal 500 fire damage',
        type: 'damage_fire',
        target: 500,
        current: 0,
        reward: {
          gold: 50,
          souls: 3,
          xp: 100
        },
        duration: 'daily',
        icon: '🔥'
      },
      {
        id: 'daily_heal_hp',
        title: 'Field Medic',
        description: 'Heal 300 HP',
        type: 'heal_hp',
        target: 300,
        current: 0,
        reward: {
          gold: 50,
          souls: 3,
          xp: 100
        },
        duration: 'daily',
        icon: '💚'
      },
      {
        id: 'daily_use_spells',
        title: 'Spell Caster',
        description: 'Cast 20 spells',
        type: 'spells_cast',
        target: 20,
        current: 0,
        reward: {
          gold: 75,
          souls: 4,
          xp: 125
        },
        duration: 'daily',
        icon: '✨'
      },
      {
        id: 'daily_perfect_victory',
        title: 'Flawless Victory',
        description: 'Win a battle without taking damage',
        type: 'perfect_victory',
        target: 1,
        current: 0,
        reward: {
          gold: 150,
          souls: 10,
          gems: 1,
          xp: 200
        },
        duration: 'daily',
        icon: '🏆'
      }
    ];
  }

  /**
   * Generate Weekly Missions
   * @returns {Array} Weekly missions with larger Soul rewards
   */
  generateWeeklyMissions() {
    return [
      {
        id: 'weekly_win_15_ranked',
        title: 'Ranked Champion',
        description: 'Win 15 ranked matches',
        type: 'ranked_wins',
        target: 15,
        current: 0,
        reward: {
          gold: 500,
          souls: 25,
          gems: 5,
          xp: 1000
        },
        duration: 'weekly',
        icon: '👑'
      },
      {
        id: 'weekly_collect_50_souls',
        title: 'Soul Collector',
        description: 'Collect 50 Souls',
        type: 'souls_collected',
        target: 50,
        current: 0,
        reward: {
          gold: 300,
          souls: 15,
          gems: 3,
          xp: 750
        },
        duration: 'weekly',
        icon: '👻'
      },
      {
        id: 'weekly_win_streak',
        title: 'Unstoppable',
        description: 'Win 5 battles in a row',
        type: 'win_streak',
        target: 5,
        current: 0,
        reward: {
          gold: 400,
          souls: 20,
          gems: 4,
          xp: 800
        },
        duration: 'weekly',
        icon: '🔥'
      },
      {
        id: 'weekly_defeat_bosses',
        title: 'Boss Slayer',
        description: 'Defeat 3 boss enemies',
        type: 'boss_defeats',
        target: 3,
        current: 0,
        reward: {
          gold: 600,
          souls: 30,
          gems: 6,
          xp: 1200
        },
        duration: 'weekly',
        icon: '🐉'
      }
    ];
  }

  /**
   * Update Mission Progress
   * @param {Object} mission - Mission object
   * @param {number} progress - Progress to add
   * @returns {Object} Updated mission with completion status
   */
  updateMissionProgress(mission, progress) {
    if (!mission) {
      return { success: false, reason: 'Invalid mission' };
    }

    if (mission.completed) {
      return { success: false, reason: 'Mission already completed' };
    }

    mission.current = Math.min(mission.current + progress, mission.target);

    const completed = mission.current >= mission.target;
    if (completed) {
      mission.completed = true;
      mission.completedAt = Date.now();
    }

    return {
      success: true,
      mission,
      completed,
      progress: mission.current,
      target: mission.target,
      percentage: Math.floor((mission.current / mission.target) * 100)
    };
  }

  /**
   * Claim Mission Reward
   * @param {Object} player - Player state object
   * @param {Object} mission - Mission object
   * @returns {Object} Result with rewards
   */
  claimMissionReward(player, mission) {
    if (!player || !mission) {
      return { success: false, reason: 'Invalid parameters' };
    }

    if (!mission.completed) {
      return { success: false, reason: 'Mission not completed' };
    }

    if (mission.claimed) {
      return { success: false, reason: 'Reward already claimed' };
    }

    // Award rewards
    const { reward } = mission;
    const awarded = {};

    if (reward.souls) {
      economyManager.awardSouls(player, reward.souls, `mission_${mission.duration}`);
      awarded.souls = reward.souls;
    }

    if (reward.gold) {
      economyManager.awardGold(player, reward.gold, `mission_${mission.duration}`);
      awarded.gold = reward.gold;
    }

    if (reward.gems) {
      economyManager.awardGems(player, reward.gems, `mission_${mission.duration}`);
      awarded.gems = reward.gems;
    }

    if (reward.xp && player.xp !== undefined) {
      player.xp += reward.xp;
      awarded.xp = reward.xp;
    }

    // Mark as claimed
    mission.claimed = true;
    mission.claimedAt = Date.now();

    return {
      success: true,
      mission,
      awarded,
      message: this.generateRewardMessage(awarded)
    };
  }

  /**
   * Track Battle Event for Missions
   * @param {Array} missions - Active missions
   * @param {Object} battleData - Battle event data
   * @returns {Array} Updated missions
   */
  trackBattleEvent(missions, battleData) {
    if (!missions || !battleData) {
      return missions;
    }

    const updatedMissions = [];

    missions.forEach(mission => {
      let progressAdded = 0;

      switch (mission.type) {
        case 'battle_wins':
          if (battleData.victory) progressAdded = 1;
          break;

        case 'ranked_wins':
          if (battleData.victory && battleData.ranked) progressAdded = 1;
          break;

        case 'damage_fire':
          progressAdded = battleData.fireDamage || 0;
          break;

        case 'heal_hp':
          progressAdded = battleData.hpHealed || 0;
          break;

        case 'spells_cast':
          progressAdded = battleData.spellsCast || 0;
          break;

        case 'perfect_victory':
          if (battleData.victory && battleData.damageTaken === 0) progressAdded = 1;
          break;

        case 'boss_defeats':
          if (battleData.victory && battleData.enemyType === 'boss') progressAdded = 1;
          break;

        default:
          break;
      }

      if (progressAdded > 0) {
        this.updateMissionProgress(mission, progressAdded);
      }

      updatedMissions.push(mission);
    });

    return updatedMissions;
  }

  /**
   * Track Soul Collection for Missions
   * @param {Array} missions - Active missions
   * @param {number} soulsCollected - Number of Souls collected
   * @returns {Array} Updated missions
   */
  trackSoulCollection(missions, soulsCollected) {
    if (!missions || soulsCollected <= 0) {
      return missions;
    }

    missions.forEach(mission => {
      if (mission.type === 'souls_collected') {
        this.updateMissionProgress(mission, soulsCollected);
      }
    });

    return missions;
  }

  /**
   * Track Win Streak for Missions
   * @param {Array} missions - Active missions
   * @param {number} currentStreak - Current win streak
   * @returns {Array} Updated missions
   */
  trackWinStreak(missions, currentStreak) {
    if (!missions) {
      return missions;
    }

    missions.forEach(mission => {
      if (mission.type === 'win_streak' && currentStreak >= mission.target) {
        this.updateMissionProgress(mission, mission.target);
      }
    });

    return missions;
  }

  /**
   * Get Daily Missions
   * @returns {Array} Daily missions
   */
  getDailyMissions() {
    return this.generateDailyMissions();
  }

  /**
   * Get Weekly Missions
   * @returns {Array} Weekly missions
   */
  getWeeklyMissions() {
    return this.generateWeeklyMissions();
  }

  /**
   * Reset Daily Missions
   * @returns {Array} Fresh daily missions
   */
  resetDailyMissions() {
    return this.generateDailyMissions();
  }

  /**
   * Reset Weekly Missions
   * @returns {Array} Fresh weekly missions
   */
  resetWeeklyMissions() {
    return this.generateWeeklyMissions();
  }

  /**
   * Check if Missions Should Reset
   * @param {number} lastResetTimestamp - Last reset time
   * @param {string} duration - 'daily' or 'weekly'
   * @returns {boolean} Should reset
   */
  shouldResetMissions(lastResetTimestamp, duration) {
    if (!lastResetTimestamp) return true;

    const now = Date.now();
    const timeSinceReset = now - lastResetTimestamp;

    if (duration === 'daily') {
      // Reset after 24 hours
      return timeSinceReset >= 24 * 60 * 60 * 1000;
    }

    if (duration === 'weekly') {
      // Reset after 7 days
      return timeSinceReset >= 7 * 24 * 60 * 60 * 1000;
    }

    return false;
  }

  /**
   * Generate Reward Message
   * @param {Object} rewards - Rewards object
   * @returns {string} Formatted message
   */
  generateRewardMessage(rewards) {
    const parts = [];

    if (rewards.souls > 0) parts.push(`+${rewards.souls} Souls 👻`);
    if (rewards.gold > 0) parts.push(`+${rewards.gold} Gold 💰`);
    if (rewards.gems > 0) parts.push(`+${rewards.gems} Gems 💎`);
    if (rewards.xp > 0) parts.push(`+${rewards.xp} XP ⭐`);

    return parts.length > 0 ? parts.join(', ') : 'No rewards';
  }

  /**
   * Get Mission Summary
   * @param {Array} missions - Mission list
   * @returns {Object} Summary statistics
   */
  getMissionSummary(missions) {
    if (!missions) {
      return null;
    }

    const completed = missions.filter(m => m.completed).length;
    const claimed = missions.filter(m => m.claimed).length;
    const total = missions.length;

    return {
      total,
      completed,
      claimed,
      remaining: total - completed,
      completionRate: Math.floor((completed / total) * 100)
    };
  }
}

// Export singleton instance
export default new MissionManager();
