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

print(f"Found mesh: {mesh_obj.name}")

# Calculate bounding box and reposition mesh
bbox = [mesh_obj.matrix_world @ mathutils.Vector(v.co) for v in mesh_obj.data.vertices]
min_z = min(v.z for v in bbox)
max_z = max(v.z for v in bbox)
height = max_z - min_z

print(f"Original Z range: [{min_z:.3f}, {max_z:.3f}], height: {height:.3f}")

# Move mesh so bottom is at origin
mesh_obj.location.z = -min_z
bpy.context.view_layer.update()

print(f"Mesh repositioned to have feet at Z=0")

# Create simple single-bone armature
bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
armature_obj = bpy.context.active_object
armature_obj.name = "Armature"
armature = armature_obj.data

# Single bone from bottom to top
root = armature.edit_bones[0]
root.name = "Root"
root.head = (0, 0, 0)
root.tail = (0, 0, height)

bpy.ops.object.mode_set(mode='OBJECT')

print("Created single-bone armature")

# Select mesh first, then armature
bpy.ops.object.select_all(action='DESELECT')
mesh_obj.select_set(True)
armature_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj

# Parent with automatic weights (envelope should work better for single bone)
bpy.ops.object.parent_set(type='ARMATURE_ENVELOPE')

print(f"Parented mesh to armature")

# Manually ensure all vertices are weighted to Root
if "Root" not in mesh_obj.vertex_groups:
    vg = mesh_obj.vertex_groups.new(name="Root")
else:
    vg = mesh_obj.vertex_groups["Root"]

# Assign ALL vertices to Root with full weight
vg.add(range(len(mesh_obj.data.vertices)), 1.0, 'REPLACE')
print(f"Assigned all {len(mesh_obj.data.vertices)} vertices to Root bone")

# Verify armature modifier
armature_mod = None
for mod in mesh_obj.modifiers:
    if mod.type == 'ARMATURE':
        armature_mod = mod
        break

if not armature_mod:
    armature_mod = mesh_obj.modifiers.new(name="Armature", type='ARMATURE')

armature_mod.object = armature_obj
armature_mod.use_vertex_groups = True
armature_mod.use_deform_preserve_volume = True

print("Armature modifier configured")

# Test the deformation by moving the bone
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.mode_set(mode='POSE')

# Create animation with visible movement
action = bpy.data.actions.new(name="idle")
if not armature_obj.animation_data:
    armature_obj.animation_data_create()
armature_obj.animation_data.action = action

root_pose = armature_obj.pose.bones["Root"]

# Frame 0 - neutral
bpy.context.scene.frame_set(0)
root_pose.location = (0, 0, 0)
root_pose.rotation_euler = (0, 0, 0)
root_pose.keyframe_insert(data_path="location", frame=0)
root_pose.keyframe_insert(data_path="rotation_euler", frame=0)

# Frame 30 - rotate slightly
bpy.context.scene.frame_set(30)
root_pose.rotation_euler = (0, 0, 0.1)  # 0.1 radians rotation
root_pose.keyframe_insert(data_path="rotation_euler", frame=30)

# Frame 60 - back to neutral
bpy.context.scene.frame_set(60)
root_pose.rotation_euler = (0, 0, 0)
root_pose.keyframe_insert(data_path="rotation_euler", frame=60)

bpy.ops.object.mode_set(mode='OBJECT')

print("Created idle animation with rotation")

# Apply a single-frame test to verify deformation works
bpy.context.scene.frame_set(30)
bpy.context.view_layer.update()
print("Set to frame 30 to test deformation")

# Export with explicit settings
bpy.ops.object.select_all(action='DESELECT')
mesh_obj.select_set(True)
armature_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj

print("\n=== Export Info ===")
print(f"Mesh: {mesh_obj.name}")
print(f"  - Has {len(mesh_obj.vertex_groups)} vertex groups:")
for vg in mesh_obj.vertex_groups:
    print(f"    - {vg.name}")
print(f"  - Armature modifier: {armature_mod.name}, target: {armature_mod.object.name}")
print(f"Armature: {armature_obj.name}")
print(f"  - Has {len(armature.bones)} bones")
print(f"  - Animation: {action.name}, {len(action.fcurves)} fcurves")

bpy.ops.export_scene.gltf(
    filepath=output_file,
    check_existing=False,
    export_format='GLB',
    use_selection=True,
    export_animations=True,
    export_skins=True,
    export_all_influences=True,
    export_apply=False,
    export_yup=True
)

print(f"\n✓ Successfully exported to: {output_file}")
print("✓ Mesh with feet at Z=0")
print("✓ Single-bone armature with all vertices weighted")
print("✓ Idle animation with rotation")
