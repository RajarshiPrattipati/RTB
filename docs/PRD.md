# Product Requirements Document (PRD)
## Spell Brawler: Collectible Real-Time Simultaneous Action Battle System

**Version:** 1.2
**Last Updated:** 2025-10-11
**Status:** In Development
**Project Lead:** Product Team

---

## Executive Summary

### Product Vision
A strategic, collectible spell-based **real-time simultaneous action** combat game where players build decks of 6 spells, battle opponents (AI or PvP), and collect rare abilities through a gacha-style progression system. Actions are queued and resolve simultaneously every 2 seconds, creating fast-paced strategic gameplay. Players complete missions to unlock track progress and acquire new spells, creating a deep metagame focused on deck building, elemental strategy, and skillful combat execution.

### Core Value Proposition
- **Strategic Depth**: Rock-paper-scissors elemental weaknesses, status effects, and combo systems
- **Collection Hook**: Gacha-style spell acquisition with rarity tiers (Common → Mythic)
- **Skill Expression**: Real-time combat with simultaneous actions, predictive gameplay, and mind games
- **Progression Systems**: Multiple advancement paths (spell upgrades, player mastery, achievements)
- **Accessibility**: Easy to learn, hard to master gameplay loop

### Target Audience
- **Primary**: Strategy/CCG players (age 18-35)
- **Secondary**: Gacha enthusiasts, Pokemon/Auto-Chess fans
- **Platform**: Mobile-first web (React), native mobile port planned

---

## Product Goals & Success Metrics

### Key Performance Indicators (KPIs)
1. **Engagement**:
   - DAU/MAU ratio > 40%
   - Average session length > 15 minutes
   - 3+ battles per session

2. **Retention**:
   - Day 1: 60%
   - Day 7: 35%
   - Day 30: 15%

3. **Monetization** (Cosmetic-Only):
   - Conversion rate: 5-8% (cosmetic purchases)
   - ARPU: $5-10/month (NO pay-to-win)
   - Gem purchase rate: 15-20% of active users
   - Battle pass adoption: 25-30%

4. **Social**:
   - PvP match completion rate > 80%
   - Guild participation > 25% of active users

---

## Feature Specifications

### 1. Core Combat System

#### 1.1 Real-Time Simultaneous Action Battle Flow
**Priority:** P0 (Must Have)

**Core Mechanic:**
- **Action Interval**: Actions resolve simultaneously every **2 seconds**
- **Default Action**: "Charge" (adds Mana if no spell selected)
- **Simultaneous Resolution**: Both players' actions execute at the same time
- **No Turns**: Continuous real-time action queuing

**Requirements:**
- 6-spell deck selection before battle
- Resource management (Mana, Energy, Momentum, Soul Fragments)
- 2-second action timer (always active)
- Battle end conditions: HP = 0, surrender, timeout (3 minutes)

**Battle Flow:**
```
1. Select 6 spells from collection
2. Queue matchmaking (AI or PvP)
3. Battle starts with base resources (Mana: 0, Energy: 50)
4. Every 2-second interval:
   a. If no spell selected → Auto-Charge (+20 Mana)
   b. If spell selected → Queue for resolution
   c. Both players' actions resolve simultaneously
   d. Animations play (damage, effects)
   e. Status effects tick
   f. Resources update
   g. Next 2-second interval begins
5. Victory/Defeat screen
6. Rewards distribution
```

**Key Differences from Turn-Based:**
- ⚡ **Fast-Paced**: 2-second intervals keep battles under 3 minutes
- 🔄 **Simultaneous**: Both players act at the same time (no waiting)
- ⚙️ **Resource Management**: Charge for Mana vs. spend for spells
- 🎯 **Prediction**: Anticipate opponent's actions (mind games)
- 📊 **Action Priority**: Spell speed determines who hits first in interval

**Technical Specs:**
- State machine: INIT → ACTIVE (repeating 2s intervals) → END
- Synchronized interval timer (both players)
- Action queue with simultaneous resolution
- Priority system for spell execution order within interval
- Deterministic resolution (for replay/validation)

#### 1.2 Resource System
**Priority:** P0

**Resource Types:**

| Resource | Max | Gain Rate | Purpose |
|----------|-----|-----------|---------|
| **Mana** | 100 | **+20 per Charge action** (every 2s if no spell cast) | Primary spell casting |
| **Energy** | 50 | +10/interval (starts at 50) | Quick/reactive spells |
| **Momentum** | 100 | +5 per damage dealt | Finisher abilities |
| **Soul Fragments** | 10 | +1 per kill | Resurrection/Ultimates |

**Charge Mechanic (Core Resource Generation):**
- **Default Action**: If no spell selected, auto-Charge for +20 Mana
- **Strategic Decision**: Charge for resources vs. cast spells
- **Banking**: Early game = Charge for Mana, late game = spend for combos
- **Opportunity Cost**: Charging means not casting (opponent can pressure)

**Advanced Mechanics:**
- **Mana Overflow**: Excess mana stored (max 150) for Overload spells
- **Fast Charge**: Some spells grant bonus Mana on use
- **Mana Burn**: Spells that prevent opponent from Charging
- **Resource Conversion**:
  - 20 HP → 30 Mana (emergency conversion)
  - 30 Energy → +15 damage boost (1 interval)
- **Resource Denial**: Spells that drain/block opponent resources

**Data Model:**
```javascript
{
  playerId: string,
  resources: {
    mana: { current: number, max: number },
    energy: { current: number, max: number },
    momentum: { current: number, max: number },
    soulFragments: { current: number, max: number }
  },
  resourceHistory: Array<ResourceSnapshot>
}
```

---

### 2. Spell System

#### 2.1 Spell Data Model
**Priority:** P0

