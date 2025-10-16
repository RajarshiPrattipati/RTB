# Game Mechanics System

## Overview

The Mechanics Engine is a comprehensive system that handles all game mechanics calculations including damage, status effects, player modifiers, attack modifiers, resistances, and evasion. It processes combat in discrete steps to ensure proper order of operations.

## Architecture

### Core Components

1. **MechanicsEngine** (`src/systems/battle/MechanicsEngine.js`)
   - Main calculation engine
   - Handles all combat math
   - Processes status effects and modifiers

2. **Mechanics Data** (`src/data/mechanics.json`)
   - Configuration for all game mechanics
   - Defines stats, values, and behaviors
   - Easy to balance without code changes

## Damage Calculation Flow

Damage is calculated in **14 discrete steps** to ensure proper interaction between all mechanics:

### Step 1: Evasion Check
**When**: Before any damage calculations
**Purpose**: Determine if attack can be avoided completely

```javascript
// Evasion can be bypassed by Pierce modifier
if (canEvade && !hasPierce) {
  // Check dodge, parry, deflect, phase
  // Evasive modifier increases dodge chance
  // Sharpsight modifier reduces enemy dodge
  // Marked status prevents evasion
}
```

**Modifiers Involved**:
- `evasive` - Increases dodge chance (+15%)
- `sharpsight` - Increases accuracy (+20%)
- `pierce` - Ignores all evasion

**Status Effects**:
- `marked` - Cannot evade
- `invisible` - Cannot be targeted by single-target

**On Evasion Success**:
- Damage calculation stops
- `riposte` may trigger (75% chance to counterattack)

---

### Step 2: Base Damage Modifiers
**When**: After confirming hit
**Purpose**: Apply passive damage increases

```javascript
// Apply passive player modifiers
damage *= (1 + damageModifierValue)
```

**Player Modifiers Applied**:
- `momentum` - Stacking damage bonus (5% per stack, max 5)
- `deadly` - Increases crit damage multiplier (+50%)
- `precise` - Increases crit chance (+15%)

---

### Step 3: Conditional Modifiers
**When**: After base modifiers
**Purpose**: Apply situational bonuses

```javascript
// Focus: No damage taken last turn
if (!attacker.damagedLastTurn) {
  damage *= 1.25; // +25%
}

// Overload: Above 80% mana
if (attacker.mana / attacker.maxMana >= 0.80) {
  damage *= 1.30; // +30% spell damage
}

// Desperation: Below 30% health
if (attacker.health / attacker.maxHealth <= 0.30) {
  damage *= 1.40; // +40% all damage
}
```

**Player Modifiers Applied**:
- `focus` - +25% damage if no damage taken last turn
- `overload` - +30% spell damage when above 80% mana
- `desperation` - +40% damage when below 30% health
- `adaptive` - Gain resistance to last damage type received (+25%)

---

### Step 4: Critical Hit Check
**When**: After base damage calculations
**Purpose**: Roll for critical strike

```javascript
// Base: 5% crit chance, 150% crit multiplier
let critChance = 0.05;
let critMultiplier = 1.5;

// Apply precise modifier
critChance += preciseBonusChance;

// Apply deadly modifier
critMultiplier += deadlyBonusDamage;

// Brittle guarantees crit
if (hasBrittle) {
  isCrit = true;
  removeEffect('brittle');
}
```

**Player Modifiers**:
- `precise` - +15% crit chance
- `deadly` - +50% crit multiplier

**Status Effects**:
- `brittle` - Next hit is guaranteed crit (removed after)

**Resistance Types**:
- `critical` resistance reduces crit chance

---

### Step 5: Elemental Advantages
**When**: After crit calculation
**Purpose**: Apply elemental strengths/weaknesses

```javascript
// Check element advantages
if (isAdvantage) {
  damage *= 1.5; // 150%
} else if (isWeakness) {
  damage *= 0.5; // 50%
}

// Elementalist enhances this
if (hasElementalist) {
  // Increases advantage bonus by 25%
}
```

**Element System**:
- Fire > Ice, Earth
- Water > Fire, Earth
- Earth > Lightning, Air
- Air > Water, Earth
- Lightning > Water, Air
- Ice > Water, Earth
- Light ↔ Dark (mutual)
- Chaos ↔ Cosmic (mutual)

**Player Modifiers**:
- `elementalist` - Increases elemental advantage bonus (+25%)

---

### Step 6: Attack Modifiers
**When**: After elemental calculation
**Purpose**: Apply special attack effects

