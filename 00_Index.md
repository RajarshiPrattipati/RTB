# RTB Project Master Index

**Project Name:** RTB (React Turn-Based Battle Game with Godot Integration)
**Version:** 1.0
**Last Updated:** 2025-10-15
**Type:** React Web Game + Godot 3D Fighter Integration

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Documentation Map](#documentation-map)
4. [Source Code Structure](#source-code-structure)
5. [Development Workflow](#development-workflow)
6. [Key Systems](#key-systems)
7. [Integration Guides](#integration-guides)
8. [Reference](#reference)

---

## Quick Start

### For New Developers
1. **Start Here:** [`QUICK_START.md`](./QUICK_START.md) - General project quick start
2. **Then Read:** [`docs/README.md`](./docs/README.md) - Documentation overview
3. **For Godot:** [`GODOT_QUICK_START.md`](./GODOT_QUICK_START.md) - Godot setup guide

### For Implementation Tasks
1. **Check Status:** [`IMPLEMENTATION_READY.md`](./IMPLEMENTATION_READY.md) - Implementation checklist
2. **Review Plans:** [`docs/TASKMASTER_PLAN.md`](./docs/TASKMASTER_PLAN.md) - Task breakdown
3. **Follow Integration:** [`INTEGRATION_SUMMARY.md`](./INTEGRATION_SUMMARY.md) - Integration status

### Quick Commands
```bash
# Start React development server
npm start

# Build for production
npm run build

# Build Godot game (requires Godot 4.5)
./build_godot_game.sh
```

---

## Project Overview

### What is RTB?

RTB is a **hybrid web-based battle game** that combines:
- **React Frontend:** Turn-based spell battle system with deck building, gacha mechanics, and progression
- **Godot 3D Engine:** Real-time 3D fighting game integration for enhanced combat visuals
- **JSON-Driven Content:** Easy-to-modify spell and mechanics data

### Architecture

```
┌─────────────────────────────────────────┐
│         React Web Application           │
│  ┌─────────────────────────────────┐   │
│  │   UI Components & Battle System │   │
│  └─────────────────────────────────┘   │
│              ↕                          │
│  ┌─────────────────────────────────┐   │
│  │   JSON Data & Mechanics Engine  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↕ (Integration Layer)
┌─────────────────────────────────────────┐
│         Godot 4.5 3D Fighter            │
│  ┌─────────────────────────────────┐   │
│  │  Real-time Combat & Animations  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Key Features
- **Turn-Based Combat:** Strategic spell battles with simultaneous action resolution
- **Spell Collection:** 70+ spells with rarity tiers (Common → Mythic)
- **Deck Building:** 6-spell loadouts with elemental strategies
- **Progression System:** Hero leveling, spell upgrades, mastery trees
- **Gacha Mechanics:** Spell acquisition with pity system
- **Godot Integration:** 3D character animation and visual effects
- **JSON Content:** All spells and mechanics configurable via JSON

---

## Documentation Map

### 📘 Core Documentation

#### Getting Started
| Document | Description | Priority |
|----------|-------------|----------|
| [`README.md`](./README.md) | Project readme (placeholder) | ⭐ |
| [`QUICK_START.md`](./QUICK_START.md) | General quick start guide | ⭐⭐⭐⭐⭐ |
| [`docs/README.md`](./docs/README.md) | Documentation index | ⭐⭐⭐⭐ |

#### Product & Design
| Document | Description | Priority |
|----------|-------------|----------|
| [`docs/PRD.md`](./docs/PRD.md) | Product Requirements Document - Full game specification | ⭐⭐⭐⭐⭐ |
| [`docs/PRD_CHANGELOG.md`](./docs/PRD_CHANGELOG.md) | PRD version history | ⭐⭐ |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System architecture & technical design | ⭐⭐⭐⭐⭐ |
| [`docs/SHARED_INTERFACES.md`](./docs/SHARED_INTERFACES.md) | API contracts between systems | ⭐⭐⭐⭐ |

#### Planning & Tasks
| Document | Description | Priority |
|----------|-------------|----------|
| [`docs/TASKMASTER_PLAN.md`](./docs/TASKMASTER_PLAN.md) | Multi-agent development plan | ⭐⭐⭐⭐⭐ |
| [`docs/MULTI_AGENT_PLAN.md`](./docs/MULTI_AGENT_PLAN.md) | Agent coordination strategy | ⭐⭐⭐⭐ |
| [`IMPLEMENTATION_READY.md`](./IMPLEMENTATION_READY.md) | Implementation checklist & status | ⭐⭐⭐⭐⭐ |

### 🎮 Game Systems Documentation

#### Combat & Mechanics
| Document | Description | Priority |
|----------|-------------|----------|
| [`MECHANICS_SYSTEM.md`](./MECHANICS_SYSTEM.md) | Complete game mechanics system documentation | ⭐⭐⭐⭐⭐ |
| [`docs/COMBAT_SYSTEM_EXPLAINED.md`](./docs/COMBAT_SYSTEM_EXPLAINED.md) | Combat system deep dive | ⭐⭐⭐⭐ |
| [`JSON_SYSTEM_COMPLETE.md`](./JSON_SYSTEM_COMPLETE.md) | JSON-based content system guide | ⭐⭐⭐⭐⭐ |

#### Implementation Status
| Document | Description | Priority |
|----------|-------------|----------|
| [`INTEGRATION_SUMMARY.md`](./INTEGRATION_SUMMARY.md) | Integration status summary | ⭐⭐⭐⭐ |
| [`docs/INTEGRATION_COMPLETE.md`](./docs/INTEGRATION_COMPLETE.md) | Integration completion report | ⭐⭐⭐ |
| [`docs/IMPLEMENTATION_SUMMARY.md`](./docs/IMPLEMENTATION_SUMMARY.md) | Implementation summary | ⭐⭐⭐ |

### 🎯 Godot Integration

#### Main Godot Guides
| Document | Description | Priority |
|----------|-------------|----------|
| [`GODOT_QUICK_START.md`](./GODOT_QUICK_START.md) | Godot setup & quick start | ⭐⭐⭐⭐⭐ |
| [`GODOT_INTEGRATION.md`](./GODOT_INTEGRATION.md) | Godot integration architecture | ⭐⭐⭐⭐⭐ |
| [`godot_fighter/README.md`](./godot_fighter/README.md) | Godot project documentation | ⭐⭐⭐⭐ |

#### Godot Patterns Library
📁 **Location:** [`Claude.md/`](./Claude.md/)

| Document | Description | Priority |
|----------|-------------|----------|
| [`Claude.md/00_INDEX.md`](./Claude.md/00_INDEX.md) | Godot patterns master index | ⭐⭐⭐⭐⭐ |
| [`Claude.md/01_character_controllers.md`](./Claude.md/01_character_controllers.md) | CharacterBody3D movement patterns | ⭐⭐⭐⭐⭐ |
| [`Claude.md/02_combat_physics.md`](./Claude.md/02_combat_physics.md) | Ragdoll physics & combat mechanics | ⭐⭐⭐⭐ |
| [`Claude.md/03_ai_navigation.md`](./Claude.md/03_ai_navigation.md) | AI navigation & pathfinding | ⭐⭐⭐ |
| [`Claude.md/04_visual_effects.md`](./Claude.md/04_visual_effects.md) | Particles, lighting, VFX | ⭐⭐⭐⭐ |
| [`Claude.md/05_performance_optimization.md`](./Claude.md/05_performance_optimization.md) | Performance tuning & optimization | ⭐⭐⭐⭐ |
| [`Claude.md/06_godot45_quick_reference.md`](./Claude.md/06_godot45_quick_reference.md) | Godot 4.5 quick reference | ⭐⭐⭐ |
| [`Claude.md/README.md`](./Claude.md/README.md) | Claude.md directory overview | ⭐⭐⭐ |

---

## Source Code Structure

### Directory Tree

```
RTB/
├── public/                      # Static assets
├── src/                         # React source code
│   ├── components/              # React components
│   │   ├── App/                 # Main app component
│   │   ├── Battle/              # Battle screen
│   │   ├── BattleMenu/          # Battle menu UI
│   │   ├── BattleAnnouncer/     # Battle messages
│   │   ├── StartMenu/           # Start menu
│   │   ├── EndMenu/             # End game menu
│   │   ├── PlayerSummary/       # Player stats display
│   │   ├── Shop/                # Shop UI (Soul & Item)
│   │   ├── Hero/                # Hero components
│   │   ├── Bar/                 # Progress bars
│   │   ├── GodotGame/           # Godot integration component
│   │   └── common/              # Shared components
│   │
│   ├── systems/                 # Game systems
│   │   └── battle/
│   │       └── MechanicsEngine.js  # Mechanics calculation engine
│   │
│   ├── models/                  # Data models
│   │   ├── Hero.js              # Hero model
│   │   └── SpellSlot.js         # Spell slot model
│   │
│   ├── data/                    # JSON data files
│   │   ├── spells.json          # Spell database
│   │   └── mechanics.json       # Game mechanics config
│   │
│   ├── utils/                   # Utilities
│   │   ├── dataLoader.js        # JSON data loader
│   │   └── PersistenceManager.js # Save/load system
│   │
│   ├── shared/                  # Shared code
│   │   ├── starterSpells.js     # Starter spell definitions
│   │   ├── spellTypes.js        # Spell type constants
│   │   ├── characters.js        # Character data
│   │   ├── helpers.js           # Helper functions
│   │   └── index.js             # Shared exports
│   │
│   ├── context/                 # React context
│   │   ├── GlobalState.js       # Global state definition
│   │   └── GlobalStateProvider.js # State provider
│   │
│   ├── hooks/                   # Custom React hooks
│   │
│   ├── index.js                 # App entry point
│   └── reportWebVitals.js       # Performance monitoring
│
├── godot_fighter/               # Godot 4.5 project
│   ├── scenes/                  # Godot scenes
│   ├── scripts/                 # GDScript files
│   ├── assets/                  # Godot assets
│   ├── project.godot            # Godot project file
│   ├── export_presets.cfg       # Export settings
│   └── export_web.sh            # Web export script
│
├── docs/                        # Project documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── TASKMASTER_PLAN.md
│   └── [other docs]
│
├── Claude.md/                   # Godot patterns & guides
│   ├── 00_INDEX.md
│   └── [01-06 guides]
│
├── assets/                      # Shared assets
│
├── build/                       # Build output
│
├── package.json                 # NPM dependencies
├── build_godot_game.sh          # Godot build script
└── 00_Index.md                  # This file
```

### Key Files

#### Configuration
- `package.json` - NPM dependencies and scripts
- `jsconfig.json` - JavaScript configuration
- `.prettierrc` - Code formatting rules
- `.gitignore` - Git ignore patterns

#### React Entry Points
- `src/index.js` - Application entry point
- `src/components/App/App.js` - Main app component
- `src/context/GlobalStateProvider.js` - Global state setup

#### Game Systems
- `src/systems/battle/MechanicsEngine.js` - Core mechanics engine
- `src/models/Hero.js` - Hero data model
- `src/utils/dataLoader.js` - JSON data loading

#### Data Files
- `src/data/spells.json` - All spell definitions
- `src/data/mechanics.json` - Game mechanics configuration

#### Godot Integration
- `src/components/GodotGame/` - Godot integration component
- `godot_fighter/project.godot` - Godot project
- `build_godot_game.sh` - Godot build automation

---

## Development Workflow

### Phase 1: React Development

1. **Start Development Server**
   ```bash
   npm start
   ```
   - Opens at `http://localhost:3000`
   - Hot reload enabled

2. **Edit Game Content**
   - **Spells:** Edit `src/data/spells.json`
   - **Mechanics:** Edit `src/data/mechanics.json`
   - **Components:** Edit files in `src/components/`

3. **Test Changes**
   - Changes auto-reload in browser
   - Check console for errors

4. **Build for Production**
   ```bash
   npm run build
   ```
   - Output in `build/` directory

### Phase 2: Godot Integration

1. **Open Godot Project**
   ```bash
   cd godot_fighter
   # Open in Godot 4.5 editor
   ```

2. **Edit Godot Scenes**
   - Scenes in `godot_fighter/scenes/`
   - Scripts in `godot_fighter/scripts/`

3. **Export for Web**
   ```bash
   ./build_godot_game.sh
   ```
   - Exports to `public/godot/` for React integration

4. **Test Integration**
   - Start React dev server
   - Godot game loads in `<GodotGame>` component

### Phase 3: Integration Testing

1. **Test Both Systems**
   - React UI + Godot 3D rendering
   - Data flow between systems

2. **Debug Integration**
   - Check browser console
   - Check Godot remote debugger

---

## Key Systems

### 1. Combat System

**Location:** `src/systems/battle/MechanicsEngine.js`
**Documentation:** [`MECHANICS_SYSTEM.md`](./MECHANICS_SYSTEM.md)

**Features:**
- 14-step damage calculation
- Elemental advantages/weaknesses
- Status effects (DoT, CC, Buffs, Debuffs)
- Player modifiers (30+ types)
- Attack modifiers (20+ types)
- Evasion & critical hits

**Quick Example:**
```javascript
import mechanicsEngine from './systems/battle/MechanicsEngine';

const result = mechanicsEngine.calculateDamage(
  attacker,
  defender,
  {
    baseDamage: 50,
    damageType: 'physical',
    element: 'fire',
    canCrit: true,
    canEvade: true
  }
);
```

### 2. Spell System

**Location:** `src/data/spells.json`
**Documentation:** [`JSON_SYSTEM_COMPLETE.md`](./JSON_SYSTEM_COMPLETE.md)

**Features:**
- 10+ spells (expandable to 200+)
- Rarity tiers: Common, Uncommon, Rare, Epic, Legendary, Mythic
- 11 elements with advantage matrix
- JSON-driven, easy to modify

**Quick Example:**
```json
{
  "id": "fireball_basic",
  "name": "Fireball",
  "rarity": "common",
  "element": "fire",
  "baseDamage": 45,
  "manaCost": 30
}
```

### 3. Hero System

**Location:** `src/models/Hero.js`
**Documentation:** [`docs/PRD.md`](./docs/PRD.md) (Section 4.1)

**Features:**
- Hero creation & management
- Death/revival mechanics
- Primary & secondary builds
- Spell lock system
- Level progression

### 4. Godot Integration

**Location:** `godot_fighter/` + `src/components/GodotGame/`
**Documentation:** [`GODOT_INTEGRATION.md`](./GODOT_INTEGRATION.md)

**Features:**
- 3D character rendering
- Real-time combat animations
- Particle effects
- Physics-based knockback
- Camera controls

---

## Integration Guides

### React ↔ Godot Communication

**Current Status:** See [`INTEGRATION_SUMMARY.md`](./INTEGRATION_SUMMARY.md)

**Communication Flow:**
```
React Component
    ↓ (emit event)
JavaScript Bridge
    ↓ (call GDScript function)
Godot Scene
    ↓ (render/animate)
Godot Output
    ↓ (callback)
React State Update
```

**Implementation:**
1. **React Side:** `src/components/GodotGame/`
2. **Godot Side:** `godot_fighter/scripts/`
3. **Bridge:** JavaScript ↔ GDScript interface

### JSON Content System

**Documentation:** [`JSON_SYSTEM_COMPLETE.md`](./JSON_SYSTEM_COMPLETE.md)

**Benefits:**
- Add spells without coding
- Easy balance adjustments
- Version control friendly
- Mod support ready

**How to Add a Spell:**
1. Open `src/data/spells.json`
2. Copy an existing spell object
3. Modify properties
4. Save and restart server

**Example:**
```json
{
  "id": "lightning_bolt",
  "name": "Lightning Bolt",
  "description": "Strike with lightning",
  "rarity": "uncommon",
  "element": "lightning",
  "type": "damage",
  "baseDamage": 55,
  "manaCost": 40,
  "tags": ["offensive", "instant"]
}
```

---

## Reference

### Key Concepts

#### Rarities
- **Common** (50% drop) - Basic spells
- **Uncommon** (30% drop) - Enhanced spells
- **Rare** (15% drop) - Powerful spells
- **Epic** (4% drop) - Very powerful spells
- **Legendary** (0.9% drop) - Elite spells
- **Mythic** (0.1% drop) - Ultimate spells

#### Elements
Fire, Water, Ice, Lightning, Earth, Air, Light, Dark, Chaos, Cosmic, Neutral

**Advantages:**
- Fire > Ice, Earth
- Water > Fire, Earth
- Lightning > Water, Air
- Ice > Water, Earth
- And more... (see `MECHANICS_SYSTEM.md`)

#### Damage Types
- **Physical** - Reduced by armor
- **Magical** - Reduced by magic defense
- **True** - Ignores defense (not resistance)
- **Pure** - Ignores both defense and resistance

### Technologies Used

**Frontend:**
- React 18.2+
- Context API (state management)
- CSS Modules
- LocalStorage (persistence)

**Game Engine:**
- Godot 4.5
- GDScript
- HTML5 export target

**Build Tools:**
- Create React App
- Webpack
- Bash scripts

**Development:**
- Git version control
- NPM package management

### External Resources

**Godot:**
- [Godot Documentation](https://docs.godotengine.org)
- [Godot Demo Projects](https://github.com/godotengine/godot-demo-projects)

**React:**
- [React Documentation](https://react.dev)
- [Create React App Docs](https://create-react-app.dev)

**Game Design:**
- Hearthstone (deck building reference)
- Pokémon (type advantages reference)
- Slay the Spire (progression reference)

---

## Development Status

### Completed ✅
- [x] React app foundation
- [x] Combat system core
- [x] Spell data model
- [x] JSON content system
- [x] Hero system
- [x] Shop system (Soul & Item)
- [x] Mechanics engine (14-step damage calc)
- [x] Godot project setup
- [x] Initial integration

### In Progress 🚧
- [ ] Godot 3D character implementation
- [ ] Full React ↔ Godot communication
- [ ] Advanced combat animations
- [ ] Additional spells (target: 70+)

### Planned 📋
- [ ] PvP system
- [ ] Ranked mode
- [ ] Guild system
- [ ] Advanced progression
- [ ] Mobile optimization
- [ ] Native mobile ports

---

## Getting Help

### Documentation Issues
If you can't find what you need:
1. Check this index first
2. Search for keywords in relevant docs
3. Check [`docs/README.md`](./docs/README.md)
4. Review [`QUICK_START.md`](./QUICK_START.md)

### Technical Issues
For development problems:
1. Check browser console for errors
2. Review [`MECHANICS_SYSTEM.md`](./MECHANICS_SYSTEM.md) for game logic
3. Review [`GODOT_INTEGRATION.md`](./GODOT_INTEGRATION.md) for Godot issues
4. Check Git history for recent changes

### Content Creation
For adding/modifying content:
1. Read [`JSON_SYSTEM_COMPLETE.md`](./JSON_SYSTEM_COMPLETE.md)
2. See example spells in `src/data/spells.json`
3. Check balance guidelines in docs

---

## Quick Reference

### Common Tasks

**Add a new spell:**
→ Edit `src/data/spells.json`

**Modify damage calculations:**
→ Edit `src/systems/battle/MechanicsEngine.js`

**Change UI components:**
→ Edit files in `src/components/`

**Update Godot scenes:**
→ Edit files in `godot_fighter/scenes/`

**Build for production:**
→ Run `npm run build`

**Build Godot game:**
→ Run `./build_godot_game.sh`

---

## Version History

- **v1.0** (2025-10-15) - Initial master index created
- React foundation complete
- JSON system implemented
- Godot integration in progress

---

## Contributors

This project follows a multi-agent development model:
- **Agent 1:** Combat Core Engineer
- **Agent 2:** Spell Library Designer
- **Agent 3:** UI/UX Developer
- **Agent 4:** Progression Systems Engineer
- **Agent 5:** AI & Game Modes Engineer
- **Agent 6:** State Management & Integration

See [`docs/MULTI_AGENT_PLAN.md`](./docs/MULTI_AGENT_PLAN.md) for coordination details.

---

**Last Updated:** 2025-10-15
**Maintained By:** Project Team
**Status:** Living Document - Updated as project evolves