**Core Attributes:**
```javascript
{
  id: string,
  name: string,
  description: string,

  // Rarity & Visuals
  rarity: RARITY,
  element: ELEMENT,
  school: SPELL_SCHOOL,
  animationKey: string,
  iconUrl: string,

  // Combat Stats
  baseDamage: number,
  damageType: DAMAGE_TYPE,
  manaCost: number,
  energyCost: number,
  momentumCost: number,

  // Timing (in 2-second intervals)
  castTime: number, // intervals to charge (0 = instant, 1 = 2s delay, 2 = 4s delay)
  cooldown: number, // intervals before reuse (e.g., 3 = 6 seconds)

  // Effects
  primaryEffect: {
    type: SPELL_TYPE,
    value: number,
    targets: number, // 1 = single, -1 = all
    duration: number // intervals (1 = 2s, 2 = 4s, etc.)
  },
  secondaryEffects: Array<{
    type: STATUS_EFFECT,
    chance: number, // 0-1
    value: number,
    duration: number,
    stackable: boolean
  }>,

  // Advanced
  comboTags: Array<string>, // for combo detection
  counters: Array<string>, // spell IDs this counters
  upgrades: {
    level: number,
    maxLevel: number,
    nextUpgradeCost: number
  },

  // Mutations (stat variations)
  mutations: {
    critChance: number, // +0-15%
    costReduction: number, // -0-30%
    powerVariance: number // 0.8-1.2x
  }
}
```

#### 2.2 Spell Categories & Examples
**Priority:** P0 (Core Spells), P1 (Extended Library)

**Core Spell Library (Launch - 50 Spells):**

| Spell Name | Element | Type | Cost | Effect |
|------------|---------|------|------|--------|
| **Fireball** | Fire | Damage | 30 Mana | 45 damage, 30% Burn (3 intervals/6s) |
| **Frost Lance** | Ice | Damage + CC | 35 Mana | 40 damage, 50% Freeze (1 interval/2s) |
| **Chain Lightning** | Lightning | AOE | 50 Mana | 30 damage to all, bounces |
| **Healing Spring** | Water | Heal | 40 Mana | Restore 50 HP, +5 HP/interval (3 intervals/6s) |
| **Stone Skin** | Earth | Buff | 25 Mana | +30 armor (2 intervals/4s) |
| **Shadow Strike** | Dark | Damage + Debuff | 35 Mana | 35 damage, 40% Vulnerability |
| **Divine Shield** | Light | Defensive | 45 Mana | Immune to next 2 attacks |
| **Chaos Bolt** | Chaos | Random | 40 Mana | Random effect (50-100 damage OR 50% stun OR heal opponent) |
| **Time Warp** | Cosmic | Utility | 60 Mana | Rewind to state 2 intervals ago (4s) |
| **Meteor Strike** | Fire | Ultimate | 80 Mana + 50 Momentum | 150 damage, 2-interval delay (4s) |

**Extended Library (Post-Launch - 150+ Spells)**

#### 2.3 Spell Acquisition (Gacha System)
**Priority:** P0

**Drop Methods:**
1. **Mission Completion**: Guaranteed spell on mission clear
2. **Track Progress**: Unlock spells at milestones (10%, 25%, 50%, 75%, 100%)
3. **Battle Rewards**: 15% drop chance per PvP win
4. **Daily Login**: 1 free spell pull/day
5. **Premium Pulls** (Future): Paid currency for guaranteed rarity

**Pity System:**
- Guaranteed Rare after 10 pulls without
- Guaranteed Epic after 25 pulls without
- Guaranteed Legendary after 50 pulls without
- Pity counter persists across sessions

**Drop Rate Table:**
| Rarity | Base Rate | With Pity (max) |
|--------|-----------|-----------------|
| Common | 50% | 45% |
| Uncommon | 30% | 28% |
| Rare | 15% | 20% |
| Epic | 4% | 6% |
| Legendary | 0.9% | 1% |
| Mythic | 0.1% | 0.1% |

---

### 3. Combat Mechanics

#### 3.1 Elemental Advantage System
**Priority:** P0

**Damage Multipliers:**
- **Super Effective** (element advantage): 1.5x damage
- **Neutral**: 1.0x damage
- **Resisted** (element disadvantage): 0.5x damage

**Dual-Element Spells:**
- Average multipliers if mixed advantage/disadvantage
- Example: Fire/Water hybrid vs Earth = (1.5 + 1.0) / 2 = 1.25x

**Adaptive Resistance:**
- After taking 3 hits of same element, gain +25% resistance
- Lasts 2 intervals (4 seconds)
- Encourages element diversity in decks

#### 3.2 Status Effects Engine
**Priority:** P0

**Implementation Requirements:**
- Stack system (max 5 stacks per effect type)
- Duration tracking (ticks down every 2-second interval)
- Cleanse mechanics (remove X stacks)
- Spread mechanics (Corruption spreads to adjacent buffs)
- Interval-based: All durations in 2-second intervals

**Effect Priorities (Resolution Order):**
1. Immunity/Invulnerability (blocks all)
2. Reflect (returns damage)
3. Absorb (converts to healing)
4. Block/Parry (negates damage)
5. Shield (absorbs before HP)
6. Damage reduction
7. Damage calculation
8. DoT application
9. Healing
10. Resource manipulation

**Effect Interactions:**
```javascript
// Example: Freeze + Shatter combo
if (target.hasEffect('freeze') && spell.element === 'physical') {
  damage *= 2; // Shatter bonus
  target.removeEffect('freeze');
}
```

#### 3.3 Combo System
**Priority:** P1

