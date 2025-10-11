/**
 * Build Manager
 * Manages hero builds (Primary and Secondary) and build switching
 */

import { BUILD_TYPE } from '../../models/Hero';

/**
 * Build unlock requirements
 */
export const BUILD_REQUIREMENTS = {
  PRIMARY: {
    level: 1,
    unlocked: true, // Always unlocked
  },
  SECONDARY: {
    level: 15, // Unlocks at Level 15
    unlocked: false,
  },
};

/**
 * BuildManager class
 * Manages build switching and validation
 */
export class BuildManager {
  constructor(eventBus = null) {
    this.eventBus = eventBus;
  }

  /**
   * Check if a build is unlocked for the player
   * @param {string} buildType - 'primary' or 'secondary'
   * @param {number} playerLevel - Player's current level
   * @returns {boolean}
   */
  isBuildUnlocked(buildType, playerLevel) {
    if (buildType === BUILD_TYPE.PRIMARY) {
      return true; // Primary always unlocked
    }

    if (buildType === BUILD_TYPE.SECONDARY) {
      return playerLevel >= BUILD_REQUIREMENTS.SECONDARY.level;
    }

    return false;
  }

  /**
   * Get build unlock status for all builds
   * @param {number} playerLevel - Player's current level
   * @returns {Object} Unlock status for each build
   */
  getBuildUnlockStatus(playerLevel) {
    return {
      primary: {
        unlocked: true,
        requiredLevel: 1,
      },
      secondary: {
        unlocked: playerLevel >= BUILD_REQUIREMENTS.SECONDARY.level,
        requiredLevel: BUILD_REQUIREMENTS.SECONDARY.level,
        levelsUntilUnlock: Math.max(0, BUILD_REQUIREMENTS.SECONDARY.level - playerLevel),
      },
    };
  }

