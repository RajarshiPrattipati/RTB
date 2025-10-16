# Combat Physics: Ragdoll & IK Systems

**Source:** Godot Demo Projects - Ragdoll Physics & Inverse Kinematics
**Relevance:** Add realistic knockdowns, limb positioning, and impact physics

## Overview
Upgrade your stick figure combat with ragdoll physics for defeats and IK for dynamic punch/kick targeting.

---

## Pattern 1: Ragdoll Physics for Knockouts

### Core Ragdoll Implementation
```gdscript
# ragdoll_system.gd - Based on Godot ragdoll demo
extends Node3D

const INITIAL_VELOCITY_STRENGTH = 0.5

# Spawn ragdoll on defeat
func create_ragdoll_from_fighter(fighter_position: Vector3, fighter_rotation: float, impact_direction: Vector3):
    # Load your ragdoll character scene
    var ragdoll = preload("res://characters/fighter_ragdoll.tscn").instantiate()

    # Position ragdoll where fighter was
    ragdoll.position = fighter_position + Vector3(0.0, 0.5, 0.0)
    ragdoll.rotation.y = fighter_rotation

    # Apply impact force for dramatic effect
    ragdoll.initial_velocity = impact_direction * INITIAL_VELOCITY_STRENGTH

    add_child(ragdoll)
    return ragdoll

# Make ragdoll respond to physics
func apply_ragdoll_impulse(ragdoll: PhysicalBone3D, impact_point: Vector3, force: Vector3):
    ragdoll.apply_impulse(force, impact_point)
```

### Ragdoll Character Scene Structure
```
FighterRagdoll (Node3D)
├── Skeleton3D
│   ├── PhysicalBone3D (Hips) - ROOT
│   ├── PhysicalBone3D (Spine)
│   ├── PhysicalBone3D (Chest)
│   ├── PhysicalBone3D (Head)
│   ├── PhysicalBone3D (LeftUpperArm)
│   ├── PhysicalBone3D (LeftLowerArm)
│   ├── PhysicalBone3D (RightUpperArm)
│   ├── PhysicalBone3D (RightLowerArm)
│   ├── PhysicalBone3D (LeftUpperLeg)
│   ├── PhysicalBone3D (LeftLowerLeg)
│   ├── PhysicalBone3D (RightUpperLeg)
│   └── PhysicalBone3D (RightLowerLeg)
└── MeshInstance3D (Visual representation)
```

### PhysicalBone3D Setup (for each bone)
```gdscript
# Configure each physical bone in editor or script
func setup_physical_bone(bone: PhysicalBone3D, mass: float = 1.0):
    bone.mass = mass
    bone.gravity_scale = 1.0
    bone.can_sleep = true

    # Add collision shape
    var collision = CollisionShape3D.new()
    var capsule = CapsuleShape3D.new()
    capsule.radius = 0.1
    capsule.height = 0.3
    collision.shape = capsule
    bone.add_child(collision)

    # Configure joint limits for realistic movement
    if bone.name.contains("Arm"):
        # Arms can swing more freely
        bone.joint_type = PhysicalBone3D.JOINT_TYPE_CONE
        bone.cone_twist_swing_span = deg_to_rad(90)
    elif bone.name.contains("Leg"):
        # Legs have hinge-like movement
        bone.joint_type = PhysicalBone3D.JOINT_TYPE_HINGE
        bone.hinge_angular_limit = deg_to_rad(120)
```

### Integration with Your Fighter Defeat System
```gdscript
# In fighter.gd
signal fighter_ragdolled(ragdoll_instance)

var ragdoll_scene = preload("res://characters/fighter_ragdoll.tscn")

func defeat():
    is_defeated = true

    # Get impact direction from last attack
    var impact_dir = global_transform.basis.z  # Direction facing

    # Replace fighter with ragdoll
    var ragdoll = ragdoll_scene.instantiate()
    get_parent().add_child(ragdoll)
    ragdoll.global_transform = global_transform

    # Apply knockout force
    var hips = ragdoll.get_node("Skeleton3D/Hips")
    if hips and hips is PhysicalBone3D:
        hips.apply_central_impulse(impact_dir * 5.0 + Vector3.UP * 2.0)

    # Hide original fighter
    visible = false
    fighter_ragdolled.emit(ragdoll)

    # Optional: Remove ragdoll after animation
    await get_tree().create_timer(5.0).timeout
    ragdoll.queue_free()
```

