@tool
extends Node3D
class_name StickFigure

var skeleton: Skeleton3D
var animation_player: AnimationPlayer

# Bone indices
var bone_hips: int
var bone_spine: int
var bone_chest: int
var bone_head: int
var bone_left_upper_arm: int
var bone_left_lower_arm: int
var bone_right_upper_arm: int
var bone_right_lower_arm: int
var bone_left_upper_leg: int
var bone_left_lower_leg: int
var bone_right_upper_leg: int
var bone_right_lower_leg: int

func _ready():
	# Prevent duplicate creation in editor
	if skeleton:
		return

	create_skeleton()
	create_body_parts()
	create_animations()

func create_skeleton():
	skeleton = Skeleton3D.new()
	add_child(skeleton)

	if Engine.is_editor_hint():
		skeleton.owner = get_tree().edited_scene_root

	# Create bones
	bone_hips = skeleton.add_bone("Hips")
	bone_spine = skeleton.add_bone("Spine")
	bone_chest = skeleton.add_bone("Chest")
	bone_head = skeleton.add_bone("Head")
	bone_left_upper_arm = skeleton.add_bone("LeftUpperArm")
	bone_left_lower_arm = skeleton.add_bone("LeftLowerArm")
	bone_right_upper_arm = skeleton.add_bone("RightUpperArm")
	bone_right_lower_arm = skeleton.add_bone("RightLowerArm")
	bone_left_upper_leg = skeleton.add_bone("LeftUpperLeg")
	bone_left_lower_leg = skeleton.add_bone("LeftLowerLeg")
	bone_right_upper_leg = skeleton.add_bone("RightUpperLeg")
	bone_right_lower_leg = skeleton.add_bone("RightLowerLeg")

	# Set up bone hierarchy and rest poses
	# Hips (root)
	skeleton.set_bone_rest(bone_hips, Transform3D(Basis(), Vector3(0, 1.0, 0)))

	# Spine (child of hips)
	skeleton.set_bone_parent(bone_spine, bone_hips)
	skeleton.set_bone_rest(bone_spine, Transform3D(Basis(), Vector3(0, 0.3, 0)))

	# Chest (child of spine)
	skeleton.set_bone_parent(bone_chest, bone_spine)
	skeleton.set_bone_rest(bone_chest, Transform3D(Basis(), Vector3(0, 0.3, 0)))

	# Head (child of chest)
	skeleton.set_bone_parent(bone_head, bone_chest)
	skeleton.set_bone_rest(bone_head, Transform3D(Basis(), Vector3(0, 0.4, 0)))

	# Left arm
	skeleton.set_bone_parent(bone_left_upper_arm, bone_chest)
	skeleton.set_bone_rest(bone_left_upper_arm, Transform3D(Basis(), Vector3(-0.3, 0.3, 0)))
	skeleton.set_bone_parent(bone_left_lower_arm, bone_left_upper_arm)
	skeleton.set_bone_rest(bone_left_lower_arm, Transform3D(Basis(), Vector3(-0.35, 0, 0)))

	# Right arm
	skeleton.set_bone_parent(bone_right_upper_arm, bone_chest)
	skeleton.set_bone_rest(bone_right_upper_arm, Transform3D(Basis(), Vector3(0.3, 0.3, 0)))
	skeleton.set_bone_parent(bone_right_lower_arm, bone_right_upper_arm)
	skeleton.set_bone_rest(bone_right_lower_arm, Transform3D(Basis(), Vector3(0.35, 0, 0)))

	# Left leg
	skeleton.set_bone_parent(bone_left_upper_leg, bone_hips)
	skeleton.set_bone_rest(bone_left_upper_leg, Transform3D(Basis(), Vector3(-0.15, -0.1, 0)))
	skeleton.set_bone_parent(bone_left_lower_leg, bone_left_upper_leg)
	skeleton.set_bone_rest(bone_left_lower_leg, Transform3D(Basis(), Vector3(0, -0.4, 0)))

	# Right leg
	skeleton.set_bone_parent(bone_right_upper_leg, bone_hips)
	skeleton.set_bone_rest(bone_right_upper_leg, Transform3D(Basis(), Vector3(0.15, -0.1, 0)))
	skeleton.set_bone_parent(bone_right_lower_leg, bone_right_upper_leg)
	skeleton.set_bone_rest(bone_right_lower_leg, Transform3D(Basis(), Vector3(0, -0.4, 0)))

