# Taskmaster Implementation Plan
## Spell Brawler - Parallel Agent Development Tasks

**Created:** 2025-10-11
**Agents:** 6 specialized Claude agents working in parallel
**Goal:** Implement Hero Death/Revival System + Spell Lock System

---

## 🎯 Project Overview

### New Systems to Implement

1. **Hero Death & Revival System**
   - Hero enters death state when HP = 0
   - Soul currency for revival (10-50 Souls per revival)
   - Soul sources: Kills, missions, shop
   - Locked out of battles until revived

2. **Spell Lock System**
   - Primary Build: 6 locked spell slots
   - Secondary Build: 6 locked spell slots (unlocks at Level 15)
   - Spell Unlocker item (100 Gems) to free 1 slot
   - Anti-swap mechanic (strategic commitment)

3. **Currency Expansion**
   - Add "Souls" currency
   - Gold → Souls conversion (100 Gold = 1 Soul)
   - Gems → Spell Unlocker item

---

## 👥 Agent Task Assignments

### 🔴 Agent 1: Hero Death & Revival System
**Priority:** P0 (Critical Path)
**Estimated Time:** 2-3 hours

#### Tasks:
1. **Implement Hero State Model**
   ```javascript
   // /src/models/Hero.js
   {
     id: string,
     name: string,
     avatar: string,
     status: 'alive' | 'dead',
     deathCount: number,
     revivalCost: number, // 10, 25, or 50 Souls
     primaryBuild: Array<Spell>, // 6 locked spells
     secondaryBuild: Array<Spell>, // 6 locked spells
     lastDeathTime: timestamp
   }
   ```

2. **Create Death Detection Logic**
   - Hook into battle end (HP = 0)
   - Set hero.status = 'dead'
   - Calculate revival cost based on deathCount
   - Emit 'hero:death' event

3. **Build Revival System**
   ```javascript
   // /src/systems/hero/RevivalManager.js
   class RevivalManager {
     canRevive(hero, souls) {
       return souls >= hero.revivalCost;
     }

     reviveHero(hero, player) {
       if (player.souls >= hero.revivalCost) {
         player.souls -= hero.revivalCost;
         hero.status = 'alive';
         hero.deathCount++;
         hero.revivalCost = this.calculateNextCost(hero.deathCount);
         return true;
       }
       return false;
     }

     calculateNextCost(deathCount) {
       if (deathCount === 0) return 10;
       if (deathCount === 1) return 25;
       return 50; // caps at 50
     }
   }
   ```

4. **Soul Currency System**
   - Add 'souls' to player currencies
   - Implement gain logic: +1 per kill, +5-10 per mission
   - Gold → Souls shop (100 Gold = 1 Soul)

5. **Battle Lockout Logic**
   - Check hero.status before battle
   - If 'dead', show revival prompt
   - Block battle start until revived

#### Deliverables:
- [ ] `/src/models/Hero.js`
- [ ] `/src/systems/hero/RevivalManager.js`
- [ ] `/src/systems/hero/SoulManager.js`
- [ ] Soul gain hooks (battle, missions)
- [ ] Revival cost calculator
- [ ] Unit tests for revival logic

#### Handoff:
- **To Agent 3:** Hero state for UI rendering
- **To Agent 6:** Hero model for global state

---

### 🟠 Agent 2: Spell Lock System
**Priority:** P0 (Critical Path)
**Estimated Time:** 2-3 hours

#### Tasks:
1. **Implement Spell Lock Model**
   ```javascript
   // /src/models/SpellSlot.js
   {
     slotId: string,
     buildType: 'primary' | 'secondary',
     spell: Spell | null,
     locked: boolean, // true once spell equipped
     unlockedAt: timestamp | null
   }
   ```

