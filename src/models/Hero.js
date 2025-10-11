/**
 * Hero Model
 * Represents a player's hero with death/revival and spell build systems
 */

/**
 * Hero Status Enum
 */
export const HERO_STATUS = {
  ALIVE: 'alive',
  DEAD: 'dead',
};

/**
 * Build Type Enum
 */
export const BUILD_TYPE = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
};

/**
 * Hero class representing a player's hero
 * @class Hero
 */
export class Hero {
  constructor({
    id = null,
    name = 'Hero',
    avatar = '/assets/heroes/default.png',
    status = HERO_STATUS.ALIVE,
    deathCount = 0,
    primaryBuild = null,
    secondaryBuild = null,
    activeBuild = BUILD_TYPE.PRIMARY,
    lastDeathTime = null,
  } = {}) {
    this.id = id || `hero_${Date.now()}`;
    this.name = name;
    this.avatar = avatar;
    this.status = status;
    this.deathCount = deathCount;
    this.revivalCost = this.calculateRevivalCost(deathCount);
    this.primaryBuild = primaryBuild || this.createEmptyBuild();
    this.secondaryBuild = secondaryBuild || this.createEmptyBuild();
    this.activeBuild = activeBuild;
    this.lastDeathTime = lastDeathTime;
  }

  /**
   * Create an empty build with 6 spell slots
   * @returns {Array<SpellSlot>}
   */
  createEmptyBuild() {
    return Array(6).fill(null).map((_, index) => ({
      slotId: `slot_${index}`,
      spell: null,
      locked: false,
      unlockedAt: null,
    }));
  }

  /**
   * Calculate revival cost based on death count
   * @param {number} deathCount - Number of times hero has died
   * @returns {number} Cost in Souls
   */
  calculateRevivalCost(deathCount) {
    if (deathCount === 0) return 10; // First death: 10 Souls
    if (deathCount === 1) return 25; // Second death: 25 Souls
    return 50; // Third+ death: 50 Souls (caps here)
  }

  /**
   * Check if hero is alive
   * @returns {boolean}
   */
  isAlive() {
    return this.status === HERO_STATUS.ALIVE;
  }

  /**
   * Check if hero is dead
   * @returns {boolean}
   */
  isDead() {
    return this.status === HERO_STATUS.DEAD;
  }

  /**
   * Mark hero as dead
   */
  die() {
    this.status = HERO_STATUS.DEAD;
    this.lastDeathTime = Date.now();
    this.revivalCost = this.calculateRevivalCost(this.deathCount);
  }

  /**
   * Revive the hero
   */
  revive() {
    this.status = HERO_STATUS.ALIVE;
    this.deathCount += 1;
    this.revivalCost = this.calculateRevivalCost(this.deathCount);
    this.lastDeathTime = null;
  }

  /**
   * Get the active build
   * @returns {Array<SpellSlot>}
   */
  getActiveBuild() {
    return this.activeBuild === BUILD_TYPE.PRIMARY
      ? this.primaryBuild
      : this.secondaryBuild;
  }

  /**
   * Get a specific build
   * @param {string} buildType - 'primary' or 'secondary'
   * @returns {Array<SpellSlot>}
   */
  getBuild(buildType) {
    return buildType === BUILD_TYPE.PRIMARY
      ? this.primaryBuild
      : this.secondaryBuild;
  }

  /**
   * Switch active build
   * @param {string} buildType - 'primary' or 'secondary'
   */
  switchBuild(buildType) {
    if (buildType === BUILD_TYPE.PRIMARY || buildType === BUILD_TYPE.SECONDARY) {
      this.activeBuild = buildType;
    }
  }

  /**
   * Check if a build is complete (all 6 slots filled and locked)
   * @param {string} buildType - 'primary' or 'secondary'
   * @returns {boolean}
   */
  isBuildComplete(buildType) {
    const build = this.getBuild(buildType);
    return build.every(slot => slot.spell !== null && slot.locked === true);
  }

  /**
   * Get all spells from a build
   * @param {string} buildType - 'primary' or 'secondary'
   * @returns {Array<Spell>}
   */
  getSpellsFromBuild(buildType) {
    const build = this.getBuild(buildType);
    return build.map(slot => slot.spell).filter(spell => spell !== null);
  }

  /**
   * Check if hero can battle (alive and has complete active build)
   * @returns {boolean}
   */
  canBattle() {
    return this.isAlive() && this.isBuildComplete(this.activeBuild);
  }

  /**
   * Convert hero to plain object for serialization
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      status: this.status,
      deathCount: this.deathCount,
      revivalCost: this.revivalCost,
      primaryBuild: this.primaryBuild,
      secondaryBuild: this.secondaryBuild,
      activeBuild: this.activeBuild,
      lastDeathTime: this.lastDeathTime,
    };
  }

  /**
   * Create Hero from plain object (deserialization)
   * @param {Object} data - Hero data
   * @returns {Hero}
   */
  static fromJSON(data) {
    return new Hero(data);
  }

  /**
   * Create a default hero for new players
   * @param {string} playerName - Player's name
   * @returns {Hero}
   */
  static createDefault(playerName = 'Hero') {
    return new Hero({
      name: playerName,
      avatar: '/assets/heroes/default.png',
      status: HERO_STATUS.ALIVE,
      deathCount: 0,
    });
  }
}

export default Hero;
