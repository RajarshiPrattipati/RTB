/**
 * useHero Hook
 * Provides hero operations and state management
 */

import { useGlobalState } from '../context/GlobalStateProvider';
import { useMemo, useCallback } from 'react';
import { Hero, HERO_STATUS, BUILD_TYPE } from '../models/Hero';

/**
 * Custom hook for hero operations
 * @returns {Object} Hero state and operations
 */
export const useHero = () => {
  const { state, dispatch } = useGlobalState();

  const hero = state.player.hero;
  const souls = state.player.currencies.souls;
  const gems = state.player.currencies.gems;
  const spellUnlockers = state.player.inventory.spell_unlocker;
  const playerLevel = state.player.level;

  /**
   * Initialize hero for new player
   */
  const initHero = useCallback((playerName = 'Hero') => {
    const newHero = Hero.createDefault(playerName);
    dispatch({
      type: 'HERO_INIT',
      payload: { hero: newHero },
    });
    return newHero;
  }, [dispatch]);

  /**
   * Revive hero by spending Souls
   */
  const reviveHero = useCallback(() => {
    if (!hero) {
      return {
        success: false,
        message: 'No hero found',
      };
    }

    if (hero.status !== HERO_STATUS.DEAD) {
      return {
        success: false,
        message: 'Hero is already alive',
      };
    }

    if (souls < hero.revivalCost) {
      return {
        success: false,
        message: `Insufficient Souls. Need ${hero.revivalCost}, have ${souls}`,
        requiredSouls: hero.revivalCost,
        availableSouls: souls,
        shortfall: hero.revivalCost - souls,
      };
    }

    dispatch({ type: 'HERO_REVIVE' });

    return {
      success: true,
      message: `${hero.name} has been revived!`,
      soulsSpent: hero.revivalCost,
      remainingSouls: souls - hero.revivalCost,
    };
  }, [hero, souls, dispatch]);

  /**
   * Mark hero as dead (called when HP reaches 0)
   */
  const killHero = useCallback(() => {
    if (!hero) {
      return {
        success: false,
        message: 'No hero found',
      };
    }

    dispatch({ type: 'HERO_DEATH' });

    return {
      success: true,
      message: `${hero.name} has fallen!`,
      revivalCost: hero.revivalCost,
    };
  }, [hero, dispatch]);

  /**
   * Lock a spell into a hero build slot
   */
  const lockSpell = useCallback((buildType, slotIndex, spell) => {
    if (!hero) {
      return {
        success: false,
        message: 'No hero found',
      };
    }

    const build = hero.getBuild(buildType);
    const slot = build[slotIndex];

    if (slot.locked) {
      return {
        success: false,
        message: 'Slot is already locked. Use Spell Unlocker to unlock first.',
      };
    }

    dispatch({
      type: 'SPELL_LOCK',
      payload: { buildType, slotIndex, spell },
    });

    return {
      success: true,
      message: `${spell.name} locked into ${buildType} build slot ${slotIndex + 1}`,
    };
  }, [hero, dispatch]);

  /**
   * Unlock a spell from a build slot using Spell Unlocker item
   */
  const unlockSpell = useCallback((buildType, slotIndex) => {
    if (!hero) {
      return {
        success: false,
        message: 'No hero found',
      };
    }

    if (spellUnlockers <= 0) {
      return {
        success: false,
        message: 'No Spell Unlocker items available',
        hint: 'Purchase Spell Unlocker for 100 Gems',
      };
    }

    const build = hero.getBuild(buildType);
    const slot = build[slotIndex];

    if (!slot.locked) {
      return {
        success: false,
        message: 'Slot is not locked',
      };
    }

    const returnedSpell = slot.spell;

    dispatch({
      type: 'SPELL_UNLOCK',
      payload: { buildType, slotIndex },
    });

    return {
      success: true,
      message: `${returnedSpell.name} unlocked and returned to collection`,
      returnedSpell,
    };
  }, [hero, spellUnlockers, dispatch]);

  /**
   * Unlock spell using Gems directly (100 Gems)
   */
  const unlockSpellWithGems = useCallback((buildType, slotIndex) => {
    if (!hero) {
      return {
        success: false,
        message: 'No hero found',
      };
    }

    if (gems < 100) {
      return {
        success: false,
        message: `Insufficient Gems. Need 100, have ${gems}`,
      };
    }

    const build = hero.getBuild(buildType);
    const slot = build[slotIndex];

    if (!slot.locked) {
      return {
        success: false,
        message: 'Slot is not locked',
      };
    }

    const returnedSpell = slot.spell;

    dispatch({
      type: 'SPELL_UNLOCK_WITH_GEMS',
      payload: { buildType, slotIndex },
    });

    return {
      success: true,
      message: `${returnedSpell.name} unlocked for 100 Gems`,
      returnedSpell,
      gemsSpent: 100,
    };
  }, [hero, gems, dispatch]);

  /**
   * Switch active build (Primary/Secondary)
   */
  const switchBuild = useCallback((buildType) => {
    if (!hero) {
      return {
        success: false,
        message: 'No hero found',
      };
    }

    if (hero.activeBuild === buildType) {
      return {
        success: false,
        message: `Already using ${buildType} build`,
      };
    }

    // Check if secondary build is unlocked (Level 15+)
    if (buildType === BUILD_TYPE.SECONDARY && playerLevel < 15) {
      return {
        success: false,
        message: 'Secondary build unlocks at Level 15',
        requiredLevel: 15,
        currentLevel: playerLevel,
      };
    }

    // Check if target build is complete
    if (!hero.isBuildComplete(buildType)) {
      return {
        success: false,
        message: `${buildType} build is not complete. Fill and lock all 6 spell slots.`,
      };
    }

    dispatch({
      type: 'HERO_SWITCH_BUILD',
      payload: { buildType },
    });

    return {
      success: true,
      message: `Switched to ${buildType} build`,
    };
  }, [hero, playerLevel, dispatch]);

  /**
   * Award Souls to player
   */
  const awardSouls = useCallback((amount, source = 'unknown') => {
    dispatch({
      type: 'SOUL_GAIN',
      payload: { amount, source },
    });
  }, [dispatch]);

  /**
   * Convert Gold to Souls (100 Gold = 1 Soul)
   */
  const convertGoldToSouls = useCallback((goldAmount) => {
    const soulsToGain = Math.floor(goldAmount / 100);

    if (soulsToGain === 0) {
      return {
        success: false,
        message: 'Minimum 100 Gold required for 1 Soul',
      };
    }

    if (state.player.currencies.gold < goldAmount) {
      return {
        success: false,
        message: `Insufficient Gold. Need ${goldAmount}, have ${state.player.currencies.gold}`,
      };
    }

    dispatch({
      type: 'GOLD_TO_SOULS',
      payload: { goldAmount },
    });

    return {
      success: true,
      message: `Converted ${goldAmount} Gold to ${soulsToGain} Souls`,
      goldSpent: goldAmount,
      soulsGained: soulsToGain,
    };
  }, [state.player.currencies.gold, dispatch]);

  /**
   * Purchase Spell Unlocker item (100 Gems)
   */
  const purchaseSpellUnlocker = useCallback(() => {
    if (gems < 100) {
      return {
        success: false,
        message: `Insufficient Gems. Need 100, have ${gems}`,
      };
    }

    // Spend Gems
    dispatch({
      type: 'CURRENCY_SPEND',
      payload: { currency: 'gems', amount: 100 },
    });

    // Add Spell Unlocker to inventory
    dispatch({
      type: 'INVENTORY_ADD',
      payload: { item: 'spell_unlocker', amount: 1 },
    });

    return {
      success: true,
      message: 'Spell Unlocker purchased!',
      gemsSpent: 100,
      newCount: spellUnlockers + 1,
    };
  }, [gems, spellUnlockers, dispatch]);

  // ===== Computed Values =====

  const heroStatus = useMemo(() => {
    if (!hero) {
      return {
        exists: false,
        alive: false,
        canBattle: false,
      };
    }

    return {
      exists: true,
      alive: hero.isAlive(),
      dead: hero.isDead(),
      canBattle: hero.canBattle(),
      revivalCost: hero.revivalCost,
      deathCount: hero.deathCount,
      activeBuild: hero.activeBuild,
    };
  }, [hero]);

  const buildInfo = useMemo(() => {
    if (!hero) {
      return {
        primary: null,
        secondary: null,
      };
    }

    return {
      primary: {
        complete: hero.isBuildComplete(BUILD_TYPE.PRIMARY),
        spells: hero.getSpellsFromBuild(BUILD_TYPE.PRIMARY),
        isActive: hero.activeBuild === BUILD_TYPE.PRIMARY,
      },
      secondary: {
        complete: hero.isBuildComplete(BUILD_TYPE.SECONDARY),
        spells: hero.getSpellsFromBuild(BUILD_TYPE.SECONDARY),
        isActive: hero.activeBuild === BUILD_TYPE.SECONDARY,
        unlocked: playerLevel >= 15,
      },
    };
  }, [hero, playerLevel]);

  const canRevive = useMemo(() => {
    return hero && hero.isDead() && souls >= hero.revivalCost;
  }, [hero, souls]);

  const canAffordSpellUnlocker = useMemo(() => {
    return gems >= 100;
  }, [gems]);

  return {
    // State
    hero,
    heroStatus,
    buildInfo,
    souls,
    gems,
    spellUnlockers,
    inventory: state.player.inventory,
    canRevive,
    canAffordSpellUnlocker,

    // Operations
    initHero,
    reviveHero,
    killHero,
    lockSpell,
    unlockSpell,
    unlockSpellWithGems,
    switchBuild,
    awardSouls,
    convertGoldToSouls,
    purchaseSpellUnlocker,
  };
};

export default useHero;