### Slow Motion Knockout Effect
```gdscript
# Dramatic slow-mo on knockout (from ragdoll demo)
func trigger_knockout_slowmo():
    Engine.time_scale = 0.25  # 25% speed

    # Restore normal speed after 1 real second (4 seconds game time)
    await get_tree().create_timer(1.0, false).timeout  # false = real-time timer
    Engine.time_scale = 1.0

# In battle_manager.gd when fighter is defeated
func on_fighter_defeated(fighter: Fighter):
    trigger_knockout_slowmo()
    # ... rest of defeat logic
```

---

## Pattern 2: Inverse Kinematics for Dynamic Combat

### SkeletonIK3D Setup for Punches/Kicks

```gdscript
# ik_combat_controller.gd
extends Node3D

@onready var skeleton: Skeleton3D = $Skeleton3D
@onready var right_arm_ik: SkeletonIK3D = $Skeleton3D/RightArmIK
@onready var left_arm_ik: SkeletonIK3D = $Skeleton3D/LeftArmIK
@onready var right_leg_ik: SkeletonIK3D = $Skeleton3D/RightLegIK

func _ready():
    setup_ik_chains()

func setup_ik_chains():
    # Right arm IK for punches
    right_arm_ik.root_bone = "RightUpperArm"
    right_arm_ik.tip_bone = "RightHand"
    right_arm_ik.target_node = $IKTargets/RightHandTarget
    right_arm_ik.start()

    # Left arm IK
    left_arm_ik.root_bone = "LeftUpperArm"
    left_arm_ik.tip_bone = "LeftHand"
    left_arm_ik.target_node = $IKTargets/LeftHandTarget
    left_arm_ik.start()

    # Right leg IK for kicks
    right_leg_ik.root_bone = "RightUpperLeg"
    right_leg_ik.tip_bone = "RightFoot"
    right_leg_ik.target_node = $IKTargets/RightFootTarget
    right_leg_ik.start()

# Dynamic punch that aims at opponent
func execute_targeted_punch(target_position: Vector3, use_right_hand: bool = true):
    var ik_target = $IKTargets/RightHandTarget if use_right_hand else $IKTargets/LeftHandTarget
    var ik_controller = right_arm_ik if use_right_hand else left_arm_ik

    # Move IK target to opponent's position
    var tween = create_tween()
    tween.tween_property(ik_target, "global_position", target_position, 0.2)
    tween.tween_property(ik_target, "global_position", ik_target.position, 0.3)

    await tween.finished

# Kick with IK
func execute_targeted_kick(target_position: Vector3):
    var kick_target = $IKTargets/RightFootTarget

    # Lift leg and extend toward target
    var start_pos = kick_target.global_position
    var tween = create_tween()

    # Raise leg
    tween.tween_property(kick_target, "global_position",
        start_pos + Vector3.UP * 0.5, 0.15)

    # Extend toward target
    tween.tween_property(kick_target, "global_position",
        target_position + Vector3.UP * 0.3, 0.2)

    # Retract
    tween.tween_property(kick_target, "global_position",
        start_pos, 0.25)
```

### Scene Setup for IK
```
Fighter (CharacterBody3D)
├── Skeleton3D
│   ├── [All bones]
│   ├── RightArmIK (SkeletonIK3D)
│   ├── LeftArmIK (SkeletonIK3D)
│   └── RightLegIK (SkeletonIK3D)
├── IKTargets (Node3D)
│   ├── RightHandTarget (Marker3D)
│   ├── LeftHandTarget (Marker3D)
│   └── RightFootTarget (Marker3D)
└── StickFigureMesh (MeshInstance3D)
```

### Combining IK with Your Existing Animations

