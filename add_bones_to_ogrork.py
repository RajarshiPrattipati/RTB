import bpy
import os
import math

# Clear existing scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# File paths
input_file = "/Users/rajarshiprattipati/Documents/RTB/assets/Ogrork_Goblimp_1016120330_texture.glb"
output_file = "/Users/rajarshiprattipati/Documents/RTB/assets/Ogrork_Goblimp_rigged.glb"

# Import the GLB file
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

# Get mesh dimensions to scale the armature appropriately
dimensions = mesh_obj.dimensions
height = dimensions.z
width = dimensions.x
depth = dimensions.y

print(f"Mesh dimensions - Height: {height}, Width: {width}, Depth: {depth}")

# Create armature
bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
armature_obj = bpy.context.active_object
armature_obj.name = "Ogrork_Armature"
armature = armature_obj.data

# Get the root bone and rename it
root_bone = armature.edit_bones[0]
root_bone.name = "Root"
root_bone.head = (0, 0, 0)
root_bone.tail = (0, 0, height * 0.15)

# Create spine bones
spine1 = armature.edit_bones.new("Spine1")
spine1.head = (0, 0, height * 0.15)
spine1.tail = (0, 0, height * 0.35)
spine1.parent = root_bone

spine2 = armature.edit_bones.new("Spine2")
spine2.head = (0, 0, height * 0.35)
spine2.tail = (0, 0, height * 0.50)
spine2.parent = spine1

spine3 = armature.edit_bones.new("Spine3")
spine3.head = (0, 0, height * 0.50)
spine3.tail = (0, 0, height * 0.65)
spine3.parent = spine2

# Create neck and head
neck = armature.edit_bones.new("Neck")
neck.head = (0, 0, height * 0.65)
neck.tail = (0, 0, height * 0.75)
neck.parent = spine3

head = armature.edit_bones.new("Head")
head.head = (0, 0, height * 0.75)
head.tail = (0, 0, height * 1.0)
head.parent = neck

# Create left leg
left_hip = armature.edit_bones.new("LeftHip")
left_hip.head = (width * 0.15, 0, height * 0.15)
left_hip.tail = (width * 0.15, 0, height * 0.45)
left_hip.parent = root_bone

left_knee = armature.edit_bones.new("LeftKnee")
left_knee.head = (width * 0.15, 0, height * 0.45)
left_knee.tail = (width * 0.15, 0, height * 0.75)
left_knee.parent = left_hip

left_ankle = armature.edit_bones.new("LeftAnkle")
left_ankle.head = (width * 0.15, 0, height * 0.75)
left_ankle.tail = (width * 0.15, depth * 0.15, height * 0.80)
left_ankle.parent = left_knee

# Create right leg
right_hip = armature.edit_bones.new("RightHip")
right_hip.head = (-width * 0.15, 0, height * 0.15)
right_hip.tail = (-width * 0.15, 0, height * 0.45)
right_hip.parent = root_bone

right_knee = armature.edit_bones.new("RightKnee")
right_knee.head = (-width * 0.15, 0, height * 0.45)
right_knee.tail = (-width * 0.15, 0, height * 0.75)
right_knee.parent = right_hip

right_ankle = armature.edit_bones.new("RightAnkle")
right_ankle.head = (-width * 0.15, 0, height * 0.75)
right_ankle.tail = (-width * 0.15, depth * 0.15, height * 0.80)
right_ankle.parent = right_knee

# Create left arm
left_shoulder = armature.edit_bones.new("LeftShoulder")
left_shoulder.head = (width * 0.15, 0, height * 0.60)
left_shoulder.tail = (width * 0.30, 0, height * 0.60)
left_shoulder.parent = spine3

left_elbow = armature.edit_bones.new("LeftElbow")
left_elbow.head = (width * 0.30, 0, height * 0.60)
left_elbow.tail = (width * 0.45, 0, height * 0.50)
left_elbow.parent = left_shoulder

left_wrist = armature.edit_bones.new("LeftWrist")
left_wrist.head = (width * 0.45, 0, height * 0.50)
left_wrist.tail = (width * 0.50, 0, height * 0.45)
left_wrist.parent = left_elbow

# Create right arm
right_shoulder = armature.edit_bones.new("RightShoulder")
right_shoulder.head = (-width * 0.15, 0, height * 0.60)
right_shoulder.tail = (-width * 0.30, 0, height * 0.60)
right_shoulder.parent = spine3

right_elbow = armature.edit_bones.new("RightElbow")
right_elbow.head = (-width * 0.30, 0, height * 0.60)
right_elbow.tail = (-width * 0.45, 0, height * 0.50)
right_elbow.parent = right_shoulder

right_wrist = armature.edit_bones.new("RightWrist")
right_wrist.head = (-width * 0.45, 0, height * 0.50)
right_wrist.tail = (-width * 0.50, 0, height * 0.45)
right_wrist.parent = right_elbow

# Switch to object mode
bpy.ops.object.mode_set(mode='OBJECT')

# Parent mesh to armature with automatic weights
mesh_obj.select_set(True)
armature_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj

# Use automatic weights
bpy.ops.object.parent_set(type='ARMATURE_AUTO')

print("Armature created and parented to mesh with automatic weights")

# Select all objects for export
bpy.ops.object.select_all(action='DESELECT')
armature_obj.select_set(True)
mesh_obj.select_set(True)

# Export as GLB
bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    use_selection=True,
    export_animations=False,
    export_skins=True,
    export_apply=False
)

print(f"Successfully exported rigged model to: {output_file}")
print("\nBone hierarchy created:")
print("- Root")
print("  - Spine1 -> Spine2 -> Spine3")
print("    - Neck -> Head")
print("    - LeftShoulder -> LeftElbow -> LeftWrist")
print("    - RightShoulder -> RightElbow -> RightWrist")
print("  - LeftHip -> LeftKnee -> LeftAnkle")
print("  - RightHip -> RightKnee -> RightAnkle")
