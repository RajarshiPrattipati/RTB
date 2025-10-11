# Shared Interfaces & Contracts
## Spell Brawler - Cross-Agent API Definitions

**Purpose:** This document defines all shared interfaces that agents must follow for seamless integration.

**Rule:** Any changes to these interfaces require approval from ALL agents.

---

## Core Data Types

### Spell Interface
```javascript
/**
 * @typedef {Object} Spell
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} description - Tooltip text
 * @property {RARITY} rarity - Common | Uncommon | Rare | Epic | Legendary | Mythic
 * @property {ELEMENT} element - Fire | Water | Earth | Air | Lightning | Ice | Light | Dark | Chaos | Cosmic | Neutral
 * @property {SPELL_SCHOOL} school - Evocation | Conjuration | Necromancy | etc.
 * @property {string} iconUrl - Path to icon image
 * @property {string} animationKey - Animation identifier
 * @property {number} baseDamage - Base damage value (0 if non-damaging)
 * @property {number} baseHeal - Base heal value (0 if non-healing)
 * @property {DAMAGE_TYPE} damageType - Physical | Magical | True | Pure
 * @property {Object} costs - Resource costs
 * @property {number} costs.mana
 * @property {number} costs.energy
 * @property {number} costs.momentum
 * @property {number} castTime - Turns required to cast (0 = instant)
 * @property {number} cooldown - Turns before can use again
 * @property {Object} primaryEffect
 * @property {SPELL_TYPE} primaryEffect.type
 * @property {number} primaryEffect.value
 * @property {number} primaryEffect.targets - 1 = single, -1 = all
 * @property {number} primaryEffect.duration - Turns
 * @property {Array<SecondaryEffect>} secondaryEffects
 * @property {Array<string>} comboTags - Tags for synergy detection
 * @property {Array<string>} counters - Spell IDs this counters
 * @property {Object} upgrades
 * @property {number} upgrades.level - Current upgrade level (0-10)
 * @property {number} upgrades.maxLevel - Always 10
 * @property {Object} mutations - Random stat variations
 * @property {number} mutations.critChance - 0-0.15
 * @property {number} mutations.costReduction - 0-0.3
 * @property {number} mutations.powerVariance - 0.8-1.2
 */

/**
 * @typedef {Object} SecondaryEffect
 * @property {STATUS_EFFECT} type
 * @property {number} chance - 0-1 probability
 * @property {number} value - Effect magnitude
 * @property {number} duration - Turns
 * @property {boolean} stackable - Can stack multiple instances
 */
```

### Player Interface
```javascript
/**
 * @typedef {Object} Player
 * @property {string} id
 * @property {string} username
 * @property {number} level - 1-100
 * @property {number} xp - Experience points
 * @property {number} elo - Ranked rating (1000 base)
 * @property {Array<Spell>} collection - All owned spells
 * @property {Array<Deck>} decks - Saved deck configurations
 * @property {string} activeDeckId - Currently selected deck
 * @property {Object} currencies
 * @property {number} currencies.gold
 * @property {number} currencies.shards
 * @property {number} currencies.wildcards
 * @property {number} currencies.gems
 * @property {Object} stats - Player statistics
 * @property {number} stats.wins
 * @property {number} stats.losses
 * @property {number} stats.totalDamage
 * @property {number} stats.spellsCast
 * @property {Object} masteryTrees - Element/school mastery
 */

/**
 * @typedef {Object} Deck
 * @property {string} id
 * @property {string} name
 * @property {Array<string>} spellIds - Array of 6 spell IDs
 * @property {Object} stats - Calculated deck stats
 * @property {number} stats.avgManaCost
 * @property {Object} stats.elementDistribution - { fire: 2, water: 1, ... }
 * @property {number} createdAt - Timestamp
 */
```

