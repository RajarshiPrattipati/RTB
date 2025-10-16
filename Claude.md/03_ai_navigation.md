# AI Navigation Systems for Fighting Game

**Source:** Godot Demo Projects - 3D Navigation
**Relevance:** Enemy AI pathfinding, arena awareness, positioning strategy

## Overview
Upgrade your enemy AI from simple random selection to intelligent movement and positioning using NavigationAgent3D.

---

## Pattern 1: NavigationAgent3D for Smart Enemy Movement

### Core Navigation Implementation
```gdscript
# ai_fighter.gd - Extends your Fighter class
extends Fighter
class_name AIFighter

@export var move_speed: float = 4.0
@export var optimal_attack_distance: float = 2.0  # Preferred distance from opponent
@export var retreat_distance: float = 4.0  # Distance when low on health

@onready var nav_agent: NavigationAgent3D = $NavigationAgent3D
var target_fighter: Fighter = null
var current_strategy: String = "aggressive"

func _ready():
    super._ready()  # Call parent ready

    # Configure navigation agent
    nav_agent.max_speed = move_speed
    nav_agent.path_desired_distance = 0.5
    nav_agent.target_desired_distance = 0.5

    # Navigation callbacks
    nav_agent.velocity_computed.connect(_on_velocity_computed)

func _physics_process(delta):
    if is_defeated or not target_fighter:
        return

    # Update AI strategy based on health
    update_combat_strategy()

    # Navigate to strategic position
    navigate_to_position(delta)

    # Select action when in range
    if is_in_attack_range():
        select_combat_action()

func navigate_to_position(delta):
    if nav_agent.is_navigation_finished():
        return

    # Get next position on path
    var next_position = nav_agent.get_next_path_position()
    var current_position = global_position

    # Calculate movement direction
    var new_velocity = (next_position - current_position).normalized() * move_speed

    # Use navigation agent's velocity computation for smooth avoidance
    nav_agent.set_velocity(new_velocity)

func _on_velocity_computed(safe_velocity: Vector3):
    # Apply the computed safe velocity
    velocity = safe_velocity
    move_and_slide()

    # Face movement direction
    if velocity.length() > 0.1:
        var look_direction = Vector2(velocity.z, velocity.x).angle()
        rotation.y = lerp_angle(rotation.y, look_direction, 10.0 * get_physics_process_delta_time())

func update_combat_strategy():
    var health_percent = float(current_health) / float(max_health)

    if health_percent < 0.3:
        current_strategy = "defensive"
        set_strategic_position(get_retreat_position())
    elif health_percent < 0.6:
        current_strategy = "balanced"
        set_strategic_position(get_flanking_position())
    else:
        current_strategy = "aggressive"
        set_strategic_position(get_approach_position())

func get_approach_position() -> Vector3:
    # Move to optimal attack distance
    var direction = global_position.direction_to(target_fighter.global_position)
    return target_fighter.global_position - direction * optimal_attack_distance

func get_retreat_position() -> Vector3:
    # Retreat to safe distance
    var direction = global_position.direction_to(target_fighter.global_position)
    return target_fighter.global_position - direction * retreat_distance

func get_flanking_position() -> Vector3:
    # Circle around opponent
    var direction = global_position.direction_to(target_fighter.global_position)
    var perpendicular = Vector3(-direction.z, 0, direction.x)  # 90-degree rotation

    return target_fighter.global_position - direction * optimal_attack_distance + perpendicular * 1.5

func set_strategic_position(target_pos: Vector3):
    nav_agent.set_target_position(target_pos)

func is_in_attack_range() -> bool:
    if not target_fighter:
        return false
    return global_position.distance_to(target_fighter.global_position) <= optimal_attack_distance + 0.5
```

---

## Pattern 2: Advanced Combat AI Decision Making

