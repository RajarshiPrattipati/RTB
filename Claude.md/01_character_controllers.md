# Character Controller Patterns for 3D Fighting Game

**Source:** Godot Demo Projects - 3D Platformer & Kinematic Character
**Relevance:** Upgrade from turn-based to real-time 3D movement for fighting game

## Overview
Your current game uses static Fighter nodes. These patterns show how to add real-time 3D movement, perfect for transitioning to a full 3D brawler with free movement.

---

## Pattern 1: CharacterBody3D Movement (Platformer Demo)

### Complete Implementation
```gdscript
class_name Player
extends CharacterBody3D

# Movement constants - TUNED FOR FIGHTING GAMES
const MAX_SPEED: float = 6.0        # Maximum movement speed
const TURN_SPEED: float = 40.0      # How fast character rotates to face movement direction
const JUMP_VELOCITY: float = 12.5   # Upward force for jumps
const ACCEL: float = 14.0           # Acceleration on ground
const DEACCEL: float = 14.0         # Deceleration when stopping
const AIR_ACCEL_FACTOR: float = 0.5 # Reduced acceleration in air (0.5 = 50% control)

var movement_dir := Vector3()
var jumping: bool = false

@onready var gravity: Vector3 = ProjectSettings.get_setting("physics/3d/default_gravity")
@onready var _camera := $Target/Camera3D

func _physics_process(delta: float):
    # Apply gravity every frame
    velocity += gravity * delta

    # Get camera-relative input
    var cam_basis := _camera.get_global_transform().basis
    var movement_vec2 := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
    var movement_direction := cam_basis * Vector3(movement_vec2.x, 0, movement_vec2.y)
    movement_direction = movement_direction.normalized()

    # Different movement logic for ground vs air
    if is_on_floor():
        handle_ground_movement(movement_direction, delta)
        handle_jumping()
    else:
        handle_air_movement(movement_direction, delta)

    # Built-in collision and movement
    move_and_slide()

func handle_ground_movement(movement_direction: Vector3, delta: float):
    var horizontal_velocity = Vector3(velocity.x, 0, velocity.z)
    var horizontal_speed = horizontal_velocity.length()

    if movement_direction.length() > 0.1:
        # Accelerate toward max speed
        horizontal_speed = min(horizontal_speed + ACCEL * delta, MAX_SPEED)

        # Smoothly rotate character to face movement direction
        var target_rotation = atan2(movement_direction.x, movement_direction.z)
        rotation.y = lerp_angle(rotation.y, target_rotation, TURN_SPEED * delta)

        # Apply movement
        velocity.x = movement_direction.x * horizontal_speed
        velocity.z = movement_direction.z * horizontal_speed
    else:
        # Decelerate when no input
        horizontal_speed = max(0, horizontal_speed - DEACCEL * delta)
        velocity.x = velocity.x * (horizontal_speed / max(horizontal_velocity.length(), 0.001))
        velocity.z = velocity.z * (horizontal_speed / max(horizontal_velocity.length(), 0.001))

func handle_air_movement(movement_direction: Vector3, delta: float):
    # Reduced control in air for realistic physics
    if movement_direction.length() > 0.1:
        velocity.x += movement_direction.x * ACCEL * AIR_ACCEL_FACTOR * delta
        velocity.z += movement_direction.z * ACCEL * AIR_ACCEL_FACTOR * delta

        # Clamp to max speed
        var horizontal_vel = Vector3(velocity.x, 0, velocity.z)
        if horizontal_vel.length() > MAX_SPEED:
            horizontal_vel = horizontal_vel.normalized() * MAX_SPEED
            velocity.x = horizontal_vel.x
            velocity.z = horizontal_vel.z

func handle_jumping():
    if Input.is_action_just_pressed("jump"):
        velocity.y = JUMP_VELOCITY
        jumping = true
```

### Integration with Your Fighter System
```gdscript
# In your fighter.gd, extend CharacterBody3D instead of Node3D
extends CharacterBody3D
class_name Fighter

# Add movement capabilities
const MOVE_SPEED = 4.0
const DODGE_SPEED = 8.0

func _physics_process(delta):
    # Your existing combat logic
    if not is_attacking:
        handle_fighter_movement(delta)

    move_and_slide()

func handle_fighter_movement(delta):
    var input_dir = Input.get_vector("left", "right", "forward", "back")
    var direction = (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()

    if direction:
        velocity.x = direction.x * MOVE_SPEED
        velocity.z = direction.z * MOVE_SPEED
    else:
        velocity.x = move_toward(velocity.x, 0, MOVE_SPEED)
        velocity.z = move_toward(velocity.z, 0, MOVE_SPEED)

# Upgrade dodge to actual movement
func execute_dodge():
    var dodge_dir = global_transform.basis.z  # Dodge backward
    velocity = -dodge_dir * DODGE_SPEED
    play_animation("dodge")
```

