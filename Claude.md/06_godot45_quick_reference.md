# Godot 4.5 Quick Reference for Fighting Games

**Purpose:** Fast reference for common patterns and Godot 4.5 specific features

---

## Quick Project Setup

### Input Actions Setup (Project Settings → Input Map)
```
# Movement
move_forward: W, Up Arrow
move_back: S, Down Arrow
move_left: A, Left Arrow
move_right: D, Right Arrow

# Combat
light_attack: J, Mouse Button Left
heavy_attack: K, Mouse Button Right
block: L, Shift
special: U, Q
dodge: I, Space

# System
jump: Space
pause: Escape
restart: R
toggle_debug_stats: F3
```

---

## Node Structure Quick Templates

### Fighter Character (Real-time 3D Brawler)
```
Fighter (CharacterBody3D)
├── CollisionShape3D
├── Skeleton3D
│   ├── [Bones...]
│   ├── RightArmIK (SkeletonIK3D)
│   ├── LeftArmIK (SkeletonIK3D)
│   └── RightLegIK (SkeletonIK3D)
├── MeshInstance3D
├── AnimationPlayer
├── AnimationTree
├── Hitbox (Area3D)
│   └── CollisionShape3D
├── Hurtbox (Area3D)
│   └── CollisionShape3D
├── NavigationAgent3D (for AI)
├── HealthBar (Node3D)
│   └── Sprite3D
└── VFXContainer (Node3D)
```

### Battle Arena Scene
```
BattleArena (Node3D)
├── WorldEnvironment
├── DirectionalLight3D
├── SpotLight3D (Rim1)
├── SpotLight3D (Rim2)
├── Camera3D
├── Floor (StaticBody3D)
│   ├── MeshInstance3D
│   └── CollisionShape3D
├── Walls (StaticBody3D)
├── NavigationRegion3D
│   └── NavigationMesh
├── Fighter1 (Fighter)
├── Fighter2 (AIFighter)
├── BattleManager
├── UI (CanvasLayer)
│   ├── HealthBars
│   ├── ActionButtons
│   └── TurnTimer
└── VFXManager
```

---

## Essential Code Snippets

### CharacterBody3D Movement Template
```gdscript
extends CharacterBody3D

const SPEED = 5.0
const JUMP_VELOCITY = 4.5
var gravity = ProjectSettings.get_setting("physics/3d/default_gravity")

func _physics_process(delta):
    # Gravity
    if not is_on_floor():
        velocity.y -= gravity * delta

    # Jump
    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = JUMP_VELOCITY

    # Movement
    var input_dir = Input.get_vector("move_left", "move_right", "move_forward", "move_back")
    var direction = (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()

    if direction:
        velocity.x = direction.x * SPEED
        velocity.z = direction.z * SPEED
    else:
        velocity.x = move_toward(velocity.x, 0, SPEED)
        velocity.z = move_toward(velocity.z, 0, SPEED)

    move_and_slide()
```

### Camera Follow Two Fighters
```gdscript
extends Camera3D

@export var target1: Node3D
@export var target2: Node3D
@export var height: float = 5.0
@export var distance: float = 10.0
@export var smooth_speed: float = 5.0

func _process(delta):
    if not target1 or not target2:
        return

    # Midpoint between fighters
    var midpoint = (target1.global_position + target2.global_position) / 2.0

    # Distance-based zoom
    var fighter_distance = target1.global_position.distance_to(target2.global_position)
    var dynamic_distance = clamp(fighter_distance * 0.8, distance, distance * 2)

    # Target position
    var target_pos = midpoint + Vector3(0, height, dynamic_distance)

    # Smooth follow
    global_position = global_position.lerp(target_pos, smooth_speed * delta)

    # Look at midpoint
    look_at(midpoint, Vector3.UP)
```

### Hit Detection (Area3D)
```gdscript
# On Hitbox Area3D
extends Area3D

signal hit_detected(target)

func _ready():
    area_entered.connect(_on_area_entered)

func _on_area_entered(area: Area3D):
    # Check if it's an enemy hurtbox
    if area.is_in_group("hurtbox"):
        var target = area.get_parent()  # Get fighter
        hit_detected.emit(target)

# On Fighter
@onready var hitbox = $Hitbox

func _ready():
    hitbox.hit_detected.connect(_on_hit_detected)

func _on_hit_detected(target):
    if target.has_method("take_damage"):
        target.take_damage(attack_power, ActionType.LIGHT_ATTACK, global_position)
```

