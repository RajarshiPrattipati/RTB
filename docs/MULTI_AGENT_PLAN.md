# Multi-Agent Development Plan
## Spell Brawler - Parallel Implementation Strategy

**Last Updated:** 2025-10-11
**Strategy:** 6 Specialized Agents Working in Parallel

---

## Agent Assignment Matrix

| Agent | Primary Focus | Week 1-2 | Week 3-4 | Week 5-6 | Dependencies |
|-------|---------------|----------|----------|----------|--------------|
| **Agent 1** | Combat Core | Battle engine, damage calc | Status effects, combos | Counter-casting, advanced mechanics | None (foundational) |
| **Agent 2** | Spell Library | 20 core spells, effects | 50 more spells, balance | Spell fusion, augments | Agent 1 (spell model) |
| **Agent 3** | UI/UX | Component library, battle UI | Collection, deck builder | Gacha, progression screens | Agents 1, 2 (data) |
| **Agent 4** | Progression | Leveling, XP, missions | Gacha, pity, track progress | Mastery trees, achievements | Agent 2 (spells) |
| **Agent 5** | AI & Modes | AI opponent logic | Game modes, matchmaking | Boss raids, tournaments | Agent 1 (battle) |
| **Agent 6** | State & Integration | State architecture, persistence | Context providers, optimization | Migration, testing | All agents |

---

## Agent 1: Combat Core Engineer

### Objective
Build the foundational battle system that all other systems depend on.

### Week 1-2: Core Combat System

#### Tasks
1. **Create Spell Data Model** (Priority: Critical)
   ```javascript
   // File: /src/models/Spell.js
   export class Spell {
     constructor(config) {
       this.id = config.id;
       this.name = config.name;
       // ... full implementation
     }

     canCast(caster) {
       // Check resource costs, cooldowns, silenced, etc.
     }

     calculateDamage(caster, target) {
       // Base damage + stats + element advantage
     }
   }
   ```

2. **Implement Resource System** (Priority: Critical)
   ```javascript
   // File: /src/systems/battle/ResourceManager.js
   export class ResourceManager {
     constructor(maxValues) {
       this.resources = {
         mana: { current: 100, max: 100, regenRate: 20 },
         energy: { current: 50, max: 50, regenRate: 10 },
         momentum: { current: 0, max: 100, regenRate: 0 },
         soulFragments: { current: 0, max: 10, regenRate: 0 }
       };
     }

     spend(type, amount) { /* ... */ }
     regenerate() { /* ... */ }
     convert(from, to, ratio) { /* ... */ }
   }
   ```

3. **Build Damage Calculator** (Priority: Critical)
   ```javascript
   // File: /src/systems/battle/DamageCalculator.js
   export const calculateDamage = ({
     spell,
     caster,
     target,
     elements = ELEMENTAL_ADVANTAGE
   }) => {
     let damage = spell.baseDamage;

     // Stat scaling
     damage += caster.stats[spell.scalingStat] * spell.scalingRatio;

     // Elemental advantage
     const multiplier = getElementalMultiplier(spell.element, target.element, elements);
     damage *= multiplier;

     // Defense reduction
     if (spell.damageType === DAMAGE_TYPE.PHYSICAL) {
       damage -= target.stats.defense / 2;
     } else if (spell.damageType === DAMAGE_TYPE.MAGICAL) {
       damage -= target.stats.magicDefense / 2;
     }

     // Critical hit
     if (Math.random() < caster.stats.critChance) {
       damage *= caster.stats.critMultiplier;
     }

     return Math.max(0, Math.floor(damage));
   };
   ```

4. **Create Action Queue System** (Priority: High)
   ```javascript
   // File: /src/systems/battle/ActionQueue.js
   export class ActionQueue {
     constructor() {
       this.queue = [];
     }

     addAction(action) {
       this.queue.push(action);
       this.queue.sort((a, b) => b.priority - a.priority);
     }

     async resolveAll(battleState) {
       while (this.queue.length > 0) {
         const action = this.queue.shift();
         await this.resolveAction(action, battleState);
       }
     }
   }
   ```

5. **Implement Basic Status Effects** (Priority: High)
   ```javascript
   // File: /src/systems/battle/StatusEffectManager.js
   export class StatusEffectManager {
     constructor() {
       this.activeEffects = new Map(); // entityId -> [effects]
     }

     applyEffect(targetId, effect) {
       // Stack or replace based on effect type
     }

     tickEffects() {
       // Apply DoT, reduce duration, remove expired
     }

     hasEffect(targetId, effectType) { /* ... */ }
     removeEffect(targetId, effectType) { /* ... */ }
   }
   ```

#### Deliverables
- [ ] `/src/models/Spell.js` - Complete spell class
- [ ] `/src/models/BattleState.js` - Battle state model
- [ ] `/src/systems/battle/ResourceManager.js`
- [ ] `/src/systems/battle/DamageCalculator.js`
- [ ] `/src/systems/battle/ActionQueue.js`
- [ ] `/src/systems/battle/StatusEffectManager.js`
- [ ] Unit tests for all damage calculations
- [ ] Integration test: Full battle simulation

#### Handoff to Other Agents
- **To Agent 2:** Spell model interface, effect callback system
- **To Agent 3:** BattleState structure for UI rendering
- **To Agent 5:** Battle API for AI integration
- **To Agent 6:** State shape for persistence

---

## Agent 2: Spell Library Designer

### Objective
Create a diverse, balanced library of 70+ spells with unique effects and synergies.

### Week 1-2: Core Spell Library

