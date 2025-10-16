/**
 * MechanicsEngine System
 * Handles all game mechanics calculations including status effects, modifiers, and combat calculations
 */

import mechanics from '../../data/mechanics.json';

/**
 * MechanicsEngine Class
 * Core engine for calculating all game mechanics
 */
export class MechanicsEngine {
  constructor() {
    this.mechanics = mechanics;
  }

  /**
   * Calculate Final Damage
   * Applies all modifiers, resistances, and attack modifiers
   * @param {Object} attacker - Attacker entity
   * @param {Object} defender - Defender entity
   * @param {Object} attackData - Attack configuration
   * @returns {Object} Damage calculation result
   */
  calculateDamage(attacker, defender, attackData) {
    const {
      baseDamage,
      damageType = 'physical',
      element = 'neutral',
      canCrit = true,
      canEvade = true,
      attackModifiers = []
    } = attackData;

    let damage = baseDamage;
    const result = {
      finalDamage: 0,
      wasCrit: false,
      wasEvaded: false,
      wasBlocked: false,
      modifiersApplied: [],
      statusEffectsApplied: []
    };

    // Step 1: Check for evasion (unless pierce is active)
    if (canEvade && !this.hasModifier(attackModifiers, 'pierce')) {
      const evadeRoll = this.checkEvasion(attacker, defender);
      if (evadeRoll.evaded) {
        result.wasEvaded = true;
        result.evasionType = evadeRoll.type;

        // Check for riposte
        if (this.hasModifier(defender.attackModifiers, 'riposte')) {
          result.riposteTriggered = this.rollChance(0.75);
          if (result.riposteTriggered) {
            result.riposteDamage = baseDamage * 0.80;
          }
        }

        return result;
      }
    }

    // Step 2: Apply attacker player modifiers (pre-damage)
    damage = this.applyPlayerModifiers(damage, attacker, 'damage');

    // Step 3: Apply conditional modifiers
    damage = this.applyConditionalModifiers(damage, attacker, defender);

    // Step 4: Check for critical hit
    if (canCrit) {
      const critResult = this.checkCriticalHit(attacker, defender);
      if (critResult.isCrit) {
        damage *= critResult.multiplier;
        result.wasCrit = true;
      }
    }

    // Step 5: Apply elemental advantages/weaknesses
    const elementalMultiplier = this.calculateElementalMultiplier(element, defender.element);
    damage *= elementalMultiplier;
    if (elementalMultiplier > 1) {
      result.modifiersApplied.push({ type: 'elemental_advantage', value: elementalMultiplier });
    } else if (elementalMultiplier < 1) {
      result.modifiersApplied.push({ type: 'elemental_weakness', value: elementalMultiplier });
    }

    // Step 6: Apply attack modifiers
    const modifierResult = this.applyAttackModifiers(damage, attacker, defender, attackModifiers);
    damage = modifierResult.damage;
    result.modifiersApplied.push(...modifierResult.modifiers);

    // Step 7: Apply penetration
    let effectiveDefense = this.getDefense(defender, damageType);
    if (this.hasModifier(attackModifiers, 'penetration')) {
      effectiveDefense *= (1 - 0.30); // 30% penetration
      result.modifiersApplied.push({ type: 'penetration', value: 0.30 });
    }

    // Step 8: Apply defense reduction
    damage = this.applyDefense(damage, effectiveDefense, damageType);

    // Step 9: Apply resistance
    damage = this.applyResistance(damage, defender, damageType, element);

    // Step 10: Apply status effect modifiers
    const statusResult = this.applyStatusEffects(damage, attacker, defender);
    damage = statusResult.damage;
    result.statusEffectsApplied = statusResult.effects;

    // Step 11: Check for shields
    if (defender.shield && defender.shield.value > 0) {
      const shieldResult = this.applyShield(damage, defender.shield);
      damage = shieldResult.remainingDamage;
      defender.shield.value = shieldResult.remainingShield;
      result.shieldAbsorbed = shieldResult.absorbed;
    }

    // Step 12: Apply final damage modifiers (vulnerability, fortified, etc.)
    damage = this.applyFinalModifiers(damage, defender);

    // Step 13: Ensure damage is not negative
    damage = Math.max(0, damage);
    result.finalDamage = Math.floor(damage);

    // Step 14: Process reactive modifiers (lifesteal, absorb, etc.)
    result.reactions = this.processReactions(attacker, defender, result.finalDamage, attackData);

    return result;
  }