  /**
   * Switch hero's active build
   * @param {Hero} hero - The hero
   * @param {string} buildType - 'primary' or 'secondary'
   * @param {number} playerLevel - Player's level
   * @param {boolean} inBattle - Whether player is currently in battle
   * @returns {Object} Result
   */
  switchBuild(hero, buildType, playerLevel, inBattle = false) {
    // Validation
    if (!hero) {
      return {
        success: false,
        message: 'Hero not found',
      };
    }

    // Cannot switch builds during battle
    if (inBattle) {
      return {
        success: false,
        message: 'Cannot switch builds during battle',
      };
    }

    // Check if build type is valid
    if (buildType !== BUILD_TYPE.PRIMARY && buildType !== BUILD_TYPE.SECONDARY) {
      return {
        success: false,
        message: 'Invalid build type',
      };
    }

    // Check if already on this build
    if (hero.activeBuild === buildType) {
      return {
        success: false,
        message: `Already using ${buildType} build`,
      };
    }

    // Check if build is unlocked
    if (!this.isBuildUnlocked(buildType, playerLevel)) {
      return {
        success: false,
        message: `${buildType} build unlocks at level ${BUILD_REQUIREMENTS.SECONDARY.level}`,
        requiredLevel: BUILD_REQUIREMENTS.SECONDARY.level,
        currentLevel: playerLevel,
      };
    }

    // Check if target build is complete
    if (!hero.isBuildComplete(buildType)) {
      return {
        success: false,
        message: `${buildType} build is not complete. All 6 spell slots must be filled and locked.`,
        buildStatus: this.getBuildInfo(hero, buildType),
      };
    }

    const previousBuild = hero.activeBuild;

    // Switch build
    hero.switchBuild(buildType);

    // Emit event
    if (this.eventBus) {
      this.eventBus.emit('build:switched', {
        heroId: hero.id,
        previousBuild,
        newBuild: buildType,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      message: `Switched to ${buildType} build`,
      previousBuild,
      newBuild: buildType,
    };
  }

  /**
   * Get information about a specific build
   * @param {Hero} hero - The hero
   * @param {string} buildType - 'primary' or 'secondary'
   * @returns {Object} Build information
   */
  getBuildInfo(hero, buildType) {
    if (!hero) {
      return {
        exists: false,
        isComplete: false,
        slots: [],
      };
    }

    const build = hero.getBuild(buildType);
    const spells = hero.getSpellsFromBuild(buildType);
    const isComplete = hero.isBuildComplete(buildType);
    const isActive = hero.activeBuild === buildType;

    const filledSlots = build.filter(slot => slot.spell !== null).length;
    const lockedSlots = build.filter(slot => slot.locked).length;
    const emptySlots = 6 - filledSlots;

    return {
      exists: true,
      buildType,
      isActive,
      isComplete,
      canBattle: isComplete,
      slots: build.map((slot, index) => ({
        index,
        hasSpell: slot.spell !== null,
        isLocked: slot.locked,
        spell: slot.spell,
        slotId: slot.slotId,
      })),
      spells,
      stats: {
        filled: filledSlots,
        locked: lockedSlots,
        empty: emptySlots,
        total: 6,
      },
    };
  }

  /**
   * Get information about all builds
   * @param {Hero} hero - The hero
   * @param {number} playerLevel - Player's level
   * @returns {Object} All builds info
   */
  getAllBuildsInfo(hero, playerLevel) {
    const unlockStatus = this.getBuildUnlockStatus(playerLevel);

    return {
      primary: {
        ...this.getBuildInfo(hero, BUILD_TYPE.PRIMARY),
        unlocked: unlockStatus.primary.unlocked,
      },
      secondary: {
        ...this.getBuildInfo(hero, BUILD_TYPE.SECONDARY),
        unlocked: unlockStatus.secondary.unlocked,
        requiredLevel: unlockStatus.secondary.requiredLevel,
        levelsUntilUnlock: unlockStatus.secondary.levelsUntilUnlock,
      },
      activeBuild: hero.activeBuild,
    };
  }

  /**
   * Copy spells from one build to another (if both unlocked)
   * @param {Hero} hero - The hero
   * @param {string} fromBuild - Source build
   * @param {string} toBuild - Target build
   * @param {number} playerLevel - Player's level
   * @returns {Object} Result
   */
  copyBuild(hero, fromBuild, toBuild, playerLevel) {
    // Validation
    if (!hero) {
      return { success: false, message: 'Hero not found' };
    }

    // Check both builds unlocked
    if (!this.isBuildUnlocked(fromBuild, playerLevel) ||
        !this.isBuildUnlocked(toBuild, playerLevel)) {
      return {
        success: false,
        message: 'Both builds must be unlocked',
      };
    }

    // Check source build is complete
    if (!hero.isBuildComplete(fromBuild)) {
      return {
        success: false,
        message: `Source build (${fromBuild}) is not complete`,
      };
    }

    const sourceBuild = hero.getBuild(fromBuild);
    const targetBuild = hero.getBuild(toBuild);

    // Check if target build has any locked slots (cannot overwrite)
    const hasLockedSlots = targetBuild.some(slot => slot.locked);
    if (hasLockedSlots) {
      return {
        success: false,
        message: 'Cannot copy to build with locked slots. Unlock slots first.',
      };
    }

    // Copy spell references (note: spells remain locked in source)
    targetBuild.forEach((slot, index) => {
      const sourceSlot = sourceBuild[index];
      if (sourceSlot.spell) {
        slot.spell = { ...sourceSlot.spell }; // Deep copy spell object
        slot.locked = false; // Don't copy lock status
      }
    });

    // Emit event
    if (this.eventBus) {
      this.eventBus.emit('build:copied', {
        heroId: hero.id,
        fromBuild,
        toBuild,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      message: `Copied ${fromBuild} build to ${toBuild} build`,
      note: 'Spells are copied but not locked. Lock them to use in battle.',
    };
  }

  /**
   * Clear all unlocked slots in a build
   * @param {Hero} hero - The hero
   * @param {string} buildType - 'primary' or 'secondary'
   * @returns {Object} Result
   */
  clearUnlockedSlots(hero, buildType) {
    if (!hero) {
      return { success: false, message: 'Hero not found' };
    }

    const build = hero.getBuild(buildType);
    let clearedCount = 0;

    build.forEach(slot => {
      if (!slot.locked && slot.spell) {
        slot.clear();
        clearedCount++;
      }
    });

    // Emit event
    if (this.eventBus && clearedCount > 0) {
      this.eventBus.emit('build:cleared', {
        heroId: hero.id,
        buildType,
        clearedSlots: clearedCount,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      message: `Cleared ${clearedCount} unlocked slot(s)`,
      clearedCount,
    };
  }

  /**
   * Get build switching recommendations
   * @param {Hero} hero - The hero
   * @param {Object} battleContext - Current battle context (opponent, mode, etc.)
   * @returns {Object} Recommendation
   */
  getBuildRecommendation(hero, battleContext = {}) {
    if (!hero) {
      return { recommendation: null };
    }

    const primaryInfo = this.getBuildInfo(hero, BUILD_TYPE.PRIMARY);
    const secondaryInfo = this.getBuildInfo(hero, BUILD_TYPE.SECONDARY);

    // Simple recommendation logic (can be enhanced)
    if (!primaryInfo.isComplete && !secondaryInfo.isComplete) {
      return {
        recommendation: null,
        message: 'Complete at least one build first',
      };
    }

    if (primaryInfo.isComplete && !secondaryInfo.isComplete) {
      return {
        recommendation: BUILD_TYPE.PRIMARY,
        message: 'Use Primary build (Secondary not complete)',
      };
    }

    if (!primaryInfo.isComplete && secondaryInfo.isComplete) {
      return {
        recommendation: BUILD_TYPE.SECONDARY,
        message: 'Use Secondary build (Primary not complete)',
      };
    }

    // Both complete - recommend based on battle context (future enhancement)
    return {
      recommendation: hero.activeBuild,
      message: `Continue with ${hero.activeBuild} build`,
    };
  }

  /**
   * Validate if hero can enter battle
   * @param {Hero} hero - The hero
   * @returns {Object} Validation result
   */
  canEnterBattle(hero) {
    if (!hero) {
      return {
        canBattle: false,
        reason: 'Hero not found',
      };
    }

    if (!hero.isAlive()) {
      return {
        canBattle: false,
        reason: 'Hero is dead. Revive to battle.',
        requiresRevival: true,
      };
    }

    const activeBuildInfo = this.getBuildInfo(hero, hero.activeBuild);

    if (!activeBuildInfo.isComplete) {
      return {
        canBattle: false,
        reason: `${hero.activeBuild} build is incomplete (${activeBuildInfo.stats.filled}/6 spells, ${activeBuildInfo.stats.locked}/6 locked)`,
        buildInfo: activeBuildInfo,
      };
    }

    return {
      canBattle: true,
      activeBuild: hero.activeBuild,
      buildInfo: activeBuildInfo,
    };
  }
}

export default BuildManager;
