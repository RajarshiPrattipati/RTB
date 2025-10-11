# System Architecture
## Spell Brawler - Technical Overview

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (Agent 3)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Battle  │  │   Deck   │  │Collection│  │  Progression │   │
│  │  Screen  │  │ Builder  │  │ Browser  │  │   Screens    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (React Context)
┌─────────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT (Agent 6)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Global State (Context API / Redux)                       │  │
│  │  - Player State    - Battle State    - Progression       │  │
│  │  - UI State        - Event Bus       - Persistence       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (Actions/Events)
┌─────────────────────────────────────────────────────────────────┐
│                      GAME SYSTEMS LAYER                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │ BATTLE ENGINE│  │ SPELL LIBRARY│  │ PROGRESSION MANAGER │   │
│  │  (Agent 1)   │  │  (Agent 2)   │  │     (Agent 4)       │   │
│  │              │  │              │  │                     │   │
│  │ - Turn Logic │  │ - 70+ Spells │  │ - Leveling          │   │
│  │ - Damage Calc│  │ - Effects    │  │ - Missions          │   │
│  │ - Resources  │  │ - Balance    │  │ - Gacha             │   │
│  │ - Status FX  │  │ - Synergies  │  │ - Currencies        │   │
│  │ - Combos     │  │ - Mutations  │  │ - Achievements      │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          AI & GAME MODES (Agent 5)                        │  │
│  │  - AI Opponent (Easy/Medium/Hard)                         │  │
│  │  - Ranked Matchmaking                                     │  │
│  │  - Draft Mode    - Horde Mode    - Boss Raids            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (Data Layer)
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐  │
│  │  LocalStorage│  │  Spell DB   │  │  Balance Configs       │  │
│  │  (Player)    │  │  (JSON)     │  │  (Constants)           │  │
│  └─────────────┘  └─────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Battle Flow
```
User Clicks Spell Button
         ↓
UI dispatches CAST_SPELL action
         ↓
State Manager updates global state
         ↓
Battle Engine processes action
         ↓
Spell Library executes effect
         ↓
Damage Calculator computes damage
         ↓
Status Effect Manager applies effects
         ↓
State updated with results
         ↓
UI re-renders with animations
         ↓
Event Bus emits battle:spell_cast
         ↓
Progression Manager tracks mission progress
```

### Progression Flow
```
Battle Ends
         ↓
Battle Engine emits battle:end event
         ↓
Progression Manager listens to event
         ↓
Awards XP, Currency, possibly spell drop
         ↓
Leveling System checks for level up
         ↓
If level up → unlock rewards
         ↓
Mission Manager updates progress
         ↓
State Manager persists to localStorage
         ↓
UI shows rewards modal
```

### Gacha Flow
```
User clicks "Pull 10" button
         ↓
Economy Manager checks gold balance
         ↓
If sufficient → deduct gold
         ↓
Gacha Manager determines rarities (with pity)
         ↓
Spell Library provides random spells of those rarities
         ↓
Collection Manager adds to player collection
         ↓
UI shows pull animation & results
         ↓
Event Bus emits spell:acquired events
         ↓
Mission Manager checks "collect X spells" missions
```

---

## Module Responsibilities

### Agent 1: Battle Core

**Primary Responsibilities:**
- Battle state management
- Turn execution
- Resource management (Mana, Energy, Momentum, Soul Fragments)
- Damage calculation
- Status effect application & tracking
- Combo detection
- Action queue & priority system

**Key Files:**
```
/src/systems/battle/
  ├── BattleManager.js          # Orchestrates battle
  ├── DamageCalculator.js       # Damage formulas
  ├── ResourceManager.js        # Resource tracking
  ├── StatusEffectManager.js    # Buffs/debuffs
  ├── ActionQueue.js            # Action resolution
  └── ComboDetector.js          # Combo logic

/src/models/
  ├── BattleState.js            # Battle state model
  └── PlayerBattleState.js      # Player in battle
```

**Dependencies:**
- None (foundational)

**Consumers:**
- Agent 2 (uses battle API for spell effects)
- Agent 5 (uses battle for AI & game modes)
- Agent 3 (renders battle state)

---

### Agent 2: Spell Library

**Primary Responsibilities:**
- Spell definitions (70+ spells)
- Spell effect implementations
- Balance validation
- Synergy detection
- Spell mutations
- Elemental advantage system

**Key Files:**
```
/src/data/spells/
  ├── coreSpells.js
  ├── fireSpells.js
  ├── waterSpells.js
  ├── [...element]Spells.js
  └── balanceConfig.js

/src/systems/spells/
  ├── SpellLibrary.js           # Spell registry
  ├── SpellEffects.js           # Effect functions
  ├── SpellValidator.js         # Balance checks
  ├── SynergyDetector.js        # Combo detection
  └── SpellMutator.js           # Stat variations
```