### State Machine for Combat AI
```gdscript
# ai_combat_brain.gd
class_name AICombatBrain

enum AIState {
    POSITIONING,  # Moving to strategic position
    ATTACKING,    # Executing attack
    DEFENDING,    # Blocking or dodging
    RECOVERING    # After being hit
}

var current_state: AIState = AIState.POSITIONING
var fighter: AIFighter
var opponent: Fighter

# AI reaction times (makes AI feel more human)
var reaction_delay: float = 0.2
var last_decision_time: float = 0.0

# Pattern recognition
var opponent_last_actions: Array[Fighter.ActionType] = []
const PATTERN_MEMORY_SIZE = 5

func _init(ai_fighter: AIFighter, target: Fighter):
    fighter = ai_fighter
    opponent = target

func update(delta: float) -> void:
    match current_state:
        AIState.POSITIONING:
            handle_positioning()
        AIState.ATTACKING:
            handle_attacking()
        AIState.DEFENDING:
            handle_defending()
        AIState.RECOVERING:
            handle_recovering()

func handle_positioning():
    # Wait for good position and timing
    if fighter.is_in_attack_range():
        # Check if it's a good time to attack
        if should_attack():
            current_state = AIState.ATTACKING
        elif should_defend():
            current_state = AIState.DEFENDING

func should_attack() -> bool:
    # Don't attack too frequently
    var time_since_decision = Time.get_ticks_msec() / 1000.0 - last_decision_time
    if time_since_decision < reaction_delay:
        return false

    # Attack if opponent is vulnerable
    if opponent.is_blocking:
        return randf() > 0.7  # Sometimes try to break block
    if opponent.current_health < fighter.current_health:
        return randf() > 0.3  # More aggressive when winning

    return randf() > 0.5

func should_defend() -> bool:
    # Predict opponent's attack based on pattern
    var predicted_action = predict_opponent_action()

    if predicted_action in [Fighter.ActionType.HEAVY_ATTACK, Fighter.ActionType.SPECIAL]:
        return randf() > 0.3  # Likely to defend against strong attacks

    if fighter.current_health < 30:
        return randf() > 0.4  # More defensive when low health

    return randf() > 0.7

func predict_opponent_action() -> Fighter.ActionType:
    if opponent_last_actions.size() < 2:
        return Fighter.ActionType.LIGHT_ATTACK  # Default guess

    # Simple pattern detection: if opponent used same move twice, expect it again
    if opponent_last_actions[-1] == opponent_last_actions[-2]:
        return opponent_last_actions[-1]

    # If opponent used heavy attack last, expect light attack (cooldown)
    if opponent_last_actions[-1] == Fighter.ActionType.HEAVY_ATTACK:
        return Fighter.ActionType.LIGHT_ATTACK

    return Fighter.ActionType.LIGHT_ATTACK

func select_counter_action(predicted_action: Fighter.ActionType) -> Fighter.ActionType:
    match predicted_action:
        Fighter.ActionType.LIGHT_ATTACK:
            return Fighter.ActionType.HEAVY_ATTACK  # Trade favorably
        Fighter.ActionType.HEAVY_ATTACK:
            return Fighter.ActionType.DODGE if randf() > 0.5 else Fighter.ActionType.BLOCK
        Fighter.ActionType.SPECIAL:
            return Fighter.ActionType.DODGE  # Can't block specials
        Fighter.ActionType.BLOCK:
            return Fighter.ActionType.SPECIAL  # Break through block
        Fighter.ActionType.DODGE:
            return Fighter.ActionType.BLOCK  # Safe option

    return Fighter.ActionType.LIGHT_ATTACK

func handle_attacking():
    var predicted_action = predict_opponent_action()
    var counter = select_counter_action(predicted_action)

    fighter.select_action(counter)
    last_decision_time = Time.get_ticks_msec() / 1000.0

    current_state = AIState.POSITIONING

func handle_defending():
    # Choose between block and dodge
    var defense_action = Fighter.ActionType.BLOCK

    var predicted = predict_opponent_action()
    if predicted == Fighter.ActionType.SPECIAL:
        defense_action = Fighter.ActionType.DODGE

    fighter.select_action(defense_action)
    current_state = AIState.POSITIONING

func handle_recovering():
    # After being hit, be more defensive
    if randf() > 0.5:
        fighter.select_action(Fighter.ActionType.BLOCK)
    else:
        fighter.select_action(Fighter.ActionType.DODGE)

    current_state = AIState.POSITIONING

func record_opponent_action(action: Fighter.ActionType):
    opponent_last_actions.append(action)
    if opponent_last_actions.size() > PATTERN_MEMORY_SIZE:
        opponent_last_actions.pop_front()
```

---

## Pattern 3: Path Visualization for Debugging

### Draw AI Movement Paths
```gdscript
# line3d.gd - From navigation demo
class_name Line3D
extends MeshInstance3D

var _points: PackedVector3Array = []

func draw_path(path: PackedVector3Array):
    _points = path
    update_mesh()

func update_mesh():
    if _points.size() < 2:
        mesh = null
        return

    var arrays = []
    arrays.resize(Mesh.ARRAY_MAX)

    var vertices = PackedVector3Array()
    var colors = PackedColorArray()

    for i in range(_points.size() - 1):
        vertices.append(_points[i])
        vertices.append(_points[i + 1])
        colors.append(Color.GREEN)
        colors.append(Color.GREEN)

    arrays[Mesh.ARRAY_VERTEX] = vertices
    arrays[Mesh.ARRAY_COLOR] = colors

    var array_mesh = ArrayMesh.new()
    array_mesh.add_surface_from_arrays(Mesh.PRIMITIVE_LINES, arrays)

    mesh = array_mesh

# Usage in AIFighter
var path_visualizer: Line3D

func _ready():
    super._ready()

    if OS.is_debug_build():
        path_visualizer = Line3D.new()
        add_child(path_visualizer)
        path_visualizer.set_as_top_level(true)

func set_strategic_position(target_pos: Vector3):
    nav_agent.set_target_position(target_pos)

    # Visualize path in debug mode
    if path_visualizer:
        var path = NavigationServer3D.map_get_path(
            get_world_3d().get_navigation_map(),
            global_position,
            target_pos,
            true  # optimize
        )
        path_visualizer.draw_path(path)
```

