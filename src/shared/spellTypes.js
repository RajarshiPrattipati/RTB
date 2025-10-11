// Spell Rarity System
export const RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  MYTHIC: 'mythic',
};

// Elemental Types
export const ELEMENT = {
  FIRE: 'fire',
  WATER: 'water',
  EARTH: 'earth',
  AIR: 'air',
  LIGHTNING: 'lightning',
  ICE: 'ice',
  LIGHT: 'light',
  DARK: 'dark',
  CHAOS: 'chaos',
  COSMIC: 'cosmic',
  NEUTRAL: 'neutral',
};

// Elemental Weakness Chart (what element is strong against what)
export const ELEMENTAL_ADVANTAGE = {
  [ELEMENT.FIRE]: [ELEMENT.ICE, ELEMENT.EARTH],
  [ELEMENT.WATER]: [ELEMENT.FIRE, ELEMENT.EARTH],
  [ELEMENT.EARTH]: [ELEMENT.LIGHTNING, ELEMENT.AIR],
  [ELEMENT.AIR]: [ELEMENT.WATER, ELEMENT.EARTH],
  [ELEMENT.LIGHTNING]: [ELEMENT.WATER, ELEMENT.AIR],
  [ELEMENT.ICE]: [ELEMENT.WATER, ELEMENT.EARTH],
  [ELEMENT.LIGHT]: [ELEMENT.DARK, ELEMENT.CHAOS],
  [ELEMENT.DARK]: [ELEMENT.LIGHT, ELEMENT.COSMIC],
  [ELEMENT.CHAOS]: [ELEMENT.COSMIC, ELEMENT.LIGHT],
  [ELEMENT.COSMIC]: [ELEMENT.CHAOS, ELEMENT.DARK],
  [ELEMENT.NEUTRAL]: [],
};

// Damage Types
export const DAMAGE_TYPE = {
  PHYSICAL: 'physical',
  MAGICAL: 'magical',
  TRUE: 'true', // Ignores defense
  PURE: 'pure', // Ignores all resistances
};

// Spell Types/Categories
export const SPELL_TYPE = {
  DAMAGE: 'damage',
  HEAL: 'heal',
  BUFF: 'buff',
  DEBUFF: 'debuff',
  CONTROL: 'control', // CC effects
  SUMMON: 'summon',
  UTILITY: 'utility',
  ULTIMATE: 'ultimate',
};

// Status Effects
export const STATUS_EFFECT = {
  // Damage Over Time
  BURN: 'burn',
  POISON: 'poison',
  BLEED: 'bleed',
  CORRUPTION: 'corruption',

  // Crowd Control
  STUN: 'stun',
  FREEZE: 'freeze',
  SLOW: 'slow',
  ROOT: 'root',
  SILENCE: 'silence',
  POLYMORPH: 'polymorph',
  CONFUSION: 'confusion',

  // Offensive Stacks
  MARK: 'mark',
  HEX: 'hex',
  VULNERABILITY: 'vulnerability',
  SHRED: 'shred',

  // Defensive
  SHIELD: 'shield',
  BARRIER: 'barrier',
  EVASION: 'evasion',
  SPELL_ARMOR: 'spellArmor',
  BLOCK: 'block',
  PARRY: 'parry',
  ABSORB: 'absorb',
  REFLECT: 'reflect',

  // Utility
  HASTE: 'haste',
  REGEN: 'regen',
  STEALTH: 'stealth',
  IMMUNITY: 'immunity',
};

// Resource Types
export const RESOURCE_TYPE = {
  MANA: 'mana',
  ENERGY: 'energy',
  MOMENTUM: 'momentum',
  SOUL_FRAGMENTS: 'soulFragments',
};

// Spell School/Tags for Synergy
export const SPELL_SCHOOL = {
  EVOCATION: 'evocation',
  CONJURATION: 'conjuration',
  NECROMANCY: 'necromancy',
  ABJURATION: 'abjuration',
  TRANSMUTATION: 'transmutation',
  DIVINATION: 'divination',
  ENCHANTMENT: 'enchantment',
  ILLUSION: 'illusion',
};

// Rarity drop rates for gacha
export const RARITY_DROP_RATE = {
  [RARITY.COMMON]: 0.50,      // 50%
  [RARITY.UNCOMMON]: 0.30,    // 30%
  [RARITY.RARE]: 0.15,        // 15%
  [RARITY.EPIC]: 0.04,        // 4%
  [RARITY.LEGENDARY]: 0.009,  // 0.9%
  [RARITY.MYTHIC]: 0.001,     // 0.1%
};

// Rarity multipliers for spell stats
export const RARITY_MULTIPLIER = {
  [RARITY.COMMON]: 1.0,
  [RARITY.UNCOMMON]: 1.2,
  [RARITY.RARE]: 1.5,
  [RARITY.EPIC]: 2.0,
  [RARITY.LEGENDARY]: 3.0,
  [RARITY.MYTHIC]: 5.0,
};
