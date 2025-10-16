# Performance Optimization for 3D Fighting Games

**Source:** Godot Demo Projects - Graphics Settings, Occlusion Culling, Physics Tests
**Relevance:** Maintain 60 FPS for responsive fighting game feel

## Overview
Fighting games require consistent high frame rates. These patterns ensure smooth performance across different hardware.

---

## Pattern 1: Graphics Settings System

### Comprehensive Graphics Options
```gdscript
# graphics_settings.gd
class_name GraphicsSettings
extends Node

# Settings structure
var settings = {
    "resolution_scale": 1.0,  # 0.5 to 2.0
    "msaa": Viewport.MSAA_DISABLED,
    "fxaa": false,
    "vsync": DisplayServer.VSYNC_ENABLED,
    "max_fps": 0,  # 0 = unlimited
    "shadow_quality": 1.0,
    "particle_quality": 1.0,
    "post_processing": true,
    "ssao": true,
    "ssr": false,
    "glow": true,
    "volumetric_fog": false
}

# Performance presets
const PRESET_LOW = {
    "resolution_scale": 0.75,
    "msaa": Viewport.MSAA_DISABLED,
    "fxaa": true,
    "vsync": DisplayServer.VSYNC_ENABLED,
    "max_fps": 60,
    "shadow_quality": 0.5,
    "particle_quality": 0.5,
    "post_processing": false,
    "ssao": false,
    "ssr": false,
    "glow": false,
    "volumetric_fog": false
}

const PRESET_MEDIUM = {
    "resolution_scale": 1.0,
    "msaa": Viewport.MSAA_2X,
    "fxaa": false,
    "vsync": DisplayServer.VSYNC_ENABLED,
    "max_fps": 60,
    "shadow_quality": 0.75,
    "particle_quality": 0.75,
    "post_processing": true,
    "ssao": true,
    "ssr": false,
    "glow": true,
    "volumetric_fog": false
}

const PRESET_HIGH = {
    "resolution_scale": 1.0,
    "msaa": Viewport.MSAA_4X,
    "fxaa": false,
    "vsync": DisplayServer.VSYNC_ADAPTIVE,
    "max_fps": 0,
    "shadow_quality": 1.0,
    "particle_quality": 1.0,
    "post_processing": true,
    "ssao": true,
    "ssr": true,
    "glow": true,
    "volumetric_fog": false
}

const PRESET_ULTRA = {
    "resolution_scale": 1.5,
    "msaa": Viewport.MSAA_8X,
    "fxaa": false,
    "vsync": DisplayServer.VSYNC_DISABLED,
    "max_fps": 0,
    "shadow_quality": 1.5,
    "particle_quality": 1.5,
    "post_processing": true,
    "ssao": true,
    "ssr": true,
    "glow": true,
    "volumetric_fog": true
}

func apply_preset(preset_name: String):
    match preset_name:
        "low":
            settings = PRESET_LOW.duplicate()
        "medium":
            settings = PRESET_MEDIUM.duplicate()
        "high":
            settings = PRESET_HIGH.duplicate()
        "ultra":
            settings = PRESET_ULTRA.duplicate()

    apply_all_settings()

func apply_all_settings():
    apply_resolution_scale()
    apply_antialiasing()
    apply_vsync()
    apply_fps_limit()
    apply_shadow_quality()
    apply_particle_quality()
    apply_post_processing()

func apply_resolution_scale():
    var viewport = get_viewport()
    viewport.scaling_3d_scale = settings.resolution_scale

func apply_antialiasing():
    var viewport = get_viewport()
    viewport.msaa_3d = settings.msaa
    viewport.screen_space_aa = Viewport.SCREEN_SPACE_AA_FXAA if settings.fxaa else Viewport.SCREEN_SPACE_AA_DISABLED

func apply_vsync():
    DisplayServer.window_set_vsync_mode(settings.vsync)

func apply_fps_limit():
    Engine.max_fps = settings.max_fps

func apply_shadow_quality():
    var lights = get_tree().get_nodes_in_group("lights")
    for light in lights:
        if light is DirectionalLight3D:
            light.shadow_enabled = settings.shadow_quality > 0

            # Adjust shadow resolution
            if settings.shadow_quality >= 1.0:
                light.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_4_SPLITS
            elif settings.shadow_quality >= 0.75:
                light.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_2_SPLITS
            else:
                light.directional_shadow_mode = DirectionalLight3D.SHADOW_ORTHOGONAL

            # Shadow distance
            light.directional_shadow_max_distance = 20.0 * settings.shadow_quality

func apply_particle_quality():
    var particles = get_tree().get_nodes_in_group("particles")
    for particle in particles:
        if particle is GPUParticles3D:
            var base_amount = particle.get_meta("base_amount", particle.amount)
            particle.amount = int(base_amount * settings.particle_quality)

func apply_post_processing():
    var world_env = get_tree().get_first_node_in_group("world_environment") as WorldEnvironment
    if not world_env or not world_env.environment:
        return

    var env = world_env.environment

    # SSAO
    env.ssao_enabled = settings.post_processing and settings.ssao

    # SSR
    env.ssr_enabled = settings.post_processing and settings.ssr

    # Glow
    env.glow_enabled = settings.post_processing and settings.glow

    # Volumetric fog
    env.volumetric_fog_enabled = settings.post_processing and settings.volumetric_fog

func auto_detect_preset():
    # Simple performance detection
    var renderer = RenderingServer.get_rendering_device()

    if not renderer:
        # Compatibility renderer - use low settings
        apply_preset("low")
        return

    # Check available video memory
    var video_adapter = RenderingServer.get_video_adapter_name()

    if "Intel" in video_adapter or "AMD" in video_adapter and "Radeon" in video_adapter:
        apply_preset("medium")
    elif "NVIDIA" in video_adapter:
        apply_preset("high")
    else:
        apply_preset("medium")
```