---

## Pattern 4: Arena-Aware AI

### Avoid Arena Edges and Hazards
```gdscript
# arena_awareness.gd
class_name ArenaAwareness

var arena_center: Vector3
var arena_radius: float
var hazard_zones: Array[Area3D] = []

func _init(center: Vector3, radius: float):
    arena_center = center
    arena_radius = radius

func is_position_safe(pos: Vector3) -> bool:
    # Check if position is within arena bounds
    if pos.distance_to(arena_center) > arena_radius - 1.0:
        return false

    # Check hazard zones
    for hazard in hazard_zones:
        if hazard.overlaps_point(pos):
            return false

    return true

func get_safe_position_near(target: Vector3) -> Vector3:
    if is_position_safe(target):
        return target

    # Move position toward arena center
    var direction = arena_center.direction_to(target)
    var safe_distance = arena_radius - 1.5

    return arena_center + direction * safe_distance

# Usage in AIFighter
var arena_awareness: ArenaAwareness

func set_strategic_position(target_pos: Vector3):
    if arena_awareness:
        target_pos = arena_awareness.get_safe_position_near(target_pos)

    nav_agent.set_target_position(target_pos)
```

---

## Pattern 5: Difficulty Levels

### Adjustable AI Difficulty
```gdscript
# ai_difficulty.gd
enum Difficulty {
    EASY,
    MEDIUM,
    HARD,
    EXPERT
}

class DifficultySettings:
    var reaction_time: float
    var pattern_recognition: bool
    var optimal_play_chance: float  # 0.0 to 1.0
    var mistake_chance: float

    func _init(difficulty: Difficulty):
        match difficulty:
            Difficulty.EASY:
                reaction_time = 0.8
                pattern_recognition = false
                optimal_play_chance = 0.3
                mistake_chance = 0.3

            Difficulty.MEDIUM:
                reaction_time = 0.4
                pattern_recognition = true
                optimal_play_chance = 0.6
                mistake_chance = 0.15

            Difficulty.HARD:
                reaction_time = 0.2
                pattern_recognition = true
                optimal_play_chance = 0.85
                mistake_chance = 0.05

            Difficulty.EXPERT:
                reaction_time = 0.1
                pattern_recognition = true
                optimal_play_chance = 0.95
                mistake_chance = 0.01

# Apply difficulty in AIFighter
var difficulty_settings: DifficultySettings

func set_difficulty(difficulty: Difficulty):
    difficulty_settings = DifficultySettings.new(difficulty)
    reaction_delay = difficulty_settings.reaction_time

func select_combat_action():
    # Easy AI makes more mistakes
    if randf() < difficulty_settings.mistake_chance:
        # Random action (mistake)
        var random_action = randi() % Fighter.ActionType.size()
        select_action(random_action)
        return

    # Use combat brain for smart decisions
    if combat_brain and difficulty_settings.pattern_recognition:
        combat_brain.update(get_physics_process_delta_time())
    else:
        # Simple random weighted selection for easy mode
        select_weighted_random_action()
```

---

## Integration with Your Current System

### Updated battle_manager.gd
```gdscript
# Replace simple enemy AI with navigation-based AI
func setup_fighters():
    player_fighter = $Fighter1
    enemy_fighter = $Fighter2  # Now an AIFighter

    # Setup AI
    if enemy_fighter is AIFighter:
        enemy_fighter.target_fighter = player_fighter
        enemy_fighter.set_difficulty(AIDifficulty.Difficulty.MEDIUM)

        # Setup arena awareness
        enemy_fighter.arena_awareness = ArenaAwareness.new(
            Vector3.ZERO,  # Arena center
            10.0  # Arena radius
        )
```

---

## Key Takeaways

1. **NavigationAgent3D** handles pathfinding automatically
2. **State machine** makes AI behavior more organized
3. **Pattern recognition** makes AI feel smarter
4. **Difficulty levels** provide player progression
5. **Arena awareness** prevents AI from falling off edges

---

**Upgrade Priority:** MEDIUM - Enhances single-player experience
**Implementation Time:** 3-4 hours for basic nav, 4-6 hours for advanced AI brain
**Player Impact:** HIGH - Makes single-player mode actually challenging and fun