**Combo Detection (Interval-Based):**
- Chain Meter: 0-100%
- **+15% per spell cast** (not Charge action)
- **Decays -10% per interval** if Charge action used
- Bonuses at thresholds:
  - 50%: +10% damage
  - 75%: +20% damage, +5% crit chance
  - 100%: +35% damage, guaranteed crit, unlock Finisher spells

**Aggressive vs. Banking:**
- Aggressive = Cast spells frequently (build combo)
- Banking = Charge for Mana (combo decays but get resources)
- Strategic Balance: When to bank vs. when to pressure

**Spell Synergies:**
- Tag-based bonuses (e.g., 3 "Evocation" spells in deck = +10% spell damage)
- Sequential bonuses (e.g., Fire → Lightning in same interval = "Plasma Chain" bonus effect)

#### 3.4 Simultaneous Resolution & Priority System
**Priority:** P0

**Action Priority (Within 2s Interval):**
All actions resolve simultaneously, but execution order matters for animations/effects:

1. **Instant Spells** (0 cast time): Resolve first
   - Example: Quick Strike, Counter Spell
2. **Standard Spells** (standard speed): Resolve second
   - Example: Fireball, Frost Lance
3. **Charge Spells** (2+ interval cast): Resolve last when ready
   - Example: Meteor Strike (queued 2 intervals ago)
4. **Charge Action**: Executes if no spell selected
   - +20 Mana gained

**Simultaneous Interaction Rules:**
- Both players' damage applies (can double KO)
- Status effects apply after damage
- Priority determines animation order, not outcome
- "Counter" spells check opponent's action type and negate if match
  - Example: "Spell Counter" negates magic spells cast in same interval
  - Costs Energy, refunds half opponent's Mana

**Mind Games:**
- Predict opponent's action (attack, defense, charge?)
- Counter spells beat specific action types
- Fast spells beat slow spells in animation order
- Reading patterns = skill expression

---

### 4. Progression Systems

#### 4.1 Player Progression
**Priority:** P0

**Player Level System:**
- XP from battles (50 win / 25 loss)
- Levels 1-100
- Unlocks:
  - Level 5: 6th spell slot
  - Level 10: Spell upgrades
  - Level 15: Spell fusion
  - Level 25: Ranked mode
  - Level 50: Guild creation

**Mastery Trees:**
```
Element Mastery (per element):
├─ Tier 1 (Level 1): +5% damage
├─ Tier 2 (Level 5): +10% damage, -5% mana cost
├─ Tier 3 (Level 10): +15% damage, -10% cost, +1 effect duration
└─ Tier 4 (Level 20): +25% damage, -15% cost, +50% status effect chance

School Mastery (per spell school):
├─ Evocation: +spell damage
├─ Abjuration: +defensive buffs
├─ Necromancy: +DoT damage
└─ [etc...]
```

#### 4.2 Spell Progression
**Priority:** P1

**Upgrade System:**
- 10 levels per spell
- Cost: Spell Shards (from disenchanting duplicates)
- Per-level bonuses:
  - +5% base damage/healing
  - -2% mana cost (max -20%)
  - +2% status effect chance

**Spell Fusion:**
- Combine 2 spells (both level 5+)
- Creates hybrid spell with both effects
- Example: Fireball + Ice Lance = Thermal Shock (40 fire + 40 ice damage)
- Fusion requires rare "Catalyst" item

**Augment Slots:**
- Unlock at spell level 5
- Socket gems for bonuses:
  - Ruby: +15% fire damage
  - Sapphire: +20% mana efficiency
  - Emerald: +10% healing
  - Diamond: +5% crit chance

#### 4.3 Collection & Economy
**Priority:** P1

**Collection Tracking:**
- Total spells: X/200
- Per-rarity counts
- Set completion bonuses (e.g., all Fire spells = +10% global fire damage)
- Achievement spells (unlock via feats)

**Currencies:**
| Currency | Source | Use |
|----------|--------|-----|
| **Gold** | Battle rewards | Spell upgrades, shop |
| **Spell Shards** | Disenchant spells | Crafting specific spells |
| **Wildcards** | Track milestones | Fill missing spell in set |
| **Gems (Premium)** | Purchases, Achievements, Events | Cosmetics, marketplace trades, battle pass |

**Monetization Philosophy:**
- ✅ **NO Pay-to-Win**: Premium currency CANNOT buy gameplay advantages
- ✅ **Cosmetic-Only Purchases**: Spell skins, character skins, animations, UI themes
- ✅ **Premium Battle Pass**: Cosmetic rewards + accelerated progression (NOT exclusive spells)
- ✅ **Spell Marketplace**: Trade spells with other players using Gems
- ✅ **Fair F2P**: All spells obtainable through gameplay

**Disenchant Values:**
| Rarity | Shards | Wildcard Progress |
|--------|--------|-------------------|
| Common | 10 | 1% |
| Uncommon | 25 | 3% |
| Rare | 75 | 8% |
| Epic | 200 | 20% |
| Legendary | 500 | 50% |
| Mythic | 1500 | 100% |

#### 4.4 Spell Trading Marketplace
**Priority:** P2 (Post-Launch)

**Overview:**
Player-to-player spell trading system using premium currency (Gems) as the medium of exchange.

**Features:**
- **Listing System**: Players can list duplicate/unwanted spells for sale
- **Marketplace Browser**: Search and filter available spell listings
- **Gem Pricing**: Sellers set Gem price (system suggests fair market value)
- **Trade Verification**: Both parties must confirm before trade completes
- **Transaction Fee**: 10% Gem fee (prevents market manipulation)
- **Trade History**: Track all past trades, price trends

**Trading Rules:**
- Minimum player level: 25 (prevents bot abuse)
- Cannot trade spells currently in active deck
- Listing duration: 7 days (auto-cancel if no buyer)
- Price limits: Min 10 Gems, Max 10,000 Gems per spell
- Daily trade limit: 5 trades per player (anti-inflation)