```javascript
// Penetration: Ignore 30% defense
// Shatter: Remove shields, bonus damage
// Execute: 2x damage vs targets below 25% HP
// Amplify: Stacking damage to same target
// Shred: Reduce enemy armor
```

**Attack Modifiers**:
- `penetration` - Ignore 30% of enemy defense
- `shatter` - Remove all shields + bonus damage (1.5x shield value)
- `pierce` - Ignore dodge/evasion
- `cleave` - Hit 3 targets for 60% damage each
- `execute` - 2x damage when target below 25% HP
- `amplify` - +10% per hit on same target (max 10 stacks)
- `shred` - Reduce armor by 15% for 2 turns
- `overwhelm` - 50% overkill damage carries to another target

---

### Step 7: Defense Application
**When**: After attack modifiers
**Purpose**: Reduce damage based on armor

```javascript
// Get defense value (physical or magical)
let defense = getDefense(defender, damageType);

// Apply penetration reduction
if (hasPenetration) {
  defense *= 0.70; // 30% ignored
}

// Apply shred debuff
if (hasShredDebuff) {
  defense *= (1 - shredAmount);
}

// Defense formula: damage - (defense / 2)
finalDamage = damage - (defense / 2);
```

**Damage Types**:
- `physical` - Reduced by armor
- `magical` - Reduced by magic defense
- `true` - Ignores defense (but not resistance)
- `pure` - Ignores both defense and resistance

**Resistance Types**:
- `physical` resistance
- `magical` resistance

---

### Step 8: Resistance Application
**When**: After defense
**Purpose**: Apply percentage-based damage reduction

```javascript
// Physical/Magical resistance
let resistance = defender.resistances[damageType];

// Elemental resistance (if applicable)
resistance += defender.resistances[element];

// Adaptive modifier
if (defender.lastDamageTaken === damageType) {
  resistance += 0.25;
}

// Cap at 75% reduction
resistance = Math.min(0.75, resistance);
finalDamage = damage * (1 - resistance);
```

**Resistance Types**:
- `physical` - Reduces physical damage
- `magical` - Reduces magical damage
- `elemental` - Reduces elemental damage
- `status` - Reduces status effect duration/potency
- `critical` - Reduces crit chance
- `true` - Reduces true damage (rare)

**Player Modifiers**:
- `adaptive` - Gains 25% resistance to last damage type
- `resilient` - 15% damage reduction from all sources

---

### Step 9: Status Effect Modifiers
**When**: After resistance
**Purpose**: Apply buff/debuff damage multipliers

```javascript
// Defender debuffs increase damage taken
if (hasVulnerability) damage *= 1.50;
if (hasMarked) damage *= 1.25;

// Defender buffs reduce damage taken
if (hasFortified) damage *= 0.75;

// Attacker buffs increase damage dealt
if (hasBerserk) damage *= 1.30;

// Attacker debuffs reduce damage dealt
if (hasFear) damage *= 0.90;
```

**Status Effects**:

**Buffs**:
- `fortified` - Reduces damage taken (-25%)
- `berserk` - Increases damage dealt (+30%) but reduces defense
- `shield` - Absorbs damage (processed in step 10)
- `thorns` - Reflects 30% damage back

**Debuffs**:
- `vulnerability` - Increases damage taken (+50%)
- `marked` - Increases damage taken (+25%), cannot evade
- `fear` - Reduces damage dealt (-10%), reduces mana regen
- `curse` - Reduces all resistances, may cause spell backfire

---

### Step 10: Shield Absorption
**When**: After all damage modifiers
**Purpose**: Absorb damage before it hits HP

```javascript
if (defender.shield.value > 0) {
  absorbed = Math.min(damage, shield.value);
  shield.value -= absorbed;
  damage -= absorbed;
}
```

**Status Effects**:
- `shield` - Absorbs incoming damage

**Attack Modifiers**:
- `shatter` - Removes all shields and deals bonus damage

---

### Step 11: Final Modifiers
**When**: Last defensive check
**Purpose**: Apply final damage reduction

```javascript
// Resilient modifier
if (hasResilient) {
  damage *= 0.85; // 15% reduction
}
```

**Player Modifiers**:
- `resilient` - 15% damage reduction from all sources

---

### Step 12: Fatal Damage Check
**When**: Before applying damage to HP
**Purpose**: Check for survival mechanics

```javascript
if (damage >= defender.health) {
  // Check Last Stand
  if (hasLastStand && !lastStandUsed) {
    defender.health = 1;
    lastStandUsed = true;
    return; // Survived
  }
}
```

