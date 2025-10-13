/**
 * Data Loader Utilities
 * Loads and manages game data from JSON files
 */

import spellsData from '../data/spells.json';
import mechanicsData from '../data/mechanics.json';

/**
 * Spell Data Loader
 */
export class SpellDataLoader {
  constructor() {
    this.spells = spellsData.spells;
    this.version = spellsData.version;
  }

  /**
   * Get all spells
   */
  getAllSpells() {
    return [...this.spells];
  }

  /**
   * Get spell by ID
   */
  getSpellById(id) {
    return this.spells.find(spell => spell.id === id) || null;
  }

  /**
   * Get spells by tag
   */
  getSpellsByTag(tag) {
    return this.spells.filter(spell => spell.tags && spell.tags.includes(tag));
  }

  /**
   * Get starter spells
   */
  getStarterSpells() {
    return this.getSpellsByTag('starter');
  }

  /**
   * Get spells by rarity
   */
  getSpellsByRarity(rarity) {
    return this.spells.filter(spell => spell.rarity === rarity);
  }

  /**
   * Get spells by element
   */
  getSpellsByElement(element) {
    return this.spells.filter(spell => spell.element === element);
  }

  /**
   * Get spells by type
   */
  getSpellsByType(type) {
    return this.spells.filter(spell => spell.type === type);
  }

  /**
   * Get spells by school
   */
  getSpellsBySchool(school) {
    return this.spells.filter(spell => spell.school === school);
  }

