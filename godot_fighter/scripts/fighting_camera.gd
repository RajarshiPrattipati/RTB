extends Node3D
class_name FightingCamera

# Camera settings
@export var camera_distance: float = 3.0  # Distance behind player
@export var camera_height: float = 1.6  # Shoulder height
@export var shoulder_offset: float = 0.5  # Left shoulder offset
@export var camera_angle: float = 15.0  # Degrees down from horizontal
@export var follow_speed: float = 5.0
@export var zoom_speed: float = 3.0
@export var min_distance: float = 2.0
@export var max_distance: float = 5.0

var fighter1: Fighter
var fighter2: Fighter
var camera: Camera3D

func _ready():
	# Create camera
	camera = Camera3D.new()
	add_child(camera)
	camera.fov = 75

func set_fighters(f1: Fighter, f2: Fighter):
	fighter1 = f1
	fighter2 = f2

func _process(delta: float):
	if not fighter1 or not fighter2:
		return

	# Get direction from player to enemy
	var forward_direction = (fighter2.global_position - fighter1.global_position).normalized()

	# Dynamic camera distance based on fighter separation
	var distance_between = fighter1.global_position.distance_to(fighter2.global_position)
	var target_distance = clamp(
		distance_between * 0.3 + camera_distance * 0.5,
		min_distance,
		max_distance
	)

	# Smooth zoom
	camera_distance = lerp(camera_distance, target_distance, zoom_speed * delta)

	# Calculate left direction (perpendicular to forward, on XZ plane)
	var left_direction = Vector3(-forward_direction.z, 0, forward_direction.x).normalized()

	# Position camera behind player's left shoulder
	var camera_offset = (
		-forward_direction * camera_distance +  # Behind the player
		left_direction * shoulder_offset +       # To the left shoulder
		Vector3.UP * camera_height              # At shoulder height
	)

	# Target camera position relative to player
	var target_position = fighter1.global_position + camera_offset

	# Smooth follow
	global_position = global_position.lerp(target_position, follow_speed * delta)

	# Look at enemy's upper body/head area
	var look_target = fighter2.global_position + Vector3(0, 1.2, 0)
	camera.look_at(look_target, Vector3.UP)
