# Documentation Hub
## Spell Brawler - Collectible Spell Turn-Based Brawler

Welcome to the Spell Brawler documentation! This folder contains all the essential documents for building this game with a multi-agent development approach.

---

## 📚 Document Index

### Core Documents

1. **[PRD.md](./PRD.md)** - Product Requirements Document
   - Complete product vision and specifications
   - Feature details and requirements
   - Success metrics and KPIs
   - **Read this first** to understand the product

2. **[MULTI_AGENT_PLAN.md](./MULTI_AGENT_PLAN.md)** - Multi-Agent Development Plan
   - Agent responsibilities and task breakdown
   - Weekly deliverables
   - Coordination protocols
   - **Use this** to understand your role

3. **[SHARED_INTERFACES.md](./SHARED_INTERFACES.md)** - API Contracts
   - Data type definitions
   - System APIs
   - Event bus protocol
   - **Reference constantly** when coding

4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System Architecture
   - Technical overview and diagrams
   - Data flow visualization
   - Module responsibilities
   - **Understand the big picture**

---

## 🚀 Quick Start for Agents

### For All Agents

**Step 1:** Read the PRD
- Understand the product vision
- Review your domain's features
- Note dependencies on other agents

**Step 2:** Review Your Agent Assignment
- Go to [MULTI_AGENT_PLAN.md](./MULTI_AGENT_PLAN.md)
- Find your agent section (Agent 1-6)
- Read your responsibilities and tasks

**Step 3:** Study Shared Interfaces
- Review [SHARED_INTERFACES.md](./SHARED_INTERFACES.md)
- Bookmark the interfaces you'll implement/use
- Set up your development environment

**Step 4:** Start Coding
- Follow the file structure in your section
- Implement the Week 1-2 tasks
- Write tests as you go
- Submit PRs for review

---

## 👥 Agent-Specific Quick Starts

### Agent 1: Combat Core Engineer

**Your Mission:** Build the foundational battle system.

**Start Here:**
1. Read PRD Section 1: Core Combat System
2. Create `/src/systems/battle/` directory
3. Implement in this order:
   - Resource system
   - Spell data model
   - Damage calculator
   - Action queue
   - Status effect manager

**First File to Create:**
```javascript
// /src/systems/battle/ResourceManager.js
export class ResourceManager {
  // Implement resource tracking
}
```

**Key Deliverables (Week 1-2):**
- [ ] Resource system (4 resource types)
- [ ] Damage calculation with elemental advantage
- [ ] Status effect manager (10+ effects)
- [ ] Battle state model
- [ ] Unit tests for combat logic