2. **Create Lock/Unlock System**
   ```javascript
   // /src/systems/hero/SpellLockManager.js
   class SpellLockManager {
     lockSpell(hero, buildType, slotIndex, spell) {
       const slot = hero[buildType][slotIndex];
       if (!slot.locked) {
         slot.spell = spell;
         slot.locked = true;
         // Remove spell from available collection
         return { success: true, slot };
       }
       return { success: false, reason: 'Slot already locked' };
     }

     unlockSpell(hero, buildType, slotIndex, gemsAvailable) {
       const UNLOCK_COST = 100; // Gems

       if (gemsAvailable < UNLOCK_COST) {
         return { success: false, reason: 'Insufficient Gems' };
       }

       const slot = hero[buildType][slotIndex];
       if (slot.locked) {
         // Return spell to collection
         player.collection.push(slot.spell);

         // Clear slot
         slot.spell = null;
         slot.locked = false;
         slot.unlockedAt = Date.now();

         return {
           success: true,
           gemsCost: UNLOCK_COST,
           returnedSpell: slot.spell
         };
       }

       return { success: false, reason: 'Slot not locked' };
     }

     canEquipSpell(hero, buildType, slotIndex) {
       const slot = hero[buildType][slotIndex];
       return !slot.locked; // Can only equip if unlocked
     }
   }
   ```

3. **Build Management**
   - Primary Build: Default, available at Level 1
   - Secondary Build: Unlocks at Level 15
   - Build switching (only outside battle)

4. **Spell Unlocker Item**
   - Item definition: { name: 'Spell Unlocker', cost: 100, type: 'consumable' }
   - Purchase flow: Gems → Item → Use on slot → Spell unlocked
   - Transaction log for tracking

5. **Validation Rules**
   - Cannot battle with empty slots (must have 6 spells locked)
   - Cannot remove spell without Unlocker
   - Cannot swap builds mid-battle

#### Deliverables:
- [ ] `/src/models/SpellSlot.js`
- [ ] `/src/systems/hero/SpellLockManager.js`
- [ ] `/src/systems/hero/BuildManager.js`
- [ ] Lock/unlock logic with Gem cost
- [ ] Build validation
- [ ] Unit tests for lock system

#### Handoff:
- **To Agent 3:** Lock states for UI (locked/unlocked icons)
- **To Agent 4:** Spell Unlocker item in shop

---

### 🟡 Agent 3: Hero & Lock UI/UX
**Priority:** P0 (Critical Path)
**Estimated Time:** 3-4 hours

#### Tasks:
1. **Hero Status Banner**
   ```javascript
   // /src/components/Hero/HeroStatusBanner.js
   export const HeroStatusBanner = ({ hero, onRevive }) => {
     if (hero.status === 'dead') {
       return (
         <div className="hero-banner dead">
           <div className="hero-avatar grayscale">
             <img src={hero.avatar} alt={hero.name} />
             <div className="death-overlay">💀</div>
           </div>
           <div className="revival-prompt">
             <h3>Hero Defeated!</h3>
             <button
               className="revive-btn pulse"
               onClick={onRevive}
             >
               Revive for {hero.revivalCost} Souls 👻
             </button>
           </div>
         </div>
       );
     }

     return (
       <div className="hero-banner alive">
         <img src={hero.avatar} alt={hero.name} />
         <span className="status-badge">✅ Ready</span>
       </div>
     );
   };
   ```

2. **Build Manager UI**
   ```javascript
   // /src/components/Hero/BuildManager.js
   export const BuildManager = ({ hero, onLockSpell, onUnlockSpell }) => {
     const [activeBuild, setActiveBuild] = useState('primary');

     return (
       <div className="build-manager">
         <div className="build-tabs">
           <button
             className={activeBuild === 'primary' ? 'active' : ''}
             onClick={() => setActiveBuild('primary')}
           >
             Primary Build
           </button>
           <button
             className={activeBuild === 'secondary' ? 'active' : ''}
             onClick={() => setActiveBuild('secondary')}
             disabled={hero.level < 15}
           >
             Secondary Build {hero.level < 15 && '🔒'}
           </button>
         </div>

         <SpellSlotGrid
           build={hero[activeBuild]}
           buildType={activeBuild}
           onLockSpell={onLockSpell}
           onUnlockSpell={onUnlockSpell}
         />
       </div>
     );
   };
   ```