#### Tasks
1. **Define 20 Core Spells** (Priority: Critical)
   ```javascript
   // File: /src/data/spells/coreSpells.js
   export const FIREBALL = {
     id: 'fireball',
     name: 'Fireball',
     description: 'Launches a blazing sphere of fire at the enemy.',
     rarity: RARITY.COMMON,
     element: ELEMENT.FIRE,
     school: SPELL_SCHOOL.EVOCATION,

     baseDamage: 45,
     damageType: DAMAGE_TYPE.MAGICAL,
     manaCost: 30,
     energyCost: 0,
     castTime: 0,
     cooldown: 0,

     primaryEffect: {
       type: SPELL_TYPE.DAMAGE,
       targets: 1
     },

     secondaryEffects: [
       {
         type: STATUS_EFFECT.BURN,
         chance: 0.3,
         value: 10, // damage per turn
         duration: 3,
         stackable: true
       }
     ],

     comboTags: ['fire', 'evocation', 'damage'],
     counters: ['ice_shield', 'water_barrier']
   };
   ```

2. **Implement Spell Effect Functions** (Priority: Critical)
   ```javascript
   // File: /src/systems/spells/SpellEffects.js
   export const spellEffects = {
     // Damage effect
     damage: (spell, caster, targets, battleState) => {
       targets.forEach(target => {
         const damage = calculateDamage({ spell, caster, target });
         target.takeDamage(damage);

         // Apply secondary effects
         spell.secondaryEffects?.forEach(effect => {
           if (Math.random() < effect.chance) {
             battleState.statusEffects.applyEffect(target.id, effect);
           }
         });
       });
     },

     // Heal effect
     heal: (spell, caster, targets) => {
       const healAmount = spell.baseHeal + caster.stats.magic * 0.5;
       targets.forEach(target => {
         target.heal(healAmount);
       });
     },

     // Buff effect
     buff: (spell, caster, targets, battleState) => {
       targets.forEach(target => {
         battleState.statusEffects.applyEffect(target.id, {
           type: spell.buffType,
           value: spell.buffValue,
           duration: spell.duration
         });
       });
     },

     // Custom effects
     custom: {
       timeWarp: (spell, caster, battleState) => {
         // Rewind to state 2 turns ago
         const previousState = battleState.history[battleState.turn - 2];
         Object.assign(battleState, previousState);
       },

       chaosBolt: (spell, caster, targets) => {
         const outcomes = [
           () => targets[0].takeDamage(100), // High damage
           () => battleState.statusEffects.applyEffect(targets[0].id, { type: 'stun', duration: 1 }),
           () => caster.heal(50) // Backfire heal
         ];
         const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
         randomOutcome();
       }
     }
   };
   ```

3. **Create Spell Balance Sheet** (Priority: High)
   ```javascript
   // File: /src/data/spells/balanceConfig.js
   export const BALANCE_TARGETS = {
     DPM: {
       INSTANT: 1.0,
       STANDARD: 1.2,
       CHARGED: 1.5,
       ULTIMATE: 2.0
     },

     HPM: 0.8,

     STATUS_VALUE: {
       CC_PER_TURN: 20, // 1 turn stun = 20 damage
       DOT_PER_TURN: 10,
       BUFF_PER_TURN: 15
     }
   };

   export const validateSpellBalance = (spell) => {
     const dpm = spell.baseDamage / spell.manaCost;
     const target = BALANCE_TARGETS.DPM[spell.castTime === 0 ? 'INSTANT' : 'STANDARD'];

     if (Math.abs(dpm - target) > 0.2) {
       console.warn(`Spell ${spell.name} has DPM ${dpm}, target is ${target}`);
     }
   };
   ```

4. **Design Spell Synergies** (Priority: Medium)
   ```javascript
   // File: /src/systems/spells/SynergyDetector.js
   export class SynergyDetector {
     detectDeckSynergies(deck) {
       const synergies = [];

       // Tag-based synergy (3+ same school)
       const schoolCounts = {};
       deck.forEach(spell => {
         schoolCounts[spell.school] = (schoolCounts[spell.school] || 0) + 1;
       });

       Object.entries(schoolCounts).forEach(([school, count]) => {
         if (count >= 3) {
           synergies.push({
             type: 'school_synergy',
             school,
             bonus: { spellDamage: count * 0.05 }
           });
         }
       });

       // Element set bonus (all 5 basic elements)
       const elements = new Set(deck.map(s => s.element));
       if (elements.size >= 5) {
         synergies.push({
           type: 'rainbow_synergy',
           bonus: { allResistance: 0.1 }
         });
       }

       return synergies;
     }

     detectCombo(spellSequence, battleState) {
       // Sequential combo (fire -> lightning = plasma)
       if (spellSequence.length >= 2) {
         const [prev, curr] = spellSequence.slice(-2);
         if (prev.element === 'fire' && curr.element === 'lightning') {
           return {
             name: 'Plasma Chain',
             bonus: { damage: 1.5 }
           };
         }
       }
     }
   }
   ```

5. **Create Spell Variants (Mutations)** (Priority: Low)
   ```javascript
   // File: /src/systems/spells/SpellMutator.js
   export const generateMutatedSpell = (baseSpell) => {
     const mutated = { ...baseSpell };

     // Random stat variance
     mutated.mutations = {
       critChance: Math.random() * 0.15, // 0-15%
       costReduction: Math.random() * 0.3, // 0-30%
       powerVariance: 0.8 + Math.random() * 0.4 // 0.8-1.2x
     };

     // Apply mutations
     mutated.baseDamage *= mutated.mutations.powerVariance;
     mutated.manaCost *= (1 - mutated.mutations.costReduction);

     return mutated;
   };
   ```

