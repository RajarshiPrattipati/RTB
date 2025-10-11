/**
 * GameManager System
 * Central coordinator for all game systems and event bus integration
 */

import battleRewards from '../battle/BattleRewards';
import missionManager from '../progression/MissionManager';
import dailyRewards from '../progression/DailyRewards';
import economyManager from '../economy/EconomyManager';

/**
 * GameManager Class
 * Coordinates between all systems and manages game state events
 */
export class GameManager {
  constructor() {
    this.eventListeners = new Map();
    this.gameState = null;
  }

  /**
   * Initialize GameManager with State
   * @param {Object} initialState - Initial game state
   */
  initialize(initialState) {
    this.gameState = initialState;
    this.setupEventListeners();
  }

  /**
   * Setup Event Listeners
   * Connects all systems via event bus
   */
  setupEventListeners() {
    // Battle Events
    this.on('battle:end', this.handleBattleEnd.bind(this));
    this.on('battle:victory', this.handleBattleVictory.bind(this));
    this.on('battle:defeat', this.handleBattleDefeat.bind(this));

    // Hero Events
    this.on('hero:death', this.handleHeroDeath.bind(this));
    this.on('hero:revival', this.handleHeroRevival.bind(this));

    // Soul Events
    this.on('soul:gain', this.handleSoulGain.bind(this));
    this.on('soul:spend', this.handleSoulSpend.bind(this));

    // Mission Events
    this.on('mission:complete', this.handleMissionComplete.bind(this));
    this.on('mission:claim', this.handleMissionClaim.bind(this));

    // Daily Events
    this.on('daily:login', this.handleDailyLogin.bind(this));
  }

  /**
   * Handle Battle End
   * @param {Object} battleData - Battle result data
   */
  handleBattleEnd(battleData) {
    if (!this.gameState || !battleData) return;

    const { player, hero } = this.gameState;

    // Check victory or defeat
    if (battleData.playerVictory) {
      this.emit('battle:victory', {
        ...battleData,
        player,
        hero
      });
    } else {
      this.emit('battle:defeat', {
        ...battleData,
        player,
        hero
      });
    }

    // Update missions
    if (player.missions) {
      missionManager.trackBattleEvent(player.missions.daily, battleData);
      missionManager.trackBattleEvent(player.missions.weekly, battleData);
    }

    // Update win streak
    if (battleData.playerVictory) {
      player.winStreak = (player.winStreak || 0) + 1;
      if (player.missions) {
        missionManager.trackWinStreak(player.missions.weekly, player.winStreak);
      }
    } else {
      player.winStreak = 0;
    }
  }

  /**
   * Handle Battle Victory
   * @param {Object} data - Victory data
   */
  handleBattleVictory(data) {
    if (!this.gameState) return;

    const { player } = this.gameState;

    // Award rewards
    const rewardResult = battleRewards.awardBattleVictory(player, data);

    if (rewardResult.success) {
      this.emit('rewards:awarded', {
        type: 'battle_victory',
        rewards: rewardResult.rewards
      });

      // Track Soul collection for missions
      if (rewardResult.rewards.souls > 0 && player.missions) {
        missionManager.trackSoulCollection(
          [...player.missions.daily, ...player.missions.weekly],
          rewardResult.rewards.souls
        );
      }
    }

    // Check for first win bonus
    if (player.firstWinAvailable) {
      const bonusResult = battleRewards.awardFirstWinBonus(player);
      if (bonusResult.success) {
        player.firstWinAvailable = false;
        this.emit('rewards:awarded', {
          type: 'first_win_bonus',
          rewards: bonusResult.bonus
        });
      }
    }
  }

  /**
   * Handle Battle Defeat
   * @param {Object} data - Defeat data
   */
  handleBattleDefeat(data) {
    if (!this.gameState) return;

    const { player, hero } = this.gameState;

    // Check if hero dies
    const defeatResult = battleRewards.handleBattleDefeat(player, hero, data);

    if (defeatResult.heroDied) {
      this.emit('hero:death', {
        hero: defeatResult.hero,
        revivalCost: defeatResult.revivalCost
      });
    }
  }

  /**
   * Handle Hero Death
   * @param {Object} data - Hero death data
   */
  handleHeroDeath(data) {
    if (!this.gameState) return;

    const { hero } = data;

    // Show revival modal
    this.emit('ui:show_revival_modal', {
      hero,
      revivalCost: hero.revivalCost
    });

    // Log event
    console.log(`Hero ${hero.name} has died. Revival cost: ${hero.revivalCost} Souls`);
  }

