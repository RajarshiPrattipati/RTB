# Visual Effects for Fighting Games

**Source:** Godot Demo Projects - Particles, Lights and Shadows
**Relevance:** Impact effects, hit sparks, lighting for arena atmosphere

## Overview
Upgrade your VFX system with modern particle effects and dynamic lighting for a polished fighting game look.

---

## Pattern 1: GPUParticles3D for Combat Effects

### Hit Impact Particles
```gdscript
# combat_particles.gd
class_name CombatParticles
extends Node3D

# Particle pools for performance
var hit_spark_pool: Array[GPUParticles3D] = []
var dust_pool: Array[GPUParticles3D] = []
const POOL_SIZE = 10

func _ready():
    initialize_particle_pools()

func initialize_particle_pools():
    # Create hit spark particle pool
    for i in range(POOL_SIZE):
        var particles = create_hit_sparks()
        particles.emitting = false
        add_child(particles)
        hit_spark_pool.append(particles)

    # Create dust impact pool
    for i in range(POOL_SIZE):
        var particles = create_dust_impact()
        particles.emitting = false
        add_child(particles)
        dust_pool.append(particles)

func create_hit_sparks() -> GPUParticles3D:
    var particles = GPUParticles3D.new()

    # Particle settings
    particles.amount = 20
    particles.lifetime = 0.5
    particles.one_shot = true
    particles.explosiveness = 0.8
    particles.randomness = 0.5

    # Process material
    var material = ParticleProcessMaterial.new()

    # Emission shape: sphere
    material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
    material.emission_sphere_radius = 0.2

    # Movement
    material.direction = Vector3.UP
    material.spread = 180.0
    material.initial_velocity_min = 2.0
    material.initial_velocity_max = 5.0

    # Gravity
    material.gravity = Vector3(0, -9.8, 0)

    # Size
    material.scale_min = 0.05
    material.scale_max = 0.15

    # Color over lifetime
    var gradient = Gradient.new()
    gradient.add_point(0.0, Color.YELLOW)
    gradient.add_point(0.5, Color.ORANGE)
    gradient.add_point(1.0, Color(1, 0, 0, 0))  # Fade to transparent red

    material.color_ramp = GradientTexture1D.new()
    material.color_ramp.gradient = gradient

    # Fade out
    var alpha_curve = Curve.new()
    alpha_curve.add_point(Vector2(0, 1))
    alpha_curve.add_point(Vector2(1, 0))

    material.alpha_curve = CurveTexture.new()
    material.alpha_curve.curve = alpha_curve

    particles.process_material = material

    # Draw pass (visual representation)
    var sphere_mesh = SphereMesh.new()
    sphere_mesh.radial_segments = 8
    sphere_mesh.rings = 4
    sphere_mesh.radius = 0.05
    particles.draw_pass_1 = sphere_mesh

    return particles

func create_dust_impact() -> GPUParticles3D:
    var particles = GPUParticles3D.new()

    particles.amount = 15
    particles.lifetime = 1.0
    particles.one_shot = true
    particles.explosiveness = 0.6

    var material = ParticleProcessMaterial.new()

    # Emission
    material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
    material.emission_sphere_radius = 0.3

    # Movement - spread outward and up
    material.direction = Vector3.UP
    material.spread = 45.0
    material.initial_velocity_min = 1.0
    material.initial_velocity_max = 3.0
    material.gravity = Vector3(0, -2.0, 0)

    # Size changes over time
    var size_curve = Curve.new()
    size_curve.add_point(Vector2(0, 0.5))
    size_curve.add_point(Vector2(0.3, 1.0))
    size_curve.add_point(Vector2(1, 0.2))

    material.scale_curve = CurveTexture.new()
    material.scale_curve.curve = size_curve

    material.scale_min = 0.2
    material.scale_max = 0.4

    # Color - brown/gray dust
    material.color = Color(0.6, 0.5, 0.4)

    # Fade out
    var alpha_curve = Curve.new()
    alpha_curve.add_point(Vector2(0, 0.8))
    alpha_curve.add_point(Vector2(0.7, 0.5))
    alpha_curve.add_point(Vector2(1, 0))

    material.alpha_curve = CurveTexture.new()
    material.alpha_curve.curve = alpha_curve

    particles.process_material = material

    # Billboard quad for dust
    var quad_mesh = QuadMesh.new()
    quad_mesh.size = Vector2(0.3, 0.3)
    particles.draw_pass_1 = quad_mesh

    return particles

# Play effects
func play_hit_effect(position: Vector3, intensity: float = 1.0):
    var particles = get_available_particle(hit_spark_pool)
    if particles:
        particles.global_position = position
        particles.amount = int(20 * intensity)

        # Scale effect based on intensity
        var mat = particles.process_material as ParticleProcessMaterial
        mat.initial_velocity_max = 5.0 * intensity

        particles.emitting = true
        particles.restart()

func play_dust_effect(position: Vector3):
    var particles = get_available_particle(dust_pool)
    if particles:
        particles.global_position = position
        particles.emitting = true
        particles.restart()

func get_available_particle(pool: Array[GPUParticles3D]) -> GPUParticles3D:
    # Find non-emitting particle
    for particle in pool:
        if not particle.emitting:
            return particle
    return pool[0]  # Fallback to first particle
```