**Marketplace UI:**
- Search by: Name, Element, Rarity, Price Range
- Sort by: Price (low/high), Recently Listed, Ending Soon
- "Watchlist" feature to track specific spells
- Price history graph (last 30 days)

**Economic Balance:**
- Rare spells have dynamic pricing (supply/demand)
- System buyback option (convert to Shards if no buyer)
- Seasonal events affect market (increased supply of themed spells)

---

### 5. Game Modes

#### 5.1 Core Modes
**Priority:** P0 (PvE), P1 (PvP)

**1. Story/Campaign Mode:**
- 50 missions across 5 chapters
- Progressive difficulty
- Boss battles with unique mechanics
- Guaranteed spell drops per chapter

**2. Practice Mode:**
- AI opponent (Easy/Medium/Hard)
- Test decks without stakes
- No rewards

**3. Ranked Mode (Asynchronous PvP):**
- Play against opponent's saved deck (AI-controlled)
- ELO-based matchmaking
- 10 placement matches
- Ranks: Bronze → Silver → Gold → Platinum → Diamond → Master
- Season rewards (exclusive spells)
- **Phase 2:** Real-time synchronous PvP with WebSockets

**4. Casual PvP (Asynchronous):**
- Quick match vs opponent's deck, no rank impact
- Reduced rewards
- Practice matchups without stakes

#### 5.2 Special Modes
**Priority:** P2

**1. Draft Mode:**
- Pick 6 spells from shared pool (30 spells)
- Snake draft (A-B-B-A-A-B-B-A-A-B-B-A)
- Tests adaptability

**2. Horde Mode:**
- Endless waves of AI
- Increasing difficulty
- Leaderboard for highest wave

**3. Boss Raids (Co-op):**
- 2-3 players vs mega-boss
- Shared HP pool
- Exclusive legendary spell drops

**4. Tournament Mode:**
- 8/16/32 player brackets
- Best of 3 matches
- Entry fee, prize pool

---

### 6. Mission & Track System

#### 6.1 Mission Types
**Priority:** P0

**Daily Missions (3/day):**
- Win 3 battles (Reward: 100 Gold, 1 spell pull)
- Deal 500 fire damage (Reward: 50 Gold)
- Use 10 healing spells (Reward: 75 Gold)

**Weekly Missions (5/week):**
- Win 15 ranked matches (Reward: 500 Gold, 3 spell pulls, Rare+ guaranteed)
- Complete 20 dailies (Reward: 1 Epic spell)
- Reach combo meter 100% (Reward: 200 Gold)

**Achievement Missions (Permanent):**
- Collect 50 unique spells (Reward: "Collector" title, Legendary spell)
- Win 100 PvP matches (Reward: "Champion" title, Mythic spell)
- Unlock all Fire spells (Reward: "Pyromancer" title, exclusive Fire ultimate)

#### 6.2 Track Progress System
**Priority:** P0

**Progress Tracks (Battle Pass style):**
- Free Track: 0-100 (everyone)
- Premium Track: 0-100 (future monetization)

**Milestone Rewards:**
| Level | Free Reward | Premium Reward |
|-------|-------------|----------------|
| 10 | Uncommon spell | Rare spell |
| 25 | Rare spell | Epic spell |
| 50 | Epic spell | Legendary spell |
| 75 | 500 Shards | 1000 Shards + Rare skin |
| 100 | Legendary spell | Mythic spell + Exclusive title |

**XP Sources:**
- Battle win: 100 XP
- Battle loss: 50 XP
- Daily mission: 200 XP
- Weekly mission: 500 XP

---

### 7. UI/UX Requirements

#### 7.1 Mobile-First Design Principles
**Priority:** P0

**Design Approach:**
- **Mobile-First Layout**: Design for 375px width (iPhone SE) minimum, scale up to desktop
- **Touch Targets**: Minimum 44x44px tap areas for all interactive elements
- **Portrait Orientation**: Primary UI optimized for vertical screens
- **Single-Hand Friendly**: Critical actions within thumb reach (bottom 2/3 of screen)
- **Responsive Breakpoints**:
  - Mobile: 375px - 768px
  - Tablet: 769px - 1024px
  - Desktop: 1025px+

**Mobile-Specific Optimizations:**
- **Swipe Gestures**: Swipe spell cards to view details, swipe battles in history
- **Bottom Navigation**: Tab bar for main sections (Play, Collection, Shop, Profile)
- **Collapsible Panels**: Minimize screen clutter, expand on tap
- **Auto-rotate Support**: Landscape mode for battle screen (optional)

#### 7.2 Core Screens

**1. Main Menu (Mobile-First):**
- **Bottom Tab Bar**: Play | Collection | Deck | Shop | Profile
- **Status Bar**: Resources (Gold, Gems) always visible at top
- **Action Button**: Large "Start Battle" CTA in center
- **Quick Access**: Daily missions, rewards notifications

**2. Deck Builder (Mobile-First):**
- **Top Section**: 6 spell slots (2 rows x 3 columns on mobile)
- **Bottom Section**: Collection browser (scrollable card grid)
- **Tap-to-Add**: Tap spell in collection to add to deck
- **Long-Press**: Long-press spell slot to remove
- **Deck Stats Bar**: Sticky header with avg cost, element distribution
- **Save/Load**: Quick deck switcher dropdown

**3. Battle Screen (Mobile-First - Real-Time UI):**
- **Top 20%**: Opponent info
  - HP bar, status icons
  - Last action performed (spell icon or "Charged")
  - Opponent's queued action (hidden or show "?")
- **Middle 50%**: Battle animations (portrait-optimized sprites)
  - 2-second interval timer (circular countdown, center-top)
  - Shows time until next resolution (2.0s → 0.0s)
  - Pulses on resolution