### Tween Animations (Godot 4.x Style)
```gdscript
# Simple position tween
func move_to_position(target_pos: Vector3, duration: float = 0.5):
    var tween = create_tween()
    tween.tween_property(self, "global_position", target_pos, duration)
    tween.set_trans(Tween.TRANS_CUBIC)
    tween.set_ease(Tween.EASE_OUT)
    await tween.finished

# Parallel tweens
func pulse_effect():
    var tween = create_tween()
    tween.set_parallel(true)

    tween.tween_property(self, "scale", Vector3.ONE * 1.2, 0.2)
    tween.tween_property(material, "emission_energy", 2.0, 0.2)

    tween.chain()  # Next tweens run sequentially

    tween.tween_property(self, "scale", Vector3.ONE, 0.3)
    tween.tween_property(material, "emission_energy", 0.0, 0.3)

# Tween with callbacks
func attack_sequence():
    var tween = create_tween()
    tween.tween_callback(play_attack_sound)
    tween.tween_property(self, "rotation_degrees:y", 360, 0.5)
    tween.tween_callback(spawn_hit_effect)
```

### Signals (Best Practices)
```gdscript
# Define signals at top of script
signal health_changed(new_health: int, max_health: int)
signal fighter_defeated()
signal action_executed(action_type: int, damage: int)

# Emit signals
func take_damage(amount: int):
    current_health -= amount
    health_changed.emit(current_health, max_health)

    if current_health <= 0:
        fighter_defeated.emit()

# Connect signals (Godot 4.x style)
func _ready():
    fighter.health_changed.connect(_on_fighter_health_changed)
    fighter.fighter_defeated.connect(_on_fighter_defeated)

func _on_fighter_health_changed(hp: int, max_hp: int):
    health_bar.value = float(hp) / float(max_hp)

func _on_fighter_defeated():
    game_over_screen.show()
```

---

## Godot 4.5 New Features for Fighting Games

### 1. Improved Physics Interpolation
```gdscript
# Enable in Project Settings → Physics → Common → Physics Interpolation = true

# Or per-object:
func _ready():
    physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
```

### 2. Enhanced NavigationServer3D
```gdscript
# Better pathfinding API
func get_path_to_target(start: Vector3, end: Vector3) -> PackedVector3Array:
    var map = get_world_3d().get_navigation_map()
    return NavigationServer3D.map_get_path(
        map,
        start,
        end,
        true,  # optimize
        1  # navigation layers
    )
```

### 3. GPUParticles3D Improvements
```gdscript
# Particle trails now built-in
var particles = GPUParticles3D.new()
particles.trail_enabled = true
particles.trail_lifetime = 0.3
```

### 4. Better Animation Blending
```gdscript
# AnimationTree improvements
@onready var anim_tree: AnimationTree = $AnimationTree
@onready var state_machine = anim_tree.get("parameters/playback")

func play_animation(anim_name: String):
    state_machine.travel(anim_name)

func blend_to_attack(blend_amount: float):
    anim_tree.set("parameters/AttackBlend/blend_amount", blend_amount)
```

---

## Common Godot 4.x Gotchas

### ❌ Don't Do This (Godot 3.x style)
```gdscript
# OLD WAY
$AnimationPlayer.play("attack")
connect("body_entered", self, "_on_body_entered")
var direction = Vector3(0, 0, 1).rotated(Vector3.UP, rotation.y)
```

### ✅ Do This (Godot 4.x style)
```gdscript
# NEW WAY
$AnimationPlayer.play("attack")
body_entered.connect(_on_body_entered)
var direction = Vector3(0, 0, 1).rotated(Vector3.UP, rotation.y)  # Actually same!
```

