# JRPG Fighter - 3D Turn-Based Fighting Game

A 3D JRPG-style 1v1 fighting game built in Godot Engine with simultaneous turn-based combat mechanics inspired by Guilty Gear and Tekken.

## Features

- **Simultaneous Turn-Based Combat**: Both fighters act at the same time every 2 seconds
- **5 Action Types**: Light Attack, Heavy Attack, Block, Special, and Dodge
- **Rigged Stick Figure Characters**: Full skeletal animation with 12 bones
- **Dynamic Animations**: Fighting game-style skeletal animations for all actions
- **Real-time UI**: Health bars, turn timer, and action selection interface
- **Strategic Gameplay**: Block reduces damage, dodge negates it completely, different attack strengths
- **Visual Effects**: Particle effects for hits and impacts
- **3D Arena**: Grid-based fighting stage with dynamic camera

## Game Mechanics

### Combat System
- Every 2 seconds, both fighters execute their selected actions simultaneously
- Select your action before the timer runs out (last selected action is used if timer expires)
- Actions resolve at the same time, creating strategic depth

### Actions

1. **Light Attack** (Damage: 10)
   - Quick, reliable damage
   - Can be blocked for reduced damage

2. **Heavy Attack** (Damage: 20)
   - High damage with longer animation
   - Can be blocked for reduced damage
   - Both fighters using Heavy Attack causes clash damage

3. **Block**
   - Reduces incoming attack damage by 70%
   - Doesn't work against Special attacks
   - No damage output

4. **Special** (Damage: 30)
   - Highest damage attack
   - Cannot be blocked (full damage)
   - Use strategically

5. **Dodge**
   - Completely negates incoming damage
   - No damage output
   - High-risk, high-reward defensive option

## Controls

### Mouse Controls
Click the action buttons at the bottom of the screen:
- Light Attack
- Heavy Attack
- Block
- Special
- Dodge

### Keyboard Shortcuts
- **1** - Light Attack
- **2** - Heavy Attack
- **3** - Block
- **4** - Special
- **5** - Dodge
- **R** - Restart Battle

## Setup Instructions

1. **Install Godot Engine**
   - Download Godot 4.2 or later from [godotengine.org](https://godotengine.org/)
   - Use the "Forward+" rendering method for best 3D performance

2. **Open the Project**
   - Launch Godot Engine
   - Click "Import" and select the `project.godot` file in this folder
   - Click "Import & Edit"

3. **Run the Game**
   - Press **F5** or click the Play button in the top-right
   - The main battle scene will load automatically

## Project Structure

```
godot_fighter/
├── project.godot           # Godot project configuration
├── scenes/
│   └── main_battle.tscn   # Main battle scene
├── scripts/
│   ├── main_battle.gd     # Main scene controller
│   ├── fighter.gd         # Fighter class with stats and logic
│   ├── stick_figure.gd    # Rigged character with skeletal animations
│   ├── battle_manager.gd  # Combat system and turn management
│   ├── battle_ui.gd       # User interface controller
│   └── vfx_manager.gd     # Visual effects system
└── assets/
    ├── models/            # 3D models (auto-generated)
    ├── animations/        # Animation data
    └── effects/           # Particle effects
```

## Character System

### Stick Figure Anatomy
Each fighter is a fully rigged stick figure with:
- **12 Bones**: Hips, Spine, Chest, Head, Left/Right Upper/Lower Arms, Left/Right Upper/Lower Legs
- **Hierarchical Skeleton**: Parent-child bone relationships for natural movement
- **Procedural Meshes**: Cylinders for limbs, sphere for head
- **Full Skeletal Animation**: All actions use bone transformations

### Animation System
All 7 animations are created with keyframes:
1. **Idle**: Subtle breathing motion
2. **Light Attack**: Quick right-arm punch
3. **Heavy Attack**: Wind-up with full body rotation
4. **Block**: Cross arms defensively
5. **Dodge**: Side-lean evasion
6. **Hit**: Backward recoil
7. **Defeat**: Falling animation with collapsing legs

## Customization

### Adjusting Turn Interval
In `battle_manager.gd`, modify the `turn_interval` variable:
```gdscript
@export var turn_interval: float = 2.0  # Change to desired seconds
```

### Fighter Stats
In `fighter.gd`, adjust the exported variables:
```gdscript
@export var max_health: int = 100
@export var attack_power: int = 10
@export var defense: int = 5
```

### Customizing Stick Figure Animations
The `stick_figure.gd` file contains all skeletal animations. You can:
- Modify keyframes in animation functions (e.g., `create_light_attack_animation()`)
- Adjust bone positions and rotations for different poses
- Add new animations by creating new functions
- Change timing and easing of animations

Example: Modify light attack power
```gdscript
# In stick_figure.gd, create_light_attack_animation()
add_bone_track(anim, bone_right_upper_arm, [
    [0.0, Vector3.ZERO, Vector3.ZERO],
    [0.2, Vector3(0, 0, -0.5), Vector3(-0.8, 0, 1.5)],  # More forward motion
    [0.5, Vector3.ZERO, Vector3.ZERO]
])
```

## Extending the Game

### Adding New Fighters
1. Modify `fighter.gd` to add character-specific attributes
2. Create different colored or shaped meshes in `setup_fighter_model()`
3. Add character selection screen

### Enhanced AI
The enemy AI is in `battle_manager.gd` under `enemy_ai_select_action()`:
- Currently uses weighted random selection
- Can be extended with pattern recognition
- Add difficulty levels
- Implement counter-play strategies

### Multiplayer
To add local multiplayer:
1. Duplicate player controls in `battle_ui.gd`
2. Remove AI selection in `battle_manager.gd`
3. Split action button controls between two players

## Technical Details

- **Engine**: Godot 4.2+
- **Language**: GDScript
- **Rendering**: Forward+ (3D)
- **Resolution**: Adaptive (designed for 1080p+)
- **Platform**: Windows, macOS, Linux

## Tips for Playing

1. **Read Your Opponent**: Enemy AI has patterns based on health
2. **Block Smart**: Save blocking for when you predict a Heavy Attack
3. **Dodge Timing**: Use dodge when you expect a Special attack
4. **Attack Variety**: Mix up Light and Heavy attacks to keep AI guessing
5. **Special Attacks**: Cannot be blocked, use when enemy is defensive

## Performance Notes

- The game uses particle pooling for efficient VFX
- Animations are procedurally generated for quick iteration
- Grid rendering is optimized with immediate meshes
- Target: 60 FPS on modern hardware

## Future Enhancements

- [ ] Multiple character models with unique movesets
- [ ] Combo system for chained attacks
- [ ] Super meter and ultimate attacks
- [ ] Stage hazards and interactive environments
- [ ] Replay system
- [ ] Online multiplayer
- [ ] Story mode and AI tournament

## License

This project is open source and available for modification and learning purposes.

---

**Made with Godot Engine**
