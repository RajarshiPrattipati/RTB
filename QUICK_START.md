# 🎮 Quick Start Guide - Spell Brawler

## 🚀 Getting Started

### Development Server is Running!
Your game is live at: **http://localhost:3000**

Open your browser and navigate to that URL to play!

---

## 🎯 First Time Playing?

### What Happens Automatically:
1. **Hero Created** - You get a default hero automatically
2. **8 Starter Spells** - Added to your collection
3. **Starting Currency:**
   - 💰 100 Gold
   - 👻 10 Souls
   - 💎 50 Gems

---

## 📝 How to Play

### Step 1: Set Up Your Build
1. Click **"Manage Hero"** on the main menu
2. Click on empty spell slots to select spells
3. Choose from your 8 starter spells
4. **Lock all 6 slots** before you can battle
5. ✅ "Ready for Battle" will appear when complete

### Step 2: Battle
1. Return to main menu
2. Click **"Start Battle"**
3. Fight using Attack, Magic, or Heal
4. **Win:** Earn +1 Soul, Gold, and XP
5. **Lose (HP=0):** Hero dies and needs revival

### Step 3: Revival (if needed)
1. If your hero dies, a modal appears
2. Revival costs: **10 Souls** (first time), then 25, then 50
3. Need more Souls? Click **"Go to Shop"**

### Step 4: Shop
1. **Soul Shop** - Convert Gold → Souls
   - Best value: 100 Souls = 7,000 Gold (30% off!)
2. **Item Shop** - Buy Spell Unlockers (100 Gems each)
   - Use to unlock and change locked spell slots

---

## 🎲 Your 8 Starter Spells

1. **Fireball** 🔥 - 40 damage, Fire element
2. **Healing Light** ✨ - 35 heal, Light element
3. **Ice Shard** ❄️ - 35 damage, Ice element
4. **Lightning Bolt** ⚡ - 45 damage, Lightning element
5. **Stone Shield** 🛡️ - 50 shield, Earth element
6. **Water Wave** 🌊 - 38 damage, Water element
7. **Wind Slash** 💨 - 42 damage, Air element
8. **Dark Curse** 🌑 - Debuff, Dark element

---

## 💡 Pro Tips

### Economy Management:
- **Earn Souls:** Win battles (+1 per kill)
- **Convert Gold:** 100 Gold = 1 Soul (bulk discounts available)
- **Save Gems:** Only use for Spell Unlockers (they're rare!)

### Build Strategy:
- **Lock spells carefully!** You need 100 Gems to unlock later
- Balance damage spells with healing
- Consider elemental variety

### Revival Strategy:
- First death: Only 10 Souls (cheap!)
- Second death: 25 Souls (moderate)
- Third+ death: 50 Souls (expensive)
- Keep some Souls in reserve for emergencies

---

## 🔧 Commands

### Start the game:
```bash
npm start
```

### Build for production:
```bash
npm run build
```

### Stop the dev server:
Press `Ctrl+C` in the terminal

---

## 📊 Game Progression

### Current Features:
✅ Hero Death/Revival System
✅ Spell Lock/Unlock System
✅ Soul Economy
✅ Shop (Soul & Item)
✅ Build Management (Primary build)
✅ 8 Starter Spells
✅ Auto-save every 60 seconds

### Coming Soon (Phase 5):
- Secondary Build (unlocks at Level 15)
- More spells
- Daily/Weekly missions
- Achievements
- Animations & sound effects

---

## 🐛 Troubleshooting

### Game won't start?
```bash
npm install
npm start
```

### Lost your save?
- Saves are in browser localStorage
- Clear cache = lost save
- Use Shop to rebuild quickly

### Can't start battle?
- Check that all 6 spell slots are locked
- Look for ⚠️ "Lock all 6 spell slots to battle" warning

### Hero is dead?
- Click the revival prompt
- Need Souls? Go to Shop → Soul Shop
- Convert Gold to Souls

---

## 🎉 Have Fun!

The game is fully functional and ready to play. Experiment with different spell combinations, manage your economy wisely, and try to survive as long as possible!

**Good luck, and may your hero never fall!** ⚔️✨