#### Deliverables
- [ ] 20 core spells (4 per element: Fire, Water, Earth, Air, Lightning)
- [ ] Spell effects implementation
- [ ] Balance spreadsheet/validator
- [ ] Synergy detection system
- [ ] Spell mutation system
- [ ] Documentation: Spell design guidelines

#### Files to Create
```
/src/data/spells/
  ├── coreSpells.js (20 spells)
  ├── fireSpells.js (10 spells)
  ├── waterSpells.js (10 spells)
  ├── earthSpells.js (10 spells)
  ├── airSpells.js (10 spells)
  ├── lightningSpells.js (10 spells)
  ├── iceSpells.js (5 spells)
  ├── lightSpells.js (5 spells)
  ├── darkSpells.js (5 spells)
  ├── chaosSpells.js (3 spells)
  ├── cosmicSpells.js (2 spells)
  └── balanceConfig.js

/src/systems/spells/
  ├── SpellEffects.js
  ├── SpellValidator.js
  ├── SynergyDetector.js
  └── SpellMutator.js
```

---

## Agent 3: UI/UX Developer

### Objective
Create intuitive, responsive React components for all game screens.

### Week 1-2: Battle UI & Component Library

#### Tasks
1. **Build Component Library** (Priority: Critical)
   ```javascript
   // File: /src/components/common/Button/Button.js
   export const Button = ({
     variant = 'primary',
     disabled = false,
     onClick,
     children
   }) => (
     <button
       className={`btn btn-${variant} ${disabled ? 'disabled' : ''}`}
       onClick={disabled ? undefined : onClick}
       disabled={disabled}
     >
       {children}
     </button>
   );

   // File: /src/components/common/ResourceBar/ResourceBar.js
   export const ResourceBar = ({
     current,
     max,
     type,
     showNumbers = true
   }) => {
     const percentage = (current / max) * 100;
     const colors = {
       mana: 'blue',
       energy: 'yellow',
       momentum: 'orange',
       hp: 'red'
     };

     return (
       <div className="resource-bar">
         <div
           className={`fill fill-${colors[type]}`}
           style={{ width: `${percentage}%` }}
         />
         {showNumbers && (
           <span className="numbers">{current}/{max}</span>
         )}
       </div>
     );
   };
   ```

2. **Create Battle Screen** (Priority: Critical)
   ```javascript
   // File: /src/components/Battle/BattleScreen.js
   import { useBattleState } from 'context/BattleContext';

   export const BattleScreen = () => {
     const {
       player,
       opponent,
       turn,
       castSpell,
       availableSpells
     } = useBattleState();

     return (
       <div className="battle-screen">
         <OpponentPanel opponent={opponent} />

         <BattleField
           playerAnimation={player.animation}
           opponentAnimation={opponent.animation}
         />

         <PlayerPanel player={player}>
           <ResourceDisplay resources={player.resources} />
           <SpellBar
             spells={availableSpells}
             onSpellClick={castSpell}
             disabled={turn !== 'player'}
           />
           <ComboMeter value={player.comboMeter} />
         </PlayerPanel>

         <BattleLog entries={battleLog} />
       </div>
     );
   };
   ```

3. **Implement Spell Buttons** (Priority: Critical)
   ```javascript
   // File: /src/components/Battle/SpellButton.js
   export const SpellButton = ({ spell, onClick, disabled }) => {
     const canCast = spell.manaCost <= playerMana && !spell.onCooldown;

     return (
       <Tooltip content={<SpellTooltip spell={spell} />}>
         <button
           className={`spell-btn rarity-${spell.rarity}`}
           onClick={() => onClick(spell)}
           disabled={disabled || !canCast}
         >
           <img src={spell.iconUrl} alt={spell.name} />
           <div className="spell-info">
             <span className="name">{spell.name}</span>
             <span className="cost">{spell.manaCost} M</span>
           </div>
           {spell.cooldownRemaining > 0 && (
             <div className="cooldown-overlay">
               {spell.cooldownRemaining}
             </div>
           )}
         </button>
       </Tooltip>
     );
   };
   ```

4. **Create Animation System** (Priority: High)
   ```javascript
   // File: /src/components/Battle/BattleAnimations.js
   import { motion } from 'framer-motion';

   export const SpellAnimation = ({ spell, onComplete }) => {
     const animations = {
       fireball: {
         initial: { x: -200, scale: 0.5 },
         animate: { x: 200, scale: 1.2 },
         transition: { duration: 0.8, ease: 'easeOut' }
       },
       // ... more spell animations
     };

     return (
       <motion.div
         className="spell-animation"
         {...animations[spell.animationKey]}
         onAnimationComplete={onComplete}
       >
         <img src={spell.animationSprite} />
       </motion.div>
     );
   };

   export const DamageNumber = ({ value, x, y }) => (
     <motion.div
       className="damage-number"
       initial={{ x, y, opacity: 1, scale: 1 }}
       animate={{ y: y - 50, opacity: 0, scale: 1.5 }}
       transition={{ duration: 1 }}
     >
       -{value}
     </motion.div>
   );
   ```

5. **Build Deck Builder UI** (Priority: High)
   ```javascript
   // File: /src/components/DeckBuilder/DeckBuilder.js
   export const DeckBuilder = () => {
     const { collection } = useCollection();
     const [deck, setDeck] = useState([]);
     const [filters, setFilters] = useState({});

     const filteredSpells = applyFilters(collection, filters);

     const addToDeck = (spell) => {
       if (deck.length < 6) {
         setDeck([...deck, spell]);
       }
     };

     return (
       <div className="deck-builder">
         <DeckSlots
           deck={deck}
           onRemove={(index) => setDeck(deck.filter((_, i) => i !== index))}
         />

         <FilterBar
           filters={filters}
           onChange={setFilters}
         />

         <SpellCollection
           spells={filteredSpells}
           onSpellClick={addToDeck}
         />

         <DeckStats deck={deck} />
       </div>
     );
   };
   ```