---

## Pattern 2: Camera-Relative Fighting Game Controls

### Fighting Game Camera Setup
```gdscript
# Camera controller for 1v1 fighting
extends Node3D

@export var camera_distance: float = 8.0
@export var camera_height: float = 3.0
@export var follow_speed: float = 5.0

@onready var camera: Camera3D = $Camera3D
var fighter1: Fighter
var fighter2: Fighter

func _process(delta):
    if fighter1 and fighter2:
        # Position camera to view both fighters
        var center = (fighter1.global_position + fighter2.global_position) / 2.0
        var distance_between = fighter1.global_position.distance_to(fighter2.global_position)

        # Adjust distance based on fighter separation
        var dynamic_distance = clamp(distance_between * 0.8, camera_distance, camera_distance * 2)

        # Position camera
        var target_pos = center + Vector3(0, camera_height, dynamic_distance)
        global_position = global_position.lerp(target_pos, follow_speed * delta)

        # Look at center
        camera.look_at(center, Vector3.UP)
```

---

## Pattern 3: Attack Movement and Locking

### Lunge Attack with Movement
```gdscript
# Add to your fighter.gd for attacks that move the character
var is_attacking: bool = false
var attack_move_speed: float = 0.0

func execute_light_attack():
    is_attacking = true
    attack_move_speed = 5.0  # Lunge forward during attack
    play_animation("light_attack")

    # Create tween for attack movement
    var tween = create_tween()
    tween.tween_property(self, "attack_move_speed", 0.0, 0.3)
    await tween.finished
    is_attacking = false

func _physics_process(delta):
    if is_attacking:
        # Move forward during attack
        velocity = -global_transform.basis.z * attack_move_speed
    elif not is_defeated:
        handle_normal_movement(delta)

    move_and_slide()

# Target locking for fighting games
var target_fighter: Fighter = null

func lock_onto_target(target: Fighter):
    target_fighter = target

func _process(delta):
    if target_fighter:
        # Always face opponent
        var direction = target_fighter.global_position - global_position
        direction.y = 0  # Keep rotation horizontal
        if direction.length() > 0.1:
            var target_rotation = atan2(direction.x, direction.z)
            rotation.y = lerp_angle(rotation.y, target_rotation, 10.0 * delta)
```

---

## Pattern 4: Input Buffer System

### Combat Input Buffering
```gdscript
# Essential for responsive fighting game feel
class_name InputBuffer

const BUFFER_WINDOW: float = 0.15  # 150ms buffer window

var buffered_actions: Array = []
var buffer_times: Array = []

func buffer_action(action: String):
    buffered_actions.append(action)
    buffer_times.append(Time.get_ticks_msec())

func get_buffered_action() -> String:
    var current_time = Time.get_ticks_msec()

    for i in range(buffered_actions.size() - 1, -1, -1):
        if (current_time - buffer_times[i]) / 1000.0 < BUFFER_WINDOW:
            var action = buffered_actions[i]
            buffered_actions.remove_at(i)
            buffer_times.remove_at(i)
            return action

    return ""

func clear_old_inputs():
    var current_time = Time.get_ticks_msec()
    for i in range(buffered_actions.size() - 1, -1, -1):
        if (current_time - buffer_times[i]) / 1000.0 >= BUFFER_WINDOW:
            buffered_actions.remove_at(i)
            buffer_times.remove_at(i)

# Usage in fighter
var input_buffer = InputBuffer.new()

func _input(event):
    if event.is_action_pressed("light_attack"):
        input_buffer.buffer_action("light_attack")
    elif event.is_action_pressed("heavy_attack"):
        input_buffer.buffer_action("heavy_attack")

func _physics_process(delta):
    input_buffer.clear_old_inputs()

    if not is_attacking:
        var action = input_buffer.get_buffered_action()
        if action:
            execute_action(action)
```

---

## Key Takeaways for Your Fighting Game

1. **Switch from Node3D to CharacterBody3D** for your Fighter class
2. **Use move_and_slide()** instead of manual position changes
3. **Implement camera-relative controls** for intuitive movement
4. **Add target locking** so fighters always face each other
5. **Use input buffering** for responsive combat feel
6. **Separate movement and combat states** with is_attacking flags

## Next Steps

1. Refactor `fighter.gd` to extend CharacterBody3D
2. Add movement controls in `_physics_process()`
3. Implement camera controller to follow both fighters
4. Add input buffer system for better responsiveness
5. Test movement + attack combinations

---

**File Location:** `godot_fighter/scripts/fighter.gd`
**Upgrade Priority:** HIGH - Foundation for real-time combat
