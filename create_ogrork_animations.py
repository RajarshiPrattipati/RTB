import bpy
import mathutils

# Clear scene
bpy.ops.wm.read_homefile(use_empty=True)

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

# Get mesh bounds and reposition
bbox = [mesh_obj.matrix_world @ mathutils.Vector(v.co) for v in mesh_obj.data.vertices]
min_z = min(v.z for v in bbox)
max_z = max(v.z for v in bbox)
height = max_z - min_z
width = max(v.x for v in bbox) - min(v.x for v in bbox)

# Move mesh to have feet at origin
mesh_obj.location.z = -min_z
bpy.context.view_layer.update()

print(f"Mesh repositioned: height={height:.3f}, width={width:.3f}")

# Create armature
bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
armature_obj = bpy.context.active_object
armature_obj.name = "Armature"
armature = armature_obj.data

# Single root bone
root = armature.edit_bones[0]
root.name = "Root"
root.head = (0, 0, 0)
root.tail = (0, 0, height)

bpy.ops.object.mode_set(mode='OBJECT')

# Parent mesh
bpy.ops.object.select_all(action='DESELECT')
mesh_obj.select_set(True)
armature_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.parent_set(type='ARMATURE_ENVELOPE')

# Ensure all vertices weighted
if "Root" not in mesh_obj.vertex_groups:
    vg = mesh_obj.vertex_groups.new(name="Root")
else:
    vg = mesh_obj.vertex_groups["Root"]
vg.add(range(len(mesh_obj.data.vertices)), 1.0, 'REPLACE')

print(f"Created armature with Root bone, weighted {len(mesh_obj.data.vertices)} vertices")

# Switch to pose mode for animations
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.mode_set(mode='POSE')

root_bone = armature_obj.pose.bones["Root"]

# ===== IDLE ANIMATION =====
idle_action = bpy.data.actions.new(name="idle")
if not armature_obj.animation_data:
    armature_obj.animation_data_create()
armature_obj.animation_data.action = idle_action

bpy.context.scene.frame_start = 0
bpy.context.scene.frame_end = 60

# Gentle breathing motion
bpy.context.scene.frame_set(0)
root_bone.location = (0, 0, 0)
root_bone.rotation_euler = (0, 0, 0)
root_bone.scale = (1, 1, 1)
root_bone.keyframe_insert(data_path="location", frame=0)
root_bone.keyframe_insert(data_path="rotation_euler", frame=0)
root_bone.keyframe_insert(data_path="scale", frame=0)

bpy.context.scene.frame_set(30)
root_bone.location = (0, 0, 0.02)
root_bone.scale = (1.0, 1.0, 1.01)
root_bone.keyframe_insert(data_path="location", frame=30)
root_bone.keyframe_insert(data_path="scale", frame=30)

bpy.context.scene.frame_set(60)
root_bone.location = (0, 0, 0)
root_bone.scale = (1, 1, 1)
root_bone.keyframe_insert(data_path="location", frame=60)
root_bone.keyframe_insert(data_path="scale", frame=60)

print("Created 'idle' animation (60 frames)")

# ===== ATTACK ANIMATION =====
attack_action = bpy.data.actions.new(name="attack")
armature_obj.animation_data.action = attack_action

bpy.context.scene.frame_start = 0
bpy.context.scene.frame_end = 30

# Attack: lean back, then lunge forward
bpy.context.scene.frame_set(0)
root_bone.location = (0, 0, 0)
root_bone.rotation_euler = (0, 0, 0)
root_bone.scale = (1, 1, 1)
root_bone.keyframe_insert(data_path="location", frame=0)
root_bone.keyframe_insert(data_path="rotation_euler", frame=0)
root_bone.keyframe_insert(data_path="scale", frame=0)

# Wind up
bpy.context.scene.frame_set(10)
root_bone.location = (0, -0.2, 0)
root_bone.rotation_euler = (-0.15, 0, 0)
root_bone.keyframe_insert(data_path="location", frame=10)
root_bone.keyframe_insert(data_path="rotation_euler", frame=10)

# Strike!
bpy.context.scene.frame_set(15)
root_bone.location = (0, 0.3, 0)
root_bone.rotation_euler = (0.2, 0, 0)
root_bone.scale = (1.1, 1.1, 1.0)
root_bone.keyframe_insert(data_path="location", frame=15)
root_bone.keyframe_insert(data_path="rotation_euler", frame=15)
root_bone.keyframe_insert(data_path="scale", frame=15)

# Recovery
bpy.context.scene.frame_set(25)
root_bone.location = (0, 0, 0)
root_bone.rotation_euler = (0, 0, 0)
root_bone.scale = (1, 1, 1)
root_bone.keyframe_insert(data_path="location", frame=25)
root_bone.keyframe_insert(data_path="rotation_euler", frame=25)
root_bone.keyframe_insert(data_path="scale", frame=25)

bpy.context.scene.frame_set(30)
root_bone.keyframe_insert(data_path="location", frame=30)
root_bone.keyframe_insert(data_path="rotation_euler", frame=30)
root_bone.keyframe_insert(data_path="scale", frame=30)

print("Created 'attack' animation (30 frames)")

# ===== BATTLE_IDLE ANIMATION (same as idle) =====
battle_idle_action = bpy.data.actions.new(name="battle_idle")
armature_obj.animation_data.action = battle_idle_action

bpy.context.scene.frame_start = 0
bpy.context.scene.frame_end = 60

bpy.context.scene.frame_set(0)
root_bone.location = (0, 0, 0)
root_bone.rotation_euler = (0, 0, 0)
root_bone.scale = (1, 1, 1)
root_bone.keyframe_insert(data_path="location", frame=0)
root_bone.keyframe_insert(data_path="rotation_euler", frame=0)
root_bone.keyframe_insert(data_path="scale", frame=0)

bpy.context.scene.frame_set(30)
root_bone.location = (0, 0, 0.02)
root_bone.scale = (1.0, 1.0, 1.01)
root_bone.keyframe_insert(data_path="location", frame=30)
root_bone.keyframe_insert(data_path="scale", frame=30)

bpy.context.scene.frame_set(60)
root_bone.location = (0, 0, 0)
root_bone.scale = (1, 1, 1)
root_bone.keyframe_insert(data_path="location", frame=60)
root_bone.keyframe_insert(data_path="scale", frame=60)

print("Created 'battle_idle' animation (60 frames)")

bpy.ops.object.mode_set(mode='OBJECT')

# Export
bpy.ops.object.select_all(action='DESELECT')
armature_obj.select_set(True)
mesh_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj

# Push idle as the default action
armature_obj.animation_data.action = idle_action

bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    use_selection=True,
    export_animations=True,
    export_skins=True,
    export_apply=False,
    export_yup=True
)

print(f"\n✓ Successfully exported to: {output_file}")
print(f"✓ Animations: idle (60f), attack (30f), battle_idle (60f)")
print(f"✓ Mesh with feet at Z=0")
print(f"✓ All vertices weighted to Root bone")