### Battle State Interface
```javascript
/**
 * @typedef {Object} BattleState
 * @property {string} id
 * @property {string} mode - 'practice' | 'ranked' | 'draft' | 'horde' | 'boss_raid'
 * @property {number} turn - Current turn number
 * @property {BATTLE_PHASE} phase - 'INIT' | 'PLAYER_TURN' | 'ENEMY_TURN' | 'RESOLUTION' | 'END'
 * @property {Array<PlayerBattleState>} players - [player, opponent]
 * @property {Array<Action>} actionQueue - Pending actions
 * @property {Array<LogEntry>} battleLog - Combat log
 * @property {number} comboMeter - 0-100
 * @property {Object} environment - Environmental effects
 * @property {Array<BattleState>} history - Previous states for rollback
 */

/**
 * @typedef {Object} PlayerBattleState
 * @property {string} playerId
 * @property {number} hp - Current health
 * @property {number} maxHp - Maximum health
 * @property {Object} resources
 * @property {Resource} resources.mana
 * @property {Resource} resources.energy
 * @property {Resource} resources.momentum
 * @property {Resource} resources.soulFragments
 * @property {Array<Spell>} deck - Available spells
 * @property {Map<string, StatusEffect>} activeEffects - Active buffs/debuffs
 * @property {Object} stats - Battle stats (attack, defense, etc.)
 * @property {string} animation - Current animation state
 */

/**
 * @typedef {Object} Resource
 * @property {number} current
 * @property {number} max
 * @property {number} regenRate - Per turn
 */

/**
 * @typedef {Object} Action
 * @property {string} type - 'CAST_SPELL' | 'PASS_TURN' | 'SURRENDER'
 * @property {string} actorId - Who performed action
 * @property {Spell} spell - Spell being cast (if applicable)
 * @property {Array<string>} targetIds - Target player IDs
 * @property {number} priority - Higher = resolves first
 */
```

---

## System APIs

### Battle Engine API (Agent 1)
```javascript
class BattleEngine {
  /**
   * Create a new battle instance
   * @param {string} mode - Game mode
   * @param {Object} config - Mode-specific config
   * @returns {Promise<BattleState>}
   */
  async create(mode, config);

  /**
   * Process a player action
   * @param {BattleState} state - Current battle state
   * @param {Action} action - Player action
   * @returns {Promise<BattleState>} - Updated state
   */
  async processAction(state, action);

  /**
   * Calculate damage for a spell
   * @param {Spell} spell
   * @param {PlayerBattleState} caster
   * @param {PlayerBattleState} target
   * @returns {number} - Final damage
   */
  calculateDamage(spell, caster, target);

  /**
   * Check if spell can be cast
   * @param {Spell} spell
   * @param {PlayerBattleState} caster
   * @returns {boolean}
   */
  canCast(spell, caster);
}
```

### Spell Library API (Agent 2)
```javascript
class SpellLibrary {
  /**
   * Get all spells
   * @returns {Array<Spell>}
   */
  getAllSpells();

  /**
   * Get spells by filter
   * @param {Object} filter - { rarity?, element?, type? }
   * @returns {Array<Spell>}
   */
  getSpells(filter);

  /**
   * Get single spell by ID
   * @param {string} id
   * @returns {Spell | null}
   */
  getSpellById(id);

  /**
   * Execute spell effect
   * @param {Spell} spell
   * @param {PlayerBattleState} caster
   * @param {Array<PlayerBattleState>} targets
   * @param {BattleState} battleState
   * @returns {void}
   */
  executeSpellEffect(spell, caster, targets, battleState);

  /**
   * Validate spell balance
   * @param {Spell} spell
   * @returns {Object} - { valid: boolean, warnings: string[] }
   */
  validateBalance(spell);
}
```

### Progression System API (Agent 4)
```javascript
class ProgressionManager {
  /**
   * Add XP to player
   * @param {Player} player
   * @param {number} amount
   * @returns {Object} - { leveled: boolean, newLevel?: number, rewards?: Object }
   */
  addXP(player, amount);

  /**
   * Track mission progress
   * @param {string} eventType
   * @param {Object} data
   * @returns {Array<Mission>} - Completed missions
   */
  trackProgress(eventType, data);

  /**
   * Pull from gacha
   * @param {number} count
   * @returns {Array<Spell>}
   */
  pullSpells(count);

  /**
   * Upgrade spell
   * @param {string} spellId
   * @param {Player} player
   * @returns {boolean} - Success
   */
  upgradeSpell(spellId, player);
}
```