3. **Spell Slot Component**
   ```javascript
   // /src/components/Hero/SpellSlot.js
   export const SpellSlot = ({ slot, buildType, onUnlock }) => {
     if (slot.locked && slot.spell) {
       return (
         <div className="spell-slot locked" onClick={() => onUnlock(slot)}>
           <img src={slot.spell.iconUrl} alt={slot.spell.name} />
           <div className="lock-icon">🔒</div>
           <div className="unlock-hint">
             Unlock: 100 💎
           </div>
         </div>
       );
     }

     if (!slot.locked) {
       return (
         <div className="spell-slot empty">
           <div className="add-icon">+</div>
           <span>Tap to add spell</span>
         </div>
       );
     }
   };
   ```

4. **Revival Modal**
   ```javascript
   // /src/components/Hero/RevivalModal.js
   export const RevivalModal = ({ hero, souls, onRevive, onCancel }) => {
     const canAfford = souls >= hero.revivalCost;

     return (
       <Modal isOpen={true}>
         <div className="revival-modal">
           <h2>💀 Hero Defeated</h2>
           <p>Your hero has fallen in battle!</p>

           <div className="revival-cost">
             <span>Revival Cost:</span>
             <div className={canAfford ? 'affordable' : 'too-expensive'}>
               👻 {hero.revivalCost} Souls
             </div>
             <div className="your-souls">
               You have: 👻 {souls} Souls
             </div>
           </div>

           {!canAfford && (
             <div className="warning">
               ⚠️ Not enough Souls!
               <button onClick={() => navigate('/shop')}>
                 Buy Souls (100 Gold = 1 Soul)
               </button>
             </div>
           )}

           <div className="actions">
             <button
               className="revive-btn"
               onClick={onRevive}
               disabled={!canAfford}
             >
               Revive Hero
             </button>
             <button className="cancel-btn" onClick={onCancel}>
               Cancel (hero stays dead)
             </button>
           </div>
         </div>
       </Modal>
     );
   };
   ```

5. **Soul Counter HUD**
   ```javascript
   // /src/components/common/SoulCounter.js
   export const SoulCounter = ({ souls }) => (
     <div className="soul-counter hud-item">
       <span className="icon">👻</span>
       <span className="count">{souls}</span>
     </div>
   );
   ```

6. **Spell Unlock Confirmation**
   ```javascript
   // /src/components/Hero/UnlockConfirmation.js
   export const UnlockConfirmation = ({ slot, gems, onConfirm, onCancel }) => (
     <Modal>
       <h3>Unlock Spell Slot?</h3>
       <div className="spell-preview">
         <img src={slot.spell.iconUrl} />
         <p>{slot.spell.name} will return to your collection</p>
       </div>

       <div className="cost">
         Cost: 💎 100 Gems
         <span>You have: 💎 {gems}</span>
       </div>

       <div className="warning">
         ⚠️ This cannot be undone. Choose wisely!
       </div>

       <button onClick={onConfirm}>Unlock for 100 Gems</button>
       <button onClick={onCancel}>Cancel</button>
     </Modal>
   );
   ```

#### Deliverables:
- [ ] HeroStatusBanner component
- [ ] BuildManager component (Primary/Secondary tabs)
- [ ] SpellSlot component (locked/unlocked states)
- [ ] RevivalModal component
- [ ] UnlockConfirmation modal
- [ ] SoulCounter HUD component
- [ ] Responsive mobile UI (375px+)
- [ ] Animations (pulse on death, glow on unlock)

#### Handoff:
- **From Agent 1:** Hero state (alive/dead, revival cost)
- **From Agent 2:** Lock states, build data
- **To Agent 6:** UI state management

---

### 🟢 Agent 4: Shop & Economy Updates
**Priority:** P1 (High)
**Estimated Time:** 2 hours

#### Tasks:
1. **Add Soul Shop**
   ```javascript
   // /src/components/Shop/SoulShop.js
   export const SoulShop = ({ gold, souls, onPurchase }) => {
     const soulPackages = [
       { souls: 1, gold: 100 },
       { souls: 10, gold: 900 }, // 10% discount
       { souls: 50, gold: 4000 }, // 20% discount
       { souls: 100, gold: 7000 } // 30% discount
     ];

     return (
       <div className="soul-shop">
         <h3>👻 Soul Shop</h3>
         <p>Convert Gold to Souls for hero revival</p>

         {soulPackages.map(pkg => (
           <div className="soul-package" key={pkg.souls}>
             <div className="package-info">
               <span className="souls">👻 {pkg.souls} Souls</span>
               <span className="cost">💰 {pkg.gold} Gold</span>
             </div>
             <button
               onClick={() => onPurchase(pkg)}
               disabled={gold < pkg.gold}
             >
               Buy
             </button>
           </div>
         ))}
       </div>
     );
   };
   ```