#### Deliverables
- [ ] Component library (Button, Card, Modal, Tooltip, etc.)
- [ ] Battle screen (fully functional)
- [ ] Spell buttons with tooltips
- [ ] Animation system (Framer Motion)
- [ ] Deck builder UI
- [ ] Responsive design (mobile-friendly)

#### Files to Create
```
/src/components/
  ├── common/
  │   ├── Button/
  │   ├── Card/
  │   ├── Modal/
  │   ├── Tooltip/
  │   └── ResourceBar/
  ├── Battle/
  │   ├── BattleScreen.js
  │   ├── OpponentPanel.js
  │   ├── PlayerPanel.js
  │   ├── SpellButton.js
  │   ├── SpellBar.js
  │   ├── BattleField.js
  │   ├── BattleLog.js
  │   ├── ComboMeter.js
  │   └── BattleAnimations.js
  ├── DeckBuilder/
  │   ├── DeckBuilder.js
  │   ├── DeckSlots.js
  │   ├── SpellCollection.js
  │   ├── FilterBar.js
  │   └── DeckStats.js
  └── Collection/
      ├── CollectionBrowser.js
      ├── SpellCard.js
      └── SpellDetailModal.js
```

---

## Agent 4: Progression Systems Engineer

### Objective
Implement all player advancement systems (leveling, missions, gacha, track progress).

### Week 1-2: Core Progression

#### Tasks
1. **Implement Player Leveling** (Priority: Critical)
   ```javascript
   // File: /src/systems/progression/LevelingSystem.js
   export class LevelingSystem {
     constructor() {
       this.xpCurve = this.generateXPCurve(100); // 100 max level
     }

     generateXPCurve(maxLevel) {
       // Exponential curve: XP = 100 * level^1.5
       return Array.from({ length: maxLevel }, (_, i) =>
         Math.floor(100 * Math.pow(i + 1, 1.5))
       );
     }

     addXP(player, amount) {
       player.xp += amount;

       while (player.xp >= this.xpCurve[player.level]) {
         player.xp -= this.xpCurve[player.level];
         player.level++;
         this.onLevelUp(player);
       }
     }

     onLevelUp(player) {
       const rewards = this.getLevelRewards(player.level);
       player.receiveRewards(rewards);

       // Trigger events
       eventBus.emit('player:levelup', { player, level: player.level });
     }

     getLevelRewards(level) {
       const rewards = {
         5: { unlock: '6th_spell_slot' },
         10: { unlock: 'spell_upgrades', gold: 500 },
         15: { unlock: 'spell_fusion', legendarySpell: 'time_warp' },
         // ...
       };

       return rewards[level] || { gold: level * 50 };
     }
   }
   ```

2. **Build Mission System** (Priority: Critical)
   ```javascript
   // File: /src/systems/progression/MissionManager.js
   export class MissionManager {
     constructor() {
       this.dailyMissions = [];
       this.weeklyMissions = [];
       this.achievements = [];
     }

     generateDailyMissions(player) {
       const templates = [
         { id: 'win_battles', desc: 'Win {count} battles', count: 3, reward: { gold: 100, spellPulls: 1 } },
         { id: 'deal_fire_damage', desc: 'Deal {count} fire damage', count: 500, reward: { gold: 50 } },
         { id: 'use_healing', desc: 'Use {count} healing spells', count: 10, reward: { gold: 75 } }
       ];

       // Pick 3 random templates
       const selected = this.randomPick(templates, 3);

       this.dailyMissions = selected.map(template => ({
         ...template,
         progress: 0,
         completed: false,
         expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
       }));
     }

     trackProgress(eventType, data) {
       this.dailyMissions.forEach(mission => {
         if (mission.id === eventType && !mission.completed) {
           mission.progress += data.value;
           if (mission.progress >= mission.count) {
             this.completeMission(mission);
           }
         }
       });
     }

     completeMission(mission) {
       mission.completed = true;
       eventBus.emit('mission:complete', { mission, rewards: mission.reward });
     }
   }
   ```

3. **Create Gacha System** (Priority: Critical)
   ```javascript
   // File: /src/systems/collection/GachaManager.js
   import { RARITY_DROP_RATE } from 'shared/spellTypes';

   export class GachaManager {
     constructor() {
       this.pityCounter = {
         pulls: 0,
         lastRare: 0,
         lastEpic: 0,
         lastLegendary: 0
       };
     }

     pull(count = 1) {
       const results = [];

       for (let i = 0; i < count; i++) {
         const rarity = this.determineRarity();
         const spell = this.getRandomSpell(rarity);
         results.push(spell);

         this.updatePity(rarity);
       }

       return results;
     }

     determineRarity() {
       this.pityCounter.pulls++;

       // Pity logic
       if (this.pityCounter.lastLegendary >= 50) {
         this.pityCounter.lastLegendary = 0;
         return RARITY.LEGENDARY;
       }

       if (this.pityCounter.lastEpic >= 25) {
         this.pityCounter.lastEpic = 0;
         return RARITY.EPIC;
       }

       if (this.pityCounter.lastRare >= 10) {
         this.pityCounter.lastRare = 0;
         return RARITY.RARE;
       }

       // Normal RNG
       const roll = Math.random();
       let cumulative = 0;

       for (const [rarity, rate] of Object.entries(RARITY_DROP_RATE)) {
         cumulative += rate;
         if (roll <= cumulative) {
           return rarity;
         }
       }
     }

     updatePity(rarity) {
       this.pityCounter.lastRare++;
       this.pityCounter.lastEpic++;
       this.pityCounter.lastLegendary++;

       if (rarity === RARITY.RARE) this.pityCounter.lastRare = 0;
       if (rarity === RARITY.EPIC) this.pityCounter.lastEpic = 0;
       if (rarity === RARITY.LEGENDARY) this.pityCounter.lastLegendary = 0;
     }

     getRandomSpell(rarity) {
       const spellsOfRarity = spellLibrary.filter(s => s.rarity === rarity);
       return spellsOfRarity[Math.floor(Math.random() * spellsOfRarity.length)];
     }
   }
   ```