  /**
   * Get random spells
   */
  getRandomSpells(count = 1, filters = {}) {
    let filteredSpells = [...this.spells];

    // Apply filters
    if (filters.rarity) {
      filteredSpells = filteredSpells.filter(s => s.rarity === filters.rarity);
    }
    if (filters.element) {
      filteredSpells = filteredSpells.filter(s => s.element === filters.element);
    }
    if (filters.type) {
      filteredSpells = filteredSpells.filter(s => s.type === filters.type);
    }
    if (filters.tag) {
      filteredSpells = filteredSpells.filter(s => s.tags && s.tags.includes(filters.tag));
    }

    // Shuffle and return
    const shuffled = filteredSpells.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Search spells by name or description
   */
  searchSpells(query) {
    const lowerQuery = query.toLowerCase();
    return this.spells.filter(spell =>
      spell.name.toLowerCase().includes(lowerQuery) ||
      spell.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get spell count
   */
  getSpellCount() {
    return this.spells.length;
  }

  /**
   * Get data version
   */
  getVersion() {
    return this.version;
  }
}

/**
 * Mechanics Data Loader
 */
export class MechanicsDataLoader {
  constructor() {
    this.data = mechanicsData;
    this.version = mechanicsData.version;
  }

  /**
   * Get rarity data
   */
  getRarities() {
    return this.data.rarity;
  }

  /**
   * Get rarity info
   */
  getRarityInfo(rarity) {
    return this.data.rarity[rarity] || null;
  }

  /**
   * Get rarity drop rate
   */
  getRarityDropRate(rarity) {
    return this.data.rarity[rarity]?.dropRate || 0;
  }

  /**
   * Get rarity multiplier
   */
  getRarityMultiplier(rarity) {
    return this.data.rarity[rarity]?.multiplier || 1.0;
  }

  /**
   * Get element data
   */
  getElements() {
    return this.data.elements;
  }

  /**
   * Get element info
   */
  getElementInfo(element) {
    return this.data.elements[element] || null;
  }

  /**
   * Get elemental advantages
   */
  getElementalAdvantages(element) {
    return this.data.elements[element]?.advantages || [];
  }

  /**
   * Get elemental weaknesses
   */
  getElementalWeaknesses(element) {
    return this.data.elements[element]?.weaknesses || [];
  }

  /**
   * Check if element1 has advantage over element2
   */
  hasElementalAdvantage(element1, element2) {
    const advantages = this.getElementalAdvantages(element1);
    return advantages.includes(element2);
  }

  /**
   * Get status effects
   */
  getStatusEffects() {
    return this.data.statusEffects;
  }

  /**
   * Get status effect info
   */
  getStatusEffectInfo(effect) {
    return this.data.statusEffects[effect] || null;
  }

  /**
   * Get damage types
   */
  getDamageTypes() {
    return this.data.damageTypes;
  }

  /**
   * Get damage type info
   */
  getDamageTypeInfo(type) {
    return this.data.damageTypes[type] || null;
  }

  /**
   * Get spell types
   */
  getSpellTypes() {
    return this.data.spellTypes;
  }

  /**
   * Get spell schools
   */
  getSpellSchools() {
    return this.data.spellSchools;
  }

  /**
   * Get economy data
   */
  getEconomyData() {
    return this.data.economy;
  }

  /**
   * Get currency info
   */
  getCurrencyInfo(currency) {
    return this.data.economy.currencies[currency] || null;
  }

  /**
   * Get gold to souls conversion rate
   */
  getGoldToSoulsRate() {
    return this.data.economy.conversion.goldToSouls;
  }

  /**
   * Get soul packages
   */
  getSoulPackages() {
    return this.data.economy.conversion.soulPackages;
  }

  /**
   * Get item info
   */
  getItemInfo(itemId) {
    return this.data.economy.items[itemId] || null;
  }

  /**
   * Get progression data
   */
  getProgressionData() {
    return this.data.progression;
  }

  /**
   * Get hero progression data
   */
  getHeroProgression() {
    return this.data.progression.hero;
  }

  /**
   * Get spell progression data
   */
  getSpellProgression() {
    return this.data.progression.spells;
  }

  /**
   * Get revival cost by death count
   */
  getRevivalCost(deathCount) {
    const costs = this.data.progression.hero.revivalCosts;
    const index = Math.min(deathCount, costs.length - 1);
    return costs[index];
  }

  /**
   * Get battle settings
   */
  getBattleSettings() {
    return this.data.battle;
  }

  /**
   * Get reward data
   */
  getRewardData() {
    return this.data.rewards;
  }

  /**
   * Get battle win rewards
   */
  getBattleWinRewards() {
    return this.data.rewards.battleWin;
  }

  /**
   * Get perfect victory bonus
   */
  getPerfectVictoryBonus() {
    return this.data.rewards.perfectVictory;
  }

  /**
   * Get data version
   */
  getVersion() {
    return this.version;
  }
}

// Singleton instances
export const spellLoader = new SpellDataLoader();
export const mechanicsLoader = new MechanicsDataLoader();

/**
 * Convenience functions
 */

// Spells
export const getAllSpells = () => spellLoader.getAllSpells();
export const getSpellById = (id) => spellLoader.getSpellById(id);
export const getStarterSpells = () => spellLoader.getStarterSpells();
export const getSpellsByRarity = (rarity) => spellLoader.getSpellsByRarity(rarity);
export const getSpellsByElement = (element) => spellLoader.getSpellsByElement(element);
export const searchSpells = (query) => spellLoader.searchSpells(query);

// Mechanics
export const getRarityInfo = (rarity) => mechanicsLoader.getRarityInfo(rarity);
export const getElementInfo = (element) => mechanicsLoader.getElementInfo(element);
export const hasElementalAdvantage = (el1, el2) => mechanicsLoader.hasElementalAdvantage(el1, el2);
export const getStatusEffectInfo = (effect) => mechanicsLoader.getStatusEffectInfo(effect);
export const getRevivalCost = (deathCount) => mechanicsLoader.getRevivalCost(deathCount);
export const getBattleWinRewards = () => mechanicsLoader.getBattleWinRewards();
export const getSoulPackages = () => mechanicsLoader.getSoulPackages();

export default {
  spellLoader,
  mechanicsLoader,
  // Spell functions
  getAllSpells,
  getSpellById,
  getStarterSpells,
  getSpellsByRarity,
  getSpellsByElement,
  searchSpells,
  // Mechanics functions
  getRarityInfo,
  getElementInfo,
  hasElementalAdvantage,
  getStatusEffectInfo,
  getRevivalCost,
  getBattleWinRewards,
  getSoulPackages
};
