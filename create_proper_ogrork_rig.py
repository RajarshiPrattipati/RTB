import bpy
import mathutils

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Import original model
input_file = "/Users/rajarshiprattipati/Documents/RTB/assets/Ogrork_Goblimp_1016120330_texture.glb"
output_file = "/Users/rajarshiprattipati/Documents/RTB/assets/Ogrork_Goblimp_rigged.glb"

bpy.ops.import_scene.gltf(filepath=input_file)

# Get mesh
mesh_obj = None
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        mesh_obj = obj
        break

if not mesh_obj:
    print("ERROR: No mesh found")
    exit(1)

print(f"Found mesh: {mesh_obj.name}")

# Calculate bounding box
bbox = [mesh_obj.matrix_world @ mathutils.Vector(v.co) for v in mesh_obj.data.vertices]
min_z = min(v.z for v in bbox)
max_z = max(v.z for v in bbox)
min_x = min(v.x for v in bbox)
max_x = max(v.x for v in bbox)
min_y = min(v.y for v in bbox)
max_y = max(v.y for v in bbox)

center_x = (min_x + max_x) / 2
center_y = (min_y + max_y) / 2
height = max_z - min_z
width = max_x - min_x
depth = max_y - min_y

print(f"Mesh bounds: X[{min_x:.3f}, {max_x:.3f}] Y[{min_y:.3f}, {max_y:.3f}] Z[{min_z:.3f}, {max_z:.3f}]")
print(f"Dimensions: W={width:.3f} D={depth:.3f} H={height:.3f}")
print(f"Center: ({center_x:.3f}, {center_y:.3f})")

# Move mesh so its bottom is at Z=0
mesh_obj.location.z = -min_z
bpy.context.view_layer.update()

# Recalculate after moving
bbox = [mesh_obj.matrix_world @ mathutils.Vector(v.co) for v in mesh_obj.data.vertices]
min_z = min(v.z for v in bbox)
max_z = max(v.z for v in bbox)

print(f"After repositioning: Z range [{min_z:.3f}, {max_z:.3f}]")

# Create armature at origin
bpy.ops.object.armature_add(enter_editmode=True, location=(center_x, center_y, 0))
armature_obj = bpy.context.active_object
armature_obj.name = "Ogrork_Armature"
armature = armature_obj.data

# Position bones from ground up
root_bone = armature.edit_bones[0]
root_bone.name = "Root"
root_bone.head = (center_x, center_y, 0)
root_bone.tail = (center_x, center_y, height * 0.15)

# Spine
spine1 = armature.edit_bones.new("Spine1")
spine1.head = (center_x, center_y, height * 0.15)
spine1.tail = (center_x, center_y, height * 0.35)
spine1.parent = root_bone

spine2 = armature.edit_bones.new("Spine2")
spine2.head = (center_x, center_y, height * 0.35)
spine2.tail = (center_x, center_y, height * 0.50)
spine2.parent = spine1

spine3 = armature.edit_bones.new("Spine3")
spine3.head = (center_x, center_y, height * 0.50)
spine3.tail = (center_x, center_y, height * 0.65)
spine3.parent = spine2

# Neck and Head
neck = armature.edit_bones.new("Neck")
neck.head = (center_x, center_y, height * 0.65)
neck.tail = (center_x, center_y, height * 0.75)
neck.parent = spine3

head = armature.edit_bones.new("Head")
head.head = (center_x, center_y, height * 0.75)
head.tail = (center_x, center_y, max_z)
head.parent = neck

# Left Leg
left_hip = armature.edit_bones.new("LeftUpLeg")
left_hip.head = (center_x + width * 0.15, center_y, height * 0.45)
left_hip.tail = (center_x + width * 0.15, center_y - depth * 0.05, height * 0.25)
left_hip.parent = root_bone

left_knee = armature.edit_bones.new("LeftLeg")
left_knee.head = left_hip.tail
left_knee.tail = (center_x + width * 0.15, center_y - depth * 0.08, height * 0.05)
left_knee.parent = left_hip

left_foot = armature.edit_bones.new("LeftFoot")
left_foot.head = left_knee.tail
left_foot.tail = (center_x + width * 0.15, center_y + depth * 0.15, 0)
left_foot.parent = left_knee

# Right Leg
right_hip = armature.edit_bones.new("RightUpLeg")
right_hip.head = (center_x - width * 0.15, center_y, height * 0.45)
right_hip.tail = (center_x - width * 0.15, center_y - depth * 0.05, height * 0.25)
right_hip.parent = root_bone

right_knee = armature.edit_bones.new("RightLeg")
right_knee.head = right_hip.tail
right_knee.tail = (center_x - width * 0.15, center_y - depth * 0.08, height * 0.05)
right_knee.parent = right_hip

