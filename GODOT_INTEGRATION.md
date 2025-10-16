# Godot Fighter Integration Guide

This document explains how the 3D Godot fighter game is integrated with the React application.

## Overview

When you click "Start Game" in the React app, it now launches the Godot 3D JRPG-style fighter game instead of the original battle system.

## Setup Instructions

### 1. Export the Godot Game to HTML5

You need to build the Godot game for web (HTML5) before it can run in the React app.

#### Option A: Using the Export Script (Recommended)

```bash
cd godot_fighter
./export_web.sh
```

This script will:
- Check if Godot is installed
- Export the game to `/public/godot/`
- Verify the export was successful

#### Option B: Manual Export in Godot Editor

1. Install **Godot 4.2+** from [godotengine.org](https://godotengine.org/)
2. Open the Godot project: `godot_fighter/project.godot`
3. Go to **Project → Export**
4. If "Web" preset doesn't exist, add it:
   - Click "Add..."
   - Select "Web"
5. Configure the export:
   - Export Path: `../public/godot/index.html`
6. Click **Export Project**

### 2. Verify the Export

After exporting, check that these files exist in `/public/godot/`:
- `index.html`
- `index.js`
- `index.wasm`
- `index.pck`

### 3. Run the React App

```bash
npm start
```

Navigate to the start screen and click "Start Game" - the Godot fighter will launch!

## How It Works

### Architecture

```
React App (Port 3000)
  ├── StartMenu Component
  │   └── "Start Game" button
  ├── App Component (mode: 'godot')
  │   └── GodotGame Component
  │       ├── Loads /public/godot/index.js
  │       ├── Initializes Godot Engine
  │       └── Renders game canvas
  └── Returns to menu on exit
```

### Component Flow

1. **StartMenu** (`src/components/StartMenu/StartMenu.js`)
   - User clicks "Start Game" button
   - Calls `onStartClick()` handler

2. **App** (`src/components/App/App.js`)
   - `handleStartBattle()` sets mode to `'godot'`
   - Renders `<GodotGame />` component
   - Hides navigation and UI elements

3. **GodotGame** (`src/components/GodotGame/GodotGame.js`)
   - Dynamically loads Godot engine script
   - Initializes canvas and engine
   - Shows loading progress
   - Handles errors gracefully
   - Provides "Exit Game" button

### State Management

The app uses mode-based routing:
- `'start'` - Main menu (shows StartMenu)
- `'godot'` - Godot fighter game (shows GodotGame)
- `'battle'` - Original battle system (still available)
- `'hero'` - Hero customization
- `'shop'` - Shop interface
- `'gameOver'` - End screen

## File Structure

```
RTB/
├── godot_fighter/              # Godot project
│   ├── project.godot           # Godot configuration
│   ├── export_presets.cfg      # Export settings for HTML5
│   ├── export_web.sh           # Build script
│   ├── scenes/
│   │   └── main_battle.tscn    # Main game scene
│   └── scripts/
│       ├── fighter.gd          # Fighter class
│       ├── battle_manager.gd   # Combat system
│       ├── battle_ui.gd        # Game UI
│       ├── main_battle.gd      # Scene controller
│       └── vfx_manager.gd      # Visual effects
│
├── public/
│   └── godot/                  # Exported game (created by export)
│       ├── index.html
│       ├── index.js            # Godot engine
│       ├── index.wasm          # WebAssembly binary
│       └── index.pck           # Game assets
│
└── src/
    └── components/
        ├── GodotGame/          # React component for Godot
        │   ├── GodotGame.js    # Main component
        │   ├── styles.module.css
        │   └── index.js
        ├── App/
        │   └── App.js          # Updated with Godot mode
        └── StartMenu/
            └── StartMenu.js    # Start button triggers Godot

```

## Godot Game Features

The embedded Godot game includes:

- **Turn-Based Combat**: Both fighters act simultaneously every 2 seconds
- **5 Actions**: Light Attack, Heavy Attack, Block, Special, Dodge
- **3D Graphics**: Animated fighters with procedural animations
- **Strategic Gameplay**: Block reduces damage, dodge negates it
- **Visual Effects**: Particle effects and screen flashes
- **AI Opponent**: Adaptive behavior based on health

### Controls in Godot Game

- **Mouse**: Click action buttons
- **Keyboard**:
  - 1 - Light Attack
  - 2 - Heavy Attack
  - 3 - Block
  - 4 - Special
  - 5 - Dodge
  - R - Restart

## Troubleshooting

### "Failed to load Godot game" Error

**Problem**: Game files not found

**Solution**:
1. Export the Godot project using `./export_web.sh`
2. Verify files exist in `/public/godot/`
3. Restart React dev server

### Game Not Loading / Black Screen

**Problem**: WASM/JS loading issues

**Solution**:
1. Check browser console for errors
2. Ensure you're using a modern browser (Chrome, Firefox, Edge)
3. Try clearing browser cache
4. Check if files are being served correctly: `http://localhost:3000/godot/index.js`

### Export Script Fails

**Problem**: Godot not found in PATH

**Solution**:
1. Install Godot 4.2+ from official website
2. Add Godot to your PATH:
   ```bash
   # macOS/Linux
   export PATH="/path/to/godot:$PATH"

   # Or create symlink
   ln -s /Applications/Godot.app/Contents/MacOS/Godot /usr/local/bin/godot
   ```
3. Try export script again

### Cross-Origin Issues

**Problem**: CORS errors loading WASM

**Solution**:
The React dev server should handle this automatically. If issues persist:
1. Ensure files are in `/public/godot/` (not `/src/`)
2. Restart React dev server
3. Check browser security settings

## Development Workflow

### Making Changes to the Godot Game

1. Open Godot project: `godot_fighter/project.godot`
2. Edit scenes/scripts
3. Test in Godot editor (F5)
4. Re-export to web: `./export_web.sh`
5. Refresh React app

### Making Changes to React Integration

1. Edit `src/components/GodotGame/GodotGame.js`
2. React hot-reload handles updates automatically
3. No need to re-export Godot game

## Performance Considerations

- **File Size**: WebAssembly build is ~20-30MB
- **Loading Time**: 2-5 seconds on fast connections
- **Runtime**: 60 FPS target on modern hardware
- **Memory**: ~100-200MB browser memory usage

## Future Enhancements

Potential improvements:
- [ ] Progressive loading with better feedback
- [ ] Save/load game state between sessions
- [ ] Two-player mode (both using React UI)
- [ ] Integration with React app's hero system
- [ ] Reward souls/items based on fight performance
- [ ] Multiple fighter characters from hero roster

## Technical Details

### Godot Engine Configuration

- **Renderer**: OpenGL ES 3.0 (gl_compatibility)
- **Export Format**: HTML5 (WebAssembly)
- **Canvas Size**: 1280x720 (responsive)
- **Audio**: Web Audio API
- **Input**: Keyboard + Mouse

### React Integration

- **Framework**: React 18
- **State**: Mode-based routing (no React Router)
- **Styling**: CSS Modules
- **Loading**: Dynamic script injection
- **Lifecycle**: useEffect for mount/unmount

## Resources

- [Godot Engine Documentation](https://docs.godotengine.org/)
- [Godot HTML5 Export Guide](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html)
- [React Documentation](https://react.dev/)

---

**Integration Created**: 2025-10-14
**Godot Version**: 4.2+
**React Version**: 18.2.0