**Dependencies:**
- Agent 1 (spell model, damage calculator)

**Consumers:**
- Agent 1 (executes spell effects in battle)
- Agent 3 (displays spells in UI)
- Agent 4 (gacha drops, rewards)

---

### Agent 3: UI/UX

**Primary Responsibilities:**
- React components
- Battle UI (animations, spell buttons)
- Collection browser
- Deck builder
- Progression screens
- Responsive design

**Key Files:**
```
/src/components/
  ├── common/
  │   ├── Button/
  │   ├── Modal/
  │   ├── Tooltip/
  │   └── ResourceBar/
  ├── Battle/
  │   ├── BattleScreen.js
  │   ├── SpellButton.js
  │   ├── BattleAnimations.js
  │   └── [...].js
  ├── DeckBuilder/
  ├── Collection/
  └── Progression/

/src/styles/
  ├── global.css
  ├── animations.css
  └── [...].module.css
```

**Dependencies:**
- Agent 1 (battle state)
- Agent 2 (spell data)
- Agent 4 (progression data)
- Agent 6 (global state)

**Consumers:**
- End users

---

### Agent 4: Progression

**Primary Responsibilities:**
- Player leveling (XP, levels)
- Mission system (daily, weekly, achievements)
- Gacha with pity
- Track progress (battle pass)
- Currency management
- Spell upgrades
- Mastery trees

**Key Files:**
```
/src/systems/progression/
  ├── LevelingSystem.js
  ├── MissionManager.js
  ├── TrackProgressManager.js
  ├── MasteryTrees.js
  └── AchievementTracker.js

/src/systems/collection/
  ├── GachaManager.js
  ├── CollectionManager.js
  ├── DeckBuilder.js
  ├── CraftingSystem.js
  └── EconomyManager.js
```

**Dependencies:**
- Agent 2 (spell library for drops)

**Consumers:**
- Agent 6 (state updates)
- Agent 3 (UI displays progression)

---

### Agent 5: AI & Game Modes

**Primary Responsibilities:**
- AI opponent decision making
- Ranked matchmaking (ELO)
- Draft mode
- Horde mode (endless waves)
- Boss raids (co-op)
- Tournament system

**Key Files:**
```
/src/systems/ai/
  ├── AIOpponent.js
  ├── RandomStrategy.js
  ├── BalancedStrategy.js
  └── OptimalStrategy.js

/src/systems/modes/
  ├── GameModeManager.js
  ├── RankedMode.js
  ├── DraftMode.js
  ├── HordeMode.js
  └── BossRaidMode.js
```

**Dependencies:**
- Agent 1 (battle engine)

**Consumers:**
- Agent 6 (mode selection, state)
- Agent 3 (mode-specific UI)

---

### Agent 6: State & Integration

**Primary Responsibilities:**
- Global state management
- Context providers
- LocalStorage persistence
- State migrations
- Event bus
- System integration
- Performance optimization

**Key Files:**
```
/src/context/
  ├── GlobalContext.js
  ├── BattleContext.js
  ├── ProgressionContext.js
  └── UIContext.js

/src/reducers/
  ├── globalReducer.js
  ├── battleReducer.js
  └── [...].js

/src/utils/
  ├── eventBus.js
  ├── persistence.js
  ├── stateValidator.js
  └── performance.js

/src/systems/integration/
  └── GameManager.js           # Integrates all systems
```

**Dependencies:**
- All agents (integrates everything)

**Consumers:**
- All agents (provides state access)

---

## Technology Stack

### Frontend
- **Framework:** React 18.2+
- **State Management:** Context API (or Redux Toolkit for scaling)
- **Styling:** CSS Modules + Tailwind CSS (optional)
- **Animations:** Framer Motion
- **Build Tool:** Webpack (via react-scripts)
- **Testing:** Jest + React Testing Library

### Data Persistence
- **Local:** LocalStorage
- **Backend (Future):** REST API + WebSockets

### Future Tech
- **Backend:** Node.js + Express/Fastify
- **Database:** PostgreSQL + Redis
- **Real-time:** Socket.io
- **Deployment:** Vercel/Netlify

---

## Performance Optimization Strategies

### 1. State Optimization
- **Normalized State:** Avoid nested objects, use IDs and lookups
- **Memoization:** `useMemo` for expensive calculations
- **Lazy Loading:** Code-split by route

### 2. Render Optimization
- **React.memo:** Prevent unnecessary re-renders
- **Virtual Scrolling:** For large spell collections
- **Debounced Updates:** For frequent state changes