2. **Add Spell Unlocker Item**
   ```javascript
   // /src/components/Shop/ItemShop.js
   const SPELL_UNLOCKER = {
     id: 'spell_unlocker',
     name: 'Spell Unlocker',
     description: 'Unlocks 1 spell slot in your hero build',
     cost: 100,
     currency: 'gems',
     icon: '🔓',
     type: 'consumable'
   };

   export const ItemShop = ({ gems, inventory, onPurchase }) => (
     <div className="item-shop">
       <h3>💎 Premium Items</h3>

       <div className="item-card">
         <div className="item-icon">🔓</div>
         <div className="item-info">
           <h4>Spell Unlocker</h4>
           <p>Unlock 1 spell slot to change your build</p>
           <span className="cost">💎 100 Gems</span>
         </div>
         <button
           onClick={() => onPurchase(SPELL_UNLOCKER)}
           disabled={gems < 100}
         >
           Purchase
         </button>
       </div>

       <div className="inventory">
         <h4>Your Items</h4>
         <p>Spell Unlockers: {inventory.spell_unlocker || 0}</p>
       </div>
     </div>
   );
   ```

3. **Update Economy Manager**
   ```javascript
   // /src/systems/economy/EconomyManager.js
   class EconomyManager {
     // Add Soul conversion
     convertGoldToSouls(player, goldAmount) {
       const CONVERSION_RATE = 100; // 100 Gold = 1 Soul
       const soulsToGain = Math.floor(goldAmount / CONVERSION_RATE);

       if (player.gold >= goldAmount) {
         player.gold -= goldAmount;
         player.souls += soulsToGain;
         return { success: true, soulsGained: soulsToGain };
       }

       return { success: false };
     }

     // Purchase Spell Unlocker
     purchaseSpellUnlocker(player) {
       const COST = 100; // Gems

       if (player.gems >= COST) {
         player.gems -= COST;
         player.inventory.spell_unlocker = (player.inventory.spell_unlocker || 0) + 1;
         return { success: true };
       }

       return { success: false, reason: 'Insufficient Gems' };
     }

     // Use Spell Unlocker
     useSpellUnlocker(player, hero, buildType, slotIndex) {
       if (player.inventory.spell_unlocker > 0) {
         const result = spellLockManager.unlockSpell(hero, buildType, slotIndex, Infinity);

         if (result.success) {
           player.inventory.spell_unlocker--;
           return { success: true, returnedSpell: result.returnedSpell };
         }
       }

       return { success: false, reason: 'No Spell Unlockers available' };
     }
   }
   ```

4. **Daily Soul Rewards**
   - Add +3 Souls to daily login
   - Add +5-10 Souls to mission rewards
   - Soul bonus events (2x Souls weekends)

#### Deliverables:
- [ ] SoulShop component
- [ ] ItemShop component (Spell Unlocker)
- [ ] Gold → Souls conversion
- [ ] Spell Unlocker purchase flow
- [ ] Inventory system for items
- [ ] Daily Soul rewards

#### Handoff:
- **To Agent 6:** Economy updates for global state

---

### 🔵 Agent 5: Mission & Reward Updates
**Priority:** P1 (High)
**Estimated Time:** 1-2 hours

#### Tasks:
1. **Update Mission Rewards**
   ```javascript
   // /src/systems/progression/MissionManager.js
   const DAILY_MISSIONS = [
     {
       id: 'win_3_battles',
       desc: 'Win 3 battles',
       count: 3,
       reward: {
         gold: 100,
         souls: 5, // NEW
         spellPulls: 1
       }
     },
     {
       id: 'deal_fire_damage',
       desc: 'Deal 500 fire damage',
       count: 500,
       reward: {
         gold: 50,
         souls: 3 // NEW
       }
     },
     // ... more missions with Soul rewards
   ];

   const WEEKLY_MISSIONS = [
     {
       id: 'win_15_ranked',
       desc: 'Win 15 ranked matches',
       count: 15,
       reward: {
         gold: 500,
         souls: 25, // NEW
         spellPulls: 3
       }
     }
   ];
   ```