**Player Modifiers**:
- `laststand` - Immune to death once per battle

---

### Step 13: Apply Damage
**When**: Final step
**Purpose**: Subtract HP

```javascript
defender.health = Math.max(0, defender.health - damage);
```

---

### Step 14: Reactive Modifiers
**When**: After damage is dealt
**Purpose**: Process effects that trigger on hit

```javascript
// Lifesteal: Heal for 20% of damage dealt
if (hasLifesteal) {
  attacker.health += damage * 0.20;
}

// Absorb: Gain mana from spell damage taken
if (hasAbsorb && isMagicalDamage) {
  defender.mana += damage * 0.30;
}

// Siphon: Steal mana on hit
if (hasSiphon) {
  stolenMana = defender.mana * 0.15;
  defender.mana -= stolenMana;
  attacker.mana += stolenMana;
}

// Drain: Convert damage to shield
if (hasDrain) {
  attacker.shield += damage * 0.25;
}

// Thorns: Reflect damage
if (hasThorns) {
  attacker.health -= damage * 0.30;
}

// Counter: Chance to block and counterattack
if (hasCounter && rollChance(0.25)) {
  attacker.health -= damage * 0.50;
  // Original attack is blocked
}

// Reave: Steal temporary stats
if (hasReave) {
  stealStats(defender, attacker, 0.10);
  // Lasts 3 turns
}
```

**Attack Modifiers (Reactive)**:
- `counter` - 25% chance to prevent attack and deal 50% damage back
- `interrupt` - Guaranteed prevent enemy ability (costs 15 mana)
- `absorb` - Gain 30% of spell damage as mana
- `lifesteal` - Heal for 20% of damage dealt
- `siphon` - Steal 15% of enemy's current mana
- `drain` - Convert 25% of damage dealt into temporary shield
- `reave` - Steal 10% of enemy stats temporarily (3 turns)
- `riposte` - 75% chance to counterattack after dodging (80% damage)

**Status Effects (Reactive)**:
- `thorns` - Reflect 30% of damage back to attacker

---

## Turn-Based Processing

Each turn, the following are processed:

### 1. Status Effect Updates

```javascript
// Damage over Time (DoT)
if (hasBurn) dealDamage(burnDamagePerTurn);
if (hasPoison) dealDamage(poisonDamagePerTurn);
if (hasBleed) dealDamage(bleedDamagePerTurn);
if (hasCorruption) {
  dealDamage(corruptionDamagePerTurn);
  reduceHealing(0.50); // 50% healing reduction
}
if (hasShock) {
  dealDamage(shockDamagePerTurn);
  mayChainToOthers();
}

// Healing over Time (HoT)
if (hasRegen) healAmount(regenPerTurn);

// Mana effects
if (hasClarity) increaseManaRegen(0.30);
if (hasFear) decreaseManaRegen(0.30);

// Stat changes
if (hasDecay) reduceMaxHealth();
if (hasCurse) reduceResistances();

// Duration tracking
decrementAllEffectDurations();
removeExpiredEffects();
```

**Status Effect Types**:

**DoT (Damage over Time)**:
- `burn` - Fire damage per turn
- `poison` - Poison damage per turn
- `bleed` - Physical damage per turn
- `corruption` - Dark damage per turn + reduces healing received
- `shock` - Lightning damage per turn, may chain

**CC (Crowd Control)**:
- `freeze` - Cannot act or move
- `stun` - Cannot act
- `slow` - Reduced speed
- `root` - Cannot move but can act
- `silence` - Cannot cast spells
- `confuse` - 50% chance to use random spell

**Buffs**:
- `shield` - Absorbs damage
- `regen` - Restores health over time
- `haste` - Increased speed
- `fortified` - Increased defenses
- `thorns` - Reflects damage
- `berserk` - More damage, less defense
- `invisible` - Cannot be targeted

**Debuffs**:
- `vulnerability` - Takes increased damage
- `fear` - Reduced mana regen and damage
- `marked` - Takes more damage, cannot evade
- `brittle` - Next hit crits
- `decay` - Reduces max health over time
- `curse` - Reduced resistances, spell backfire chance

### 2. Mana Regeneration

```javascript
let manaRegen = baseManaRegen; // Default: 20

// Apply Clarity player modifier
if (hasClarity) manaRegen *= 1.30;

// Apply Spellweaver
if (hasSpellweaver) manaRegen *= 1.15;

// Apply Fear status
if (hasFear) manaRegen *= 0.70;

entity.mana = Math.min(entity.maxMana, entity.mana + manaRegen);
```

