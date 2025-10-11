/**
 * SpellSlot Model
 * Represents a single spell slot in a hero's build with lock mechanics
 */

/**
 * SpellSlot class
 * @class SpellSlot
 */
export class SpellSlot {
  constructor({
    slotId = null,
    buildType = 'primary',
    slotIndex = 0,
    spell = null,
    locked = false,
    lockedAt = null,
    unlockedAt = null,
  } = {}) {
    this.slotId = slotId || `slot_${buildType}_${slotIndex}`;
    this.buildType = buildType; // 'primary' or 'secondary'
    this.slotIndex = slotIndex; // 0-5
    this.spell = spell; // Spell object or null
    this.locked = locked; // Once locked, requires Spell Unlocker to change
    this.lockedAt = lockedAt; // Timestamp when spell was locked
    this.unlockedAt = unlockedAt; // Timestamp when spell was unlocked
  }

  /**
   * Check if slot has a spell
   * @returns {boolean}
   */
  hasSpell() {
    return this.spell !== null;
  }

  /**
   * Check if slot is locked
   * @returns {boolean}
   */
  isLocked() {
    return this.locked === true;
  }

  /**
   * Check if slot is empty and unlocked (ready for a spell)
   * @returns {boolean}
   */
  isAvailable() {
    return !this.hasSpell() && !this.isLocked();
  }

  /**
   * Check if slot can be equipped with a spell
   * @returns {boolean}
   */
  canEquip() {
    return !this.isLocked();
  }

  /**
   * Check if slot can be unlocked (has spell and is locked)
   * @returns {boolean}
   */
  canUnlock() {
    return this.isLocked() && this.hasSpell();
  }

  /**
   * Equip a spell into this slot and lock it
   * @param {Object} spell - Spell object to equip
   * @returns {Object} Result
   */
  equipSpell(spell) {
    if (!spell) {
      return {
        success: false,
        message: 'No spell provided',
      };
    }

    if (this.isLocked()) {
      return {
        success: false,
        message: 'Slot is locked. Use Spell Unlocker to unlock first.',
      };
    }

    this.spell = spell;
    this.locked = true;
    this.lockedAt = Date.now();
    this.unlockedAt = null;

    return {
      success: true,
      message: `${spell.name} equipped and locked`,
      spell: this.spell,
    };
  }

  /**
   * Unlock and clear this slot (requires Spell Unlocker item)
   * @returns {Object} Result with returned spell
   */
  unlock() {
    if (!this.isLocked()) {
      return {
        success: false,
        message: 'Slot is not locked',
      };
    }

    const returnedSpell = this.spell;

    this.spell = null;
    this.locked = false;
    this.unlockedAt = Date.now();

    return {
      success: true,
      message: `Slot unlocked, spell returned to collection`,
      returnedSpell,
    };
  }

  /**
   * Clear slot without unlocking (only works if not locked)
   * @returns {Object} Result
   */
  clear() {
    if (this.isLocked()) {
      return {
        success: false,
        message: 'Cannot clear locked slot',
      };
    }

    const removedSpell = this.spell;
    this.spell = null;

    return {
      success: true,
      message: 'Slot cleared',
      removedSpell,
    };
  }

  /**
   * Get spell info
   * @returns {Object|null} Spell or null
   */
  getSpell() {
    return this.spell;
  }

  /**
   * Get slot status info
   * @returns {Object} Status info
   */
  getStatus() {
    return {
      slotId: this.slotId,
      buildType: this.buildType,
      slotIndex: this.slotIndex,
      hasSpell: this.hasSpell(),
      isLocked: this.isLocked(),
      isAvailable: this.isAvailable(),
      canEquip: this.canEquip(),
      canUnlock: this.canUnlock(),
      spellName: this.spell ? this.spell.name : null,
      lockedAt: this.lockedAt,
      unlockedAt: this.unlockedAt,
    };
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object}
   */
  toJSON() {
    return {
      slotId: this.slotId,
      buildType: this.buildType,
      slotIndex: this.slotIndex,
      spell: this.spell,
      locked: this.locked,
      lockedAt: this.lockedAt,
      unlockedAt: this.unlockedAt,
    };
  }

  /**
   * Create SpellSlot from plain object
   * @param {Object} data - Slot data
   * @returns {SpellSlot}
   */
  static fromJSON(data) {
    return new SpellSlot(data);
  }

  /**
   * Create an empty unlocked slot
   * @param {string} buildType - 'primary' or 'secondary'
   * @param {number} slotIndex - 0-5
   * @returns {SpellSlot}
   */
  static createEmpty(buildType, slotIndex) {
    return new SpellSlot({
      buildType,
      slotIndex,
      spell: null,
      locked: false,
    });
  }

  /**
   * Create a build of 6 empty slots
   * @param {string} buildType - 'primary' or 'secondary'
   * @returns {Array<SpellSlot>}
   */
  static createBuild(buildType) {
    return Array(6).fill(null).map((_, index) =>
      SpellSlot.createEmpty(buildType, index)
    );
  }
}

export default SpellSlot;