---

## Pattern 2: Performance Monitoring

### FPS Counter and Performance Stats
```gdscript
# performance_monitor.gd
extends Label

var fps_history: Array[float] = []
const HISTORY_SIZE = 60  # 1 second at 60 FPS

var show_detailed_stats: bool = false

func _process(delta):
    update_fps_stats()

    if show_detailed_stats:
        text = get_detailed_stats()
    else:
        text = "FPS: %d" % Engine.get_frames_per_second()

func update_fps_stats():
    fps_history.append(Engine.get_frames_per_second())
    if fps_history.size() > HISTORY_SIZE:
        fps_history.pop_front()

func get_average_fps() -> float:
    if fps_history.is_empty():
        return 0.0

    var sum = 0.0
    for fps in fps_history:
        sum += fps
    return sum / fps_history.size()

func get_min_fps() -> float:
    if fps_history.is_empty():
        return 0.0

    return fps_history.min()

func get_detailed_stats() -> String:
    var stats = []

    # FPS stats
    stats.append("FPS: %d (avg: %.1f, min: %.1f)" % [
        Engine.get_frames_per_second(),
        get_average_fps(),
        get_min_fps()
    ])

    # Memory
    var static_mem = Performance.get_monitor(Performance.MEMORY_STATIC) / 1024.0 / 1024.0
    var static_max = Performance.get_monitor(Performance.MEMORY_STATIC_MAX) / 1024.0 / 1024.0
    stats.append("RAM: %.1f / %.1f MB" % [static_mem, static_max])

    # Physics
    var physics_2d = Performance.get_monitor(Performance.PHYSICS_2D_ACTIVE_OBJECTS)
    var physics_3d = Performance.get_monitor(Performance.PHYSICS_3D_ACTIVE_OBJECTS)
    stats.append("Physics: 2D=%d, 3D=%d" % [physics_2d, physics_3d])

    # Rendering
    var objects = Performance.get_monitor(Performance.RENDER_TOTAL_OBJECTS_IN_FRAME)
    var draw_calls = Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)
    stats.append("Objects: %d, Draw calls: %d" % [objects, draw_calls])

    return "\n".join(stats)

func _input(event):
    if event.is_action_pressed("toggle_debug_stats"):
        show_detailed_stats = !show_detailed_stats
```

---

## Pattern 3: LOD (Level of Detail) System