**Dependencies:** None (you're the foundation!)

**Who Needs Your Work:**
- Agent 2 (spell effects)
- Agent 5 (AI battles)
- Agent 3 (UI rendering)

---

### Agent 2: Spell Library Designer

**Your Mission:** Create 70+ diverse, balanced spells.

**Start Here:**
1. Read PRD Section 2: Spell System
2. Wait for Agent 1's spell model (or use draft)
3. Create `/src/data/spells/` directory
4. Design spells in spreadsheet first (balance!)

**First File to Create:**
```javascript
// /src/data/spells/coreSpells.js
import { RARITY, ELEMENT, SPELL_TYPE } from 'shared/spellTypes';

export const FIREBALL = {
  id: 'fireball',
  name: 'Fireball',
  // ... full definition
};
```

**Key Deliverables (Week 1-2):**
- [ ] 20 core spells (balanced)
- [ ] Spell effect functions
- [ ] Balance spreadsheet
- [ ] Synergy detection system

**Dependencies:**
- Agent 1: Spell model, damage calculator

**Who Needs Your Work:**
- Agent 3 (display spells)
- Agent 4 (gacha drops)

---

### Agent 3: UI/UX Developer

**Your Mission:** Build beautiful, responsive React components.

**Start Here:**
1. Read PRD Section 7: UI/UX Requirements
2. Set up component library structure
3. Create battle UI mockups (Figma optional)
4. Install Framer Motion for animations

**First Files to Create:**
```javascript
// /src/components/common/Button/Button.js
export const Button = ({ variant, onClick, children }) => {
  // Implement reusable button
};

// /src/components/Battle/BattleScreen.js
export const BattleScreen = () => {
  // Battle UI scaffold
};
```

**Key Deliverables (Week 1-2):**
- [ ] Component library (Button, Card, Modal, etc.)
- [ ] Battle screen (functional)
- [ ] Spell buttons with tooltips
- [ ] Animation system setup

**Dependencies:**
- Agent 1: Battle state
- Agent 2: Spell data
- Agent 6: Global state context

**Who Needs Your Work:**
- End users!

---

### Agent 4: Progression Systems Engineer

**Your Mission:** Implement all player advancement systems.

**Start Here:**
1. Read PRD Sections 4 & 6: Progression & Missions
2. Create `/src/systems/progression/` directory
3. Design XP curve and mission templates
4. Implement gacha with pity

**First Files to Create:**
```javascript
// /src/systems/progression/LevelingSystem.js
export class LevelingSystem {
  generateXPCurve(maxLevel) {
    // Exponential XP curve
  }

  addXP(player, amount) {
    // Level up logic
  }
}

// /src/systems/collection/GachaManager.js
export class GachaManager {
  pull(count) {
    // Implement pity system
  }
}
```

**Key Deliverables (Week 1-2):**
- [ ] Player leveling (XP, levels 1-100)
- [ ] Mission system (daily, weekly)
- [ ] Gacha with pity
- [ ] Currency management

**Dependencies:**
- Agent 2: Spell library (for drops)

**Who Needs Your Work:**
- Agent 6 (state updates)
- Agent 3 (UI displays)

---

### Agent 5: AI & Game Modes Engineer

**Your Mission:** Create intelligent AI and diverse game modes.

**Start Here:**
1. Read PRD Section 5: Game Modes
2. Study Agent 1's battle API
3. Enhance existing AI opponent
4. Design AI decision strategies

**First Files to Create:**
```javascript
// /src/systems/ai/AIOpponent.js
export class AIOpponent {
  constructor(difficulty) {
    this.strategy = this.selectStrategy(difficulty);
  }

  chooseSpell(battleState, availableSpells) {
    return this.strategy.evaluate(battleState, spells);
  }
}

// /src/systems/modes/RankedMode.js
export class RankedMode {
  async findMatch(player) {
    // ELO matchmaking
  }
}
```

**Key Deliverables (Week 1-2):**
- [ ] AI opponent (3 difficulty levels)
- [ ] Ranked matchmaking (ELO)
- [ ] Draft mode logic
- [ ] Horde mode (wave spawning)

**Dependencies:**
- Agent 1: Battle engine

**Who Needs Your Work:**
- Agent 6 (mode selection)
- Agent 3 (mode-specific UI)

---

### Agent 6: State Management & Integration

**Your Mission:** Manage global state and integrate all systems.

**Start Here:**
1. Read PRD Section 8: Technical Architecture
2. Design global state structure
3. Set up Context providers
4. Create event bus

**First Files to Create:**
```javascript
// /src/context/GlobalContext.js
import { createContext, useReducer } from 'react';

const initialState = {
  player: { /* ... */ },
  battle: null,
  progression: { /* ... */ }
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

// /src/utils/eventBus.js
export const eventBus = {
  events: {},
  on(event, callback) { /* ... */ },
  emit(event, data) { /* ... */ }
};
```

**Key Deliverables (Week 1-2):**
- [ ] Global state architecture
- [ ] Context providers
- [ ] LocalStorage persistence
- [ ] Event bus
- [ ] State validators

**Dependencies:**
- All agents (you integrate everything!)

**Who Needs Your Work:**
- All agents (you provide state access)

---

## 🔄 Development Workflow

### Daily Routine

1. **Morning:**
   - Check GitHub issues/PRs
   - Review other agents' code
   - Post standup update

2. **Development:**
   - Work on assigned tasks
   - Write tests alongside code
   - Commit frequently with clear messages

3. **Evening:**
   - Submit PR if task complete
   - Update documentation if needed
   - Tag blockers for discussion

### Weekly Routine

**Monday:**
- Sprint planning
- Review previous week
- Assign new tasks

**Wednesday:**
- Mid-week sync
- Demo progress
- Resolve blockers

**Friday:**
- Integration testing
- Code reviews
- Document learnings

---

## 📋 Checklists

### Before Starting Development

- [ ] Read PRD completely
- [ ] Understand your agent role
- [ ] Review shared interfaces
- [ ] Set up development environment
- [ ] Clone repo and create branch
- [ ] Install dependencies (`npm install`)
- [ ] Run project (`npm start`)

### Before Submitting PR

- [ ] Code follows shared interfaces
- [ ] Tests written and passing
- [ ] No console errors
- [ ] Documentation updated
- [ ] PR description clear
- [ ] Tagged relevant agents for review

### Before Merging

- [ ] At least 1 approval
- [ ] CI/CD passing
- [ ] No merge conflicts
- [ ] Integration tested

---

## 🛠 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Installation
```bash
# Clone the repo
git clone <repo-url>
cd RTB

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Prettier
- ESLint
- GitLens
- Auto Import

---

## 🧪 Testing Guidelines

### Unit Tests
```javascript
// Example: Testing damage calculation
import { calculateDamage } from 'systems/battle/DamageCalculator';

describe('Damage Calculator', () => {
  test('calculates basic damage correctly', () => {
    const spell = { baseDamage: 50, element: 'fire' };
    const caster = { stats: { magic: 30 } };
    const target = { stats: { magicDefense: 20 } };

    const damage = calculateDamage({ spell, caster, target });

    expect(damage).toBeGreaterThan(40);
    expect(damage).toBeLessThan(70);
  });

  test('applies elemental advantage', () => {
    // Fire vs Ice = 1.5x damage
    // Test implementation
  });
});
```

### Integration Tests
```javascript
// Example: Testing full battle flow
describe('Battle Flow', () => {
  test('player can cast spell and damage opponent', async () => {
    const battle = await battleEngine.create('practice', config);
    const action = { type: 'CAST_SPELL', spell: fireball, targetId: 'opponent' };

    const newState = await battleEngine.processAction(battle, action);

    expect(newState.players[1].hp).toBeLessThan(battle.players[1].hp);
  });
});
```

---

## 📝 Code Style Guide

### JavaScript/React Conventions
```javascript
// Use ES6+ features
const spell = spells.find(s => s.id === spellId);

// Destructure props
const SpellCard = ({ spell, onClick }) => { /* ... */ };

// Use meaningful names
const calculateElementalMultiplier = (attackElement, defendElement) => { /* ... */ };

// Comment complex logic
// Apply elemental advantage multiplier (1.5x if super effective)
const multiplier = getElementalMultiplier(spell.element, target.element);
damage *= multiplier;
```

### File Naming
- Components: `PascalCase.js` (e.g., `BattleScreen.js`)
- Utilities: `camelCase.js` (e.g., `damageCalculator.js`)
- Constants: `UPPER_SNAKE_CASE.js` (e.g., `SPELL_TYPES.js`)
- Styles: `ComponentName.module.css`

### Folder Structure
```
/src/
  ├── components/       # React components (Agent 3)
  ├── systems/          # Game systems (Agents 1, 2, 4, 5)
  ├── context/          # State management (Agent 6)
  ├── data/             # Static data (Agent 2)
  ├── models/           # Data models (Shared)
  ├── shared/           # Shared constants (Shared)
  └── utils/            # Utilities (Shared)
```

---

## 🐛 Debugging Tips

### Common Issues

**Issue:** State not updating
- Check if you're mutating state (use spread operator)
- Verify dispatch is called correctly
- Check reducer logic

**Issue:** Performance lag
- Profile with React DevTools
- Check for unnecessary re-renders
- Memoize expensive calculations

**Issue:** Tests failing
- Check mock data matches real structure
- Verify async tests use `await`
- Check test isolation (no shared state)

### Debug Tools
- React DevTools (Components & Profiler)
- Redux DevTools (if using Redux)
- Chrome DevTools Performance tab
- `console.log` (remove before commit!)

---

## 📞 Communication

### GitHub
- **Issues:** Bug reports, feature requests
- **PRs:** Code reviews, discussions
- **Discussions:** Design decisions

### Slack/Discord (if available)
- Quick questions
- Daily standups
- Urgent blockers

### Email
- Weekly summaries
- Important announcements

---

## 🎯 Success Criteria

### Week 2 Checkpoint
- [ ] All agents have MVP of their domain
- [ ] Shared interfaces agreed upon
- [ ] 50% tasks complete

### Week 4 Checkpoint
- [ ] All systems integrated
- [ ] End-to-end battle working
- [ ] 80% tasks complete

### Week 6 Launch
- [ ] All features implemented
- [ ] Performance targets met
- [ ] 100% critical path coverage

---

## 📚 Additional Resources

### Learning Materials
- [React 18 Docs](https://react.dev)
- [Framer Motion](https://www.framer.com/motion/)
- [Jest Testing](https://jestjs.io/docs/getting-started)

### Game Design References
- Hearthstone (deck building)
- Pokemon (type advantages)
- Slay the Spire (synergies)
- Genshin Impact (gacha pity)

### Tools
- [Excalidraw](https://excalidraw.com/) - Diagrams
- [Figma](https://figma.com) - UI mockups
- [Balance Spreadsheet Template](https://docs.google.com/spreadsheets)

---

## 🔐 Security Notes

- **No secrets in code:** Use environment variables
- **Validate all inputs:** Check user data before processing
- **Sanitize state:** Prevent XSS in user-generated content
- **Rate limit:** Prevent spam (future backend)

---

## 🚀 Deployment (Future)

### Development
```bash
npm start
# Runs on localhost:3000
```

### Staging
```bash
npm run build
# Deploy to staging.spellbrawler.com
```

### Production
```bash
npm run build
# Deploy to spellbrawler.com
# Includes: minification, code splitting, asset optimization
```

---

## 📄 Document Maintenance

### Updating Docs
1. Make changes in your domain's section
2. Mark change in CHANGELOG
3. Submit PR with `[DOCS]` prefix
4. Get 1 approval before merging

### Review Schedule
- **Weekly:** During sprint planning
- **Monthly:** Full doc review
- **Post-Launch:** Archive old plans, create new roadmap

---

## ❓ FAQ

**Q: Can I change a shared interface?**
A: Yes, but requires approval from ALL agents. Create issue first.

**Q: What if I'm blocked by another agent?**
A: 1) Ask in Slack, 2) Create GitHub issue, 3) Work on other tasks, 4) Escalate to lead

**Q: How detailed should my code comments be?**
A: Comment complex logic, business rules, and non-obvious decisions. Code should be self-documenting.

**Q: Should I write tests first (TDD)?**
A: Recommended for critical systems (battle, progression). Not required for UI.

**Q: Can I use external libraries?**
A: Check with team first. Prefer standard libraries, avoid heavy dependencies.

---

## 📝 CHANGELOG

| Date | Change | Author |
|------|--------|--------|
| 2025-10-11 | Initial documentation created | All |

---

**Welcome to the team! Let's build an amazing game together! 🎮✨**

**Questions?** Create a GitHub issue tagged `question` or ask in Slack.

**Ready to start?** Go to your agent section in [MULTI_AGENT_PLAN.md](./MULTI_AGENT_PLAN.md)!