  /**
   * Apply Player Modifiers
   * @param {number} value - Base value
   * @param {Object} entity - Entity with modifiers
   * @param {string} statType - Type of stat to modify
   * @returns {number} Modified value
   */
  applyPlayerModifiers(value, entity, statType) {
    if (!entity.playerModifiers) return value;

    let modified = value;

    entity.playerModifiers.forEach(modifier => {
      const modData = this.mechanics.playerModifiers[modifier.id];
      if (!modData || modData.statModifier !== statType) return;

      if (modData.type === 'passive') {
        modified *= (1 + modData.value);
      } else if (modData.type === 'stacking') {
        const stacks = Math.min(modifier.stacks || 0, modData.maxStacks);
        modified *= (1 + (modData.valuePerStack * stacks));
      }
    });

    return modified;
  }

  /**
   * Apply Conditional Modifiers
   * @param {number} damage - Base damage
   * @param {Object} attacker - Attacker entity
   * @param {Object} defender - Defender entity
   * @returns {number} Modified damage
   */
  applyConditionalModifiers(damage, attacker, defender) {
    if (!attacker.playerModifiers) return damage;

    let modified = damage;

    attacker.playerModifiers.forEach(modifier => {
      const modData = this.mechanics.playerModifiers[modifier.id];
      if (!modData || modData.type !== 'conditional') return;

      let conditionMet = false;

      switch (modData.condition) {
        case 'noDamageTaken':
          conditionMet = !attacker.damagedLastTurn;
          break;
        case 'highMana':
          conditionMet = (attacker.mana / attacker.maxMana) >= 0.80;
          break;
        case 'lowHealth':
          conditionMet = (attacker.health / attacker.maxHealth) <= 0.30;
          break;
        case 'targetBelowThreshold':
          conditionMet = (defender.health / defender.maxHealth) <= (modData.threshold || 0.25);
          break;
        case 'fatalDamage':
          // Handled separately in damage application
          break;
      }

      if (conditionMet && modData.statModifier === 'damage') {
        modified *= (1 + modData.value);
      }
    });

    return modified;
  }

  /**
   * Check for Critical Hit
   * @param {Object} attacker - Attacker entity
   * @param {Object} defender - Defender entity
   * @returns {Object} Crit result
   */
  checkCriticalHit(attacker, defender) {
    let critChance = attacker.critChance || 0.05; // 5% base
    let critMultiplier = attacker.critDamage || 1.5; // 150% base

    // Apply precise modifier
    critChance = this.applyPlayerModifiers(critChance, attacker, 'critChance');

    // Apply deadly modifier
    critMultiplier = this.applyPlayerModifiers(critMultiplier, attacker, 'critDamage');

    // Apply defender's critical resistance
    if (defender.resistances?.critical) {
      critChance *= (1 - defender.resistances.critical);
    }

    // Check for brittle status
    if (defender.statusEffects?.find(e => e.id === 'brittle')) {
      return { isCrit: true, multiplier: critMultiplier, brittle: true };
    }

    const isCrit = this.rollChance(critChance);
    return { isCrit, multiplier: isCrit ? critMultiplier : 1.0 };
  }

  /**
   * Check for Evasion
   * @param {Object} attacker - Attacker entity
   * @param {Object} defender - Defender entity
   * @returns {Object} Evasion result
   */
  checkEvasion(attacker, defender) {
    // Check for marked status (cannot evade)
    if (defender.statusEffects?.find(e => e.id === 'marked')) {
      return { evaded: false };
    }

    let dodgeChance = defender.dodgeChance || 0;

    // Apply evasive modifier
    dodgeChance = this.applyPlayerModifiers(dodgeChance, defender, 'dodgeChance');

    // Apply attacker's accuracy
    let accuracy = attacker.accuracy || 1.0;
    accuracy = this.applyPlayerModifiers(accuracy, attacker, 'accuracy');

    dodgeChance *= (2 - accuracy); // High accuracy reduces dodge chance

    // Check dodge types
    const evasionTypes = ['dodge', 'parry', 'deflect', 'phase'];

    for (const type of evasionTypes) {
      if (defender.evasionTypes?.[type]) {
        const chance = defender.evasionTypes[type];
        if (this.rollChance(chance)) {
          return { evaded: true, type };
        }
      }
    }

    // Standard dodge check
    if (this.rollChance(dodgeChance)) {
      return { evaded: true, type: 'dodge' };
    }

    return { evaded: false };
  }

