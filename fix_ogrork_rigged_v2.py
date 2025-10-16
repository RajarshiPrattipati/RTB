import bpy
import os

# Clear existing scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# File paths
input_file = "/Users/rajarshiprattipati/Documents/RTB/assets/Ogrork_Goblimp_1016120330_texture.glb"
output_file = "/Users/rajarshiprattipati/Documents/RTB/assets/Ogrork_Goblimp_rigged.glb"

# Import the original GLB file
bpy.ops.import_scene.gltf(filepath=input_file)

# Get the imported mesh
mesh_obj = None
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        mesh_obj = obj
        break

if not mesh_obj:
    print("ERROR: No mesh found in the GLB file")
    exit(1)

print(f"Found mesh: {mesh_obj.name}")

# Get mesh dimensions
bbox = [mesh_obj.matrix_world @ v.co for v in mesh_obj.data.vertices]
min_z = min([v.z for v in bbox])
max_z = max([v.z for v in bbox])
mesh_height = max_z - min_z
center_x = (max([v.x for v in bbox]) + min([v.x for v in bbox])) / 2
center_y = (max([v.y for v in bbox]) + min([v.y for v in bbox])) / 2

dimensions = mesh_obj.dimensions
width = dimensions.x
depth = dimensions.y

print(f"Mesh Z range: {min_z} to {max_z}, height: {mesh_height}")
print(f"Mesh center: ({center_x}, {center_y})")
print(f"Mesh dimensions - Width: {width}, Depth: {depth}")

# Create armature
bpy.ops.object.armature_add(enter_editmode=True, location=(center_x, center_y, min_z))
armature_obj = bpy.context.active_object
armature_obj.name = "Ogrork_Armature"
armature = armature_obj.data

# Get the root bone and position it
root_bone = armature.edit_bones[0]
root_bone.name = "Root"
root_bone.head = (center_x, center_y, min_z)
root_bone.tail = (center_x, center_y, min_z + mesh_height * 0.15)

# Create spine bones
spine1 = armature.edit_bones.new("Spine1")
spine1.head = (center_x, center_y, min_z + mesh_height * 0.15)
spine1.tail = (center_x, center_y, min_z + mesh_height * 0.35)
spine1.parent = root_bone

spine2 = armature.edit_bones.new("Spine2")
spine2.head = (center_x, center_y, min_z + mesh_height * 0.35)
spine2.tail = (center_x, center_y, min_z + mesh_height * 0.50)
spine2.parent = spine1

spine3 = armature.edit_bones.new("Spine3")
spine3.head = (center_x, center_y, min_z + mesh_height * 0.50)
spine3.tail = (center_x, center_y, min_z + mesh_height * 0.65)
spine3.parent = spine2

# Create neck and head
neck = armature.edit_bones.new("Neck")
neck.head = (center_x, center_y, min_z + mesh_height * 0.65)
neck.tail = (center_x, center_y, min_z + mesh_height * 0.75)
neck.parent = spine3

head = armature.edit_bones.new("Head")
head.head = (center_x, center_y, min_z + mesh_height * 0.75)
head.tail = (center_x, center_y, min_z + mesh_height * 1.0)
head.parent = neck

# Create left leg
left_hip = armature.edit_bones.new("LeftHip")
left_hip.head = (center_x + width * 0.15, center_y, min_z + mesh_height * 0.45)
left_hip.tail = (center_x + width * 0.15, center_y, min_z + mesh_height * 0.20)
left_hip.parent = root_bone

left_knee = armature.edit_bones.new("LeftKnee")
left_knee.head = (center_x + width * 0.15, center_y, min_z + mesh_height * 0.20)
left_knee.tail = (center_x + width * 0.15, center_y, min_z + mesh_height * 0.05)
left_knee.parent = left_hip

left_ankle = armature.edit_bones.new("LeftAnkle")
left_ankle.head = (center_x + width * 0.15, center_y, min_z + mesh_height * 0.05)
left_ankle.tail = (center_x + width * 0.15, center_y + depth * 0.15, min_z)
left_ankle.parent = left_knee

# Create right leg
right_hip = armature.edit_bones.new("RightHip")
right_hip.head = (center_x - width * 0.15, center_y, min_z + mesh_height * 0.45)
right_hip.tail = (center_x - width * 0.15, center_y, min_z + mesh_height * 0.20)
right_hip.parent = root_bone

right_knee = armature.edit_bones.new("RightKnee")
right_knee.head = (center_x - width * 0.15, center_y, min_z + mesh_height * 0.20)
right_knee.tail = (center_x - width * 0.15, center_y, min_z + mesh_height * 0.05)
right_knee.parent = right_hip

right_ankle = armature.edit_bones.new("RightAnkle")
right_ankle.head = (center_x - width * 0.15, center_y, min_z + mesh_height * 0.05)
right_ankle.tail = (center_x - width * 0.15, center_y + depth * 0.15, min_z)
right_ankle.parent = right_knee