4. **Implement Track Progress (Battle Pass)** (Priority: High)
   ```javascript
   // File: /src/systems/progression/TrackProgressManager.js
   export class TrackProgressManager {
     constructor() {
       this.level = 0;
       this.xp = 0;
       this.maxLevel = 100;
       this.rewards = this.generateRewards();
       this.claimedRewards = [];
     }

     generateRewards() {
       return {
         10: { free: { spell: 'uncommon_random' }, premium: { spell: 'rare_random' } },
         25: { free: { spell: 'rare_random' }, premium: { spell: 'epic_random' } },
         50: { free: { spell: 'epic_random' }, premium: { spell: 'legendary_random' } },
         75: { free: { shards: 500 }, premium: { shards: 1000, skin: 'exclusive' } },
         100: { free: { spell: 'legendary_random' }, premium: { spell: 'mythic_random', title: 'season_master' } }
       };
     }

     addXP(amount) {
       this.xp += amount;

       const xpPerLevel = 1000;
       while (this.xp >= xpPerLevel && this.level < this.maxLevel) {
         this.xp -= xpPerLevel;
         this.level++;
         this.checkRewards();
       }
     }

     checkRewards() {
       if (this.rewards[this.level] && !this.claimedRewards.includes(this.level)) {
         eventBus.emit('track:reward_available', { level: this.level });
       }
     }

     claimReward(level, tier = 'free') {
       if (this.level >= level && !this.claimedRewards.includes(level)) {
         const reward = this.rewards[level][tier];
         this.claimedRewards.push(level);
         return reward;
       }
     }
   }
   ```

5. **Create Currency & Economy System** (Priority: Medium)
   ```javascript
   // File: /src/systems/progression/EconomyManager.js
   export class EconomyManager {
     constructor(player) {
       this.player = player;
     }

     earnCurrency(type, amount, source) {
       this.player.currencies[type] += amount;

       eventBus.emit('currency:earned', { type, amount, source });
       this.saveToStorage();
     }

     spendCurrency(type, amount, purpose) {
       if (this.player.currencies[type] >= amount) {
         this.player.currencies[type] -= amount;
         eventBus.emit('currency:spent', { type, amount, purpose });
         this.saveToStorage();
         return true;
       }
       return false;
     }

     disenchantSpell(spell) {
       const shardValue = this.getDisenchantValue(spell.rarity);
       this.earnCurrency('shards', shardValue, 'disenchant');

       // Remove from collection
       this.player.collection = this.player.collection.filter(s => s.id !== spell.id);
     }

     getDisenchantValue(rarity) {
       const values = {
         [RARITY.COMMON]: 10,
         [RARITY.UNCOMMON]: 25,
         [RARITY.RARE]: 75,
         [RARITY.EPIC]: 200,
         [RARITY.LEGENDARY]: 500,
         [RARITY.MYTHIC]: 1500
       };
       return values[rarity];
     }
   }
   ```

#### Deliverables
- [ ] Player leveling system (XP, levels 1-100)
- [ ] Mission system (daily, weekly, achievements)
- [ ] Gacha with pity system
- [ ] Track progress (battle pass)
- [ ] Currency & economy management
- [ ] Disenchant/crafting system

---

## Agent 5: AI & Game Modes Engineer

### Objective
Create intelligent AI opponents and diverse game modes for replayability.

### Week 1-2: AI Opponent System

#### Tasks
1. **Enhance AI Decision Making** (Priority: Critical)
   ```javascript
   // File: /src/systems/ai/AIOpponent.js
   export class AIOpponent {
     constructor(difficulty = 'medium') {
       this.difficulty = difficulty;
       this.strategy = this.selectStrategy();
     }

     selectStrategy() {
       const strategies = {
         easy: new RandomStrategy(),
         medium: new BalancedStrategy(),
         hard: new OptimalStrategy()
       };
       return strategies[this.difficulty];
     }

     chooseSpell(battleState, availableSpells) {
       return this.strategy.evaluate(battleState, availableSpells);
     }
   }

   class RandomStrategy {
     evaluate(battleState, spells) {
       const castableSpells = spells.filter(s => this.canCast(s, battleState.ai));
       return castableSpells[Math.floor(Math.random() * castableSpells.length)];
     }
   }

   class BalancedStrategy {
     evaluate(battleState, spells) {
       const scores = spells.map(spell => ({
         spell,
         score: this.scoreSpell(spell, battleState)
       }));

       scores.sort((a, b) => b.score - a.score);

       // Top 3 choices, pick randomly (avoid predictability)
       const topChoices = scores.slice(0, 3);
       return topChoices[Math.floor(Math.random() * topChoices.length)].spell;
     }

     scoreSpell(spell, battleState) {
       let score = 0;

       // Damage value
       score += spell.baseDamage * 0.5;

       // Elemental advantage
       if (this.hasElementalAdvantage(spell, battleState.player)) {
         score += 30;
       }

       // Healing when low HP
       if (spell.type === 'heal' && battleState.ai.hp < battleState.ai.maxHp * 0.3) {
         score += 50;
       }

       // Finishing blow
       if (battleState.player.hp <= spell.baseDamage) {
         score += 100; // Prioritize lethal
       }

       // Mana efficiency
       score += (spell.baseDamage / spell.manaCost) * 10;

       return score;
     }
   }

   class OptimalStrategy {
     evaluate(battleState, spells) {
       // Minimax algorithm with 2-turn lookahead
       return this.minimax(battleState, spells, 2).bestSpell;
     }

     minimax(state, spells, depth) {
       if (depth === 0 || state.gameOver) {
         return { score: this.evaluateState(state) };
       }

       let bestScore = -Infinity;
       let bestSpell = null;

       spells.forEach(spell => {
         const newState = this.simulateSpell(state, spell);
         const { score } = this.minimax(newState, spells, depth - 1);

         if (score > bestScore) {
           bestScore = score;
           bestSpell = spell;
         }
       });

       return { score: bestScore, bestSpell };
     }
   }
   ```