  /**
   * Handle Hero Revival
   * @param {Object} data - Revival data
   */
  handleHeroRevival(data) {
    if (!this.gameState) return;

    const { hero } = data;

    // Check for first revival achievement
    if (hero.deathCount === 1) {
      const achievementResult = dailyRewards.awardAchievementReward(
        this.gameState.player,
        'revive_first_time'
      );

      if (achievementResult.success) {
        this.emit('achievement:unlocked', achievementResult);
      }
    }

    // Hide revival modal
    this.emit('ui:hide_revival_modal');

    console.log(`Hero ${hero.name} has been revived!`);
  }

  /**
   * Handle Soul Gain
   * @param {Object} data - Soul gain data
   */
  handleSoulGain(data) {
    if (!this.gameState) return;

    const { amount, source } = data;

    // Show notification
    this.emit('ui:show_notification', {
      type: 'soul_gain',
      message: `+${amount} Soul${amount > 1 ? 's' : ''} 👻`,
      source
    });

    // Track for missions
    if (this.gameState.player.missions) {
      missionManager.trackSoulCollection(
        [...this.gameState.player.missions.daily, ...this.gameState.player.missions.weekly],
        amount
      );
    }
  }

  /**
   * Handle Soul Spend
   * @param {Object} data - Soul spend data
   */
  handleSoulSpend(data) {
    if (!this.gameState) return;

    const { amount, purpose } = data;

    console.log(`Spent ${amount} Souls on ${purpose}`);
  }

  /**
   * Handle Mission Complete
   * @param {Object} data - Mission completion data
   */
  handleMissionComplete(data) {
    if (!this.gameState) return;

    const { mission } = data;

    // Show notification
    this.emit('ui:show_notification', {
      type: 'mission_complete',
      message: `Mission Complete: ${mission.title} ${mission.icon}`,
      mission
    });

    // Check if all daily missions complete
    const allDailyComplete = this.gameState.player.missions.daily.every(m => m.completed);

    if (allDailyComplete) {
      const achievementResult = dailyRewards.awardAchievementReward(
        this.gameState.player,
        'complete_all_daily'
      );

      if (achievementResult.success) {
        this.emit('achievement:unlocked', achievementResult);
      }
    }
  }

  /**
   * Handle Mission Claim
   * @param {Object} data - Mission claim data
   */
  handleMissionClaim(data) {
    if (!this.gameState) return;

    const { mission, rewards } = data;

    // Show rewards
    this.emit('ui:show_notification', {
      type: 'rewards',
      message: `Rewards claimed from ${mission.title}!`,
      rewards
    });
  }

  /**
   * Handle Daily Login
   * @param {Object} data - Login data
   */
  handleDailyLogin(data) {
    if (!this.gameState) return;

    const { player } = this.gameState;

    // Claim daily login reward
    const rewardResult = dailyRewards.claimDailyLoginReward(
      player,
      player.loginData || {}
    );

    if (rewardResult.success) {
      player.loginData = {
        lastClaimTime: rewardResult.streak,
        currentStreak: rewardResult.streak,
        maxStreak: Math.max(rewardResult.streak, player.loginData?.maxStreak || 0),
        totalLogins: (player.loginData?.totalLogins || 0) + 1
      };

      this.emit('ui:show_notification', {
        type: 'daily_reward',
        message: rewardResult.message,
        rewards: rewardResult.awarded,
        streak: rewardResult.streak
      });

      // Check for 30-day streak achievement
      if (rewardResult.streak === 30) {
        const achievementResult = dailyRewards.awardAchievementReward(
          player,
          'login_streak_30'
        );

        if (achievementResult.success) {
          this.emit('achievement:unlocked', achievementResult);
        }
      }
    }

    // Reset daily missions if needed
    if (missionManager.shouldResetMissions(player.missions?.dailyResetTime, 'daily')) {
      player.missions.daily = missionManager.resetDailyMissions();
      player.missions.dailyResetTime = Date.now();
    }

    // Reset weekly missions if needed
    if (missionManager.shouldResetMissions(player.missions?.weeklyResetTime, 'weekly')) {
      player.missions.weekly = missionManager.resetWeeklyMissions();
      player.missions.weeklyResetTime = Date.now();
    }

    // Reset first win bonus
    player.firstWinAvailable = true;
  }

  /**
   * Register Event Listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  /**
   * Remove Event Listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  off(event, handler) {
    if (!this.eventListeners.has(event)) return;

    const handlers = this.eventListeners.get(event);
    const index = handlers.indexOf(handler);

    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Emit Event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emit(event, data) {
    if (!this.eventListeners.has(event)) return;

    const handlers = this.eventListeners.get(event);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Update Game State
   * @param {Object} newState - New state object
   */
  updateState(newState) {
    this.gameState = newState;
  }

  /**
   * Get Current Game State
   * @returns {Object} Current game state
   */
  getState() {
    return this.gameState;
  }
}

// Export singleton instance
export default new GameManager();
