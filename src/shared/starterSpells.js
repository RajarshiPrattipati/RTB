/**
 * Starter Spells Collection
 * Default spells available to all new players
 *
 * NOTE: This file now loads data from src/data/spells.json
 * To add or modify spells, edit the JSON file instead.
 */

import { getStarterSpells } from '../utils/dataLoader';

/**
 * Starter Spell Collection
 * These spells are loaded from the master spells.json file
 */
export const STARTER_SPELLS = getStarterSpells();

/**
 * Get Random Starter Spells
 * @param {number} count - Number of spells to return
 * @returns {Array} Array of spell objects
 */
export function getRandomStarterSpells(count = 6) {
  const shuffled = [...STARTER_SPELLS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, STARTER_SPELLS.length));
}

/**
 * Get All Starter Spells
 * @returns {Array} All starter spells
 */
export function getAllStarterSpells() {
  return [...STARTER_SPELLS];
}

/**
 * Get Starter Spell by ID
 * @param {string} spellId - Spell ID
 * @returns {Object|null} Spell object or null
 */
export function getStarterSpellById(spellId) {
  return STARTER_SPELLS.find(spell => spell.id === spellId) || null;
}

export default STARTER_SPELLS;