2. **Implement Game Modes** (Priority: High)
   ```javascript
   // File: /src/systems/modes/GameModeManager.js
   export class GameModeManager {
     createMode(type, config) {
       const modes = {
         practice: new PracticeMode(config),
         ranked: new RankedMode(config),
         draft: new DraftMode(config),
         horde: new HordeMode(config),
         boss_raid: new BossRaidMode(config)
       };

       return modes[type];
     }
   }

   class RankedMode {
     constructor(config) {
       this.matchmaking = new ELOMatchmaking();
       this.seasonManager = new SeasonManager();
     }

     async findMatch(player) {
       const opponent = await this.matchmaking.findOpponent(player.elo);
       return this.createBattle(player, opponent);
     }

     onBattleEnd(winner, loser) {
       const [winnerNewElo, loserNewElo] = this.calculateEloChange(winner.elo, loser.elo);

       winner.elo = winnerNewElo;
       loser.elo = loserNewElo;

       this.updateRanks(winner, loser);
     }

     calculateEloChange(winnerElo, loserElo, kFactor = 32) {
       const expectedWin = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
       const change = Math.round(kFactor * (1 - expectedWin));

       return [winnerElo + change, loserElo - change];
     }
   }

   class DraftMode {
     async startDraft(players) {
       const pool = this.generateSpellPool(30);
       const draft = new SnakeDraft(players, pool);

       return await draft.execute();
     }

     generateSpellPool(size) {
       // Balanced pool: 15 common, 10 uncommon, 4 rare, 1 epic
       const pool = [
         ...this.randomSpells(RARITY.COMMON, 15),
         ...this.randomSpells(RARITY.UNCOMMON, 10),
         ...this.randomSpells(RARITY.RARE, 4),
         ...this.randomSpells(RARITY.EPIC, 1)
       ];

       return this.shuffle(pool);
     }
   }

   class HordeMode {
     constructor() {
       this.wave = 1;
       this.enemiesDefeated = 0;
     }

     spawnWave() {
       const enemyCount = Math.floor(1 + this.wave * 0.5);
       const enemies = [];

       for (let i = 0; i < enemyCount; i++) {
         enemies.push(this.createEnemy(this.wave));
       }

       return enemies;
     }

     createEnemy(wave) {
       const baseStats = {
         hp: 100 + wave * 50,
         attack: 20 + wave * 5,
         defense: 10 + wave * 3
       };

       // Every 5 waves, spawn elite enemy
       if (wave % 5 === 0) {
         baseStats.hp *= 3;
         baseStats.attack *= 2;
         baseStats.elite = true;
       }

       return new Enemy(baseStats);
     }
   }
   ```

3. **Create Boss Raid System** (Priority: Medium)
   ```javascript
   // File: /src/systems/modes/BossRaidMode.js
   export class BossRaidMode {
     constructor() {
       this.bosses = this.loadBosses();
     }

     loadBosses() {
       return [
         {
           id: 'fire_titan',
           name: 'Inferno Titan',
           hp: 5000,
           phases: [
             { threshold: 100, abilities: ['meteor_storm', 'flame_aura'] },
             { threshold: 50, abilities: ['meteor_storm', 'flame_aura', 'pyroclasm'] },
             { threshold: 25, abilities: ['apocalypse'] } // Enrage
           ],
           mechanics: {
             flame_aura: {
               trigger: 'every_3_turns',
               effect: (raid) => {
                 raid.players.forEach(p => p.takeDamage(50));
               }
             },
             pyroclasm: {
               trigger: 'on_spell_cast',
               effect: (raid, spell) => {
                 if (spell.element === 'fire') {
                   raid.boss.heal(spell.baseDamage); // Heals from fire
                 }
               }
             }
           },
           rewards: {
             legendary: 'titans_wrath',
             gold: 5000,
             shards: 1000
           }
         }
         // ... more bosses
       ];
     }

     startRaid(boss, players) {
       const raid = {
         boss: this.createBossInstance(boss),
         players: players.map(p => this.createPlayerInstance(p)),
         turn: 0,
         phase: 0
       };

       return new RaidBattle(raid);
     }
   }

   class RaidBattle {
     constructor(raid) {
       this.raid = raid;
     }

     async executeTurn(playerActions) {
       // Resolve player actions
       playerActions.forEach(action => {
         this.resolvePlayerAction(action);
       });

       // Check phase transition
       this.checkPhaseChange();

       // Boss mechanics
       this.triggerBossMechanics();

       // Boss turn
       this.executeBossTurn();
     }

     checkPhaseChange() {
       const hpPercent = (this.raid.boss.hp / this.raid.boss.maxHp) * 100;
       const currentPhase = this.raid.boss.phases[this.raid.phase];

       if (hpPercent <= currentPhase.threshold) {
         this.raid.phase++;
         eventBus.emit('boss:phase_change', { phase: this.raid.phase });
       }
     }
   }
   ```

