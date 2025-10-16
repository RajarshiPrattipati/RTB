extends Node3D
class_name SkeletonSync

## Syncs a target skeleton with a source skeleton for animation retargeting
## Attach this script to the root of the target model (Ogrork)

@export var source_skeleton_path: NodePath  ## Path to the Y-Bot GeneralSkeleton
@export var target_skeleton_path: NodePath  ## Path to the Ogrork's skeleton
@export var auto_find_skeleton: bool = true  ## Automatically search for skeleton in children
@export var debug_output: bool = true  ## Print debug information

var source_skeleton: Skeleton3D
var target_skeleton: Skeleton3D
var bone_map: Dictionary = {}

# Common bone name mappings (handle different naming conventions)
var bone_name_aliases = {
	"mixamorig:Hips": ["Hips", "pelvis", "root"],
	"mixamorig:Spine": ["Spine", "spine_01"],
	"mixamorig:Spine1": ["Chest", "spine_02"],
	"mixamorig:Spine2": ["UpperChest", "spine_03"],
	"mixamorig:Neck": ["Neck", "neck_01"],
	"mixamorig:Head": ["Head", "head"],
	"mixamorig:LeftShoulder": ["LeftShoulder", "shoulder_l"],
	"mixamorig:LeftArm": ["LeftUpperArm", "upper_arm_l"],
	"mixamorig:LeftForeArm": ["LeftLowerArm", "forearm_l", "lower_arm_l"],
	"mixamorig:LeftHand": ["LeftHand", "hand_l"],
	"mixamorig:RightShoulder": ["RightShoulder", "shoulder_r"],
	"mixamorig:RightArm": ["RightUpperArm", "upper_arm_r"],
	"mixamorig:RightForeArm": ["RightLowerArm", "forearm_r", "lower_arm_r"],
	"mixamorig:RightHand": ["RightHand", "hand_r"],
	"mixamorig:LeftUpLeg": ["LeftUpperLeg", "thigh_l"],
	"mixamorig:LeftLeg": ["LeftLowerLeg", "shin_l", "lower_leg_l"],
	"mixamorig:LeftFoot": ["LeftFoot", "foot_l"],
	"mixamorig:RightUpLeg": ["RightUpperLeg", "thigh_r"],
	"mixamorig:RightLeg": ["RightLowerLeg", "shin_r", "lower_leg_r"],
	"mixamorig:RightFoot": ["RightFoot", "foot_r"],
}

func _ready():
	call_deferred("_setup_skeletons")

func _setup_skeletons():
	# Get source skeleton
	if source_skeleton_path:
		source_skeleton = get_node_or_null(source_skeleton_path)

	# Get or find target skeleton
	if target_skeleton_path:
		target_skeleton = get_node_or_null(target_skeleton_path)

	if not target_skeleton and auto_find_skeleton:
		target_skeleton = _find_skeleton_recursive(self)

	if not source_skeleton:
		push_warning("SkeletonSync: Could not find source skeleton at path: " + str(source_skeleton_path))
		return

	if not target_skeleton:
		push_warning("SkeletonSync: Could not find target skeleton")
		return

	if debug_output:
		print("\n=== SkeletonSync Debug ===")
		print("Source skeleton: ", source_skeleton.name, " (", source_skeleton.get_bone_count(), " bones)")
		print("Target skeleton: ", target_skeleton.name, " (", target_skeleton.get_bone_count(), " bones)")

	# Build bone mapping
	_build_bone_map()

	if debug_output:
		print("Successfully mapped ", bone_map.size(), " bones")
		print("=========================\n")

func _find_skeleton_recursive(node: Node) -> Skeleton3D:
	if node is Skeleton3D:
		return node

	for child in node.get_children():
		var result = _find_skeleton_recursive(child)
		if result:
			return result

	return null

func _build_bone_map():
	if not source_skeleton or not target_skeleton:
		return

	# Try to match bones by name
	for target_idx in range(target_skeleton.get_bone_count()):
		var target_bone_name = target_skeleton.get_bone_name(target_idx)

		# Try direct match first
		var source_idx = source_skeleton.find_bone(target_bone_name)

		# If no direct match, try aliases
		if source_idx == -1:
			source_idx = _find_bone_with_aliases(target_bone_name)

		if source_idx != -1:
			bone_map[target_idx] = source_idx
			if debug_output:
				print("  Mapped: ", target_bone_name, " -> ", source_skeleton.get_bone_name(source_idx))

func _find_bone_with_aliases(target_name: String) -> int:
	# Check if this bone name is in our alias list
	for mixamo_name in bone_name_aliases:
		var aliases = bone_name_aliases[mixamo_name]

		# Check if target name matches any alias
		var matches = false
		if target_name in aliases:
			matches = true
		else:
			# Check case-insensitive match
			for alias in aliases:
				if target_name.to_lower() == alias.to_lower():
					matches = true
					break

		if matches:
			# Found a match, now find this in source skeleton
			var source_idx = source_skeleton.find_bone(mixamo_name)
			if source_idx == -1:
				# Try the aliases in source skeleton too
				for alias in aliases:
					source_idx = source_skeleton.find_bone(alias)
					if source_idx != -1:
						return source_idx
			return source_idx

	return -1

func _process(_delta):
	if not source_skeleton or not target_skeleton or bone_map.is_empty():
		return

	# Copy bone poses from source to target
	for target_idx in bone_map:
		var source_idx = bone_map[target_idx]
		var pose = source_skeleton.get_bone_pose(source_idx)
		target_skeleton.set_bone_pose(target_idx, pose)