---

## Pattern 2: Advanced Impact Effects

### Multi-Layered Hit Effects
```gdscript
# enhanced_vfx_manager.gd
extends Node3D

var combat_particles: CombatParticles
var flash_light: OmniLight3D

func _ready():
    combat_particles = CombatParticles.new()
    add_child(combat_particles)

    # Impact flash light
    flash_light = OmniLight3D.new()
    flash_light.omni_range = 3.0
    flash_light.energy = 0.0
    add_child(flash_light)

func play_hit_effect(position: Vector3, hit_type: String, intensity: float = 1.0):
    # Particles
    combat_particles.play_hit_effect(position, intensity)
    combat_particles.play_dust_effect(position)

    # Light flash
    flash_light.global_position = position
    flash_impact_light(intensity)

    # Screen effect for heavy hits
    if hit_type == "heavy" or hit_type == "special":
        apply_hit_freeze(0.1 * intensity)

func flash_impact_light(intensity: float):
    var tween = create_tween()
    flash_light.energy = 5.0 * intensity

    match intensity:
        var x when x >= 2.0:  # Special attack
            flash_light.light_color = Color.PURPLE
        var x when x >= 1.5:  # Heavy attack
            flash_light.light_color = Color.ORANGE_RED
        _:  # Light attack
            flash_light.light_color = Color.YELLOW

    # Fade out quickly
    tween.tween_property(flash_light, "energy", 0.0, 0.15)

func apply_hit_freeze(duration: float):
    # Brief pause for impact feel
    Engine.time_scale = 0.1
    await get_tree().create_timer(duration, false).timeout  # Real time
    Engine.time_scale = 1.0

# Trail effect for fast movements
func create_motion_trail(fighter: Node3D) -> GPUParticles3D:
    var trail = GPUParticles3D.new()
    trail.amount = 50
    trail.lifetime = 0.3
    trail.preprocess = 0.1

    var material = ParticleProcessMaterial.new()
    material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
    material.emission_sphere_radius = 0.3

    # Particles stay where emitted (no velocity)
    material.direction = Vector3.ZERO
    material.initial_velocity_min = 0.0
    material.initial_velocity_max = 0.0

    # Fade out
    var alpha_curve = Curve.new()
    alpha_curve.add_point(Vector2(0, 1))
    alpha_curve.add_point(Vector2(1, 0))
    material.alpha_curve = CurveTexture.new()
    material.alpha_curve.curve = alpha_curve

    # Color based on fighter
    material.color = Color(0.5, 0.5, 1.0, 0.5)

    trail.process_material = material
    trail.draw_pass_1 = SphereMesh.new()

    fighter.add_child(trail)
    return trail
```

---

## Pattern 3: Dynamic Lighting for Arena