- **Bottom 30%**: Player area
  - Resources bar (Mana, Energy, Momentum) - always visible
  - 6 spell buttons (3x2 grid on mobile, 6x1 on tablet/desktop)
    - Grayed if insufficient resources
    - Cooldown overlay (number of intervals remaining)
    - Glowing border if selected/queued
  - **Charge button** (bottom-center, large)
    - Default action: "+20 Mana"
    - Auto-activates if no spell selected when timer hits 0
    - Shows "Auto-Charge in 1.5s..." countdown
  - Combo meter (thin bar above spells, fills left-to-right)
- **Side Panel (Collapsible)**: Battle log, action history (swipe-in from left)

**4. Collection:**
- Filter by: Rarity, Element, Type, Owned/Missing
- Sort by: Name, Rarity, Level, Recent
- Spell detail popup (stats, upgrade tree, augments)
- Bulk disenchant

**5. Gacha/Shop:**
- Single pull (100 Gold)
- 10-pull (900 Gold, guaranteed Uncommon+)
- Pity counter display
- Pull animation (reveal rarity)
- "New" indicator on first-time spells

#### 7.3 UX Principles
**Priority:** P0

**Mobile-First UX:**
- **Progressive Disclosure**: Show essential info first, details on tap
- **Gesture Navigation**: Swipes, long-presses, pull-to-refresh
- **Thumb-Zone Optimization**: Primary actions in lower half of screen
- **Loading States**: Skeleton screens, progressive image loading
- **Offline Support**: Cache battles, queue actions when offline

**Accessibility:**
- Color-blind mode (elemental color coding)
- Font size adjustment (system setting respect)
- High contrast mode for readability
- Screen reader support (ARIA labels)
- Keyboard shortcuts on desktop (spell 1-6 = keys 1-6)

**Onboarding (Mobile-Optimized):**
- Tutorial battle with tap targets highlighted
- Context-sensitive tooltips (tap "?" icons)
- Interactive walkthrough (first 3 battles guided)
- Skip option for experienced players
- Practice mode recommendation

**Feedback (Real-Time):**
- **Visual**:
  - Damage numbers (scaled for mobile), particle effects (optimized)
  - Interval timer pulses on resolution
  - Queued spell icon glows
  - "Charging..." animation on default action
- **Audio**:
  - Spell SFX, impact sounds, UI clicks (respect silent mode)
  - **Interval tick** sound at 1s remaining (audio cue)
  - **Resolution sound** when actions execute
- **Haptic**:
  - Light vibration on action queue (iOS/Android)
  - Medium vibration on interval resolution
  - Strong vibration on combo milestone (50%, 75%, 100%)
- **Toast Notifications**: Non-intrusive status updates (resource warnings)

**Performance (Mobile-Critical):**
- Animation speed toggle (1x, 1.5x, 2x, instant)
  - Does NOT affect 2-second interval timing (gameplay stays consistent)
  - Only speeds up animations between intervals
- Battery saver mode (reduced particles, 30fps)
- Data saver mode (preload assets on WiFi only)
- **Auto-battle** for grinding (AI auto-selects actions)
  - Shows "AUTO" indicator
  - Can cancel anytime
- Battle history (last 10 matches, swipeable cards)
- **Interval precision**: Client-side timer with server validation (future PvP)

---

### 8. Technical Architecture

#### 8.1 Technology Stack

**Frontend (Mobile-First):**
- **React 18.2+** (already implemented)
- **State**: Context API + useReducer (or Redux Toolkit for scaling)
- **Styling**: CSS Modules + Tailwind CSS (mobile-first breakpoints)
- **Animations**: Framer Motion (performance-optimized for mobile)
- **PWA**: Progressive Web App with Service Workers
  - Offline support (cache battles, assets)
  - Add to home screen capability
  - Push notifications (web)
  - Background sync
- **Touch Gestures**: React Swipe, Hammer.js
- **Responsive**: Mobile (375px+), Tablet (768px+), Desktop (1024px+)

**Backend (Phase 2+):**
- Node.js + Express or Fastify
- Database: PostgreSQL (player data) + Redis (caching, sessions)
- Real-time: Socket.io (synchronous PvP Phase 2)
- Auth: JWT tokens + OAuth (Google, Apple Sign-In)
- CDN: Cloudflare for assets

**Mobile Native (Phase 6):**
- React Native or Capacitor
- Platform: iOS 14+, Android 10+
- Features: Push notifications, in-app purchases, deep linking

**Current (Phase 1 - Prototype):**
- Client-side only (mobile web)
- LocalStorage for persistence
- AI opponent logic
- Asynchronous PvP (vs saved decks)

#### 8.2 Data Architecture

**State Structure:**
```javascript
{
  // Player State
  player: {
    id: string,
    username: string,
    level: number,
    xp: number,
    resources: ResourcePool,
    stats: PlayerStats,
    masteryTrees: Array<MasteryTree>,
    collection: Array<Spell>,
    decks: Array<Deck>,
    activeDeckId: string,
    currencies: {
      gold: number,
      shards: number,
      wildcards: number,
      gems: number
    }
  },

  // Battle State
  battle: {
    id: string,
    mode: string,
    turn: number,
    phase: BattlePhase,
    players: [PlayerBattleState, PlayerBattleState],
    actionQueue: Array<Action>,
    battleLog: Array<LogEntry>,
    comboMeter: number,
    environment: EnvironmentEffects
  },

  // Progression State
  progression: {
    missions: {
      daily: Array<Mission>,
      weekly: Array<Mission>,
      achievements: Array<Achievement>
    },
    trackProgress: {
      level: number,
      xp: number,
      claimedRewards: Array<number>
    },
    pityCounter: {
      pulls: number,
      lastRare: number,
      lastEpic: number,
      lastLegendary: number
    }
  },

  // UI State
  ui: {
    activeScreen: string,
    modals: Array<Modal>,
    notifications: Array<Notification>,
    settings: UserSettings
  }
}
```