2. **Soul Kill Tracking**
   ```javascript
   // /src/systems/battle/BattleRewards.js
   export const onBattleEnd = (winner, loser) => {
     if (winner.isPlayer) {
       // Award Soul Fragment for kill
       winner.souls += 1;

       eventBus.emit('soul:gained', {
         amount: 1,
         source: 'battle_kill',
         from: loser.name
       });
     }
   };
   ```

3. **Daily Login Soul Bonus**
   ```javascript
   // /src/systems/progression/DailyRewards.js
   export const dailyLoginReward = {
     day1: { gold: 50, souls: 3 },
     day2: { gold: 75, souls: 5 },
     day3: { gold: 100, souls: 7 },
     day7: { gold: 500, souls: 25, spellPull: 1 }
   };
   ```

4. **Achievement Soul Rewards**
   ```javascript
   const ACHIEVEMENTS = [
     {
       id: 'revive_first_time',
       name: 'Back from the Dead',
       desc: 'Revive your hero for the first time',
       reward: { souls: 50, title: 'Survivor' }
     },
     {
       id: 'kill_100_enemies',
       name: 'Soul Collector',
       desc: 'Defeat 100 enemies',
       reward: { souls: 100, title: 'Reaper' }
     }
   ];
   ```

#### Deliverables:
- [ ] Updated mission rewards (add Souls)
- [ ] Soul kill tracking
- [ ] Daily login Soul bonus
- [ ] Soul-based achievements
- [ ] Soul gain notifications

---

### 🟣 Agent 6: State Management & Integration
**Priority:** P0 (Critical - Orchestrator)
**Estimated Time:** 3-4 hours

#### Tasks:
1. **Update Global State Schema**
   ```javascript
   // /src/context/GlobalState.js
   const initialState = {
     player: {
       id: string,
       username: string,
       level: number,
       xp: number,

       // NEW: Hero system
       hero: {
         id: string,
         name: string,
         avatar: string,
         status: 'alive' | 'dead',
         deathCount: number,
         revivalCost: number,
         primaryBuild: Array<SpellSlot>, // 6 slots
         secondaryBuild: Array<SpellSlot>, // 6 slots
         activeBuild: 'primary' | 'secondary'
       },

       currencies: {
         gold: number,
         souls: number, // NEW
         shards: number,
         wildcards: number,
         gems: number
       },

       // NEW: Inventory
       inventory: {
         spell_unlocker: number // Count of items
       },

       collection: Array<Spell>,
       stats: PlayerStats
     },

     // ... rest of state
   };
   ```

2. **Create Hero Reducers**
   ```javascript
   // /src/reducers/heroReducer.js
   export const heroReducer = (state, action) => {
     switch (action.type) {
       case 'HERO_DEATH':
         return {
           ...state,
           hero: {
             ...state.hero,
             status: 'dead',
             revivalCost: calculateRevivalCost(state.hero.deathCount)
           }
         };

       case 'HERO_REVIVE':
         return {
           ...state,
           currencies: {
             ...state.currencies,
             souls: state.currencies.souls - state.hero.revivalCost
           },
           hero: {
             ...state.hero,
             status: 'alive',
             deathCount: state.hero.deathCount + 1
           }
         };

       case 'SPELL_LOCK':
         const { buildType, slotIndex, spell } = action.payload;
         return {
           ...state,
           hero: {
             ...state.hero,
             [buildType]: state.hero[buildType].map((slot, i) =>
               i === slotIndex
                 ? { ...slot, spell, locked: true }
                 : slot
             )
           },
           collection: state.collection.filter(s => s.id !== spell.id)
         };

       case 'SPELL_UNLOCK':
         return {
           ...state,
           currencies: {
             ...state.currencies,
             gems: state.currencies.gems - 100 // OR use inventory item
           },
           hero: {
             ...state.hero,
             [action.buildType]: state.hero[action.buildType].map((slot, i) =>
               i === action.slotIndex
                 ? { ...slot, spell: null, locked: false }
                 : slot
             )
           },
           collection: [...state.collection, action.returnedSpell]
         };

       case 'SOUL_GAIN':
         return {
           ...state,
           currencies: {
             ...state.currencies,
             souls: state.currencies.souls + action.amount
           }
         };

       default:
         return state;
     }
   };
   ```