#### Deliverables
- [ ] AI opponent (3 difficulty levels)
- [ ] Ranked matchmaking (ELO system)
- [ ] Draft mode
- [ ] Horde mode (endless waves)
- [ ] Boss raid system (3 bosses)
- [ ] Tournament bracket system (future)

---

## Agent 6: State Management & Integration

### Objective
Manage global state, persistence, and integrate all systems seamlessly.

### Week 1-2: State Architecture

#### Tasks
1. **Design Global State** (Priority: Critical)
   ```javascript
   // File: /src/context/GlobalState.js
   import { createContext, useReducer } from 'react';

   const initialState = {
     player: {
       id: null,
       username: '',
       level: 1,
       xp: 0,
       elo: 1000,
       collection: [],
       decks: [],
       activeDeckId: null,
       currencies: {
         gold: 1000,
         shards: 0,
         wildcards: 0,
         gems: 0
       },
       stats: {
         wins: 0,
         losses: 0,
         totalDamage: 0,
         spellsCast: 0
       }
     },

     battle: null, // Active battle state

     progression: {
       missions: {
         daily: [],
         weekly: [],
         achievements: []
       },
       trackProgress: {
         level: 0,
         xp: 0,
         claimedRewards: []
       },
       pityCounter: {
         pulls: 0,
         lastRare: 0,
         lastEpic: 0,
         lastLegendary: 0
       }
     },

     ui: {
       activeScreen: 'main_menu',
       modals: [],
       notifications: []
     }
   };

   export const GlobalContext = createContext();

   export const GlobalProvider = ({ children }) => {
     const [state, dispatch] = useReducer(globalReducer, initialState);

     return (
       <GlobalContext.Provider value={{ state, dispatch }}>
         {children}
       </GlobalContext.Provider>
     );
   };
   ```

2. **Create Reducers** (Priority: Critical)
   ```javascript
   // File: /src/reducers/globalReducer.js
   export const globalReducer = (state, action) => {
     switch (action.type) {
       case 'PLAYER_ADD_XP':
         return {
           ...state,
           player: {
             ...state.player,
             xp: state.player.xp + action.payload.amount
           }
         };

       case 'PLAYER_LEVEL_UP':
         return {
           ...state,
           player: {
             ...state.player,
             level: state.player.level + 1,
             xp: 0
           }
         };

       case 'COLLECTION_ADD_SPELL':
         return {
           ...state,
           player: {
             ...state.player,
             collection: [...state.player.collection, action.payload.spell]
           }
         };

       case 'BATTLE_START':
         return {
           ...state,
           battle: action.payload.battleState
         };

       case 'BATTLE_END':
         return {
           ...state,
           battle: null,
           player: {
             ...state.player,
             stats: {
               ...state.player.stats,
               wins: state.player.stats.wins + (action.payload.won ? 1 : 0),
               losses: state.player.stats.losses + (action.payload.won ? 0 : 1)
             }
           }
         };

       default:
         return state;
     }
   };
   ```

3. **Implement Persistence** (Priority: Critical)
   ```javascript
   // File: /src/utils/persistence.js
   export class PersistenceManager {
     constructor(storageKey = 'spell_brawler_save') {
       this.storageKey = storageKey;
       this.version = '1.0';
     }

     save(state) {
       const saveData = {
         version: this.version,
         timestamp: Date.now(),
         data: this.serialize(state)
       };

       try {
         localStorage.setItem(this.storageKey, JSON.stringify(saveData));
         return true;
       } catch (e) {
         console.error('Save failed:', e);
         return false;
       }
     }

     load() {
       try {
         const saved = localStorage.getItem(this.storageKey);
         if (!saved) return null;

         const saveData = JSON.parse(saved);

         // Version migration
         if (saveData.version !== this.version) {
           return this.migrate(saveData);
         }

         return this.deserialize(saveData.data);
       } catch (e) {
         console.error('Load failed:', e);
         return null;
       }
     }

     serialize(state) {
       // Convert state to saveable format
       return {
         player: state.player,
         progression: state.progression
       };
     }

     deserialize(data) {
       // Reconstruct state from save
       return data;
     }

     migrate(oldSaveData) {
       // Handle version upgrades
       const migrations = {
         '0.9': (data) => {
           // Example: Add new currency type
           data.player.currencies.gems = 0;
           return data;
         }
       };

       let data = oldSaveData.data;
       Object.keys(migrations)
         .sort()
         .forEach(version => {
           if (version > oldSaveData.version) {
             data = migrations[version](data);
           }
         });

       return data;
     }
   }
   ```