### 3. Animation Optimization
- **CSS Transforms:** Use GPU-accelerated properties
- **RequestAnimationFrame:** For smooth animations
- **Sprite Sheets:** Batch animation assets

### 4. Data Optimization
- **Compressed Assets:** Minified JSON, compressed images
- **Lazy Load Spells:** Load spell data on-demand
- **IndexedDB (Future):** For large datasets

---

## Security Considerations

### Client-Side (Current)
- **Input Validation:** Validate all user inputs
- **State Immutability:** Prevent state tampering
- **LocalStorage Encryption:** Encode save data (basic obfuscation)

### Server-Side (Future)
- **Auth:** JWT tokens, refresh tokens
- **Anti-Cheat:** Server-side battle validation
- **Rate Limiting:** Prevent spam/abuse
- **Data Integrity:** Hash save files

---

## Scalability Plan

### Phase 1: Client-Only (Current)
- LocalStorage for persistence
- Single-player + AI
- ~100 concurrent users (static hosting)

### Phase 2: Hybrid
- Backend API for PvP matchmaking
- Client-authoritative battles (trust)
- ~1,000 concurrent users

### Phase 3: Server-Authoritative
- Server validates all actions
- Real-time WebSocket battles
- Database for player data
- ~10,000+ concurrent users

### Phase 4: Distributed
- Microservices architecture
- Load-balanced battle servers
- CDN for assets
- ~100,000+ users

---

## Testing Strategy

### Unit Tests
- **Coverage Target:** 80%+ for game logic
- **Tools:** Jest
- **Focus:** Battle calculations, spell effects, progression logic

### Integration Tests
- **Scenario Testing:** Full battle flows
- **Tools:** Jest + React Testing Library
- **Focus:** System interactions, state updates

### End-to-End Tests
- **User Flows:** Complete game sessions
- **Tools:** Cypress (future)
- **Focus:** UI interactions, critical paths

### Balance Testing
- **Simulation:** 10,000+ AI vs AI battles
- **Analysis:** Win rates, spell usage stats
- **Goal:** 45-55% win rate for all viable decks

---

## Deployment Architecture

### Current (Development)
```
Developer Machine
       ↓
  npm start
       ↓
  localhost:3000
```

### Production (Phase 1)
```
GitHub Repository
       ↓
  npm run build
       ↓
  Static Build
       ↓
  Netlify/Vercel
       ↓
  CDN → Users
```

### Production (Phase 3 - Full Stack)
```
                    ┌─── CDN (Assets) ────→ Users
                    │
GitHub → CI/CD ─────┼─── API Server ───┬─── PostgreSQL
                    │                  └─── Redis
                    │
                    └─── Battle Servers ─── WebSocket → Users
```

---

## Monitoring & Analytics

### Client-Side
- **Error Tracking:** Sentry (or similar)
- **Analytics:** Custom event tracking
- **Performance:** Web Vitals (LCP, FID, CLS)

### Metrics to Track
- **Engagement:** DAU, session length, battles/session
- **Retention:** Day 1, 7, 30
- **Economy:** Spell pulls, currency earned/spent
- **Balance:** Spell usage rates, win rates by deck

---

## Roadmap

### MVP (Weeks 1-4)
✅ Core battle system
✅ 30 spells
✅ Basic progression
✅ AI opponent

### Feature Complete (Weeks 5-8)
✅ 70+ spells
✅ Deck builder
✅ Gacha system
✅ Multiple game modes

### Polish & Launch (Weeks 9-12)
✅ Animations & SFX
✅ Balance pass
✅ Performance optimization
✅ Beta testing

### Post-Launch
- PvP matchmaking
- Guilds & social features
- Seasonal content
- Mobile app

---

## Appendix

### Key Files Directory
```
/src/
  ├── components/          # Agent 3: React components
  ├── systems/
  │   ├── battle/          # Agent 1: Battle engine
  │   ├── spells/          # Agent 2: Spell system
  │   ├── progression/     # Agent 4: Progression
  │   ├── ai/              # Agent 5: AI logic
  │   └── integration/     # Agent 6: Integration
  ├── context/             # Agent 6: State management
  ├── data/
  │   └── spells/          # Agent 2: Spell definitions
  ├── models/              # Shared data models
  ├── shared/              # Shared constants & types
  └── utils/               # Shared utilities

/docs/
  ├── PRD.md               # Product Requirements
  ├── MULTI_AGENT_PLAN.md  # Agent coordination
  ├── SHARED_INTERFACES.md # API contracts
  └── ARCHITECTURE.md      # This document
```

---

**Last Updated:** 2025-10-11
**Status:** Living Document
**Maintained By:** All Agents
