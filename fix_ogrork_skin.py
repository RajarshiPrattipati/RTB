import bpy

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Import
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
    print("ERROR: No mesh")
    exit(1)

# Calculate bounds
verts = [mesh_obj.matrix_world @ v.co for v in mesh_obj.data.vertices]
min_z = min(v.z for v in verts)
max_z = max(v.z for v in verts)
height = max_z - min_z
width = max(v.x for v in verts) - min(v.x for v in verts)

# Move mesh to have feet at Z=0
mesh_obj.location.z = -min_z
bpy.context.view_layer.update()

# Create simple armature
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

# Parent with envelope - this should ensure skinning
bpy.ops.object.select_all(action='DESELECT')
mesh_obj.select_set(True)
armature_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj

# Try envelope first
bpy.ops.object.parent_set(type='ARMATURE_ENVELOPE')

# Check if vertex groups were created
print(f"Mesh vertex groups: {len(mesh_obj.vertex_groups)}")
for vg in mesh_obj.vertex_groups:
    print(f"  - {vg.name}")

# If no vertex groups, manually assign all vertices to Root
if len(mesh_obj.vertex_groups) == 0:
    print("No vertex groups created, adding manually...")
    vg = mesh_obj.vertex_groups.new(name="Root")
    vg.add(range(len(mesh_obj.data.vertices)), 1.0, 'REPLACE')
    print("Added Root vertex group with all vertices")

# Ensure armature modifier exists and is configured
has_armature = False
for mod in mesh_obj.modifiers:
    if mod.type == 'ARMATURE':
        has_armature = True
        mod.object = armature_obj
        mod.use_vertex_groups = True
        print(f"Configured armature modifier: {mod.name}")

if not has_armature:
    mod = mesh_obj.modifiers.new(name="Armature", type='ARMATURE')
    mod.object = armature_obj
    mod.use_vertex_groups = True
    print("Added new armature modifier")

# Create animation
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.mode_set(mode='POSE')

action = bpy.data.actions.new(name="idle")
if not armature_obj.animation_data:
    armature_obj.animation_data_create()
armature_obj.animation_data.action = action

root_bone = armature_obj.pose.bones["Root"]

bpy.context.scene.frame_set(0)
root_bone.rotation_quaternion = (1, 0, 0, 0)
root_bone.keyframe_insert(data_path="rotation_quaternion", frame=0)

bpy.context.scene.frame_set(30)
root_bone.rotation_euler = (0, 0, 0.05)
root_bone.keyframe_insert(data_path="rotation_quaternion", frame=30)

bpy.context.scene.frame_set(60)
root_bone.rotation_quaternion = (1, 0, 0, 0)
root_bone.keyframe_insert(data_path="rotation_quaternion", frame=60)

bpy.ops.object.mode_set(mode='OBJECT')

print("Animation created")

# Export - make absolutely sure we're exporting the skin
bpy.ops.object.select_all(action='DESELECT')
mesh_obj.select_set(True)
armature_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj

print(f"\nExporting:")
print(f"  Armature: {armature_obj.name}")
print(f"  Mesh: {mesh_obj.name}")
print(f"  Mesh has {len(mesh_obj.vertex_groups)} vertex groups")
print(f"  Mesh has armature modifier: {any(m.type == 'ARMATURE' for m in mesh_obj.modifiers)}")

bpy.ops.export_scene.gltf(
    filepath=output_file,
    export_format='GLB',
    use_selection=True,
    export_animations=True,
    export_skins=True,
    export_apply=False,
    export_force_sampling=True
)

print(f"\n✓ Exported to {output_file}")