#### 8.3 Core Systems

**1. Battle Engine:**
```
/src/systems/battle/
├── BattleManager.js          # Orchestrates battle flow
├── ActionResolver.js         # Resolves spell effects
├── StatusEffectManager.js    # Handles buffs/debuffs
├── DamageCalculator.js       # Damage formula
├── ComboDetector.js          # Chain/combo logic
└── AIOpponent.js             # AI decision making
```

**2. Spell System:**
```
/src/systems/spells/
├── SpellFactory.js           # Create spell instances
├── SpellEffects.js           # Effect implementations
├── ElementalSystem.js        # Weakness calculations
├── SpellValidator.js         # Check cast conditions
└── SpellUpgrader.js          # Upgrade logic
```

**3. Progression:**
```
/src/systems/progression/
├── LevelingSystem.js         # XP, levels
├── MissionManager.js         # Mission tracking
├── TrackProgressManager.js   # Battle pass
├── MasteryTrees.js           # Element/school mastery
└── AchievementTracker.js     # Achievement unlock
```

**4. Collection:**
```
/src/systems/collection/
├── GachaManager.js           # Pull logic, pity
├── CollectionManager.js      # Inventory
├── DeckBuilder.js            # Deck validation
└── CraftingSystem.js         # Fusion, augments
```

---

### 9. Development Phases

#### Phase 1: Core Combat (Weeks 1-3)
**Goal:** Functional 1v1 battles with basic spells

**Deliverables:**
- [ ] Spell data model & 20 core spells
- [ ] Resource system (Mana, Energy)
- [ ] Turn-based battle flow
- [ ] Damage calculation with elemental advantage
- [ ] Basic status effects (Burn, Freeze, Stun)
- [ ] AI opponent (simple decision tree)
- [ ] Battle UI (spell selection, HP bars)

#### Phase 2: Progression & Collection (Weeks 4-6)
**Goal:** Spell acquisition and player advancement

**Deliverables:**
- [ ] Gacha system with pity
- [ ] Collection UI (filter, sort, detail view)
- [ ] Deck builder (6-spell selection)
- [ ] Player leveling (XP, levels 1-50)
- [ ] Mission system (dailies)
- [ ] Track progress (free track, 50 levels)
- [ ] Currency system (Gold, Shards)

#### Phase 3: Advanced Combat (Weeks 7-9)
**Goal:** Strategic depth and variety

**Deliverables:**
- [ ] 50 additional spells (total 70)
- [ ] Combo system & chain meter
- [ ] Counter-casting & interrupts
- [ ] Spell upgrades (levels 1-10)
- [ ] Augment system (gems)
- [ ] Momentum & Soul Fragment resources
- [ ] Advanced status effects (20+ types)

#### Phase 4: Game Modes (Weeks 10-12)
**Goal:** Content variety and replayability

**Deliverables:**
- [ ] Story mode (20 missions)
- [ ] Ranked PvP (matchmaking, ELO)
- [ ] Draft mode
- [ ] Horde mode (endless waves)
- [ ] Boss raids (co-op, 3 bosses)
- [ ] Tournament bracket system

#### Phase 5: Polish & Economy (Weeks 13-16)
**Goal:** Balanced, monetization-ready (cosmetic-only)

**Deliverables:**
- [ ] Spell fusion system
- [ ] Mastery trees (10 elements, 8 schools)
- [ ] Achievement system (50+ achievements)
- [ ] Balance pass (playtest 100+ matches)
- [ ] Animation polish (particle effects, screen shake)
- [ ] Audio (SFX, music)
- [ ] Cosmetic shop UI (spell skins, character skins, themes)
- [ ] Spell trading marketplace (Gem-based P2P trading)
- [ ] PWA features (offline support, add to home screen)

#### Phase 6: Social & Endgame (Weeks 17-20+)
**Goal:** Community, retention, and platform expansion

**Deliverables:**
- [ ] Guild system (guilds, guild wars, shared spell library)
- [ ] Friend list & direct challenges
- [ ] Spectator mode & replay sharing
- [ ] Leaderboards (global, regional, guild)
- [ ] Seasons (3-month cycles with exclusive cosmetics)
- [ ] Premium battle pass (cosmetic rewards)
- [ ] Real-time synchronous PvP (WebSocket battles)
- [ ] Native mobile port (React Native/Capacitor)
  - iOS App Store release
  - Google Play Store release
  - Cross-platform save sync
  - Native push notifications & IAP

---

### 10. Parallel Development Plan (Multi-Agent)

#### Agent Task Breakdown

**Agent 1: Combat Core Engineer**
**Scope:** Battle system, spell effects, damage calculation
**Dependencies:** None (foundational)
**Files:**
```
/src/systems/battle/
/src/shared/spellTypes.js
/src/shared/damageFormulas.js
/src/hooks/useBattleSequence.js (refactor)
```
**Tasks:**
1. Implement spell data model
2. Build resource system (4 resource types)
3. Create damage calculator with elemental advantage
4. Implement status effect manager
5. Build action queue & resolver
6. Write unit tests for combat logic

**Agent 2: Spell Library Designer**
**Scope:** Spell creation, balancing, effect implementations
**Dependencies:** Agent 1 (spell model)
**Files:**
```
/src/data/spells/
  ├── fireSpells.js
  ├── waterSpells.js
  ├── [...elementSpells].js
/src/systems/spells/SpellEffects.js
```
**Tasks:**
1. Create 70 spell definitions (all rarities)
2. Implement spell effect functions
3. Balance spell costs/damage
4. Write spell descriptions
5. Create spell synergy tags
6. Document combo interactions