**Player Modifiers**:
- `clarity` - +30% mana regeneration
- `spellweaver` - -15% mana cost of all spells

**Status Effects**:
- `fear` - -30% mana regeneration

### 3. Action Check

```javascript
// Check if entity can act
const actionCheck = mechanicsEngine.canAct(entity);

if (!actionCheck.canAct) {
  // Stunned, frozen, etc.
  skipTurn();
} else if (actionCheck.confused) {
  // Use random spell
  castRandomSpell();
} else if (actionCheck.silenced) {
  // Can only use physical attacks
  physicalActionsOnly();
}
```

**CC Effects Preventing Action**:
- `stun` - Cannot act
- `freeze` - Cannot act or move
- `sleep` - Cannot act (removed on damage)

**CC Effects Modifying Action**:
- `confuse` - 50% chance to use random ability
- `silence` - Cannot cast spells
- `root` - Cannot move but can act

### 4. Cooldown Reduction

```javascript
// Reduce all cooldowns
entity.spells.forEach(spell => {
  if (spell.currentCooldown > 0) {
    let reduction = 1;

    // Quickcast modifier
    if (hasQuickcast) reduction *= 1.20;

    spell.currentCooldown -= reduction;
  }
});
```

**Player Modifiers**:
- `quickcast` - -20% cooldown on all spells

---

## Spell Casting

When a spell is cast:

```javascript
// 1. Check mana cost
let manaCost = spell.manaCost;

// Apply Spellweaver
if (hasSpellweaver) manaCost *= 0.85;

// Apply Overload bonus if high mana
if (hasMana >= 0.80) spellDamage *= 1.30;

// 2. Check silence
if (hasSilence) {
  return { success: false, reason: 'Silenced' };
}

// 3. Cast spell
entity.mana -= manaCost;

// 4. Apply spell damage
const damageResult = mechanicsEngine.calculateDamage(
  attacker,
  defender,
  {
    baseDamage: spell.damage,
    damageType: spell.damageType,
    element: spell.element,
    attackModifiers: spell.modifiers
  }
);

// 5. Check Spell Echo
if (hasSpellEcho && rollChance(0.15)) {
  // Cast spell again
  castSpellAgain();
}

// 6. Apply status effects from spell
spell.statusEffects?.forEach(effect => {
  mechanicsEngine.applyStatusEffect(defender, effect.id, effect);
});

// 7. Set cooldown
spell.currentCooldown = spell.cooldown;
```

**Player Modifiers Affecting Spells**:
- `spellweaver` - -15% mana cost
- `quickcast` - -20% cooldown
- `overload` - +30% spell damage when above 80% mana
- `spellecho` - 15% chance to cast spell twice

---

## Integration Example

Here's how to integrate the MechanicsEngine with your existing battle system:

### Update Battle.js

```javascript
import mechanicsEngine from '../../systems/battle/MechanicsEngine';

// In your attack sequence
case 'attack': {
  const damageResult = mechanicsEngine.calculateDamage(
    attacker,
    receiver,
    {
      baseDamage: attacker.attack,
      damageType: 'physical',
      element: attacker.element || 'neutral',
      canCrit: true,
      canEvade: true,
      attackModifiers: attacker.attackModifiers || []
    }
  );

  if (damageResult.wasEvaded) {
    setAnnouncerMessage(`${receiver.name} evaded the attack!`);
  } else {
    setOpponentHealth(h => h - damageResult.finalDamage);
    setAnnouncerMessage(
      `${receiver.name} took ${damageResult.finalDamage} damage!`
    );

    // Process reactions
    if (damageResult.reactions.lifesteal) {
      setPlayerHealth(h => h + damageResult.reactions.lifesteal);
    }
  }
}
```

### Update helpers.js

```javascript
import mechanicsEngine from '../systems/battle/MechanicsEngine';

export const attack = ({ attacker, receiver }) => {
  return mechanicsEngine.calculateDamage(
    attacker,
    receiver,
    {
      baseDamage: attacker.attack,
      damageType: 'physical',
      element: attacker.element || 'neutral',
      canCrit: true,
      canEvade: true,
      attackModifiers: attacker.attackModifiers || []
    }
  );
};

export const magic = ({ attacker, receiver }) => {
  return mechanicsEngine.calculateDamage(
    attacker,
    receiver,
    {
      baseDamage: attacker.magic,
      damageType: 'magical',
      element: attacker.element || 'neutral',
      canCrit: true,
      canEvade: false, // Magic can't typically be dodged
      attackModifiers: attacker.attackModifiers || []
    }
  );
};
```