func create_body_parts():
	var material = StandardMaterial3D.new()
	material.albedo_color = Color(0.9, 0.9, 0.9)
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	# Head
	create_limb(bone_head, 0.15, 0.2, material, Color(1.0, 0.9, 0.8))

	# Torso parts
	create_limb(bone_spine, 0.08, 0.3, material)
	create_limb(bone_chest, 0.1, 0.3, material)

	# Arms
	create_limb(bone_left_upper_arm, 0.06, 0.35, material)
	create_limb(bone_left_lower_arm, 0.05, 0.35, material)
	create_limb(bone_right_upper_arm, 0.06, 0.35, material)
	create_limb(bone_right_lower_arm, 0.05, 0.35, material)

	# Legs
	create_limb(bone_left_upper_leg, 0.08, 0.4, material)
	create_limb(bone_left_lower_leg, 0.06, 0.4, material)
	create_limb(bone_right_upper_leg, 0.08, 0.4, material)
	create_limb(bone_right_lower_leg, 0.06, 0.4, material)

func create_limb(bone_idx: int, radius: float, height: float, base_mat: StandardMaterial3D, color: Color = Color.WHITE):
	# Create BoneAttachment3D to properly attach mesh to bone
	var bone_attachment = BoneAttachment3D.new()
	bone_attachment.bone_name = skeleton.get_bone_name(bone_idx)
	bone_attachment.bone_idx = bone_idx
	skeleton.add_child(bone_attachment)

	if Engine.is_editor_hint():
		bone_attachment.owner = get_tree().edited_scene_root

	# Create mesh instance
	var mesh_instance = MeshInstance3D.new()

	# Use sphere for head, cylinder for limbs
	if skeleton.get_bone_name(bone_idx) == "Head":
		var sphere = SphereMesh.new()
		sphere.radius = radius
		sphere.height = radius * 2
		mesh_instance.mesh = sphere
	else:
		var cylinder = CylinderMesh.new()
		cylinder.top_radius = radius
		cylinder.bottom_radius = radius
		cylinder.height = height
		mesh_instance.mesh = cylinder
		mesh_instance.position.y = height / 2

	# Apply color
	var mat = base_mat.duplicate()
	mat.albedo_color = color
	mesh_instance.set_surface_override_material(0, mat)

	# Attach mesh to bone attachment
	bone_attachment.add_child(mesh_instance)

	if Engine.is_editor_hint():
		mesh_instance.owner = get_tree().edited_scene_root

func create_animations():
	animation_player = AnimationPlayer.new()
	skeleton.add_child(animation_player)

	if Engine.is_editor_hint():
		animation_player.owner = get_tree().edited_scene_root

	# Create animation library
	var library = AnimationLibrary.new()
	animation_player.add_animation_library("", library)

	# Create all animations
	create_idle_animation(library)
	create_light_attack_animation(library)
	create_heavy_attack_animation(library)
	create_block_animation(library)
	create_dodge_animation(library)
	create_hit_animation(library)
	create_defeat_animation(library)

	# Only play in game, not in editor
	if not Engine.is_editor_hint():
		animation_player.play("idle")

func create_idle_animation(library: AnimationLibrary):
	var anim = Animation.new()
	anim.length = 2.0
	anim.loop_mode = Animation.LOOP_LINEAR

	# Slight breathing motion in chest
	add_bone_track(anim, bone_chest, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[1.0, Vector3(0, 0.05, 0), Vector3.ZERO],
		[2.0, Vector3.ZERO, Vector3.ZERO]
	])

	library.add_animation("idle", anim)

func create_light_attack_animation(library: AnimationLibrary):
	var anim = Animation.new()
	anim.length = 0.5

	# Punch with right arm
	add_bone_track(anim, bone_right_upper_arm, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.2, Vector3(0, 0, -0.3), Vector3(-0.5, 0, 1.2)],
		[0.5, Vector3.ZERO, Vector3.ZERO]
	])

	add_bone_track(anim, bone_right_lower_arm, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.2, Vector3.ZERO, Vector3(0, 0, -0.8)],
		[0.5, Vector3.ZERO, Vector3.ZERO]
	])

	# Lean forward slightly
	add_bone_track(anim, bone_chest, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.2, Vector3(0, 0, -0.1), Vector3(0.3, 0, 0)],
		[0.5, Vector3.ZERO, Vector3.ZERO]
	])

	library.add_animation("light_attack", anim)