  /**
   * Calculate Elemental Multiplier
   * @param {string} attackElement - Attack element
   * @param {string} defenderElement - Defender element
   * @returns {number} Multiplier
   */
  calculateElementalMultiplier(attackElement, defenderElement) {
    if (!attackElement || !defenderElement || attackElement === 'neutral') {
      return 1.0;
    }

    const elementData = this.mechanics.elements[attackElement];
    if (!elementData) return 1.0;

    const baseMultiplier = this.mechanics.battle.elementalAdvantageMultiplier;
    const weaknessMultiplier = this.mechanics.battle.elementalWeaknessMultiplier;

    if (elementData.advantages.includes(defenderElement)) {
      return baseMultiplier;
    } else if (elementData.weaknesses.includes(defenderElement)) {
      return weaknessMultiplier;
    }

    return 1.0;
  }

  /**
   * Apply Attack Modifiers
   * @param {number} damage - Base damage
   * @param {Object} attacker - Attacker entity
   * @param {Object} defender - Defender entity
   * @param {Array} modifiers - Attack modifiers
   * @returns {Object} Result with modified damage and applied modifiers
   */
  applyAttackModifiers(damage, attacker, defender, modifiers = []) {
    let modified = damage;
    const applied = [];

    modifiers.forEach(modId => {
      const modData = this.mechanics.attackModifiers[modId];
      if (!modData) return;

      switch (modId) {
        case 'shatter':
          if (defender.shield?.value > 0) {
            const shieldValue = defender.shield.value;
            modified += shieldValue * (modData.damageMultiplier - 1);
            defender.shield.value = 0;
            applied.push({ type: 'shatter', bonus: shieldValue * 0.5 });
          }
          break;

        case 'execute':
          if ((defender.health / defender.maxHealth) <= modData.threshold) {
            modified *= modData.damageMultiplier;
            applied.push({ type: 'execute', multiplier: modData.damageMultiplier });
          }
          break;

        case 'cleave':
          // Handled separately for multi-target
          applied.push({ type: 'cleave', targets: modData.targetCount });
          break;

        case 'amplify':
          // Stacking damage to same target
          const stacks = attacker.amplifyStacks?.[defender.id] || 0;
          const amplifyBonus = Math.min(stacks, modData.maxStacks) * modData.stackValue;
          modified *= (1 + amplifyBonus);
          applied.push({ type: 'amplify', stacks, bonus: amplifyBonus });
          break;

        case 'shred':
          // Reduce armor
          if (!defender.temporaryEffects) defender.temporaryEffects = {};
          defender.temporaryEffects.armorReduction =
            (defender.temporaryEffects.armorReduction || 0) + modData.armorReduction;
          applied.push({ type: 'shred', reduction: modData.armorReduction });
          break;

        case 'overwhelm':
          // Handled post-kill
          break;
      }
    });

    return { damage: modified, modifiers: applied };
  }

  /**
   * Get Defense Value
   * @param {Object} entity - Entity
   * @param {string} damageType - Type of damage
   * @returns {number} Defense value
   */
  getDefense(entity, damageType) {
    let defense = 0;

    switch (damageType) {
      case 'physical':
        defense = entity.defense || 0;
        break;
      case 'magical':
        defense = entity.magicDefense || 0;
        break;
      case 'true':
        defense = 0; // True damage ignores defense
        break;
      case 'pure':
        defense = 0; // Pure damage ignores everything
        break;
    }

    // Apply temporary armor reduction (from shred)
    if (entity.temporaryEffects?.armorReduction) {
      defense *= (1 - entity.temporaryEffects.armorReduction);
    }

    return defense;
  }

