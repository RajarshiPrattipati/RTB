# Combat System Explained
## Spell Brawler - Real-Time Simultaneous Action Combat

---

## 🎮 Core Concept

**Spell Brawler is NOT turn-based.** It's a **real-time simultaneous action system** where both players make decisions every 2 seconds.

Think: **Clash Royale meets Hearthstone Battlegrounds**

---

## ⏱️ How It Works

### The 2-Second Interval Loop

```
┌─────────────────────────────────────────┐
│         EVERY 2 SECONDS:                │
│                                          │
│  1. Timer counts down: 2.0 → 0.0        │
│  2. Player selects action (or doesn't)  │
│  3. Timer hits 0 → Actions resolve      │
│  4. Both players' actions execute       │
│  5. Animations play simultaneously      │
│  6. Resources update, effects tick      │
│  7. Next interval begins                │
│                                          │
│  Repeat for 90 intervals (3 min max)    │
└─────────────────────────────────────────┘
```

---

## 🎯 The Charge Mechanic

### Default Action
If you **don't select a spell** when the timer hits 0, you **automatically Charge**:

```
Charge Action:
- Adds +20 Mana
- Costs no resources
- Happens instantly
- Is the DEFAULT if no spell queued
```

### Strategic Decision
Every 2 seconds, you choose:

| Action | Effect | Trade-off |
|--------|--------|-----------|
| **Charge** | +20 Mana | Build resources, but don't damage opponent |
| **Cast Spell** | Damage/Effect | Spend Mana, pressure opponent |

**Early Game:** Charge to build Mana pool
**Mid Game:** Mix of Charging and casting
**Late Game:** Spam spells, ride the combo meter

---

## 🔄 Simultaneous Resolution

### Both Players Act At Once

Unlike traditional turn-based games (Pokémon, Final Fantasy), **both players' actions happen at the same time**:

```
Example Interval:
Player 1: Casts Fireball (45 damage)
Player 2: Casts Frost Lance (40 damage)

Result:
- Both take damage simultaneously
- Player 1: -40 HP
- Player 2: -45 HP
- Double KO is possible!
```

### Priority System (Animation Order)

While actions resolve simultaneously, **animation order** is determined by spell speed:

1. **Instant Spells** (0 cast time): Play animation first
   - Example: Quick Strike, Counter Spell
2. **Standard Spells**: Play animation second
   - Example: Fireball, Frost Lance
3. **Charged Spells** (2+ intervals): Play animation last
   - Example: Meteor Strike (queued 2 intervals ago)
4. **Charge Action**: No animation (instant resource gain)

**Important:** Priority affects visuals only, NOT damage outcome. Both players' damage applies regardless.

---

## 💡 Mind Games & Prediction

### Reading Your Opponent

Since actions are simultaneous, **prediction is key**:

**Scenario 1: Counter Spell**
- You predict opponent will cast a spell
- You cast "Spell Counter" (negates magic spells)
- If correct: Opponent's spell fails, they get half mana back
- If wrong: You wasted Energy

**Scenario 2: Banking**
- Opponent has been Charging for 3 intervals
- They now have 60 Mana (can cast big spell)
- You predict they'll attack next interval
- You cast a defensive spell preemptively

**Scenario 3: Aggressive Rush**
- You cast spells every interval (no Charging)
- Build combo meter quickly (15% per spell)
- Opponent forced to Charge less (lose combo)
- High risk: Might run out of Mana

---

## 📊 Resource Management

### Mana Economy

| Strategy | Mana Flow | Combo Meter | Playstyle |
|----------|-----------|-------------|-----------|
| **Banking** | Charge 5x, Cast 1x | Low (decays) | Control, Late-game |
| **Balanced** | Charge 2x, Cast 2x | Medium | Midrange |
| **Aggressive** | Charge 1x, Cast 5x | High (builds) | Aggro, Early-game |

### Combo Meter Dynamics

```
Combo Meter (0-100%):
- +15% per spell cast
- -10% per Charge action (decay)

Milestones:
- 50%: +10% damage bonus
- 75%: +20% damage, +5% crit chance
- 100%: +35% damage, guaranteed crit, unlock Finishers
```

**Example:**
```
Interval 1: Cast spell → 15% combo
Interval 2: Cast spell → 30% combo
Interval 3: Charge → 20% combo (decayed -10%)
Interval 4: Cast spell → 35% combo
Interval 5: Cast spell → 50% combo → +10% damage unlocked!
```

---

## ⚡ Battle Pacing

### Timeline

| Time | Intervals Elapsed | Typical State |
|------|-------------------|---------------|
| **0:00-0:20** | 0-10 | Early game, both players Charging |
| **0:20-0:40** | 10-20 | First spells cast, poke damage |
| **0:40-1:00** | 20-30 | Mana pools full, frequent casting |
| **1:00-1:30** | 30-45 | Mid game, combo meters building |
| **1:30-2:00** | 45-60 | Pressure phase, frequent spells |
| **2:00-2:30** | 60-75 | Late game, ultimates available |
| **2:30-3:00** | 75-90 | Finisher phase, combo burst |