3. **Integration Hooks**
   ```javascript
   // /src/hooks/useHero.js
   export const useHero = () => {
     const { state, dispatch } = useContext(GlobalContext);

     const reviveHero = (souls) => {
       if (souls >= state.hero.revivalCost) {
         dispatch({ type: 'HERO_REVIVE' });
         return { success: true };
       }
       return { success: false, reason: 'Insufficient Souls' };
     };

     const lockSpell = (buildType, slotIndex, spell) => {
       dispatch({
         type: 'SPELL_LOCK',
         payload: { buildType, slotIndex, spell }
       });
     };

     const unlockSpell = (buildType, slotIndex) => {
       const slot = state.hero[buildType][slotIndex];

       if (state.inventory.spell_unlocker > 0) {
         dispatch({
           type: 'SPELL_UNLOCK',
           buildType,
           slotIndex,
           returnedSpell: slot.spell
         });
         dispatch({ type: 'INVENTORY_USE', item: 'spell_unlocker' });
         return { success: true };
       }

       return { success: false, reason: 'No Spell Unlockers' };
     };

     return {
       hero: state.hero,
       souls: state.currencies.souls,
       reviveHero,
       lockSpell,
       unlockSpell
     };
   };
   ```

4. **Persistence Updates**
   ```javascript
   // /src/utils/persistence.js
   class PersistenceManager {
     save(state) {
       const saveData = {
         version: '1.3', // NEW VERSION
         timestamp: Date.now(),
         data: {
           player: {
             ...state.player,
             hero: state.player.hero, // NEW
             inventory: state.player.inventory // NEW
           },
           progression: state.progression
         }
       };

       localStorage.setItem(this.storageKey, JSON.stringify(saveData));
     }

     migrate(oldSaveData) {
       // Migrate v1.2 → v1.3 (add hero system)
       if (oldSaveData.version === '1.2') {
         oldSaveData.data.player.hero = {
           id: 'default_hero',
           name: oldSaveData.data.player.username,
           avatar: '/assets/default_hero.png',
           status: 'alive',
           deathCount: 0,
           revivalCost: 10,
           primaryBuild: Array(6).fill({ spell: null, locked: false }),
           secondaryBuild: Array(6).fill({ spell: null, locked: false }),
           activeBuild: 'primary'
         };

         oldSaveData.data.player.currencies.souls = 0;
         oldSaveData.data.player.inventory = { spell_unlocker: 0 };
       }

       return oldSaveData.data;
     }
   }
   ```

5. **Event Bus Coordination**
   ```javascript
   // /src/systems/integration/GameManager.js
   setupEventListeners() {
     eventBus.on('battle:end', ({ winner, loser }) => {
       if (loser.hp === 0) {
         // Check if loser is player's hero
         if (loser.id === this.state.player.hero.id) {
           eventBus.emit('hero:death', { hero: this.state.player.hero });
         }
       }

       if (winner.id === this.state.player.hero.id) {
         // Award Soul for kill
         eventBus.emit('soul:gain', { amount: 1, source: 'kill' });
       }
     });

     eventBus.on('hero:death', ({ hero }) => {
       this.dispatch({ type: 'HERO_DEATH' });
       this.showRevivalPrompt(hero);
     });

     eventBus.on('soul:gain', ({ amount, source }) => {
       this.dispatch({ type: 'SOUL_GAIN', amount });
       this.showSoulNotification(amount, source);
     });
   }
   ```

#### Deliverables:
- [ ] Updated global state schema
- [ ] Hero reducers
- [ ] Spell lock/unlock reducers
- [ ] useHero hook
- [ ] Persistence migration (v1.2 → v1.3)
- [ ] Event bus coordination
- [ ] Integration tests

