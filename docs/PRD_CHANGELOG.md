# PRD Changelog
## Spell Brawler - Product Requirements Document Updates

---

## Version 1.2 (2025-10-11)

### 🔥 MAJOR CHANGE: Combat System Clarification

**Critical Update:** The game is **NOT turn-based**. It's a **real-time simultaneous action system** with 2-second intervals.

#### What Changed

**Previous Understanding (INCORRECT):**
- Turn-based combat (players alternate)
- Each player takes a full turn
- 30-second turn timer

**Current Reality (CORRECT):**
- **Real-time simultaneous action combat**
- **Actions resolve every 2 seconds**
- **Both players act at the same time**
- **Default action: "Charge" (+20 Mana)**

#### How It Works

```
Every 2-Second Interval:
1. Player selects spell OR does nothing
2. If nothing selected → Auto-Charge (+20 Mana)
3. Both players' actions resolve simultaneously
4. Animations play, effects apply
5. Next 2-second interval begins
6. Repeat until battle ends (3-minute max)
```

#### Key Implications

1. **Fast-Paced Gameplay**
   - Battles last 1-3 minutes (90 intervals max)
   - Constant decision-making every 2 seconds
   - No waiting for opponent's turn

2. **Resource Management**
   - Charge action = bank Mana
   - Spell cast = spend Mana, build Momentum
   - Strategic: When to bank vs. when to attack

3. **Simultaneous Resolution**
   - Both players can hit each other (double KO possible)
   - Priority system for animation order (instant → standard → charged)
   - Mind games: Predict opponent's action

4. **No "Turns"**
   - All references changed from "turns" to "intervals"
   - Duration measured in 2-second intervals (not turns)
   - Combo meter builds on spells, decays on Charge

#### Updated Sections

✅ **Section 1.1**: Renamed "Turn-Based" → "Real-Time Simultaneous Action"
- Battle flow completely rewritten
- 2-second interval mechanics explained
- Charge action as default

✅ **Section 1.2**: Resource System
- Mana gain: +20 per Charge action (not per turn)
- Energy: +10/interval (not per turn)
- Charge mechanic core resource generation

✅ **Section 2.1**: Spell Timing
- `castTime`: Intervals to charge (0 = instant, 1 = 2s, 2 = 4s)
- `cooldown`: Intervals before reuse (3 = 6 seconds)
- All durations in 2-second intervals

✅ **Section 3.2**: Status Effects
- Duration tracking: Ticks down every 2-second interval
- Example: Burn (3 intervals) = 6 seconds total

✅ **Section 3.3**: Combo System
- +15% per spell cast (NOT Charge)
- -10% decay per interval if Charge used
- Banking vs. Aggression strategic choice

✅ **Section 3.4**: Renamed "Counter System" → "Simultaneous Resolution & Priority"
- Priority within interval (instant → standard → charged)
- Both actions execute (simultaneous damage)
- Counter spells negate specific action types

✅ **Section 7.2**: Battle Screen UI
- 2-second interval timer (circular countdown)
- Charge button (large, bottom-center)
- "Auto-Charge in X.Xs..." indicator
- Queued action display
- Interval tick audio cue at 1s

✅ **Product Vision & Title**
- Changed from "Turn-Based" to "Real-Time Simultaneous Action"
- Core value prop updated

#### Impact on Development

