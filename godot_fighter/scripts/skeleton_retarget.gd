extends SkeletonModifier3D
class_name SkeletonRetarget

## Retargets animation from source skeleton to this skeleton using Godot's SkeletonModifier system
## This is the proper Godot 4.x way to handle skeleton retargeting

@export var source_skeleton: Skeleton3D  ## The skeleton to copy animations from (Y-Bot)
@export var use_bone_map: bool = true  ## Use automatic bone name mapping
@export var scale_adjustment: float = 1.0  ## Scale difference adjustment between skeletons

var bone_mapping: Dictionary = {}
var target_skeleton: Skeleton3D

# Standard bone name mappings for retargeting
const BONE_ALIASES = {
	# Mixamo to standard mapping
	"mixamorig:Hips": ["Hips", "pelvis"],
	"mixamorig:Spine": ["Spine"],
	"mixamorig:Spine1": ["Spine1", "Chest"],
	"mixamorig:Spine2": ["Spine2", "UpperChest"],
	"mixamorig:Neck": ["Neck"],
	"mixamorig:Head": ["Head"],
	"mixamorig:LeftShoulder": ["LeftShoulder"],
	"mixamorig:LeftArm": ["LeftArm", "LeftUpperArm"],
	"mixamorig:LeftForeArm": ["LeftForeArm", "LeftLowerArm"],
	"mixamorig:LeftHand": ["LeftHand"],
	"mixamorig:RightShoulder": ["RightShoulder"],
	"mixamorig:RightArm": ["RightArm", "RightUpperArm"],
	"mixamorig:RightForeArm": ["RightForeArm", "RightLowerArm"],
	"mixamorig:RightHand": ["RightHand"],
	"mixamorig:LeftUpLeg": ["LeftUpLeg", "LeftUpperLeg"],
	"mixamorig:LeftLeg": ["LeftLeg", "LeftLowerLeg"],
	"mixamorig:LeftFoot": ["LeftFoot"],
	"mixamorig:LeftToeBase": ["LeftToeBase", "LeftToes"],
	"mixamorig:RightUpLeg": ["RightUpLeg", "RightUpperLeg"],
	"mixamorig:RightLeg": ["RightLeg", "RightLowerLeg"],
	"mixamorig:RightFoot": ["RightFoot"],
	"mixamorig:RightToeBase": ["RightToeBase", "RightToes"],
}

func _ready():
	super._ready()
	target_skeleton = get_skeleton()

	if target_skeleton and source_skeleton:
		_build_bone_mapping()
		print("[SkeletonRetarget] Initialized with ", bone_mapping.size(), " bone mappings")
	else:
		push_warning("[SkeletonRetarget] Missing skeleton reference")

func _build_bone_mapping():
	if not target_skeleton or not source_skeleton:
		return

	# Build mapping from target bone index to source bone index
	for target_idx in range(target_skeleton.get_bone_count()):
		var target_bone_name = target_skeleton.get_bone_name(target_idx)

		# Try direct name match first
		var source_idx = source_skeleton.find_bone(target_bone_name)

		# If no match, try with aliases
		if source_idx == -1:
			source_idx = _find_source_bone(target_bone_name)

		if source_idx != -1:
			bone_mapping[target_idx] = source_idx
			print("  Mapped: ", target_bone_name, " (", target_idx, ") -> ",
				  source_skeleton.get_bone_name(source_idx), " (", source_idx, ")")

func _find_source_bone(target_name: String) -> int:
	# Check all aliases
	for mixamo_name in BONE_ALIASES:
		var aliases = BONE_ALIASES[mixamo_name]

		# Check if target matches any alias
		for alias in aliases:
			if target_name.to_lower() == alias.to_lower():
				# Try to find the mixamo name in source
				var idx = source_skeleton.find_bone(mixamo_name)
				if idx != -1:
					return idx

				# Try other aliases in source
				for other_alias in aliases:
					idx = source_skeleton.find_bone(other_alias)
					if idx != -1:
						return idx

	return -1

func _process_modification():
	if not source_skeleton or bone_mapping.is_empty():
		return

	# Copy bone poses from source to target
	for target_idx in bone_mapping:
		var source_idx = bone_mapping[target_idx]

		# Get the pose from source skeleton using correct Godot 4.x API
		var source_rot = source_skeleton.get_bone_pose_rotation(source_idx)
		var source_pos = source_skeleton.get_bone_pose_position(source_idx)
		var source_scale = source_skeleton.get_bone_pose_scale(source_idx)

		# Apply to target skeleton
		target_skeleton.set_bone_pose_rotation(target_idx, source_rot)
		target_skeleton.set_bone_pose_position(target_idx, source_pos * scale_adjustment)
		target_skeleton.set_bone_pose_scale(target_idx, source_scale)