func create_heavy_attack_animation(library: AnimationLibrary):
	var anim = Animation.new()
	anim.length = 0.8

	# Wind up and big punch
	add_bone_track(anim, bone_right_upper_arm, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.3, Vector3(0, 0, 0.2), Vector3(-1.0, 0, -0.5)],
		[0.5, Vector3(0, 0, -0.5), Vector3(0.8, 0, 1.5)],
		[0.8, Vector3.ZERO, Vector3.ZERO]
	])

	add_bone_track(anim, bone_right_lower_arm, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.3, Vector3.ZERO, Vector3(0, 0, 0.5)],
		[0.5, Vector3.ZERO, Vector3(0, 0, -1.2)],
		[0.8, Vector3.ZERO, Vector3.ZERO]
	])

	# Full body rotation
	add_bone_track(anim, bone_hips, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.3, Vector3.ZERO, Vector3(0, -0.3, 0)],
		[0.5, Vector3.ZERO, Vector3(0, 0.5, 0)],
		[0.8, Vector3.ZERO, Vector3.ZERO]
	])

	library.add_animation("heavy_attack", anim)

func create_block_animation(library: AnimationLibrary):
	var anim = Animation.new()
	anim.length = 0.3

	# Cross arms in front
	add_bone_track(anim, bone_left_upper_arm, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.3, Vector3(0.2, 0, -0.3), Vector3(0, 0, 0.8)]
	])

	add_bone_track(anim, bone_right_upper_arm, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.3, Vector3(-0.2, 0, -0.3), Vector3(0, 0, -0.8)]
	])

	# Crouch slightly
	add_bone_track(anim, bone_hips, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.3, Vector3(0, -0.2, 0), Vector3.ZERO]
	])

	library.add_animation("block", anim)

func create_dodge_animation(library: AnimationLibrary):
	var anim = Animation.new()
	anim.length = 0.4

	# Lean to the side
	add_bone_track(anim, bone_hips, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.2, Vector3(0.5, 0, 0), Vector3(0, 0, 0.5)],
		[0.4, Vector3.ZERO, Vector3.ZERO]
	])

	add_bone_track(anim, bone_chest, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.2, Vector3.ZERO, Vector3(0, 0, -0.8)],
		[0.4, Vector3.ZERO, Vector3.ZERO]
	])

	library.add_animation("dodge", anim)

func create_hit_animation(library: AnimationLibrary):
	var anim = Animation.new()
	anim.length = 0.3

	# Recoil backward
	add_bone_track(anim, bone_chest, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.1, Vector3(0, 0, 0.2), Vector3(-0.3, 0, 0)],
		[0.3, Vector3.ZERO, Vector3.ZERO]
	])

	add_bone_track(anim, bone_head, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.1, Vector3.ZERO, Vector3(-0.2, 0, 0)],
		[0.3, Vector3.ZERO, Vector3.ZERO]
	])

	library.add_animation("hit", anim)

func create_defeat_animation(library: AnimationLibrary):
	var anim = Animation.new()
	anim.length = 1.0

	# Fall over
	add_bone_track(anim, bone_hips, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.5, Vector3(0, -0.5, 0), Vector3(0, 0, 1.2)],
		[1.0, Vector3(0, -0.8, 0), Vector3(0, 0, 1.57)]
	])

	# Legs collapse
	add_bone_track(anim, bone_left_upper_leg, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.5, Vector3.ZERO, Vector3(1.0, 0, 0)]
	])

	add_bone_track(anim, bone_right_upper_leg, [
		[0.0, Vector3.ZERO, Vector3.ZERO],
		[0.5, Vector3.ZERO, Vector3(1.0, 0, 0)]
	])

	library.add_animation("defeat", anim)

func add_bone_track(anim: Animation, bone_idx: int, keyframes: Array):
	var bone_name = "Skeleton3D:" + skeleton.get_bone_name(bone_idx)

	# Position track
	var pos_track = anim.add_track(Animation.TYPE_POSITION_3D)
	anim.track_set_path(pos_track, bone_name)

	# Rotation track
	var rot_track = anim.add_track(Animation.TYPE_ROTATION_3D)
	anim.track_set_path(rot_track, bone_name)

	for keyframe in keyframes:
		var time = keyframe[0]
		var position = keyframe[1]
		var rotation = keyframe[2]

		anim.track_insert_key(pos_track, time, position)
		anim.track_insert_key(rot_track, time, Quaternion.from_euler(rotation))

func play_animation(anim_name: String):
	if animation_player and animation_player.has_animation(anim_name):
		animation_player.stop()
		animation_player.play(anim_name)