| Area | Impact | Action Required |
|------|--------|-----------------|
| **Battle Engine** | Critical | Rewrite from turn-based to interval-based |
| **UI/UX** | High | Add 2s timer, Charge button, action queue |
| **Spell Design** | Medium | Adjust timings to 2s intervals |
| **AI Opponent** | Medium | Decision-making every 2s (not per turn) |
| **Animations** | Low | Speed options (doesn't affect interval timing) |

#### Reference Games (Updated)

This combat style is similar to:
- **Clash Royale**: Real-time action with card deployment
- **Hearthstone Battlegrounds**: Simultaneous combat rounds
- **Auto Chess/TFT**: Timed preparation → simultaneous battle
- **Fighting Games**: Frame-based timing, simultaneous hits

---

## Version 1.1 (2025-10-11)

### 🎯 Key Design Decisions Finalized

#### 1. PvP Strategy ✅
**Decision:** Support both asynchronous and synchronous PvP, phased approach

**Phase 1 (Launch):**
- Asynchronous PvP: Players battle against opponent's saved deck (AI-controlled)
- Benefits: No server infrastructure needed, works offline, thoughtful gameplay
- Implementation: LocalStorage-based deck sharing

**Phase 2 (Post-Launch):**
- Real-time synchronous PvP with WebSockets
- Live matchmaking, tournaments, spectator mode
- Requires backend infrastructure

**Rationale:**
- Start simple, validate gameplay first
- Async PvP proven successful (Clash Royale, Hearthstone Arena)
- Real-time adds complexity but higher engagement

---

#### 2. Monetization Model ✅
**Decision:** Strictly cosmetic-only, NO pay-to-win

**Core Principles:**
- ✅ Premium currency (Gems) CANNOT buy gameplay advantages
- ✅ All spells obtainable through free gameplay
- ✅ Cosmetic-only purchases (skins, animations, themes, emotes)
- ✅ Premium battle pass: Cosmetic rewards + XP boost (NOT exclusive spells)

**What Can Be Purchased:**
- **Spell Skins**: Custom visual effects for existing spells
- **Character Skins**: Player avatar customization
- **UI Themes**: Dark mode, neon theme, fantasy theme, etc.
- **Battle Arenas**: Visual backgrounds for battles
- **Emotes & Victory Poses**: Social expression
- **Premium Battle Pass**: Cosmetic track with exclusive skins

**What CANNOT Be Purchased:**
- ❌ Exclusive powerful spells
- ❌ Stat boosts or power increases
- ❌ Extra deck slots (beyond free limit)
- ❌ Guaranteed spell drops (pity system is free)

**Gem Uses (Premium Currency):**
- Cosmetic purchases
- Spell marketplace trading fees
- Premium battle pass
- Convenience features (deck slot expansion, skip animations)

**Rationale:**
- Fair play = better retention
- Cosmetics generate revenue without affecting balance
- Proven model: League of Legends, Fortnite, Path of Exile

---

#### 3. Spell Trading Marketplace ✅
**Decision:** YES - Player-to-player trading using Gems (Post-launch)

**Implementation (Phase 5):**
- Players can list spells for sale
- Buyers pay in Gems (premium currency)
- 10% transaction fee (Gem sink, prevents inflation)
- Search, filter, and watchlist functionality
- Price history tracking (30-day graphs)

**Trading Rules:**
- **Level Requirement**: Player must be level 25+ (anti-bot measure)
- **Active Deck Restriction**: Cannot trade spells in active deck
- **Listing Duration**: 7 days auto-expire
- **Price Limits**: Min 10 Gems, Max 10,000 Gems per spell
- **Daily Trade Limit**: 5 trades per player (anti-inflation)

**Economic Safeguards:**
- Dynamic pricing based on supply/demand
- System buyback option (convert to Shards if no buyer)
- Seasonal events affect market (themed spell drops)
- Market monitoring for manipulation

**Rationale:**
- Gives value to duplicate spells
- Creates Gem demand (monetization)
- Player-driven economy increases engagement
- Safeguards prevent abuse

---

#### 4. Mobile Platform Strategy ✅
**Decision:** Mobile-first web design, native port planned

**Phase 1 (Launch): Mobile-First Web**
- Design for 375px minimum width (iPhone SE)
- Touch-optimized UI (44px+ tap targets)
- Portrait orientation primary
- Responsive breakpoints: Mobile (375px+), Tablet (768px+), Desktop (1024px+)
- Progressive Web App (PWA) features:
  - Offline support (cached battles)
  - Add to home screen
  - Web push notifications
  - Background sync

**Phase 6 (Post-Launch): Native Mobile**
- React Native or Capacitor wrapper
- iOS App Store & Google Play release
- Native features:
  - Push notifications
  - In-app purchases (cosmetics)
  - Deep linking
  - Cross-platform save sync

**Mobile-First Design Principles:**
- **Progressive Disclosure**: Essential info first, details on tap
- **Gesture Navigation**: Swipes, long-presses, pull-to-refresh
- **Thumb-Zone Optimization**: Primary actions in lower 2/3 of screen
- **Performance**: Battery saver mode, data saver mode
- **Loading**: Skeleton screens, progressive image loading

**Rationale:**
- Mobile gaming is 50%+ of market
- PWA allows app-like experience without stores
- Native port maximizes reach later
- Mobile-first ensures desktop works well too

---

### 📋 Updated Sections

#### Executive Summary
- **Platform**: Changed from "Web (React), expandable to mobile" → "Mobile-first web (React), native mobile port planned"

#### Product Goals & Success Metrics
- **Monetization KPIs**: Added cosmetic-only clarification
  - Conversion rate: 5-8% (cosmetic purchases)
  - ARPU: $5-10/month (NO pay-to-win)
  - Gem purchase rate: 15-20%
  - Battle pass adoption: 25-30%

#### Game Modes (Section 5)
- **Ranked Mode**: Now "Ranked Mode (Asynchronous PvP)"
  - Play against opponent's saved deck (AI-controlled)
  - Phase 2: Real-time synchronous PvP with WebSockets
- **Casual PvP**: Now "Casual PvP (Asynchronous)"
  - Quick match vs opponent's deck

#### Collection & Economy (Section 4.3)
- **Currencies**: Updated Gems description
  - Source: Purchases, Achievements, Events
  - Use: Cosmetics, marketplace trades, battle pass
- **Added Monetization Philosophy**:
  - NO Pay-to-Win principles
  - Cosmetic-only purchases
  - Fair F2P guarantee

#### NEW: Spell Trading Marketplace (Section 4.4)
- Complete marketplace specification
- Trading rules and restrictions
- Economic balance systems
- UI/UX for marketplace

#### UI/UX Requirements (Section 7)
- **NEW: Mobile-First Design Principles (7.1)**
  - Touch targets, gestures, responsive breakpoints
  - PWA features, offline support
- **Updated Core Screens (7.2)**
  - Mobile-first layouts for all screens
  - Bottom tab navigation
  - Touch-optimized battle screen (3x2 spell grid)
- **Updated UX Principles (7.3)**
  - Mobile-specific feedback (haptic, toasts)
  - Performance optimizations (battery saver, data saver)

#### Technical Architecture (Section 8)
- **Frontend**: Added mobile-first tech stack
  - PWA with Service Workers
  - Touch gesture libraries
  - Mobile-first CSS breakpoints
- **Backend**: Added OAuth for mobile (Google, Apple Sign-In)
- **NEW: Mobile Native section**
  - React Native/Capacitor
  - Platform requirements (iOS 14+, Android 10+)
- **Current Phase**: Clarified "mobile web" focus

#### Development Phases (Section 9)
- **Phase 5**: Added marketplace & PWA features
  - Cosmetic shop UI
  - Spell trading marketplace
  - PWA features (offline, add to home)
- **Phase 6**: Added native mobile port
  - Real-time synchronous PvP
  - iOS/Android app releases
  - Cross-platform save sync

#### Appendix (Section 14)
- **Removed: Open Questions**
- **Added: Design Decisions (14.3)**
  - PvP mode strategy (async → sync)
  - Monetization model (cosmetic-only)
  - Spell trading marketplace (yes)
  - Mobile platform strategy (web → native)
  - Social features priority

---

### 📊 Impact Summary

| Area | Change | Impact |
|------|--------|--------|
| **Platform** | Mobile-first web → Native app | High - Changes entire UI/UX approach |
| **Monetization** | Clarified cosmetic-only | High - Affects revenue, player trust |
| **PvP** | Async first, sync later | Medium - Simplifies Phase 1, adds Phase 2 |
| **Trading** | Added marketplace | Medium - New feature, Gem demand driver |
| **Design** | Mobile-first principles | High - All UI must be touch-optimized |

---

### ✅ What's Clear Now

1. **PvP Implementation**
   - ✅ Phase 1: Asynchronous (vs saved decks)
   - ✅ Phase 2: Real-time (WebSockets)
   - ✅ No ambiguity on rollout strategy

2. **Monetization**
   - ✅ 100% cosmetic-only
   - ✅ NO pay-to-win mechanics
   - ✅ Gem uses defined (cosmetics, marketplace, convenience)
   - ✅ Fair F2P commitment

3. **Trading**
   - ✅ Player-to-player marketplace confirmed
   - ✅ Gem-based trading system
   - ✅ Anti-abuse safeguards defined
   - ✅ Phase 5 delivery target

4. **Mobile**
   - ✅ Mobile-first web design (Phase 1)
   - ✅ PWA features (offline, home screen)
   - ✅ Native apps (Phase 6)
   - ✅ Touch-optimized UI patterns

---

### 🚀 Next Steps

1. **UI/UX Design**
   - Create mobile-first wireframes (375px width)
   - Design touch-optimized spell buttons (3x2 grid)
   - Prototype gesture navigation

2. **Technical Planning**
   - Set up PWA infrastructure (Service Workers)
   - Plan async PvP deck storage system
   - Design marketplace database schema

3. **Monetization Setup**
   - Create cosmetic asset pipeline (spell skins, character skins)
   - Design Gem purchase tiers
   - Plan battle pass cosmetic rewards

4. **Agent Assignments**
   - **Agent 3 (UI/UX)**: Implement mobile-first components
   - **Agent 4 (Progression)**: Build marketplace system (Phase 5)
   - **Agent 5 (AI & Modes)**: Async PvP vs saved decks
   - **Agent 6 (State)**: PWA setup, offline support

---

### 📝 Documentation Status

- **Version**: 1.0 → 1.1
- **Last Updated**: 2025-10-11
- **Status**: Design Decisions Finalized
- **Ready for**: Phase 1 Development Start

---

## Version History

### v1.1 (2025-10-11)
- ✅ Finalized PvP strategy (async → sync phased approach)
- ✅ Clarified monetization (cosmetic-only, NO pay-to-win)
- ✅ Added spell trading marketplace specification
- ✅ Established mobile-first design principles
- ✅ Updated all relevant sections with decisions

### v1.0 (2025-10-11)
- ✅ Initial PRD with comprehensive feature specs
- ✅ Multi-agent development plan
- ✅ Shared interfaces and architecture
- ⏳ Open questions pending decisions

---

**All key design decisions are now finalized. Ready for implementation! 🚀**