### Property Access Changes
```gdscript
# Godot 4.x uses properties more consistently
# OLD: get_viewport().get_camera()
# NEW:
get_viewport().get_camera_3d()

# OLD: OS.get_screen_size()
# NEW:
DisplayServer.window_get_size()

# OLD: Input.get_action_strength()
# NEW: (same)
Input.get_action_strength("move_forward")
```

---

## Performance Tips Checklist

### Rendering
```gdscript
# Use Forward+ for complex scenes, Mobile for simple ones
# Project Settings → Rendering → Renderer → Rendering Method

# Occlusion culling (Godot 4.x)
# Add OccluderInstance3D nodes for arena walls

# SDFGI for dynamic GI (expensive!)
var env = Environment.new()
env.sdfgi_enabled = true
env.sdfgi_use_occlusion = true
```

### Physics
```gdscript
# Reduce physics substeps if not needed
# Project Settings → Physics → 3D → Solver → Solver Iterations = 4 (default: 8)

# Use correct physics layers
# Only check collisions you need!
collision_mask = 0b00001100  # Only layers 3 and 4
```

### Memory
```gdscript
# Preload resources
const ATTACK_SOUND = preload("res://sounds/attack.wav")
const HIT_PARTICLES = preload("res://effects/hit_sparks.tscn")

# Use object pools for frequently spawned objects
var particle_pool: Array[GPUParticles3D] = []
```

---

## Debugging Tools

### Print Debugging
```gdscript
print("Value: ", some_value)
print_debug("Debug info: ", value)  # Includes file and line number
push_error("Error occurred!")  # Shows in debugger errors tab
push_warning("Warning!")  # Shows in debugger warnings tab
```

### Debug Drawing
```gdscript
# Enable visible collision shapes in editor: Debug → Visible Collision Shapes

# Debug draw in code (must be in _process or _physics_process)
func _process(delta):
    # Draw line
    DebugDraw3D.draw_line(global_position, target.global_position, Color.RED)

    # Draw box
    DebugDraw3D.draw_box(global_position, Vector3.ONE, Color.GREEN)
```

### Remote Scene Tree
```gdscript
# When running game, click "Remote" tab in Scene panel
# Live inspect/edit running game nodes
```

---

## Export Settings for Web (Your Use Case)

### HTML5 Export Preset
```
# In Project → Export
1. Add "Web" preset
2. Set export path: build/index.html
3. Enable "Export as thread" for better performance
4. Set SharedArrayBuffer support for threading

# Required headers for SharedArrayBuffer:
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### Optimize for Web
```gdscript
# Detect web platform
if OS.has_feature("web"):
    # Reduce quality for web
    graphics_settings.apply_preset("medium")

# Reduce build size
# Project Settings → Rendering → Textures → Canvas Textures → Default Texture Filter = Linear
# Compress textures in Import settings
```

---

## Useful Code Templates

### Singleton (Autoload)
```gdscript
# global_game_state.gd (add to AutoLoad in Project Settings)
extends Node

var player_score: int = 0
var current_level: int = 1
var game_settings: Dictionary = {}

signal score_changed(new_score: int)

func add_score(amount: int):
    player_score += amount
    score_changed.emit(player_score)

# Access from anywhere:
# GlobalGameState.add_score(100)
```

### Save/Load System
```gdscript
const SAVE_PATH = "user://savegame.save"

func save_game():
    var save_data = {
        "player_score": GlobalGameState.player_score,
        "level": GlobalGameState.current_level,
        "settings": settings_dict
    }

    var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
    file.store_var(save_data)
    file.close()

func load_game():
    if not FileAccess.file_exists(SAVE_PATH):
        return

    var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
    var save_data = file.get_var()
    file.close()

    GlobalGameState.player_score = save_data.player_score
    GlobalGameState.current_level = save_data.level
```

---

## Resources and Learning

- **Official Docs:** https://docs.godotengine.org/en/stable/
- **Godot 4 Changes:** https://docs.godotengine.org/en/stable/tutorials/migrating/upgrading_to_godot_4.html
- **Performance:** https://docs.godotengine.org/en/stable/tutorials/performance/index.html
- **3D Graphics:** https://docs.godotengine.org/en/stable/tutorials/3d/index.html

---

**Keep This Doc Handy:** Bookmark for quick reference during development!