**Average Battle Duration:** 1:30-2:00 (45-60 intervals)

---

## 🎨 UI/UX Flow

### What Players See

```
╔═══════════════════════════════════╗
║  Opponent HP: ████████░░ (80%)    ║
║  Last Action: 🔥 Fireball          ║
╠═══════════════════════════════════╣
║                                    ║
║        [  2.0s  ]  ← Timer        ║
║           ⏱️                       ║
║                                    ║
║    🧙 Player   vs   🧝 Opponent   ║
║                                    ║
╠═══════════════════════════════════╣
║  HP: ████████████ (100%)          ║
║  Mana: 60/100  Energy: 50/50      ║
║                                    ║
║  [🔥][💧][⚡][🌍][🌙][✨]        ║
║   Fireball  Frost  Lightning...   ║
║                                    ║
║      [  ⚡ CHARGE +20 MANA  ]      ║
║                                    ║
║  Combo: ████░░░░░░ (40%)          ║
╚═══════════════════════════════════╝
```

### Player Actions

1. **Tap spell button** → Spell queues, button glows
2. **Wait for timer** → Countdown 2.0s → 0.0s
3. **Timer hits 0** → Action resolves
4. **Animation plays** → Damage/effects apply
5. **Next interval** → Timer resets to 2.0s

**If no spell selected:** Charge button pulses at 1.5s, auto-activates at 0s

---

## 🧠 Strategic Depth

### Decision Framework

Every 2 seconds, ask yourself:

1. **Do I need Mana?**
   - Yes → Charge
   - No → Consider spell

2. **What is opponent likely to do?**
   - Charge → Attack (they're defenseless)
   - Attack → Defend or Counter
   - Defend → Charge or setup combo

3. **Where's my combo meter?**
   - <50% → Consider Charging (build resources)
   - 50-75% → Cast to maintain combo
   - 75%+ → Aggressive casting for milestone

4. **What's my Mana pool?**
   - <30 → Must Charge soon
   - 30-60 → Flexible
   - 60+ → Can afford big spells

### Advanced Tactics

**Baiting:**
- Charge 3x in a row (lure opponent aggression)
- Interval 4: Cast counter spell
- Opponent's attack negated

**Bluffing:**
- Queue expensive spell (80 Mana)
- Cancel at last second (re-queue Charge)
- Opponent wasted defensive spell

**Tempo Control:**
- Control when combo meter spikes
- Force opponent to Charge (lose combo)
- Strike when they're low on Mana

---

## 🎯 Comparison to Other Games

| Game | Combat Style | Spell Brawler Similarity |
|------|--------------|--------------------------|
| **Clash Royale** | Real-time card deployment | ✅ Timed intervals, resource management |
| **Hearthstone Battlegrounds** | Simultaneous combat rounds | ✅ Both players act at once |
| **Auto Chess / TFT** | Prep phase → battle phase | ✅ Banking vs. spending resources |
| **Fighting Games** | Frame-based, simultaneous | ✅ Priority system, prediction |
| **Pokémon** | Turn-based, alternating | ❌ NOT like this (we're simultaneous) |
| **Slay the Spire** | Turn-based, sequential | ❌ NOT like this (we're real-time) |

---

## 📝 Key Takeaways

### What Makes Spell Brawler Unique

1. ⚡ **Fast-Paced**: 2-second decisions, 1-3 minute battles
2. 🔄 **Simultaneous**: Both players act at once (mind games)
3. ⚙️ **Charge Mechanic**: Banking vs. aggression strategic choice
4. 📊 **Combo System**: Decay on Charge, build on cast
5. 🎯 **Prediction**: Reading opponent patterns = skill expression

### It's NOT Turn-Based Because:

❌ Players don't alternate
❌ No waiting for opponent's turn
❌ Both actions execute simultaneously
❌ Constant 2-second action loop

### It's Real-Time Because:

✅ Continuous 2-second intervals
✅ Always making decisions (Charge or Cast)
✅ Fast-paced, reactive gameplay
✅ No downtime between actions

---

## 🚀 Implementation Priorities

### For Developers

**Critical Systems:**
1. **Interval Timer**: Precise 2-second loop (client + server sync)
2. **Action Queue**: Track queued actions per player
3. **Simultaneous Resolution**: Execute both actions at interval end
4. **Priority System**: Order animations by spell speed
5. **Charge Mechanic**: Default action if no spell queued

**UI/UX Critical:**
1. Countdown timer (2.0s → 0.0s, circular)
2. Charge button (large, bottom-center, auto-activates)
3. Queued action indicator (spell icon glows)
4. Audio cue at 1s remaining
5. Haptic feedback on resolution

**Testing Focus:**
1. Interval timing precision (±50ms tolerance)
2. Simultaneous damage application
3. Priority resolution order
4. Charge auto-activation
5. Combo meter decay/build rates

---

**This is the core of Spell Brawler's combat system. Master the 2-second loop, and you master the game.** ⚡🎮