**Agent 3: UI/UX Developer**
**Scope:** React components, screens, animations
**Dependencies:** Agent 1 (battle state), Agent 2 (spell data)
**Files:**
```
/src/components/
  ├── Battle/
  ├── Collection/
  ├── DeckBuilder/
  ├── Gacha/
  ├── Profile/
/src/styles/
```
**Tasks:**
1. Build deck builder UI
2. Create collection browser
3. Implement battle screen (spell buttons, resources, effects)
4. Build gacha pull animation
5. Create progression screens
6. Implement responsive design

**Agent 4: Progression Systems Engineer**
**Scope:** Leveling, missions, achievements, gacha
**Dependencies:** Agent 2 (spell library)
**Files:**
```
/src/systems/progression/
/src/systems/collection/GachaManager.js
/src/hooks/useMissions.js
/src/hooks/useTrackProgress.js
```
**Tasks:**
1. Implement player leveling & XP
2. Build mission system (daily/weekly/achievements)
3. Create track progress (battle pass)
4. Implement gacha with pity system
5. Build disenchant/crafting
6. Create mastery tree logic

**Agent 5: AI & Game Modes Engineer**
**Scope:** AI opponent, game modes, matchmaking
**Dependencies:** Agent 1 (battle core)
**Files:**
```
/src/systems/ai/
/src/systems/modes/
/src/hooks/useAIOpponent.js (enhance)
```
**Tasks:**
1. Enhance AI decision-making (3 difficulty levels)
2. Implement ranked matchmaking (ELO)
3. Build draft mode logic
4. Create horde mode (wave spawning)
5. Implement boss raid mechanics
6. Build tournament bracket system

**Agent 6: State Management & Persistence**
**Scope:** Global state, data persistence, optimization
**Dependencies:** All agents (integrates everything)
**Files:**
```
/src/context/
  ├── PlayerContext.js
  ├── BattleContext.js
  ├── ProgressionContext.js
/src/utils/
  ├── localStorage.js
  ├── stateValidator.js
```
**Tasks:**
1. Design global state architecture
2. Implement Context providers
3. Build localStorage persistence
4. Create state hydration/dehydration
5. Optimize re-renders
6. Write migration system for schema changes

#### Coordination Strategy

**1. Shared Contracts (API Interfaces):**
All agents follow shared TypeScript/JSDoc interfaces:
```javascript
// Shared contract: Spell interface
/**
 * @typedef {Object} Spell
 * @property {string} id
 * @property {string} name
 * @property {RARITY} rarity
 * @property {ELEMENT} element
 * // ... (full spec)
 */
```

**2. Communication Protocol:**
- **Daily Sync:** All agents report progress, blockers
- **Shared Document:** Living design doc (this PRD)
- **Code Reviews:** Cross-agent PR reviews
- **Integration Points:** Clearly defined handoff points

**3. Parallel Work Phases:**

**Week 1-2: Foundation (Parallel)**
- Agent 1: Battle core
- Agent 2: First 20 spells
- Agent 3: UI scaffolding
- Agent 4: Data models
- Agent 5: Basic AI
- Agent 6: State setup

**Week 3-4: Integration (Sequential Dependencies)**
- Agent 1 → Agent 5 (AI uses battle system)
- Agent 2 → Agent 3 (UI displays spells)
- Agent 4 → Agent 6 (State persists progression)

**Week 5-6: Feature Complete (Parallel)**
- All agents: Implement remaining features
- Cross-testing

**Week 7-8: Polish (Collaborative)**
- All agents: Bug fixes, optimization, polish

**4. Testing Strategy:**
- **Agent 1**: Unit tests for combat formulas
- **Agent 2**: Balance spreadsheet, simulation
- **Agent 3**: Visual regression tests
- **Agent 4**: Integration tests for progression flows
- **Agent 5**: AI behavior tests (win rate targets)
- **Agent 6**: State persistence tests

**5. Conflict Resolution:**
- **Merge Conflicts**: Agent 6 (State) has merge authority
- **Design Conflicts**: Refer to PRD, escalate to product lead
- **Performance Issues**: Agent 6 profiles and optimizes

---

### 11. Balancing & Economy

#### 11.1 Spell Balance Targets

**Damage Per Mana (DPM) Ratios:**
- Fast spells (0 cast time): 1.0 DPM
- Standard spells (1 turn): 1.2 DPM
- Charge spells (2+ turns): 1.5 DPM
- Ultimates: 2.0 DPM (with restrictions)

**Healing Per Mana (HPM) Ratios:**
- 0.8 HPM (healing is stronger than damage due to resource limitation)

**Status Effect Value:**
- 1 turn CC = 20 damage equivalent
- 1 turn DoT tick = 10 damage
- Buff/Debuff = 15 damage/turn

#### 11.2 Progression Pacing

**Spell Acquisition Rate:**
- Day 1: 10 spells (tutorial + starter deck)
- Week 1: 30 spells (dailies, missions)
- Month 1: 80 spells (40% of library)
- Month 3: 150 spells (75% of library)
- Month 6: 190+ spells (95%+, missing only Mythics)

**Resource Earn Rates:**
| Activity | Gold/hour | Shards/hour | XP/hour |
|----------|-----------|-------------|---------|
| PvE grinding | 200 | 50 | 300 |
| Ranked PvP | 300 | 75 | 500 |
| Missions | 150 | 100 | 400 |

