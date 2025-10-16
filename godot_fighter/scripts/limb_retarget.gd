extends Node3D
class_name LimbRetarget

## Retargets limb animations from Y-Bot skeleton to Ogrork model
## Focuses on arms and legs for combat animations

@export var source_skeleton_path: NodePath = NodePath("../Armature/GeneralSkeleton")
@export var enable_arms: bool = true
@export var enable_legs: bool = true
@export var enable_spine: bool = true
@export var rotation_damping: float = 1.0  ## Adjust if rotations are too extreme

var source_skeleton: Skeleton3D
var target_skeleton: Skeleton3D

# Bone mappings for limbs
var limb_bone_map: Dictionary = {}

# Key bones to map for combat animations
const LIMB_BONES = {
	"LeftUpperArm": ["mixamorig:LeftArm", "LeftArm", "LeftShoulder"],
	"LeftLowerArm": ["mixamorig:LeftForeArm", "LeftForeArm", "LeftLowerArm"],
	"LeftHand": ["mixamorig:LeftHand", "LeftHand"],
	"RightUpperArm": ["mixamorig:RightArm", "RightArm", "RightShoulder"],
	"RightLowerArm": ["mixamorig:RightForeArm", "RightForeArm", "RightLowerArm"],
	"RightHand": ["mixamorig:RightHand", "RightHand"],
	"LeftUpperLeg": ["mixamorig:LeftUpLeg", "LeftUpLeg", "LeftThigh"],
	"LeftLowerLeg": ["mixamorig:LeftLeg", "LeftLeg"],
	"LeftFoot": ["mixamorig:LeftFoot", "LeftFoot"],
	"RightUpperLeg": ["mixamorig:RightUpLeg", "RightUpLeg", "RightThigh"],
	"RightLowerLeg": ["mixamorig:RightLeg", "RightLeg"],
	"RightFoot": ["mixamorig:RightFoot", "RightFoot"],
	"Hips": ["mixamorig:Hips", "Hips", "pelvis"],
	"Spine": ["mixamorig:Spine", "Spine"],
	"Chest": ["mixamorig:Spine1", "Spine1", "Chest"],
	"UpperChest": ["mixamorig:Spine2", "Spine2", "UpperChest"],
	"Neck": ["mixamorig:Neck", "Neck"],
	"Head": ["mixamorig:Head", "Head"],
}

func _ready():
	call_deferred("_initialize")

func _initialize():
	# Find skeletons
	if source_skeleton_path:
		source_skeleton = get_node_or_null(source_skeleton_path)

	target_skeleton = _find_skeleton_in_children(self)

	if not source_skeleton:
		push_error("LimbRetarget: Source skeleton not found at: " + str(source_skeleton_path))
		return

	if not target_skeleton:
		push_error("LimbRetarget: Target skeleton not found in children")
		return

	print("\n=== LimbRetarget Initialization ===")
	print("Source: ", source_skeleton.name, " (", source_skeleton.get_bone_count(), " bones)")
	print("Target: ", target_skeleton.name, " (", target_skeleton.get_bone_count(), " bones)")

	# Build bone mapping
	_build_limb_mapping()

	print("Mapped ", limb_bone_map.size(), " limb bones")
	print("===================================\n")

func _find_skeleton_in_children(node: Node) -> Skeleton3D:
	if node is Skeleton3D:
		return node

	for child in node.get_children():
		var result = _find_skeleton_in_children(child)
		if result:
			return result

	return null

func _build_limb_mapping():
	# Map each limb bone from source to target
	for source_bone_name in LIMB_BONES:
		var target_names = LIMB_BONES[source_bone_name]

		# Find source bone
		var source_idx = source_skeleton.find_bone(source_bone_name)

		# Try target bone names
		var target_idx = -1
		for target_name in target_names:
			target_idx = target_skeleton.find_bone(target_name)
			if target_idx != -1:
				limb_bone_map[target_idx] = source_idx
				print("  ✓ ", target_skeleton.get_bone_name(target_idx), " <- ", source_skeleton.get_bone_name(source_idx))
				break

func _process(_delta):
	if not source_skeleton or not target_skeleton or limb_bone_map.is_empty():
		return

	# Copy poses for mapped bones
	for target_idx in limb_bone_map:
		var source_idx = limb_bone_map[target_idx]

		# Get source bone transform
		var source_pose = source_skeleton.get_bone_pose(source_idx)

		# Apply to target with damping
		var rotation = source_pose.basis.get_rotation_quaternion()
		if rotation_damping != 1.0:
			rotation = rotation.slerp(Quaternion.IDENTITY, 1.0 - rotation_damping)

		target_skeleton.set_bone_pose_rotation(target_idx, rotation)
		target_skeleton.set_bone_pose_position(target_idx, source_pose.origin)
		target_skeleton.set_bone_pose_scale(target_idx, source_pose.basis.get_scale())