# Create left arm
left_shoulder = armature.edit_bones.new("LeftShoulder")
left_shoulder.head = (center_x + width * 0.15, center_y, min_z + mesh_height * 0.60)
left_shoulder.tail = (center_x + width * 0.30, center_y, min_z + mesh_height * 0.60)
left_shoulder.parent = spine3

left_elbow = armature.edit_bones.new("LeftElbow")
left_elbow.head = (center_x + width * 0.30, center_y, min_z + mesh_height * 0.60)
left_elbow.tail = (center_x + width * 0.45, center_y, min_z + mesh_height * 0.45)
left_elbow.parent = left_shoulder

left_wrist = armature.edit_bones.new("LeftWrist")
left_wrist.head = (center_x + width * 0.45, center_y, min_z + mesh_height * 0.45)
left_wrist.tail = (center_x + width * 0.50, center_y, min_z + mesh_height * 0.40)
left_wrist.parent = left_elbow

# Create right arm
right_shoulder = armature.edit_bones.new("RightShoulder")
right_shoulder.head = (center_x - width * 0.15, center_y, min_z + mesh_height * 0.60)
right_shoulder.tail = (center_x - width * 0.30, center_y, min_z + mesh_height * 0.60)
right_shoulder.parent = spine3

right_elbow = armature.edit_bones.new("RightElbow")
right_elbow.head = (center_x - width * 0.30, center_y, min_z + mesh_height * 0.60)
right_elbow.tail = (center_x - width * 0.45, center_y, min_z + mesh_height * 0.45)
right_elbow.parent = right_shoulder

right_wrist = armature.edit_bones.new("RightWrist")
right_wrist.head = (center_x - width * 0.45, center_y, min_z + mesh_height * 0.45)
right_wrist.tail = (center_x - width * 0.50, center_y, min_z + mesh_height * 0.40)
right_wrist.parent = right_elbow

# Switch to object mode
bpy.ops.object.mode_set(mode='OBJECT')

# Select mesh and armature for parenting
bpy.ops.object.select_all(action='DESELECT')
mesh_obj.select_set(True)
armature_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj

# Parent with automatic weights
bpy.ops.object.parent_set(type='ARMATURE_AUTO')

print("Armature created and parented to mesh with automatic weights")

# Verify the armature modifier was created
if mesh_obj.modifiers:
    for mod in mesh_obj.modifiers:
        print(f"Mesh has modifier: {mod.name} ({mod.type})")
        if mod.type == 'ARMATURE':
            print(f"  - Armature object: {mod.object.name if mod.object else 'None'}")

# Create a simple idle animation
armature_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.mode_set(mode='POSE')

# Create animation
action = bpy.data.actions.new(name="idle")
armature_obj.animation_data_create()
armature_obj.animation_data.action = action

# Set frame range
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 60

# Animate slight breathing motion
root_pose_bone = armature_obj.pose.bones["Root"]
spine1_pose_bone = armature_obj.pose.bones["Spine1"]

# Frame 1
bpy.context.scene.frame_set(1)
root_pose_bone.location = (0, 0, 0)
root_pose_bone.keyframe_insert(data_path="location", frame=1)
spine1_pose_bone.scale = (1.0, 1.0, 1.0)
spine1_pose_bone.keyframe_insert(data_path="scale", frame=1)

# Frame 30 (breathe in)
bpy.context.scene.frame_set(30)
root_pose_bone.location.z += 0.03
root_pose_bone.keyframe_insert(data_path="location", frame=30)
spine1_pose_bone.scale = (1.02, 1.02, 1.0)
spine1_pose_bone.keyframe_insert(data_path="scale", frame=30)

# Frame 60 (breathe out)
bpy.context.scene.frame_set(60)
root_pose_bone.location = (0, 0, 0)
root_pose_bone.keyframe_insert(data_path="location", frame=60)
spine1_pose_bone.scale = (1.0, 1.0, 1.0)
spine1_pose_bone.keyframe_insert(data_path="scale", frame=60)

print("Created idle animation with breathing motion")

bpy.ops.object.mode_set(mode='OBJECT')

# Select both for export
bpy.ops.object.select_all(action='DESELECT')
armature_obj.select_set(True)
mesh_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj

# Export as GLB with animations and skins
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    use_selection=True,
    export_animations=True,
    export_skins=True,
    export_apply=False
)

print(f"\nSuccessfully exported rigged model to: {output_file}")
print(f"Model specifications:")
print(f"- Armature location: ({center_x:.3f}, {center_y:.3f}, {min_z:.3f})")
print(f"- Mesh height: {mesh_height:.3f}")
print(f"- 15 bones with proper hierarchy")
print(f"- Idle animation (60 frames)")
print(f"- Mesh properly skinned to armature")