**Upgrade Costs:**
| Spell Level | Shard Cost | Gold Cost | Time to Earn |
|-------------|------------|-----------|--------------|
| 1 → 2 | 50 | 500 | 30 min |
| 2 → 3 | 75 | 750 | 45 min |
| 5 → 6 | 200 | 2000 | 2 hours |
| 9 → 10 | 500 | 5000 | 5 hours |

---

### 12. Risks & Mitigation

#### 12.1 Technical Risks

**Risk:** State management complexity at scale
**Impact:** High
**Mitigation:** Use Redux Toolkit early, normalize state structure

**Risk:** Battle desync in PvP (future)
**Impact:** Critical
**Mitigation:** Implement deterministic battle engine, rollback netcode

**Risk:** Performance issues with complex animations
**Impact:** Medium
**Mitigation:** Canvas/WebGL for particles, virtualize long lists

#### 12.2 Design Risks

**Risk:** Power creep (new spells too strong)
**Impact:** High
**Mitigation:** Balance spreadsheet, DPM targets, regular balance patches

**Risk:** Gacha feels too grindy
**Impact:** High (retention killer)
**Mitigation:** Generous pity system, guaranteed drops from missions

**Risk:** Meta becomes stale (dominant deck)
**Impact:** Medium
**Mitigation:** Monthly balance patches, seasonal spell rotations

#### 12.3 Product Risks

**Risk:** Lack of endgame content
**Impact:** High (churn)
**Mitigation:** Prioritize ranked seasons, guilds, repeatable modes

**Risk:** Tutorial too long/boring
**Impact:** Medium (drop-off)
**Mitigation:** Skippable tutorial, learn-by-playing approach

---

### 13. Success Criteria

#### 13.1 MVP Launch (Phase 1-2)
- [ ] 30+ unique spells across all rarities
- [ ] Functional deck builder
- [ ] PvE battles vs AI (3 difficulty levels)
- [ ] Gacha with pity system
- [ ] Player levels 1-50
- [ ] 10 daily missions
- [ ] 70+ spell collection target in 2 weeks

#### 13.2 Feature Complete (Phase 1-4)
- [ ] 70+ spells
- [ ] Ranked PvP
- [ ] 3 game modes (Ranked, Draft, Horde)
- [ ] Spell upgrades & fusion
- [ ] 50 achievements
- [ ] Battle pass (free track)

#### 13.3 Polish & Launch (Phase 1-6)
- [ ] 150+ spells
- [ ] Guild system
- [ ] 5 game modes
- [ ] Seasonal content pipeline
- [ ] Monetization (premium pass, shop)
- [ ] Sub-2 second load time
- [ ] 60fps battle animations

---

### 14. Appendix

#### 14.1 Glossary
- **DPM**: Damage Per Mana
- **DoT**: Damage over Time
- **CC**: Crowd Control
- **ELO**: Rating system for matchmaking
- **Pity**: Guaranteed rare drop mechanic

#### 14.2 Reference Games
- **Hearthstone**: Deck building, spell variety
- **Pokémon**: Type advantages, collection
- **Slay the Spire**: Deck synergies, roguelike progression
- **Genshin Impact**: Gacha pity system, elemental reactions

#### 14.3 Design Decisions

**1. PvP Mode Strategy**
- ✅ **Phase 1**: Asynchronous PvP (play vs opponent's saved deck, AI-controlled)
  - Easier to implement, no server infrastructure needed
  - Works offline, no latency issues
  - Allows thoughtful turn planning
- ✅ **Phase 2**: Real-time synchronous PvP with WebSockets
  - More engaging social experience
  - Live tournaments and events
  - Requires backend infrastructure

**2. Monetization Model**
- ✅ **Strictly NO Pay-to-Win**: Premium currency (Gems) CANNOT buy gameplay advantages
- ✅ **Cosmetic-Only Purchases**:
  - Spell visual effects (custom animations)
  - Character skins and avatars
  - UI themes (dark mode, neon theme, fantasy theme)
  - Battle arenas (visual backgrounds)
  - Emotes and victory poses
- ✅ **Premium Battle Pass**: Cosmetic rewards + faster XP gain (NOT exclusive spells)
- ✅ **Gem Uses**: Cosmetics, marketplace trades, battle pass, convenience features
- ✅ **Fair F2P**: Every spell obtainable through gameplay, no exclusive power locked behind paywall

**3. Spell Trading Marketplace**
- ✅ **YES - Player-to-Player Trading**: Post-launch feature (Phase 5+)
- ✅ **Gem Currency**: Trades use premium currency (Gems) as medium of exchange
- ✅ **Anti-Abuse Systems**:
  - Level 25+ requirement
  - Daily trade limits (5 trades/day)
  - Transaction fees (10%)
  - Price limits and market monitoring
- ✅ **Economic Balance**: Dynamic pricing, supply/demand tracking, seasonal events

**4. Mobile Platform Strategy**
- ✅ **Mobile-First Web Design**: Primary development target
  - Design for 375px minimum width (iPhone SE)
  - Touch-optimized UI (44px+ tap targets)
  - Portrait orientation primary, landscape optional
  - Progressive Web App (PWA) capabilities
- ✅ **Native Mobile Port**: Planned for Phase 6+
  - React Native or Capacitor wrapper
  - App Store & Google Play release
  - Native features (push notifications, deep links, IAP)
  - Cross-platform save sync

**5. Social Features Priority**
- ✅ **Phase 1**: Asynchronous PvP, leaderboards
- ✅ **Phase 2**: Friend system, direct challenges
- ✅ **Phase 3**: Guilds/clans, guild wars
- ✅ **Phase 4**: Spectator mode, replay sharing
- ✅ **Phase 5**: Tournaments, real-time PvP

---

**Document Status:** Living Document
**Next Review:** After Phase 1 completion
**Feedback:** Open for all team members
**Design Decisions Last Updated:** 2025-10-11
