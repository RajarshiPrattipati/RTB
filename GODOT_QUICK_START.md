# Quick Start: Godot Fighter Integration

## TL;DR

1. **Build the Godot game**:
   ```bash
   npm run build:godot
   ```

2. **Start the React app**:
   ```bash
   npm start
   ```

3. **Play**: Click "Start Game" button → 3D Fighter launches!

---

## What Changed

When you click **"Start Game"**, the app now launches a **3D JRPG-style fighter game** built in Godot Engine!

### Game Features
- ⚔️ Simultaneous turn-based combat (2-second intervals)
- 🎮 5 actions: Light Attack, Heavy Attack, Block, Special, Dodge
- 🎨 3D animated fighters with Guilty Gear/Tekken-style movement
- 🤖 AI opponent with adaptive behavior
- 💥 Particle effects and visual polish

---

## First Time Setup

### Prerequisites
- **Godot 4.2+** ([Download here](https://godotengine.org/))

### Build the Game

```bash
# Option 1: npm script (easiest)
npm run build:godot

# Option 2: Direct script
./build_godot_game.sh

# Option 3: Manual in Godot
# 1. Open godot_fighter/project.godot
# 2. Project → Export → Web
# 3. Export to ../public/godot/index.html
```

---

## How to Play

### Controls

**Mouse**: Click action buttons

**Keyboard**:
- `1` - Light Attack (10 damage)
- `2` - Heavy Attack (20 damage)
- `3` - Block (70% damage reduction)
- `4` - Special (30 damage, unblockable)
- `5` - Dodge (negate all damage)
- `R` - Restart match

### Strategy
- Actions execute **simultaneously** every 2 seconds
- Select before timer runs out
- Block reduces normal attacks
- Dodge avoids everything but deals no damage
- Special attacks can't be blocked
- AI gets defensive when low HP

---

## Troubleshooting

### Error: "Failed to load Godot game"
Run `npm run build:godot` first

### Game Won't Load
1. Check files exist: `public/godot/index.js`, `index.wasm`, `index.pck`
2. Restart: `npm start`

### Godot Not Found
Install Godot 4.2+ and add to PATH:
```bash
# macOS
ln -s /Applications/Godot.app/Contents/MacOS/Godot /usr/local/bin/godot
```

---

## File Structure

```
RTB/
├── godot_fighter/        # Godot source
├── public/godot/        # Built game (auto-generated)
└── src/components/
    ├── GodotGame/       # React wrapper
    └── App/             # Routes to Godot
```

---

## More Info

- **Full Guide**: `GODOT_INTEGRATION.md`
- **Godot Game Docs**: `godot_fighter/README.md`

---

**Have fun fighting!** 🥊
