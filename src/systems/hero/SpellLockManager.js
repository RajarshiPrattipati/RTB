/**
 * Spell Lock Manager
 * Manages spell locking/unlocking in hero builds using Spell Unlocker items
 */

import { BUILD_TYPE } from '../../models/Hero';

/**
 * Spell Unlocker Item Constants
 */
export const SPELL_UNLOCKER = {
  ITEM_ID: 'spell_unlocker',
  NAME: 'Spell Unlocker',
  COST_GEMS: 100,
  DESCRIPTION: 'Unlocks 1 spell slot in your hero build',
};

/**
 * SpellLockManager class
 * Handles spell locking and unlocking mechanics
 */
export class SpellLockManager {
  constructor(eventBus = null) {
    this.eventBus = eventBus;
  }

  /**
   * Lock a spell into a hero's build slot
   * @param {Hero} hero - The hero
   * @param {string} buildType - 'primary' or 'secondary'
   * @param {number} slotIndex - 0-5
   * @param {Object} spell - Spell to lock
   * @param {Object} player - Player object (to remove spell from collection)
   * @returns {Object} Result
   */
  lockSpell(hero, buildType, slotIndex, spell, player = null) {
    // Validation
    if (!hero) {
      return { success: false, message: 'Hero not found' };
    }

    if (buildType !== BUILD_TYPE.PRIMARY && buildType !== BUILD_TYPE.SECONDARY) {
      return { success: false, message: 'Invalid build type' };
    }

    if (slotIndex < 0 || slotIndex > 5) {
      return { success: false, message: 'Invalid slot index (must be 0-5)' };
    }

    if (!spell || !spell.id) {
      return { success: false, message: 'Invalid spell' };
    }

    // Get the build
    const build = hero.getBuild(buildType);
    const slot = build[slotIndex];

    if (!slot) {
      return { success: false, message: 'Slot not found' };
    }

    // Check if slot is already locked
    if (slot.locked) {
      return {
        success: false,
        message: `Slot already locked with ${slot.spell?.name}. Use Spell Unlocker to unlock first.`,
        currentSpell: slot.spell,
      };
    }

    // Lock the spell into the slot
    const result = slot.equipSpell(spell);

    if (!result.success) {
      return result;
    }

    // Remove spell from player's collection (if player provided)
    if (player && player.collection) {
      const spellIndex = player.collection.findIndex(s => s.id === spell.id);
      if (spellIndex !== -1) {
        player.collection.splice(spellIndex, 1);
      }
    }

    // Emit event
    if (this.eventBus) {
      this.eventBus.emit('spell:locked', {
        heroId: hero.id,
        buildType,
        slotIndex,
        spell: spell,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      message: `${spell.name} locked into ${buildType} build slot ${slotIndex + 1}`,
      spell,
      slot,
    };
  }

  /**
   * Unlock a spell from a hero's build slot using Spell Unlocker item
   * @param {Hero} hero - The hero
   * @param {string} buildType - 'primary' or 'secondary'
   * @param {number} slotIndex - 0-5
   * @param {Object} player - Player object (for inventory and collection)
   * @returns {Object} Result
   */
  unlockSpell(hero, buildType, slotIndex, player) {
    // Validation
    if (!hero) {
      return { success: false, message: 'Hero not found' };
    }

    if (!player) {
      return { success: false, message: 'Player not found' };
    }

    if (buildType !== BUILD_TYPE.PRIMARY && buildType !== BUILD_TYPE.SECONDARY) {
      return { success: false, message: 'Invalid build type' };
    }

    if (slotIndex < 0 || slotIndex > 5) {
      return { success: false, message: 'Invalid slot index (must be 0-5)' };
    }

    // Check if player has Spell Unlocker item
    if (!player.inventory || !player.inventory.spell_unlocker || player.inventory.spell_unlocker <= 0) {
      return {
        success: false,
        message: 'No Spell Unlocker items available',
        hint: `Purchase Spell Unlocker for ${SPELL_UNLOCKER.COST_GEMS} Gems`,
      };
    }

    // Get the build and slot
    const build = hero.getBuild(buildType);
    const slot = build[slotIndex];

    if (!slot) {
      return { success: false, message: 'Slot not found' };
    }

    // Check if slot is locked
    if (!slot.locked) {
      return {
        success: false,
        message: 'Slot is not locked',
      };
    }

    if (!slot.spell) {
      return {
        success: false,
        message: 'No spell in slot',
      };
    }

    const returnedSpell = slot.spell;

    // Unlock the slot
    const result = slot.unlock();

    if (!result.success) {
      return result;
    }

    // Use one Spell Unlocker item
    player.inventory.spell_unlocker -= 1;

    // Return spell to player's collection
    if (!player.collection) {
      player.collection = [];
    }
    player.collection.push(returnedSpell);

    // Emit event
    if (this.eventBus) {
      this.eventBus.emit('spell:unlocked', {
        heroId: hero.id,
        buildType,
        slotIndex,
        returnedSpell,
        remainingUnlockers: player.inventory.spell_unlocker,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      message: `${returnedSpell.name} unlocked and returned to collection`,
      returnedSpell,
      remainingUnlockers: player.inventory.spell_unlocker,
    };
  }

  /**
   * Unlock spell with Gems directly (alternative to using item)
   * @param {Hero} hero - The hero
   * @param {string} buildType - 'primary' or 'secondary'
   * @param {number} slotIndex - 0-5
   * @param {Object} player - Player object
   * @returns {Object} Result
   */
  unlockSpellWithGems(hero, buildType, slotIndex, player) {
    // Check if player has enough Gems
    if (!player.currencies || player.currencies.gems < SPELL_UNLOCKER.COST_GEMS) {
      return {
        success: false,
        message: `Insufficient Gems. Need ${SPELL_UNLOCKER.COST_GEMS}, have ${player.currencies?.gems || 0}`,
        required: SPELL_UNLOCKER.COST_GEMS,
        available: player.currencies?.gems || 0,
      };
    }

    // Get the slot
    const build = hero.getBuild(buildType);
    const slot = build[slotIndex];

    if (!slot || !slot.locked || !slot.spell) {
      return { success: false, message: 'Invalid unlock operation' };
    }

    const returnedSpell = slot.spell;

    // Unlock the slot
    const result = slot.unlock();

    if (!result.success) {
      return result;
    }

    // Spend Gems
    player.currencies.gems -= SPELL_UNLOCKER.COST_GEMS;

    // Return spell to collection
    if (!player.collection) {
      player.collection = [];
    }
    player.collection.push(returnedSpell);

    // Emit event
    if (this.eventBus) {
      this.eventBus.emit('spell:unlocked', {
        heroId: hero.id,
        buildType,
        slotIndex,
        returnedSpell,
        paidWithGems: true,
        gemsSpent: SPELL_UNLOCKER.COST_GEMS,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      message: `${returnedSpell.name} unlocked for ${SPELL_UNLOCKER.COST_GEMS} Gems`,
      returnedSpell,
      gemsSpent: SPELL_UNLOCKER.COST_GEMS,
      remainingGems: player.currencies.gems,
    };
  }

  /**
   * Check if a slot can be equipped
   * @param {Hero} hero - The hero
   * @param {string} buildType - 'primary' or 'secondary'
   * @param {number} slotIndex - 0-5
   * @returns {Object} Check result
   */
  canEquipSlot(hero, buildType, slotIndex) {
    if (!hero) {
      return { canEquip: false, reason: 'Hero not found' };
    }

    const build = hero.getBuild(buildType);
    const slot = build[slotIndex];

    if (!slot) {
      return { canEquip: false, reason: 'Slot not found' };
    }

    if (slot.locked) {
      return {
        canEquip: false,
        reason: 'Slot is locked',
        currentSpell: slot.spell,
      };
    }

    return { canEquip: true };
  }

  /**
   * Check if a slot can be unlocked
   * @param {Hero} hero - The hero
   * @param {string} buildType - 'primary' or 'secondary'
   * @param {number} slotIndex - 0-5
   * @param {Object} player - Player object
   * @returns {Object} Check result
   */
  canUnlockSlot(hero, buildType, slotIndex, player) {
    if (!hero) {
      return { canUnlock: false, reason: 'Hero not found' };
    }

    const build = hero.getBuild(buildType);
    const slot = build[slotIndex];

    if (!slot) {
      return { canUnlock: false, reason: 'Slot not found' };
    }

    if (!slot.locked) {
      return { canUnlock: false, reason: 'Slot is not locked' };
    }

    if (!slot.spell) {
      return { canUnlock: false, reason: 'No spell in slot' };
    }

    const hasItem = player.inventory?.spell_unlocker > 0;
    const hasGems = player.currencies?.gems >= SPELL_UNLOCKER.COST_GEMS;

    if (!hasItem && !hasGems) {
      return {
        canUnlock: false,
        reason: 'Need Spell Unlocker item or 100 Gems',
        hasItem,
        hasGems,
      };
    }

    return {
      canUnlock: true,
      hasItem,
      hasGems,
      currentSpell: slot.spell,
    };
  }

  /**
   * Get all locked spells in a build
   * @param {Hero} hero - The hero
   * @param {string} buildType - 'primary' or 'secondary'
   * @returns {Array<Object>} Locked spells with slot info
   */
  getLockedSpells(hero, buildType) {
    if (!hero) return [];

    const build = hero.getBuild(buildType);
    return build
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.locked && slot.spell)
      .map(({ slot, index }) => ({
        slotIndex: index,
        spell: slot.spell,
        lockedAt: slot.lockedAt,
      }));
  }

  /**
   * Get build completion status
   * @param {Hero} hero - The hero
   * @param {string} buildType - 'primary' or 'secondary'
   * @returns {Object} Build status
   */
  getBuildStatus(hero, buildType) {
    if (!hero) {
      return {
        isComplete: false,
        filledSlots: 0,
        lockedSlots: 0,
        emptySlots: 6,
      };
    }

    const build = hero.getBuild(buildType);
    const filledSlots = build.filter(slot => slot.spell !== null).length;
    const lockedSlots = build.filter(slot => slot.locked).length;
    const emptySlots = 6 - filledSlots;

    return {
      isComplete: filledSlots === 6 && lockedSlots === 6,
      filledSlots,
      lockedSlots,
      emptySlots,
      canBattle: filledSlots === 6 && lockedSlots === 6,
    };
  }

  /**
   * Validate entire build (all 6 slots filled and locked)
   * @param {Hero} hero - The hero
   * @param {string} buildType - 'primary' or 'secondary'
   * @returns {Object} Validation result
   */
  validateBuild(hero, buildType) {
    const status = this.getBuildStatus(hero, buildType);

    if (!status.isComplete) {
      return {
        valid: false,
        message: `Build incomplete: ${status.filledSlots}/6 spells, ${status.lockedSlots}/6 locked`,
        status,
      };
    }

    return {
      valid: true,
      message: 'Build is complete and ready for battle',
      status,
    };
  }
}

export default SpellLockManager;