### Combat Arena Lighting Setup
```gdscript
# arena_lighting.gd
extends Node3D

@onready var directional_light: DirectionalLight3D = $DirectionalLight3D
@onready var rim_light1: SpotLight3D = $RimLight1
@onready var rim_light2: SpotLight3D = $RimLight2
@onready var fill_light: OmniLight3D = $FillLight

func _ready():
    setup_main_lighting()
    setup_rim_lighting()

func setup_main_lighting():
    # Main directional light (sun)
    directional_light.light_energy = 1.0
    directional_light.rotation_degrees = Vector3(-45, 45, 0)

    # Enable shadows with PCSS (contact-hardening)
    directional_light.shadow_enabled = true
    directional_light.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_4_SPLITS

    # Soft shadows
    directional_light.shadow_blur = 1.5

    # Warm color for dramatic look
    directional_light.light_color = Color(1.0, 0.95, 0.85)

func setup_rim_lighting():
    # Rim lights highlight fighter edges (fighting game style)

    # Rim light 1 (blue, from left)
    rim_light1.light_energy = 2.0
    rim_light1.light_color = Color(0.5, 0.7, 1.0)  # Cool blue
    rim_light1.spot_range = 15.0
    rim_light1.spot_angle = 45.0
    rim_light1.position = Vector3(-5, 3, 0)
    rim_light1.rotation_degrees = Vector3(-30, 45, 0)

    # Rim light 2 (orange, from right)
    rim_light2.light_energy = 2.0
    rim_light2.light_color = Color(1.0, 0.6, 0.3)  # Warm orange
    rim_light2.spot_range = 15.0
    rim_light2.spot_angle = 45.0
    rim_light2.position = Vector3(5, 3, 0)
    rim_light2.rotation_degrees = Vector3(-30, -45, 0)

    # Fill light (subtle ambient)
    fill_light.light_energy = 0.3
    fill_light.light_color = Color.WHITE
    fill_light.omni_range = 20.0
    fill_light.position = Vector3(0, 5, 0)

# Dynamic lighting during combat
func pulse_lights_on_hit(hit_position: Vector3):
    var tween = create_tween()
    tween.set_parallel(true)

    # Increase rim light intensity briefly
    tween.tween_property(rim_light1, "light_energy", 3.0, 0.1)
    tween.tween_property(rim_light2, "light_energy", 3.0, 0.1)

    tween.chain()

    tween.tween_property(rim_light1, "light_energy", 2.0, 0.3)
    tween.tween_property(rim_light2, "light_energy", 2.0, 0.3)

# Victory lighting
func victory_lighting(winner_position: Vector3):
    # Spotlight on winner
    var spotlight = SpotLight3D.new()
    add_child(spotlight)

    spotlight.light_energy = 5.0
    spotlight.light_color = Color.GOLD
    spotlight.spot_range = 10.0
    spotlight.spot_angle = 30.0
    spotlight.position = winner_position + Vector3(0, 5, 0)
    spotlight.look_at(winner_position, Vector3.UP)

    # Fade in spotlight
    spotlight.light_energy = 0.0
    var tween = create_tween()
    tween.tween_property(spotlight, "light_energy", 5.0, 1.0)
```

---

## Pattern 4: Environment Effects

### Arena Environment and Atmosphere
```gdscript
# arena_environment.gd
extends WorldEnvironment

func _ready():
    setup_environment()

func setup_environment():
    var env = Environment.new()

    # Sky
    var sky = Sky.new()
    var sky_material = ProceduralSkyMaterial.new()
    sky_material.sky_top_color = Color(0.4, 0.6, 1.0)
    sky_material.sky_horizon_color = Color(0.7, 0.8, 0.9)
    sky_material.ground_bottom_color = Color(0.2, 0.2, 0.25)
    sky.sky_material = sky_material

    env.background_mode = Environment.BG_SKY
    env.sky = sky

    # Ambient light
    env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
    env.ambient_light_energy = 0.5

    # Glow (bloom) for dramatic effect
    env.glow_enabled = true
    env.glow_intensity = 0.8
    env.glow_strength = 1.2
    env.glow_bloom = 0.3
    env.glow_blend_mode = Environment.GLOW_BLEND_MODE_SOFTLIGHT

    # Tone mapping for punchy colors
    env.tonemap_mode = Environment.TONE_MAPPER_ACES
    env.tonemap_exposure = 1.2

    # SSAO for depth
    env.ssao_enabled = true
    env.ssao_radius = 1.0
    env.ssao_intensity = 1.5

    # SSR for floor reflections
    env.ssr_enabled = true
    env.ssr_max_steps = 32

    environment = env
```