  /**
   * Apply Defense
   * @param {number} damage - Raw damage
   * @param {number} defense - Defense value
   * @param {string} damageType - Type of damage
   * @returns {number} Reduced damage
   */
  applyDefense(damage, defense, damageType) {
    if (damageType === 'true' || damageType === 'pure') {
      return damage;
    }

    // Simple defense formula: damage - (defense / 2)
    return Math.max(1, damage - (defense / 2));
  }

  /**
   * Apply Resistance
   * @param {number} damage - Damage after defense
   * @param {Object} defender - Defender entity
   * @param {string} damageType - Type of damage
   * @param {string} element - Attack element
   * @returns {number} Reduced damage
   */
  applyResistance(damage, defender, damageType, element) {
    if (damageType === 'pure') {
      return damage; // Pure damage ignores resistances
    }

    let resistance = 0;

    // Physical/Magical resistance
    if (defender.resistances?.[damageType]) {
      resistance += defender.resistances[damageType];
    }

    // Elemental resistance
    if (element !== 'neutral' && defender.resistances?.[element]) {
      resistance += defender.resistances[element];
    }

    // Adaptive modifier
    if (defender.playerModifiers?.find(m => m.id === 'adaptive')) {
      if (defender.lastDamageTaken?.type === damageType) {
        resistance += 0.25;
      }
    }

    // Apply resistance (capped at 75% reduction)
    resistance = Math.min(0.75, resistance);
    return damage * (1 - resistance);
  }

  /**
   * Apply Status Effects
   * @param {number} damage - Current damage
   * @param {Object} attacker - Attacker entity
   * @param {Object} defender - Defender entity
   * @returns {Object} Result with modified damage and effects
   */
  applyStatusEffects(damage, attacker, defender) {
    let modified = damage;
    const effects = [];

    // Defender effects that modify incoming damage
    if (defender.statusEffects) {
      defender.statusEffects.forEach(effect => {
        switch (effect.id) {
          case 'vulnerability':
            modified *= 1.5;
            effects.push({ type: 'vulnerability', multiplier: 1.5 });
            break;

          case 'fortified':
            modified *= 0.75;
            effects.push({ type: 'fortified', multiplier: 0.75 });
            break;

          case 'marked':
            modified *= 1.25;
            effects.push({ type: 'marked', multiplier: 1.25 });
            break;

          case 'brittle':
            // Handled in crit check, remove after hit
            const index = defender.statusEffects.findIndex(e => e.id === 'brittle');
            if (index > -1) {
              defender.statusEffects.splice(index, 1);
            }
            break;
        }
      });
    }

    // Attacker effects that modify outgoing damage
    if (attacker.statusEffects) {
      attacker.statusEffects.forEach(effect => {
        switch (effect.id) {
          case 'berserk':
            modified *= 1.3;
            effects.push({ type: 'berserk', multiplier: 1.3 });
            break;

          case 'fear':
            modified *= 0.9;
            effects.push({ type: 'fear', multiplier: 0.9 });
            break;
        }
      });
    }

    return { damage: modified, effects };
  }

  /**
   * Apply Shield
   * @param {number} damage - Incoming damage
   * @param {Object} shield - Shield object
   * @returns {Object} Result
   */
  applyShield(damage, shield) {
    const absorbed = Math.min(damage, shield.value);
    return {
      absorbed,
      remainingShield: shield.value - absorbed,
      remainingDamage: damage - absorbed
    };
  }

  /**
   * Apply Final Modifiers
   * @param {number} damage - Current damage
   * @param {Object} defender - Defender entity
   * @returns {number} Final damage
   */
  applyFinalModifiers(damage, defender) {
    let modified = damage;

    // Resilient modifier
    if (defender.playerModifiers?.find(m => m.id === 'resilient')) {
      modified *= 0.85; // 15% damage reduction
    }

    return modified;
  }