### Distance-Based Quality Reduction
```gdscript
# lod_manager.gd
class_name LODManager
extends Node

@export var camera: Camera3D
@export var update_interval: float = 0.5  # Update LOD every 0.5s

var lod_objects: Array[Dictionary] = []
var update_timer: float = 0.0

# LOD distance thresholds
const LOD_DISTANCE_HIGH = 5.0
const LOD_DISTANCE_MEDIUM = 10.0
const LOD_DISTANCE_LOW = 20.0

func register_lod_object(object: Node3D, high_detail: Node3D, medium_detail: Node3D, low_detail: Node3D):
    lod_objects.append({
        "object": object,
        "high": high_detail,
        "medium": medium_detail,
        "low": low_detail,
        "current_lod": "high"
    })

func _process(delta):
    update_timer += delta
    if update_timer >= update_interval:
        update_timer = 0.0
        update_all_lods()

func update_all_lods():
    if not camera:
        return

    var camera_pos = camera.global_position

    for lod_data in lod_objects:
        var object = lod_data.object as Node3D
        if not is_instance_valid(object):
            continue

        var distance = camera_pos.distance_to(object.global_position)
        var new_lod = determine_lod_level(distance)

        if new_lod != lod_data.current_lod:
            apply_lod_level(lod_data, new_lod)
            lod_data.current_lod = new_lod

func determine_lod_level(distance: float) -> String:
    if distance < LOD_DISTANCE_HIGH:
        return "high"
    elif distance < LOD_DISTANCE_MEDIUM:
        return "medium"
    elif distance < LOD_DISTANCE_LOW:
        return "low"
    else:
        return "culled"

func apply_lod_level(lod_data: Dictionary, level: String):
    # Hide all LODs first
    for lod_level in ["high", "medium", "low"]:
        if lod_data[lod_level]:
            lod_data[lod_level].visible = false

    # Show appropriate LOD
    if level != "culled" and lod_data[level]:
        lod_data[level].visible = true
```

---

## Pattern 4: Physics Optimization

### Optimized Collision Layers for Fighting Game
```gdscript
# Setup collision layers in project settings:
# Layer 1: Player
# Layer 2: Enemy
# Layer 3: Arena Floor
# Layer 4: Arena Walls
# Layer 5: Hitboxes
# Layer 6: Hurtboxes

# In fighter.gd
func setup_collision_layers():
    # Fighter body
    collision_layer = 0b00000001  # Layer 1
    collision_mask = 0b00001100   # Detect layers 3 & 4 (floor & walls)

    # Hitbox (attack)
    var hitbox = $AttackHitbox as Area3D
    hitbox.collision_layer = 0b00010000  # Layer 5
    hitbox.collision_mask = 0b00100000   # Detect layer 6 (hurtboxes)

    # Hurtbox (can be hit)
    var hurtbox = $Hurtbox as Area3D
    hurtbox.collision_layer = 0b00100000  # Layer 6
    hurtbox.collision_mask = 0b00010000   # Detect layer 5 (hitboxes)

# Physics optimization settings
func optimize_physics():
    # Reduce physics iterations for better performance
    # In Project Settings -> Physics -> 3D:
    # - physics_ticks_per_second = 60 (default is good for fighting games)
    # - solver_iterations = 4 (lower = faster but less accurate)

    # For fighters, disable continuous collision detection if not needed
    if self is CharacterBody3D:
        motion_mode = CharacterBody3D.MOTION_MODE_GROUNDED
```

---

## Pattern 5: Memory Management

### Resource Pooling System
```gdscript
# object_pool.gd
class_name ObjectPool

var pool: Array = []
var scene_template: PackedScene
var initial_size: int
var max_size: int

func _init(template: PackedScene, init_size: int = 10, maximum: int = 50):
    scene_template = template
    initial_size = init_size
    max_size = maximum

    # Pre-populate pool
    for i in range(initial_size):
        var obj = scene_template.instantiate()
        obj.set_meta("pooled", true)
        pool.append(obj)

func get_object() -> Node:
    if pool.is_empty():
        # Create new if pool is empty (up to max)
        if get_total_instances() < max_size:
            return scene_template.instantiate()
        else:
            return null  # Pool exhausted

    return pool.pop_back()

func return_object(obj: Node):
    if not obj.get_meta("pooled", false):
        obj.set_meta("pooled", true)

    # Reset object state
    if obj.has_method("reset"):
        obj.reset()

    # Remove from scene tree
    if obj.get_parent():
        obj.get_parent().remove_child(obj)

    pool.append(obj)

func get_total_instances() -> int:
    return pool.size() + get_active_instances()

func get_active_instances() -> int:
    # Count instances not in pool
    return initial_size - pool.size()

# Usage example in vfx_manager.gd
var particle_pools = {}

func _ready():
    # Create pools for different particle types
    particle_pools["hit_sparks"] = ObjectPool.new(
        preload("res://effects/hit_sparks.tscn"),
        10,
        30
    )

    particle_pools["dust"] = ObjectPool.new(
        preload("res://effects/dust.tscn"),
        5,
        15
    )

func spawn_hit_sparks(position: Vector3):
    var particles = particle_pools["hit_sparks"].get_object()
    if particles:
        add_child(particles)
        particles.global_position = position
        particles.emitting = true

        # Return to pool after lifetime
        await get_tree().create_timer(particles.lifetime).timeout
        particle_pools["hit_sparks"].return_object(particles)
```