```gdscript
# Enhanced fighter.gd with IK
@onready var ik_controller: Node3D = $IKController
var target_opponent: Fighter = null

func execute_action() -> Dictionary:
    # ... existing code ...

    match current_action:
        ActionType.LIGHT_ATTACK:
            if target_opponent and ik_controller:
                # Use IK to aim punch at opponent's chest
                var target_pos = target_opponent.global_position + Vector3.UP * 1.2
                await ik_controller.execute_targeted_punch(target_pos, true)
            else:
                play_animation("light_attack")
            result.damage = attack_power

        ActionType.HEAVY_ATTACK:
            if target_opponent and ik_controller:
                # Heavy punch aims for head
                var target_pos = target_opponent.global_position + Vector3.UP * 1.5
                await ik_controller.execute_targeted_punch(target_pos, true)
            else:
                play_animation("heavy_attack")
            result.damage = attack_power * 2

    return result
```

---

## Pattern 3: Impact Physics and Knockback

### Physics-Based Hit Reactions
```gdscript
# Add to fighter.gd for physics knockback
var knockback_velocity: Vector3 = Vector3.ZERO
const KNOCKBACK_FRICTION: float = 5.0

func take_damage(damage: int, attacker_action: ActionType, attacker_position: Vector3):
    # ... existing damage calculation ...

    if final_damage > 0 and not is_dodging:
        # Calculate knockback direction
        var knockback_dir = (global_position - attacker_position).normalized()
        knockback_dir.y = 0  # Keep horizontal

        # Knockback strength based on damage
        var knockback_strength = final_damage * 0.2
        if attacker_action == ActionType.HEAVY_ATTACK:
            knockback_strength *= 2.0

        # Apply knockback
        knockback_velocity = knockback_dir * knockback_strength

        # Camera shake
        apply_camera_shake(final_damage * 0.05)

func _physics_process(delta):
    # Apply and reduce knockback
    if knockback_velocity.length() > 0.1:
        velocity += knockback_velocity
        knockback_velocity = knockback_velocity.lerp(Vector3.ZERO, KNOCKBACK_FRICTION * delta)

    # ... rest of movement code ...
    move_and_slide()

func apply_camera_shake(intensity: float):
    var camera = get_viewport().get_camera_3d()
    if camera and camera.has_method("shake"):
        camera.shake(intensity, 0.2)
```

### Camera Shake System
```gdscript
# camera_controller.gd
extends Camera3D

var shake_intensity: float = 0.0
var shake_duration: float = 0.0
var shake_timer: float = 0.0
var original_position: Vector3

func shake(intensity: float, duration: float):
    shake_intensity = intensity
    shake_duration = duration
    shake_timer = 0.0
    original_position = position

func _process(delta):
    if shake_timer < shake_duration:
        shake_timer += delta
        var progress = shake_timer / shake_duration
        var current_intensity = shake_intensity * (1.0 - progress)

        # Random shake offset
        position = original_position + Vector3(
            randf_range(-current_intensity, current_intensity),
            randf_range(-current_intensity, current_intensity),
            randf_range(-current_intensity, current_intensity)
        )
    elif shake_intensity > 0:
        position = original_position
        shake_intensity = 0.0
```

---

## Key Implementation Steps

### Step 1: Create Ragdoll Character
1. Duplicate your StickFigure scene
2. Add PhysicalBone3D for each bone
3. Configure joint limits and collision shapes
4. Test by dropping from height in editor

### Step 2: Add IK to Fighter
1. Add SkeletonIK3D nodes for arms and legs
2. Create IK target markers
3. Modify attack functions to use IK
4. Test with stationary target

### Step 3: Integrate Knockback Physics
1. Switch Fighter to CharacterBody3D
2. Add knockback_velocity variable
3. Calculate knockback in take_damage()
4. Apply in _physics_process()

---

## Performance Tips

- **Pool ragdolls** - Don't create/destroy, reuse instances
- **Limit active ragdolls** - Max 2-3 on screen at once
- **Disable IK when not attacking** - Call stop() on SkeletonIK3D
- **Use lower physics substeps** - 1-2 for ragdolls is enough

---

**Upgrade Priority:** MEDIUM-HIGH
**Implementation Time:** 4-6 hours for basic ragdoll, 2-3 hours for IK
**Visual Impact:** VERY HIGH - Makes combat feel dramatically better