  /**
   * Process Reactions
   * Handles lifesteal, absorb, drain, etc.
   * @param {Object} attacker - Attacker entity
   * @param {Object} defender - Defender entity
   * @param {number} damage - Final damage dealt
   * @param {Object} attackData - Attack configuration
   * @returns {Object} Reactions
   */
  processReactions(attacker, defender, damage, attackData) {
    const reactions = {};

    // Lifesteal
    if (this.hasModifier(attacker.attackModifiers, 'lifesteal')) {
      reactions.lifesteal = Math.floor(damage * 0.20);
      attacker.health = Math.min(attacker.maxHealth, attacker.health + reactions.lifesteal);
    }

    // Absorb (mana from magical damage)
    if (this.hasModifier(defender.attackModifiers, 'absorb') &&
        attackData.damageType === 'magical') {
      reactions.manaAbsorbed = Math.floor(damage * 0.30);
      defender.mana = Math.min(defender.maxMana, defender.mana + reactions.manaAbsorbed);
    }

    // Siphon (steal mana)
    if (this.hasModifier(attacker.attackModifiers, 'siphon')) {
      const manaSiphoned = Math.floor((defender.mana || 0) * 0.15);
      reactions.manaSiphoned = manaSiphoned;
      defender.mana = Math.max(0, (defender.mana || 0) - manaSiphoned);
      attacker.mana = Math.min(attacker.maxMana, attacker.mana + manaSiphoned);
    }

    // Drain (damage to shield)
    if (this.hasModifier(attacker.attackModifiers, 'drain')) {
      reactions.shieldGained = Math.floor(damage * 0.25);
      if (!attacker.shield) attacker.shield = { value: 0 };
      attacker.shield.value += reactions.shieldGained;
    }

    // Thorns (reflect damage)
    if (defender.statusEffects?.find(e => e.id === 'thorns')) {
      reactions.thornsReflected = Math.floor(damage * 0.30);
      attacker.health = Math.max(0, attacker.health - reactions.thornsReflected);
    }

    // Counter
    if (this.hasModifier(defender.attackModifiers, 'counter')) {
      if (this.rollChance(0.25)) {
        reactions.countered = true;
        reactions.counterDamage = Math.floor(damage * 0.5);
        attacker.health = Math.max(0, attacker.health - reactions.counterDamage);
      }
    }

    // Reave (steal stats)
    if (this.hasModifier(attacker.attackModifiers, 'reave')) {
      const statSteal = {
        attack: Math.floor((defender.attack || 0) * 0.10),
        defense: Math.floor((defender.defense || 0) * 0.10)
      };
      reactions.statsStolen = statSteal;

      if (!attacker.temporaryStats) attacker.temporaryStats = {};
      attacker.temporaryStats.attack = (attacker.temporaryStats.attack || 0) + statSteal.attack;
      attacker.temporaryStats.defense = (attacker.temporaryStats.defense || 0) + statSteal.defense;

      defender.attack -= statSteal.attack;
      defender.defense -= statSteal.defense;
    }

    return reactions;
  }

  /**
   * Process Turn-Based Effects
   * Updates DoTs, buffs, debuffs, and cleans up expired effects
   * @param {Object} entity - Entity to process
   * @returns {Object} Result
   */
  processTurnEffects(entity) {
    const result = {
      damage: 0,
      healing: 0,
      manaGain: 0,
      manaLoss: 0,
      effectsExpired: [],
      effectsProcessed: []
    };

    if (!entity.statusEffects) return result;

    // Process each status effect
    entity.statusEffects = entity.statusEffects.filter(effect => {
      const effectData = this.mechanics.statusEffects[effect.id];
      if (!effectData) return false;

      // Process DoT effects
      if (effectData.type === 'dot') {
        const dotDamage = effect.damagePerTurn || 0;
        result.damage += dotDamage;
        result.effectsProcessed.push({ id: effect.id, damage: dotDamage });
      }

      // Process HoT effects
      if (effect.id === 'regen') {
        const healing = effect.healingPerTurn || 0;
        result.healing += healing;
        result.effectsProcessed.push({ id: effect.id, healing });
      }

      // Process mana effects
      if (effect.id === 'clarity') {
        const manaBonus = entity.manaRegen * 0.30;
        result.manaGain += manaBonus;
        result.effectsProcessed.push({ id: effect.id, manaGain: manaBonus });
      }

      if (effect.id === 'fear') {
        const manaReduction = entity.manaRegen * 0.30;
        result.manaLoss += manaReduction;
        result.effectsProcessed.push({ id: effect.id, manaLoss: manaReduction });
      }

      // Decrement duration
      if (effect.duration !== undefined) {
        effect.duration--;
        if (effect.duration <= 0) {
          result.effectsExpired.push(effect.id);
          return false; // Remove effect
        }
      }

      return true; // Keep effect
    });

    return result;
  }