---

## 📊 Agent Coordination Matrix

| Agent | Depends On | Provides To | Communication |
|-------|------------|-------------|---------------|
| **Agent 1** | None | 2, 3, 6 | Hero model, Revival logic |
| **Agent 2** | 1 | 3, 6 | Lock system, Build data |
| **Agent 3** | 1, 2 | 6 | UI components |
| **Agent 4** | None | 6 | Shop updates, Soul economy |
| **Agent 5** | None | 6 | Mission rewards |
| **Agent 6** | 1, 2, 3, 4, 5 | All | Global state, Integration |

---

## 🚀 Parallel Execution Plan

### Phase 1 (Parallel - Hour 0-2)
- **Agent 1**: Build Hero death/revival system ⚙️
- **Agent 2**: Build Spell lock system ⚙️
- **Agent 4**: Update shop (Soul shop, Spell Unlocker) 🛒
- **Agent 5**: Update missions (add Soul rewards) 📋
- **Agent 6**: Update global state schema 🗄️

### Phase 2 (Parallel - Hour 2-4)
- **Agent 1**: Soul currency system, battle hooks 💰
- **Agent 2**: Build validation, unlock flow 🔓
- **Agent 3**: Build all UI components 🎨
- **Agent 6**: Reducers, hooks, persistence 🔗

### Phase 3 (Integration - Hour 4-5)
- **Agent 3** + **Agent 6**: Connect UI to state 🔌
- **Agent 1** + **Agent 6**: Integrate death/revival 💀
- **Agent 2** + **Agent 6**: Integrate lock system 🔒
- **All**: Cross-testing ✅

### Phase 4 (Polish - Hour 5-6)
- **All agents**: Bug fixes, edge cases 🐛
- **Agent 3**: Animation polish ✨
- **Agent 6**: Performance optimization ⚡

---

## ✅ Success Criteria

### Must Have (MVP)
- [ ] Hero can die and enter death state
- [ ] Revival costs Souls (10/25/50 scaling)
- [ ] Souls gained from kills (+1 per kill)
- [ ] Souls purchasable with Gold (100:1 ratio)
- [ ] Primary build with 6 locked spell slots
- [ ] Spells lock on equip, cannot remove
- [ ] Spell Unlocker item (100 Gems) unlocks 1 slot
- [ ] UI shows locked/unlocked states
- [ ] Revival modal on hero death
- [ ] Battle lockout when hero dead

### Nice to Have
- [ ] Secondary build (unlocks Level 15)
- [ ] Build switching UI
- [ ] Soul gain animations
- [ ] Death count tracking
- [ ] Revival history
- [ ] Spell Unlocker bulk purchase

### Testing Checklist
- [ ] Hero dies → enters death state
- [ ] Cannot battle while dead
- [ ] Revival with sufficient Souls works
- [ ] Revival cost scales (10 → 25 → 50)
- [ ] Spell locks on equip
- [ ] Cannot remove locked spell without item
- [ ] Spell Unlocker unlocks slot
- [ ] Spell returns to collection on unlock
- [ ] Gold → Souls conversion works
- [ ] Souls awarded for kills
- [ ] State persists across sessions

---

## 🎯 Launch Command

Run all agents in parallel:

```javascript
// Agent 1: Hero Death & Revival
Task("Hero Death & Revival System", "agent-1-prompt", "general-purpose")

// Agent 2: Spell Lock System
Task("Spell Lock System", "agent-2-prompt", "general-purpose")

// Agent 3: Hero & Lock UI
Task("Hero & Lock UI/UX", "agent-3-prompt", "general-purpose")

// Agent 4: Shop & Economy
Task("Shop & Economy Updates", "agent-4-prompt", "general-purpose")

// Agent 5: Mission Rewards
Task("Mission & Reward Updates", "agent-5-prompt", "general-purpose")

// Agent 6: State & Integration
Task("State Management & Integration", "agent-6-prompt", "general-purpose")
```

---

**Ready to launch! All agents have clear tasks and can work in parallel.** 🚀
