/**
 * PersistenceManager
 * Handles save/load of game state with version migration
 */

/**
 * PersistenceManager Class
 * Manages localStorage persistence and data migration
 */
export class PersistenceManager {
  constructor() {
    this.STORAGE_KEY = 'spell_brawler_save';
    this.CURRENT_VERSION = '1.3'; // Updated for Hero System
  }

  /**
   * Save Game State
   * @param {Object} state - Game state to save
   * @returns {boolean} Success status
   */
  save(state) {
    try {
      const saveData = {
        version: this.CURRENT_VERSION,
        timestamp: Date.now(),
        data: {
          player: {
            id: state.player.id,
            username: state.player.username,
            level: state.player.level,
            xp: state.player.xp,

            // NEW: Hero system
            hero: state.player.hero,

            // Currencies
            currencies: state.player.currencies,

            // NEW: Inventory
            inventory: state.player.inventory,

            // Collection
            collection: state.player.collection,

            // Stats
            stats: state.player.stats,

            // Missions
            missions: state.player.missions,

            // Login data
            loginData: state.player.loginData,

            // Win streak
            winStreak: state.player.winStreak || 0,

            // First win
            firstWinAvailable: state.player.firstWinAvailable
          },

          // Progression
          progression: state.progression,

          // Settings
          settings: state.settings
        }
      };

      const serialized = JSON.stringify(saveData);
      localStorage.setItem(this.STORAGE_KEY, serialized);

      console.log(`Game saved successfully (v${this.CURRENT_VERSION})`);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load Game State
   * @returns {Object|null} Loaded state or null if not found
   */
  load() {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);

      if (!serialized) {
        console.log('No save data found');
        return null;
      }

      const saveData = JSON.parse(serialized);

      // Check version and migrate if needed
      if (saveData.version !== this.CURRENT_VERSION) {
        console.log(`Migrating save from v${saveData.version} to v${this.CURRENT_VERSION}`);
        return this.migrate(saveData);
      }

      console.log(`Game loaded successfully (v${saveData.version})`);
      return saveData.data;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Migrate Old Save Data
   * @param {Object} oldSaveData - Old save data
   * @returns {Object} Migrated data
   */
  migrate(oldSaveData) {
    const version = oldSaveData.version;

    try {
      // Migration chain
      if (version === '1.0' || version === '1.1' || version === '1.2') {
        oldSaveData = this.migrateToV13(oldSaveData);
      }

      console.log('Migration completed successfully');
      return oldSaveData.data;
    } catch (error) {
      console.error('Migration failed:', error);
      return null;
    }
  }

  /**
   * Migrate to Version 1.3 (Hero System)
   * @param {Object} oldSaveData - Old save data
   * @returns {Object} Migrated save data
   */
  migrateToV13(oldSaveData) {
    const data = oldSaveData.data;

    // Add Hero system
    if (!data.player.hero) {
      data.player.hero = {
        id: 'default_hero',
        name: data.player.username || 'Hero',
        avatar: '/assets/heroes/default_hero.png',
        status: 'alive',
        deathCount: 0,
        revivalCost: 10,
        primaryBuild: this.createEmptyBuild(),
        secondaryBuild: this.createEmptyBuild(),
        activeBuild: 'primary',
        level: data.player.level || 1
      };
    }

    // Add Souls currency
    if (!data.player.currencies.souls) {
      data.player.currencies.souls = 0;
    }

    // Add Inventory
    if (!data.player.inventory) {
      data.player.inventory = {
        spell_unlocker: 0
      };
    }

    // Add Missions
    if (!data.player.missions) {
      data.player.missions = {
        daily: [],
        weekly: [],
        dailyResetTime: Date.now(),
        weeklyResetTime: Date.now()
      };
    }

    // Add Login Data
    if (!data.player.loginData) {
      data.player.loginData = {
        lastClaimTime: 0,
        currentStreak: 0,
        maxStreak: 0,
        totalLogins: 0
      };
    }

    // Add Win Streak
    if (data.player.winStreak === undefined) {
      data.player.winStreak = 0;
    }

    // Add First Win Bonus
    if (data.player.firstWinAvailable === undefined) {
      data.player.firstWinAvailable = true;
    }

    // Update version
    oldSaveData.version = '1.3';

    return oldSaveData;
  }

  /**
   * Create Empty Build Structure
   * @returns {Array} Empty build with 6 slots
   */
  createEmptyBuild() {
    return Array(6).fill(null).map((_, index) => ({
      slotId: `slot_${index}`,
      spell: null,
      locked: false,
      unlockedAt: null
    }));
  }

  /**
   * Delete Save Data
   * @returns {boolean} Success status
   */
  deleteSave() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Save data deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  /**
   * Check if Save Exists
   * @returns {boolean} True if save exists
   */
  hasSave() {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  /**
   * Get Save Info
   * @returns {Object|null} Save information
   */
  getSaveInfo() {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);

      if (!serialized) {
        return null;
      }

      const saveData = JSON.parse(serialized);

      return {
        version: saveData.version,
        timestamp: saveData.timestamp,
        date: new Date(saveData.timestamp).toLocaleString(),
        playerName: saveData.data.player.username,
        playerLevel: saveData.data.player.level,
        needsMigration: saveData.version !== this.CURRENT_VERSION
      };
    } catch (error) {
      console.error('Failed to get save info:', error);
      return null;
    }
  }

  /**
   * Export Save as JSON
   * @returns {string|null} JSON string of save data
   */
  exportSave() {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      return serialized;
    } catch (error) {
      console.error('Failed to export save:', error);
      return null;
    }
  }

  /**
   * Import Save from JSON
   * @param {string} jsonString - JSON save data
   * @returns {boolean} Success status
   */
  importSave(jsonString) {
    try {
      // Validate JSON
      const saveData = JSON.parse(jsonString);

      if (!saveData.version || !saveData.data) {
        throw new Error('Invalid save format');
      }

      // Store imported save
      localStorage.setItem(this.STORAGE_KEY, jsonString);

      console.log('Save imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }

  /**
   * Create Backup
   * @returns {boolean} Success status
   */
  createBackup() {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);

      if (!serialized) {
        return false;
      }

      const backupKey = `${this.STORAGE_KEY}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, serialized);

      console.log('Backup created:', backupKey);
      return true;
    } catch (error) {
      console.error('Failed to create backup:', error);
      return false;
    }
  }

  /**
   * Auto-save with Interval
   * @param {Function} getStateCallback - Function to get current state
   * @param {number} intervalMs - Auto-save interval in milliseconds
   * @returns {number} Interval ID
   */
  setupAutoSave(getStateCallback, intervalMs = 60000) {
    return setInterval(() => {
      const state = getStateCallback();
      if (state) {
        this.save(state);
        console.log('Auto-saved');
      }
    }, intervalMs);
  }

  /**
   * Clear Auto-save
   * @param {number} intervalId - Interval ID from setupAutoSave
   */
  clearAutoSave(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
      console.log('Auto-save cleared');
    }
  }
}

// Export singleton instance
export default new PersistenceManager();