### Game Mode API (Agent 5)
```javascript
class GameModeManager {
  /**
   * Start a game mode
   * @param {string} mode
   * @param {Object} config
   * @returns {Promise<BattleState>}
   */
  async startMode(mode, config);

  /**
   * Get AI decision
   * @param {BattleState} state
   * @param {string} difficulty - 'easy' | 'medium' | 'hard'
   * @returns {Action}
   */
  getAIAction(state, difficulty);

  /**
   * Find ranked match
   * @param {Player} player
   * @returns {Promise<Player>} - Matched opponent
   */
  async findRankedMatch(player);
}
```

### State Management API (Agent 6)
```javascript
class StateManager {
  /**
   * Dispatch action to update global state
   * @param {Object} action - { type: string, payload: Object }
   * @returns {void}
   */
  dispatch(action);

  /**
   * Get current global state
   * @returns {Object}
   */
  getState();

  /**
   * Save state to localStorage
   * @returns {boolean} - Success
   */
  save();

  /**
   * Load state from localStorage
   * @returns {Object | null}
   */
  load();

  /**
   * Subscribe to state changes
   * @param {Function} callback
   * @returns {Function} - Unsubscribe function
   */
  subscribe(callback);
}
```

---

## Event Bus Protocol

All agents must use the shared event bus for cross-system communication:

```javascript
import { eventBus } from 'utils/eventBus';

// Emit event
eventBus.emit('battle:end', { winner, loser, rewards });

// Listen to event
eventBus.on('battle:end', (data) => {
  console.log('Battle ended:', data);
});

// Unlisten
const unsubscribe = eventBus.on('spell:cast', handler);
unsubscribe(); // Remove listener
```

### Standard Events

#### Battle Events
- `battle:start` - { battleState }
- `battle:end` - { winner, loser, rewards }
- `battle:turn_start` - { turn, playerId }
- `spell:cast` - { spell, caster, targets, damage }
- `spell:counter` - { spell, counteredBy }
- `status:applied` - { targetId, effect }
- `status:removed` - { targetId, effect }

#### Progression Events
- `player:levelup` - { player, level, rewards }
- `player:xp_gained` - { amount, source }
- `mission:complete` - { mission, rewards }
- `spell:acquired` - { spell, source }
- `spell:upgraded` - { spell, newLevel }
- `track:reward_available` - { level, tier }

#### Economy Events
- `currency:earned` - { type, amount, source }
- `currency:spent` - { type, amount, purpose }
- `gacha:pull` - { spells, isPity }

#### UI Events
- `ui:modal_open` - { modalType, data }
- `ui:modal_close` - { modalType }
- `ui:notification` - { message, type }

---

## Shared Utilities

### Damage Calculation Formula
```javascript
/**
 * Standard damage formula used by all agents
 */
export const calculateDamage = ({
  spell,
  caster,
  target,
  elementalAdvantage = ELEMENTAL_ADVANTAGE
}) => {
  let damage = spell.baseDamage;

  // Apply mutations
  damage *= spell.mutations?.powerVariance || 1.0;

  // Stat scaling
  const scalingStat = spell.damageType === DAMAGE_TYPE.PHYSICAL
    ? 'attack'
    : 'magic';
  damage += caster.stats[scalingStat] * 0.5;

  // Elemental multiplier
  const multiplier = getElementalMultiplier(
    spell.element,
    target.element,
    elementalAdvantage
  );
  damage *= multiplier;

  // Defense reduction
  const defenseStat = spell.damageType === DAMAGE_TYPE.PHYSICAL
    ? 'defense'
    : 'magicDefense';

  if (spell.damageType !== DAMAGE_TYPE.TRUE && spell.damageType !== DAMAGE_TYPE.PURE) {
    damage -= target.stats[defenseStat] / 2;
  }

  // Critical hit
  const critChance = (caster.stats.critChance || 0.05) + (spell.mutations?.critChance || 0);
  if (Math.random() < critChance) {
    damage *= caster.stats.critMultiplier || 2.0;
  }

  // Damage modifiers from buffs/debuffs
  damage *= calculateModifiers(caster, target);

  return Math.max(0, Math.floor(damage));
};
```

### Elemental Advantage Lookup
```javascript
export const getElementalMultiplier = (attackElement, defendElement, advantageMap) => {
  if (attackElement === 'neutral' || defendElement === 'neutral') {
    return 1.0;
  }

  if (advantageMap[attackElement]?.includes(defendElement)) {
    return 1.5; // Super effective
  }

  if (advantageMap[defendElement]?.includes(attackElement)) {
    return 0.5; // Not very effective
  }

  return 1.0; // Neutral
};
```