4. **Create Integration Layer** (Priority: High)
   ```javascript
   // File: /src/systems/integration/GameManager.js
   export class GameManager {
     constructor() {
       this.battleEngine = new BattleEngine();
       this.levelingSystem = new LevelingSystem();
       this.gachaManager = new GachaManager();
       this.missionManager = new MissionManager();
       this.economyManager = new EconomyManager();

       this.setupEventListeners();
     }

     setupEventListeners() {
       eventBus.on('battle:end', this.onBattleEnd.bind(this));
       eventBus.on('spell:cast', this.onSpellCast.bind(this));
       eventBus.on('player:levelup', this.onLevelUp.bind(this));
     }

     async startBattle(mode, config) {
       const battle = await this.battleEngine.create(mode, config);

       eventBus.emit('battle:start', { battle });

       return battle;
     }

     onBattleEnd({ winner, loser, rewards }) {
       // Award XP
       this.levelingSystem.addXP(winner, 100);
       this.levelingSystem.addXP(loser, 50);

       // Award currency
       this.economyManager.earnCurrency('gold', rewards.gold, 'battle_win');

       // Update missions
       this.missionManager.trackProgress('win_battles', { value: 1 });

       // Random spell drop
       if (Math.random() < 0.15) {
         const spell = this.gachaManager.pull(1)[0];
         winner.collection.push(spell);
       }
     }

     onSpellCast({ spell, caster, damage }) {
       // Track for missions
       if (spell.element === 'fire') {
         this.missionManager.trackProgress('deal_fire_damage', { value: damage });
       }

       // Track stats
       caster.stats.spellsCast++;
       caster.stats.totalDamage += damage;
     }
   }
   ```

5. **Optimization & Testing** (Priority: Medium)
   ```javascript
   // File: /src/utils/performance.js
   export class PerformanceOptimizer {
     // Memoization for expensive calculations
     static memoize(fn) {
       const cache = new Map();
       return (...args) => {
         const key = JSON.stringify(args);
         if (cache.has(key)) {
           return cache.get(key);
         }
         const result = fn(...args);
         cache.set(key, result);
         return result;
       };
     }

     // Debounce for frequent updates
     static debounce(fn, delay) {
       let timeoutId;
       return (...args) => {
         clearTimeout(timeoutId);
         timeoutId = setTimeout(() => fn(...args), delay);
       };
     }

     // Virtual scrolling for large lists
     static virtualizeList(items, visibleCount = 20) {
       // Return only visible items for rendering
       return items.slice(0, visibleCount);
     }
   }
   ```

#### Deliverables
- [ ] Global state architecture (Context API)
- [ ] Reducers for all actions
- [ ] LocalStorage persistence
- [ ] Migration system for saves
- [ ] Integration layer (GameManager)
- [ ] Performance optimization utilities
- [ ] State validation & error handling

---

## Coordination Protocols

### 1. Daily Standup (Async)
Each agent posts daily update:
```
Agent [X] - [Date]
✅ Completed: [tasks]
🚧 In Progress: [tasks]
🚫 Blocked: [issues]
📋 Next: [tasks]
```

### 2. Code Review Process
- All PRs require 1 approval from another agent
- Critical systems (battle, state) require 2 approvals
- Review checklist:
  - [ ] Code follows shared interfaces
  - [ ] No performance regressions
  - [ ] Tests included
  - [ ] Documentation updated

### 3. Integration Points
**Week 2 End: First Integration**
- Agent 1 → Agent 5: AI uses battle system
- Agent 2 → Agent 3: UI displays spells
- Agent 4 → All: Progression hooks

**Week 4 End: Full Integration**
- Agent 6: Merge all systems
- All: Cross-system testing

### 4. Conflict Resolution
1. Check shared interfaces (defined in `/docs/interfaces.md`)
2. Refer to PRD for design decisions
3. If unclear, create GitHub issue tagged `design-decision`
4. Vote if needed (majority wins)
5. Agent 6 has final say on state structure

### 5. Testing Strategy
- **Unit Tests**: Each agent writes for their code
- **Integration Tests**: Agent 6 coordinates
- **Balance Testing**: Agent 2 runs simulations
- **UI Testing**: Agent 3 visual regression
- **Load Testing**: Agent 6 performance benchmarks

---

## Risk Mitigation

### Technical Risks
1. **Merge Conflicts**
   - Mitigation: Strict file ownership, frequent rebasing

2. **State Sync Issues**
   - Mitigation: Agent 6 provides state validators

3. **Performance Bottlenecks**
   - Mitigation: Early profiling, code reviews focus on performance

### Process Risks
1. **Agent Availability**
   - Mitigation: Clear handoff docs, no single point of failure

2. **Scope Creep**
   - Mitigation: Strict adherence to PRD, feature freeze after Phase 3

---

## Success Metrics

### Week 2 Checkpoint
- [ ] All agents have functional MVP of their domain
- [ ] Shared interfaces defined and agreed upon
- [ ] 50% of tasks complete

### Week 4 Checkpoint
- [ ] All systems integrated
- [ ] End-to-end battle working
- [ ] 80% of tasks complete

### Week 6 Launch
- [ ] All features implemented
- [ ] Performance targets met (<2s load, 60fps)
- [ ] 100% test coverage on critical paths

---

## Communication Channels

1. **GitHub Issues**: Feature requests, bugs
2. **Pull Requests**: Code reviews, discussions
3. **Shared Doc**: This plan + PRD (living documents)
4. **Slack/Discord** (if available): Quick questions

---

## Next Steps

1. **Agent 1**: Start with spell data model and resource system
2. **Agent 2**: Begin defining core 20 spells
3. **Agent 3**: Set up component library and battle UI scaffold
4. **Agent 4**: Implement player leveling and mission system
5. **Agent 5**: Enhance AI opponent logic
6. **Agent 6**: Set up global state architecture

**First Sync Point: End of Week 1**
- All agents demo progress
- Identify blockers
- Adjust plan if needed

---

**Last Updated:** 2025-10-11
**Status:** Ready for execution
**Agents Assigned:** 6
**Estimated Completion:** 6 weeks
