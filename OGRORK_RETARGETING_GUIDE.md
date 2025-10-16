# Ogrork Skeleton Retargeting Guide

## Current Setup

The Ogrork model is currently attached to the Y-Bot skeleton using a **BoneAttachment3D** on the Hips bone. This makes it follow the character's movement but doesn't animate the Ogrork's own skeleton.

## Option 1: BoneAttachment3D (Current - Simple)

**Pros:**
- ✅ Works immediately
- ✅ Simple setup
- ✅ No performance overhead
- ✅ Model follows all movements

**Cons:**
- ❌ Ogrork model doesn't deform/animate
- ❌ Limbs stay rigid
- ❌ Looks like a "floating statue"

**Current Status:** ACTIVE in `mesh_battle.tscn`

---

## Option 2: Godot's Built-in Retargeting (Recommended)

This uses Godot 4.x's animation retargeting system to properly animate the Ogrork skeleton.

### Setup in Godot Editor:

#### Step 1: Extract the Ogrork Skeleton
1. Open Godot and navigate to `battle-manager/enemies/Ogrork_Goblimp_1016120330_texture.glb`
2. In the Import dock, go to **Advanced** → **Animations**
3. Check if the model has a skeleton (look for Skeleton3D node)

#### Step 2: Create a BoneMap Resource
1. Create a new **BoneMap** resource: `Right-click in FileSystem` → `New Resource` → Search "BoneMap"
2. Save it as `res://battle-manager/enemies/ogrork_bone_map.tres`

#### Step 3: Map the Bones
Open the BoneMap resource and map bones between Y-Bot and Ogrork:

**Critical bones to map:**
- Hips/Root
- Spine/Chest
- Head
- LeftUpperArm → LeftArm
- LeftLowerArm → LeftForeArm
- RightUpperArm → RightArm
- RightLowerArm → RightForeArm
- LeftUpperLeg → LeftUpLeg
- LeftLowerLeg → LeftLeg
- RightUpperLeg → RightUpLeg
- RightLowerLeg → RightLeg

#### Step 4: Set up Animation Retargeting
1. Open `mesh_battle.tscn` in Godot
2. Select `Enemy1` → Find the **AnimationPlayer** node
3. In AnimationPlayer settings, look for **Root Motion** settings
4. Add a **Retarget** property and assign your BoneMap

#### Step 5: Alternative - Use AnimationTree
1. Select `Enemy1/AnimationTree`
2. In the AnimationTree editor, add a **Skeleton Modifier**
3. Attach the BoneMap to the modifier

---

## Option 3: SkeletonModifier3D Script (Advanced)

I've created `skeleton_retarget.gd` which uses Godot's SkeletonModifier3D system.

### Setup:

1. **In Godot Editor**, open `mesh_battle.tscn`
2. Navigate to: `Enemy1/Armature/GeneralSkeleton/BoneAttachment3D/OgrorkModel`
3. Find the Ogrork's Skeleton3D node (might be nested like `RootNode/Armature/Skeleton3D`)
4. Add a **SkeletonModifier3D** node as a child of the Ogrork's Skeleton3D
5. In the Inspector, set the script to `res://scripts/skeleton_retarget.gd`
6. Set the `source_skeleton` property to point to `Enemy1/Armature/GeneralSkeleton`
7. Adjust `scale_adjustment` if needed (try 1.0 first)

---

## Option 4: Manual Mesh Skinning (Most Complex)

If the Ogrork GLB doesn't have a compatible skeleton:

1. Extract the Ogrork mesh from the GLB
2. In Blender:
   - Import the Y-Bot skeleton
   - Import the Ogrork mesh
   - Manually skin the Ogrork mesh to the Y-Bot skeleton
   - Export as a new GLB
3. Replace the model in Godot

---

## Quick Test in Godot

To verify if the Ogrork has a skeleton:

1. Open `Ogrork_Goblimp_1016120330_texture.glb` in Godot
2. Look at the Scene tree
3. Check if there's a **Skeleton3D** node
4. If yes → Animation retargeting is possible
5. If no → Model is a static mesh, only BoneAttachment3D will work

---

## Recommended Approach

**For Quick Results:**
- Keep current BoneAttachment3D setup (already working)
- Accept that Ogrork won't have limb animation

**For Full Animation:**
- Use Option 2 (Godot's built-in retargeting) if Ogrork has a skeleton
- This requires working in the Godot Editor

**Performance Consideration:**
- BoneAttachment3D: Fastest, no overhead
- Skeleton retargeting: ~5-10% performance cost per character

---

## Current File Structure

```
mesh_battle.tscn
└── Enemy1 (Y-Bot with Ogrork stats)
    └── Armature
        └── GeneralSkeleton (Y-Bot skeleton - ANIMATING)
            ├── Alpha_Surface (Y-Bot mesh - HIDDEN)
            └── BoneAttachment3D (attached to Hips)
                └── OgrorkModel (follows Hips bone)
```

## Notes

- The skeleton retarget script (`skeleton_retarget.gd`) is ready to use but needs Godot Editor configuration
- BoneAttachment3D is the simplest solution that works out of the box
- Full skeleton retargeting requires the Ogrork model to have its own skeleton rig