---

## Pattern 6: Shader Optimization

### Optimized Fighter Shader
```gdscript
# Simple but fast shader for fighters
shader_type spatial;
render_mode blend_mix, depth_draw_opaque, cull_back, diffuse_burley, specular_schlick_ggx;

uniform vec4 albedo : source_color = vec4(1.0);
uniform float metallic : hint_range(0.0, 1.0) = 0.0;
uniform float roughness : hint_range(0.0, 1.0) = 0.5;
uniform sampler2D texture_albedo : source_color;

// Rim lighting for fighting game look
uniform float rim_strength : hint_range(0.0, 1.0) = 0.5;
uniform vec4 rim_color : source_color = vec4(0.5, 0.7, 1.0, 1.0);

void fragment() {
    vec4 tex = texture(texture_albedo, UV);
    ALBEDO = albedo.rgb * tex.rgb;

    METALLIC = metallic;
    ROUGHNESS = roughness;

    // Rim lighting
    float rim = 1.0 - dot(NORMAL, VIEW);
    rim = pow(rim, 3.0) * rim_strength;
    EMISSION = rim_color.rgb * rim;
}
```

---

## Performance Checklist for Fighting Games

### Critical (Must Have for 60 FPS)
- [ ] Resolution scaling option (0.75x - 1.5x)
- [ ] Vsync options (on/adaptive/off)
- [ ] Shadow quality settings
- [ ] Particle quality scaling
- [ ] Collision layer optimization
- [ ] Object pooling for VFX

### Important (Significant Impact)
- [ ] MSAA/FXAA options
- [ ] LOD system for background objects
- [ ] SSAO toggle
- [ ] Physics iteration reduction
- [ ] Occlusion culling for arena

### Nice to Have (Polish)
- [ ] SSR toggle
- [ ] Volumetric fog toggle
- [ ] Glow/bloom toggle
- [ ] FPS limiter options
- [ ] Performance monitoring overlay

---

## Auto-Performance Adjustment

### Dynamic Quality Scaling
```gdscript
# adaptive_quality.gd
extends Node

@export var target_fps: float = 60.0
@export var adjustment_interval: float = 2.0

var adjustment_timer: float = 0.0
var graphics_settings: GraphicsSettings

func _process(delta):
    adjustment_timer += delta

    if adjustment_timer >= adjustment_interval:
        adjustment_timer = 0.0
        check_and_adjust_quality()

func check_and_adjust_quality():
    var avg_fps = get_average_fps()

    if avg_fps < target_fps * 0.9:  # 10% below target
        reduce_quality()
    elif avg_fps > target_fps * 1.1 and graphics_settings.settings.resolution_scale < 1.0:
        increase_quality()

func reduce_quality():
    # Gradually reduce quality
    if graphics_settings.settings.ssao:
        graphics_settings.settings.ssao = false
        graphics_settings.apply_post_processing()
        print("Disabled SSAO for better performance")
    elif graphics_settings.settings.resolution_scale > 0.75:
        graphics_settings.settings.resolution_scale -= 0.25
        graphics_settings.apply_resolution_scale()
        print("Reduced resolution scale")

func increase_quality():
    # Only increase if consistently above target
    if graphics_settings.settings.resolution_scale < 1.0:
        graphics_settings.settings.resolution_scale += 0.25
        graphics_settings.apply_resolution_scale()
        print("Increased resolution scale")
```

---

## Key Takeaways

1. **Target 60 FPS minimum** - Fighting games need consistent performance
2. **Provide quality presets** - Low, Medium, High, Ultra
3. **Use object pooling** - Never create/destroy particles mid-combat
4. **Optimize collision layers** - Only check what's necessary
5. **Monitor performance** - Show FPS counter in debug builds
6. **Adaptive quality** - Auto-adjust for consistent frame rate

---

**Priority:** HIGH - Performance is critical for fighting games
**Implementation Time:** 6-8 hours for full system
**Impact:** Makes game playable on wider range of hardware
