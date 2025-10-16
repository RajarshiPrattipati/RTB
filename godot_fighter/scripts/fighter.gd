@tool
extends CharacterBody3D
class_name Fighter

signal health_changed(new_health, max_health)
signal action_selected(action_type)
signal animation_started(anim_name)
signal fighter_defeated

enum ActionType {
	LIGHT_ATTACK,
	HEAVY_ATTACK,
	BLOCK,
	SPECIAL,
	DODGE
}

# Fighter stats
@export var max_health: int = 100
@export var attack_power: int = 10
@export var defense: int = 5
@export var fighter_name: String = "Fighter"

# Movement constants
const MOVE_SPEED: float = 4.0
const DODGE_SPEED: float = 8.0
const ATTACK_LUNGE_SPEED: float = 5.0
const TURN_SPEED: float = 10.0

var current_health: int
var current_action: ActionType = ActionType.LIGHT_ATTACK
var is_blocking: bool = false
var is_dodging: bool = false
var is_defeated: bool = false
var is_attacking: bool = false
var attack_move_speed: float = 0.0
var target_fighter: Fighter = null

# Animation components
var stick_figure: StickFigure
@onready var animation_player: AnimationPlayer
@onready var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")

func _ready():
	if not Engine.is_editor_hint():
		current_health = max_health
	setup_fighter_model()

func _physics_process(delta: float):
	if Engine.is_editor_hint():
		return

	# Apply gravity
	if not is_on_floor():
		velocity.y -= gravity * delta
	else:
		velocity.y = 0

	# Handle movement
	if is_attacking:
		# Move forward during attack
		velocity.x = -global_transform.basis.z.x * attack_move_speed
		velocity.z = -global_transform.basis.z.z * attack_move_speed
	elif is_dodging:
		# Move backward during dodge
		var dodge_dir = global_transform.basis.z
		velocity.x = dodge_dir.x * DODGE_SPEED
		velocity.z = dodge_dir.z * DODGE_SPEED
	elif not is_defeated:
		handle_movement(delta)

	# Face target if locked on
	if target_fighter and not is_defeated:
		face_target(delta)

	move_and_slide()

func handle_movement(delta: float):
	# Basic movement (can be controlled by AI or player input)
	var movement = Vector3.ZERO

	# Decelerate when not moving
	velocity.x = move_toward(velocity.x, 0, MOVE_SPEED)
	velocity.z = move_toward(velocity.z, 0, MOVE_SPEED)

func face_target(delta: float):
	# Always face opponent
	var direction = target_fighter.global_position - global_position
	direction.y = 0  # Keep rotation horizontal
	if direction.length() > 0.1:
		var target_rotation = atan2(direction.x, direction.z)
		rotation.y = lerp_angle(rotation.y, target_rotation, TURN_SPEED * delta)

func setup_fighter_model():
	# Check if stick figure already exists as a child (from scene)
	stick_figure = get_node_or_null("StickFigure")

	# Create if it doesn't exist
	if not stick_figure:
		stick_figure = StickFigure.new()
		add_child(stick_figure)

		if Engine.is_editor_hint():
			# In editor, set owner so it's saved with the scene
			stick_figure.owner = get_tree().edited_scene_root

	# Wait for stick figure to be ready
	if not Engine.is_editor_hint():
		await stick_figure.ready
		animation_player = stick_figure.animation_player

func select_action(action: ActionType):
	current_action = action
	action_selected.emit(action)

func execute_action() -> Dictionary:
	if is_defeated:
		return {"type": ActionType.BLOCK, "damage": 0, "animation": "idle"}

	var result = {
		"type": current_action,
		"damage": 0,
		"animation": ""
	}

	is_blocking = false
	is_dodging = false

	match current_action:
		ActionType.LIGHT_ATTACK:
			result.damage = attack_power
			result.animation = "light_attack"
			execute_attack(0.5, ATTACK_LUNGE_SPEED)
		ActionType.HEAVY_ATTACK:
			result.damage = attack_power * 2
			result.animation = "heavy_attack"
			execute_attack(0.8, ATTACK_LUNGE_SPEED * 1.5)
		ActionType.BLOCK:
			is_blocking = true
			result.animation = "block"
		ActionType.SPECIAL:
			result.damage = attack_power * 3
			result.animation = "heavy_attack"
			execute_attack(1.0, ATTACK_LUNGE_SPEED * 2)
		ActionType.DODGE:
			is_dodging = true
			result.animation = "dodge"
			execute_dodge()

	play_animation(result.animation)
	animation_started.emit(result.animation)
	return result

func execute_attack(duration: float, lunge_speed: float):
	is_attacking = true
	attack_move_speed = lunge_speed

	# Create tween for attack movement
	var tween = create_tween()
	tween.tween_property(self, "attack_move_speed", 0.0, duration)
	await tween.finished
	is_attacking = false

func execute_dodge():
	# Dodge lasts 0.4 seconds
	await get_tree().create_timer(0.4).timeout
	is_dodging = false

func lock_onto_target(target: Fighter):
	target_fighter = target

func take_damage(damage: int, attacker_action: ActionType, attacker_position: Vector3 = Vector3.ZERO):
	if is_defeated:
		return

	var final_damage = damage

	# Apply blocking reduction
	if is_blocking and attacker_action in [ActionType.LIGHT_ATTACK, ActionType.HEAVY_ATTACK]:
		final_damage = int(damage * 0.3)

	# Dodge negates damage
	if is_dodging:
		final_damage = 0
		play_animation("dodge")
		return

	# Apply defense
	final_damage = max(0, final_damage - defense)

	current_health -= final_damage
	current_health = max(0, current_health)

	health_changed.emit(current_health, max_health)

	if final_damage > 0:
		play_animation("hit")
		# Apply knockback
		apply_knockback(attacker_position, final_damage)

	if current_health <= 0:
		defeat()

func apply_knockback(attacker_pos: Vector3, damage: int):
	if attacker_pos == Vector3.ZERO:
		return

	# Calculate knockback direction
	var knockback_dir = (global_position - attacker_pos).normalized()
	knockback_dir.y = 0

	# Knockback strength based on damage
	var knockback_strength = damage * 0.1
	knockback_strength = clamp(knockback_strength, 1.0, 5.0)

	# Apply knockback velocity
	velocity.x = knockback_dir.x * knockback_strength
	velocity.z = knockback_dir.z * knockback_strength

func defeat():
	is_defeated = true
	play_animation("defeat")
	fighter_defeated.emit()

func play_animation(anim_name: String):
	if stick_figure:
		stick_figure.play_animation(anim_name)

func reset_fighter():
	current_health = max_health
	is_defeated = false
	is_blocking = false
	is_dodging = false
	current_action = ActionType.LIGHT_ATTACK
	health_changed.emit(current_health, max_health)
	play_animation("idle")