---

## Entity Data Structure

Entities (players, heroes, enemies) should have this structure:

```javascript
const entity = {
  // Base Stats
  name: "Hero Name",
  health: 100,
  maxHealth: 100,
  mana: 100,
  maxMana: 100,
  attack: 25,
  defense: 15,
  magic: 30,
  magicDefense: 20,
  level: 10,

  // Element
  element: "fire",

  // Combat Stats
  critChance: 0.05,
  critDamage: 1.5,
  dodgeChance: 0.10,
  accuracy: 1.0,
  manaRegen: 20,

  // Modifiers
  playerModifiers: [
    { id: 'evasive', stacks: 1 },
    { id: 'focus', stacks: 1 },
    { id: 'momentum', stacks: 3 }
  ],

  attackModifiers: [
    'lifesteal',
    'penetration',
    'counter'
  ],

  // Status Effects
  statusEffects: [
    {
      id: 'burn',
      duration: 3,
      damagePerTurn: 5
    },
    {
      id: 'shield',
      duration: 2,
      value: 50
    }
  ],

  // Shield
  shield: {
    value: 25
  },

  // Resistances
  resistances: {
    physical: 0.10,
    magical: 0.15,
    fire: 0.25,
    status: 0.20,
    critical: 0.05
  },

  // Evasion Types
  evasionTypes: {
    dodge: 0.15,
    parry: 0.10
  },

  // Tracking
  damagedLastTurn: false,
  lastDamageTaken: {
    type: 'physical',
    amount: 25
  },

  // Temporary Effects
  temporaryEffects: {
    armorReduction: 0.15
  },

  temporaryStats: {
    attack: 5,
    defense: 3
  }
};
```

---

## Balancing Guide

### Damage Modifiers
- **Passive bonuses**: 10-30%
- **Conditional bonuses**: 25-40%
- **High-risk bonuses**: 40%+

### Resistances
- **Common**: 10-25%
- **Rare**: 25-50%
- **Legendary**: 50-75% (capped)

### Status Effect Durations
- **Short**: 1-2 turns
- **Medium**: 3-4 turns
- **Long**: 5+ turns

### Critical Hits
- **Base chance**: 5%
- **With modifiers**: 15-25%
- **Base multiplier**: 1.5x
- **With modifiers**: 2.0-2.5x

### Evasion
- **Base chance**: 0-10%
- **With modifiers**: 15-30%
- **Hard cap**: 50%

---

## Testing

To test the mechanics engine:

```javascript
import mechanicsEngine from './systems/battle/MechanicsEngine';

// Create test entities
const attacker = {
  health: 100,
  maxHealth: 100,
  attack: 50,
  element: 'fire',
  playerModifiers: [{ id: 'focus', stacks: 1 }],
  attackModifiers: ['lifesteal', 'penetration'],
  damagedLastTurn: false
};

const defender = {
  health: 100,
  maxHealth: 100,
  defense: 20,
  element: 'ice',
  resistances: { physical: 0.10 }
};

// Calculate damage
const result = mechanicsEngine.calculateDamage(
  attacker,
  defender,
  {
    baseDamage: attacker.attack,
    damageType: 'physical',
    element: attacker.element,
    canCrit: true,
    canEvade: true,
    attackModifiers: attacker.attackModifiers
  }
);

console.log('Damage Result:', result);
// {
//   finalDamage: 62,
//   wasCrit: false,
//   wasEvaded: false,
//   modifiersApplied: [
//     { type: 'elemental_advantage', value: 1.5 },
//     { type: 'focus', value: 1.25 },
//     { type: 'penetration', value: 0.30 }
//   ],
//   reactions: {
//     lifesteal: 12
//   }
// }
```

---

## Performance Considerations

The mechanics engine is designed to be:

1. **Deterministic** - Same inputs always produce same outputs
2. **Stateless** - Doesn't store entity state
3. **Efficient** - Minimizes calculations and loops
4. **Extensible** - Easy to add new mechanics

For optimal performance:
- Cache calculation results when possible
- Batch status effect processing
- Only recalculate when stats change

---

## Future Enhancements

Potential additions:
- Combo system (attack chains)
- Positional advantages (flanking, backstab)
- Weather/terrain effects
- Formation bonuses
- Equipment set bonuses
- Synergy bonuses (complementary modifiers)