---

## Pattern 5: Performance-Optimized VFX

### VFX Quality Settings
```gdscript
# vfx_quality_manager.gd
class_name VFXQualityManager

enum Quality {
    LOW,
    MEDIUM,
    HIGH,
    ULTRA
}

static func apply_quality_preset(quality: Quality):
    match quality:
        Quality.LOW:
            # Minimal particles
            RenderingServer.gi_set_use_half_resolution(true)
            apply_particle_quality(0.5)

        Quality.MEDIUM:
            RenderingServer.gi_set_use_half_resolution(false)
            apply_particle_quality(0.75)

        Quality.HIGH:
            apply_particle_quality(1.0)
            enable_advanced_effects(true)

        Quality.ULTRA:
            apply_particle_quality(1.5)
            enable_advanced_effects(true)

static func apply_particle_quality(multiplier: float):
    # Adjust particle counts globally
    var particles = get_tree().get_nodes_in_group("particles")
    for particle in particles:
        if particle is GPUParticles3D:
            var base_amount = particle.get_meta("base_amount", particle.amount)
            particle.amount = int(base_amount * multiplier)

static func enable_advanced_effects(enabled: bool):
    var env = get_tree().get_first_node_in_group("world_environment") as WorldEnvironment
    if env and env.environment:
        env.environment.ssao_enabled = enabled
        env.environment.ssr_enabled = enabled
        env.environment.glow_enabled = enabled
```

---

## Integration with Your Fighter System

### Updated fighter.gd with VFX
```gdscript
# In your fighter.gd
@onready var vfx_manager = get_node("/root/Main/VFXManager")
@onready var motion_trail: GPUParticles3D

func execute_action() -> Dictionary:
    var result = super.execute_action()  # Call parent

    # Add VFX based on action
    match current_action:
        ActionType.LIGHT_ATTACK:
            enable_motion_trail()

        ActionType.HEAVY_ATTACK:
            enable_motion_trail()

        ActionType.DODGE:
            enable_motion_trail(0.5)  # Longer trail for dodge

    return result

func take_damage(damage: int, attacker_action: ActionType, attacker_position: Vector3):
    super.take_damage(damage, attacker_action, attacker_position)

    if vfx_manager and damage > 0:
        var hit_pos = global_position + Vector3.UP * 1.0

        # VFX based on damage
        if attacker_action == ActionType.SPECIAL:
            vfx_manager.play_hit_effect(hit_pos, "special", 2.0)
        elif attacker_action == ActionType.HEAVY_ATTACK:
            vfx_manager.play_hit_effect(hit_pos, "heavy", 1.5)
        else:
            vfx_manager.play_hit_effect(hit_pos, "light", 1.0)

func enable_motion_trail(duration: float = 0.3):
    if not motion_trail:
        motion_trail = vfx_manager.create_motion_trail(self)

    motion_trail.emitting = true
    await get_tree().create_timer(duration).timeout
    motion_trail.emitting = false
```

---

## Key Takeaways

1. **Use GPUParticles3D** for performance (not CPUParticles3D)
2. **Pool particles** - reuse instead of create/destroy
3. **Multi-layer effects** - combine particles + lights + screen effects
4. **Rim lighting** gives fighting game look (blue/orange from sides)
5. **Quality settings** let players adjust for performance

---

**Upgrade Priority:** MEDIUM-HIGH - Major visual upgrade
**Implementation Time:** 4-5 hours for complete VFX system
**Visual Impact:** VERY HIGH - Makes game look professional