right_foot = armature.edit_bones.new("RightFoot")
right_foot.head = right_knee.tail
right_foot.tail = (center_x - width * 0.15, center_y + depth * 0.15, 0)
right_foot.parent = right_knee

# Left Arm
left_shoulder = armature.edit_bones.new("LeftShoulder")
left_shoulder.head = (center_x + width * 0.15, center_y, height * 0.60)
left_shoulder.tail = (center_x + width * 0.28, center_y, height * 0.58)
left_shoulder.parent = spine3

left_arm = armature.edit_bones.new("LeftArm")
left_arm.head = left_shoulder.tail
left_arm.tail = (center_x + width * 0.40, center_y, height * 0.45)
left_arm.parent = left_shoulder

left_forearm = armature.edit_bones.new("LeftForeArm")
left_forearm.head = left_arm.tail
left_forearm.tail = (center_x + width * 0.48, center_y, height * 0.35)
left_forearm.parent = left_arm

left_hand = armature.edit_bones.new("LeftHand")
left_hand.head = left_forearm.tail
left_hand.tail = (center_x + width * 0.50, center_y, height * 0.32)
left_hand.parent = left_forearm

# Right Arm
right_shoulder = armature.edit_bones.new("RightShoulder")
right_shoulder.head = (center_x - width * 0.15, center_y, height * 0.60)
right_shoulder.tail = (center_x - width * 0.28, center_y, height * 0.58)
right_shoulder.parent = spine3

right_arm = armature.edit_bones.new("RightArm")
right_arm.head = right_shoulder.tail
right_arm.tail = (center_x - width * 0.40, center_y, height * 0.45)
right_arm.parent = right_shoulder

right_forearm = armature.edit_bones.new("RightForeArm")
right_forearm.head = right_arm.tail
right_forearm.tail = (center_x - width * 0.48, center_y, height * 0.35)
right_forearm.parent = right_arm

right_hand = armature.edit_bones.new("RightHand")
right_hand.head = right_forearm.tail
right_hand.tail = (center_x - width * 0.50, center_y, height * 0.32)
right_hand.parent = right_forearm

# Exit edit mode
bpy.ops.object.mode_set(mode='OBJECT')

print("Armature created")

# Parent mesh to armature with automatic weights
bpy.ops.object.select_all(action='DESELECT')
mesh_obj.select_set(True)
armature_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj

bpy.ops.object.parent_set(type='ARMATURE_AUTO')

print("Mesh parented to armature")

# Verify armature modifier exists
has_armature_mod = False
for mod in mesh_obj.modifiers:
    if mod.type == 'ARMATURE':
        print(f"Armature modifier found: {mod.name}")
        has_armature_mod = True
        break

if not has_armature_mod:
    print("WARNING: No armature modifier found, adding manually")
    mod = mesh_obj.modifiers.new(name="Armature", type='ARMATURE')
    mod.object = armature_obj

# Create simple idle animation
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.mode_set(mode='POSE')

action = bpy.data.actions.new(name="idle")
if not armature_obj.animation_data:
    armature_obj.animation_data_create()
armature_obj.animation_data.action = action

bpy.context.scene.frame_start = 0
bpy.context.scene.frame_end = 60

# Animate root for breathing
root_bone = armature_obj.pose.bones["Root"]
spine1_bone = armature_obj.pose.bones["Spine1"]

# Frame 0
bpy.context.scene.frame_set(0)
root_bone.location = (0, 0, 0)
root_bone.keyframe_insert(data_path="location", frame=0)
spine1_bone.scale = (1.0, 1.0, 1.0)
spine1_bone.keyframe_insert(data_path="scale", frame=0)

# Frame 30
bpy.context.scene.frame_set(30)
root_bone.location.z = 0.02
root_bone.keyframe_insert(data_path="location", frame=30)
spine1_bone.scale = (1.01, 1.01, 1.0)
spine1_bone.keyframe_insert(data_path="scale", frame=30)

# Frame 60
bpy.context.scene.frame_set(60)
root_bone.location = (0, 0, 0)
root_bone.keyframe_insert(data_path="location", frame=60)
spine1_bone.scale = (1.0, 1.0, 1.0)
spine1_bone.keyframe_insert(data_path="scale", frame=60)

print("Animation created")

bpy.ops.object.mode_set(mode='OBJECT')

# Export
bpy.ops.object.select_all(action='DESELECT')
armature_obj.select_set(True)
mesh_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj

bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    use_selection=True,
    export_animations=True,
    export_skins=True,
    export_apply=False
)

print(f"\n✓ Successfully exported to: {output_file}")
print(f"✓ Mesh positioned with feet at Z=0")
print(f"✓ Armature with {len(armature.bones)} bones")
print(f"✓ Idle animation included")