  /**
   * Check if entity has a modifier
   * @param {Array} modifiers - Modifier array
   * @param {string} modifierId - Modifier ID to check
   * @returns {boolean}
   */
  hasModifier(modifiers = [], modifierId) {
    if (Array.isArray(modifiers)) {
      return modifiers.includes(modifierId) ||
             modifiers.some(m => m.id === modifierId);
    }
    return false;
  }

  /**
   * Roll Chance
   * @param {number} chance - Chance between 0 and 1
   * @returns {boolean}
   */
  rollChance(chance) {
    return Math.random() < chance;
  }

  /**
   * Apply Status Effect
   * @param {Object} target - Target entity
   * @param {string} effectId - Effect ID
   * @param {Object} effectData - Effect configuration
   * @returns {Object} Result
   */
  applyStatusEffect(target, effectId, effectData = {}) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }

    const effectMechanics = this.mechanics.statusEffects[effectId];
    if (!effectMechanics) {
      return { success: false, reason: 'Invalid effect ID' };
    }

    // Check status resistance
    if (target.resistances?.status) {
      const resistRoll = this.rollChance(target.resistances.status);
      if (resistRoll) {
        return { success: false, reason: 'Resisted' };
      }
    }

    // Check if effect already exists (stack or refresh)
    const existingIndex = target.statusEffects.findIndex(e => e.id === effectId);

    if (existingIndex > -1) {
      // Refresh duration or stack
      if (effectData.stacks && target.statusEffects[existingIndex].stacks) {
        target.statusEffects[existingIndex].stacks = Math.min(
          (target.statusEffects[existingIndex].stacks || 1) + 1,
          effectData.maxStacks || 5
        );
      } else {
        target.statusEffects[existingIndex].duration = effectData.duration || 3;
      }
    } else {
      // Add new effect
      target.statusEffects.push({
        id: effectId,
        duration: effectData.duration || 3,
        damagePerTurn: effectData.damagePerTurn || 0,
        healingPerTurn: effectData.healingPerTurn || 0,
        stacks: effectData.stacks || 1,
        ...effectData
      });
    }

    return { success: true, effect: effectMechanics };
  }

  /**
   * Remove Status Effect
   * @param {Object} target - Target entity
   * @param {string} effectId - Effect ID to remove
   * @returns {boolean}
   */
  removeStatusEffect(target, effectId) {
    if (!target.statusEffects) return false;

    const index = target.statusEffects.findIndex(e => e.id === effectId);
    if (index > -1) {
      target.statusEffects.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Calculate Mana Regeneration
   * @param {Object} entity - Entity
   * @returns {number} Mana regenerated
   */
  calculateManaRegen(entity) {
    let baseManaRegen = entity.manaRegen || this.mechanics.battle.manaRegenPerTurn;

    // Apply clarity
    baseManaRegen = this.applyPlayerModifiers(baseManaRegen, entity, 'manaRegen');

    // Apply fear
    if (entity.statusEffects?.find(e => e.id === 'fear')) {
      baseManaRegen *= 0.70;
    }

    // Apply clarity status
    if (entity.statusEffects?.find(e => e.id === 'clarity')) {
      baseManaRegen *= 1.30;
    }

    return Math.floor(baseManaRegen);
  }

  /**
   * Check if entity can act (not stunned, frozen, etc.)
   * @param {Object} entity - Entity
   * @returns {Object} Result
   */
  canAct(entity) {
    if (!entity.statusEffects) return { canAct: true };

    const ccEffects = ['stun', 'freeze', 'sleep'];
    const ccEffect = entity.statusEffects.find(e => ccEffects.includes(e.id));

    if (ccEffect) {
      return { canAct: false, reason: ccEffect.id };
    }

    // Check confuse
    const confuse = entity.statusEffects.find(e => e.id === 'confuse');
    if (confuse && this.rollChance(0.50)) {
      return { canAct: true, confused: true };
    }

    // Check silence (can't cast spells)
    const silence = entity.statusEffects.find(e => e.id === 'silence');
    if (silence) {
      return { canAct: true, silenced: true };
    }

    return { canAct: true };
  }
}

// Export singleton instance
export default new MechanicsEngine();