### Resource Check
```javascript
export const canAffordSpell = (spell, resources) => {
  return (
    resources.mana.current >= spell.costs.mana &&
    resources.energy.current >= spell.costs.energy &&
    resources.momentum.current >= (spell.costs.momentum || 0)
  );
};
```

---

## Validation Schema

All agents must validate data using these schemas:

### Spell Validation
```javascript
import Joi from 'joi';

export const spellSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(200).required(),
  rarity: Joi.string().valid(...Object.values(RARITY)).required(),
  element: Joi.string().valid(...Object.values(ELEMENT)).required(),
  baseDamage: Joi.number().min(0).max(500),
  costs: Joi.object({
    mana: Joi.number().min(0).max(200).required(),
    energy: Joi.number().min(0).max(100),
    momentum: Joi.number().min(0).max(100)
  }),
  // ... full validation
});
```

---

## Constants & Enums

### File: `/src/shared/constants.js`
```javascript
export const BATTLE_PHASE = {
  INIT: 'INIT',
  PLAYER_TURN: 'PLAYER_TURN',
  ENEMY_TURN: 'ENEMY_TURN',
  RESOLUTION: 'RESOLUTION',
  END: 'END'
};

export const GAME_MODES = {
  PRACTICE: 'practice',
  RANKED: 'ranked',
  DRAFT: 'draft',
  HORDE: 'horde',
  BOSS_RAID: 'boss_raid'
};

export const MAX_DECK_SIZE = 6;
export const MAX_PLAYER_LEVEL = 100;
export const BASE_ELO = 1000;
export const TURN_TIME_LIMIT = 30; // seconds
```

---

## Testing Contracts

### Mock Data Providers
Each agent provides mock data for testing:

```javascript
// Agent 1 (Battle)
export const mockBattleState = () => ({
  id: 'test-battle-1',
  mode: 'practice',
  turn: 1,
  phase: 'PLAYER_TURN',
  players: [mockPlayerBattleState(), mockPlayerBattleState()]
});

// Agent 2 (Spells)
export const mockSpell = (overrides = {}) => ({
  id: 'test-spell-1',
  name: 'Test Fireball',
  rarity: RARITY.COMMON,
  element: ELEMENT.FIRE,
  baseDamage: 45,
  costs: { mana: 30, energy: 0 },
  ...overrides
});

// Agent 4 (Progression)
export const mockPlayer = (overrides = {}) => ({
  id: 'test-player-1',
  username: 'TestPlayer',
  level: 1,
  xp: 0,
  collection: [],
  currencies: { gold: 1000, shards: 0 },
  ...overrides
});
```

---

## Error Handling

### Standard Error Types
```javascript
export class SpellBrawlerError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export const ERROR_CODES = {
  // Battle errors
  INVALID_ACTION: 'INVALID_ACTION',
  INSUFFICIENT_RESOURCES: 'INSUFFICIENT_RESOURCES',
  SPELL_ON_COOLDOWN: 'SPELL_ON_COOLDOWN',
  INVALID_TARGET: 'INVALID_TARGET',

  // Progression errors
  MAX_LEVEL_REACHED: 'MAX_LEVEL_REACHED',
  SPELL_NOT_OWNED: 'SPELL_NOT_OWNED',
  INSUFFICIENT_CURRENCY: 'INSUFFICIENT_CURRENCY',

  // State errors
  SAVE_FAILED: 'SAVE_FAILED',
  LOAD_FAILED: 'LOAD_FAILED',
  INVALID_STATE: 'INVALID_STATE'
};
```

---

## Performance Requirements

All agents must adhere to:

- **Spell effect execution**: < 100ms
- **AI decision making**: < 500ms
- **State persistence**: < 200ms
- **UI render time**: < 16ms (60fps)
- **Battle initialization**: < 1s

---

## Change Log

| Date | Agent | Change | Impact |
|------|-------|--------|--------|
| 2025-10-11 | All | Initial interface definitions | N/A |

---

**Maintenance:**
- Review interfaces weekly during development
- All changes require unanimous approval
- Breaking changes require migration plan

**Questions?**
- Create GitHub issue tagged `interface-question`
- Discuss in agent sync meetings
