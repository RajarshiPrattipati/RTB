extends Node3D
class_name VFXManager

# Particle effect pools
var hit_particles: Array = []
var slash_particles: Array = []
var dust_particles: Array = []

# Camera shake
var camera_shake_strength: float = 0.0
var camera_shake_decay: float = 5.0
var camera_original_position: Vector3
var camera_node: Camera3D

func _ready():
	create_particle_pools()

func _process(delta: float):
	# Camera shake
	if camera_shake_strength > 0:
		apply_camera_shake(delta)

func set_camera(cam: Camera3D):
	camera_node = cam
	if cam:
		camera_original_position = cam.position

func create_particle_pools():
	# Pre-create particle effects for performance
	for i in range(10):
		var hit_vfx = create_hit_effect()
		hit_particles.append(hit_vfx)
		add_child(hit_vfx)

		var slash_vfx = create_slash_effect()
		slash_particles.append(slash_vfx)
		add_child(slash_vfx)

		var dust_vfx = create_dust_effect()
		dust_particles.append(dust_vfx)
		add_child(dust_vfx)

func create_hit_effect() -> GPUParticles3D:
	var particles = GPUParticles3D.new()
	particles.emitting = false
	particles.one_shot = true
	particles.amount = 20
	particles.lifetime = 0.5
	particles.explosiveness = 1.0

	# Create particle material
	var process_material = ParticleProcessMaterial.new()
	process_material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
	process_material.emission_sphere_radius = 0.2
	process_material.direction = Vector3(0, 1, 0)
	process_material.spread = 180
	process_material.initial_velocity_min = 3.0
	process_material.initial_velocity_max = 6.0
	process_material.gravity = Vector3(0, -9.8, 0)
	process_material.scale_min = 0.1
	process_material.scale_max = 0.3

	# Color gradient
	var gradient = Gradient.new()
	gradient.set_color(0, Color(1, 0.8, 0))
	gradient.set_color(0.5, Color(1, 0.3, 0))
	gradient.set_color(1, Color(0.5, 0, 0, 0))
	process_material.color_ramp = GradientTexture1D.new()
	process_material.color_ramp.gradient = gradient

	particles.process_material = process_material

	# Mesh for particles
	var mesh = SphereMesh.new()
	mesh.radius = 0.1
	mesh.height = 0.2
	particles.draw_pass_1 = mesh

	return particles

func create_slash_effect() -> GPUParticles3D:
	var particles = GPUParticles3D.new()
	particles.emitting = false
	particles.one_shot = true
	particles.amount = 10
	particles.lifetime = 0.3
	particles.explosiveness = 1.0

	var process_material = ParticleProcessMaterial.new()
	process_material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	process_material.emission_box_extents = Vector3(0.5, 0.5, 0.1)
	process_material.direction = Vector3(0, 0, -1)
	process_material.spread = 20
	process_material.initial_velocity_min = 5.0
	process_material.initial_velocity_max = 8.0
	process_material.gravity = Vector3(0, 0, 0)
	process_material.scale_min = 0.2
	process_material.scale_max = 0.5

	var gradient = Gradient.new()
	gradient.set_color(0, Color(0.7, 0.9, 1, 1))
	gradient.set_color(1, Color(0.3, 0.5, 0.8, 0))
	process_material.color_ramp = GradientTexture1D.new()
	process_material.color_ramp.gradient = gradient

	particles.process_material = process_material

	var mesh = BoxMesh.new()
	mesh.size = Vector3(0.3, 0.1, 0.1)
	particles.draw_pass_1 = mesh

	return particles

func play_hit_effect(pos: Vector3):
	for particle in hit_particles:
		if not particle.emitting:
			particle.global_position = pos
			particle.emitting = true
			return

func play_slash_effect(pos: Vector3, direction: Vector3):
	for particle in slash_particles:
		if not particle.emitting:
			particle.global_position = pos
			particle.look_at(pos + direction)
			particle.emitting = true
			return

func create_dust_effect() -> GPUParticles3D:
	"""Dust particles for ground impacts"""
	var particles = GPUParticles3D.new()
	particles.emitting = false
	particles.one_shot = true
	particles.amount = 15
	particles.lifetime = 0.8
	particles.explosiveness = 0.8

	var process_material = ParticleProcessMaterial.new()
	process_material.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
	process_material.emission_sphere_radius = 0.3
	process_material.direction = Vector3(0, 1, 0)
	process_material.spread = 45
	process_material.initial_velocity_min = 1.0
	process_material.initial_velocity_max = 3.0
	process_material.gravity = Vector3(0, -2.0, 0)
	process_material.scale_min = 0.2
	process_material.scale_max = 0.5

	var gradient = Gradient.new()
	gradient.set_color(0, Color(0.6, 0.5, 0.4, 0.8))
	gradient.set_color(1, Color(0.4, 0.3, 0.2, 0))
	process_material.color_ramp = GradientTexture1D.new()
	process_material.color_ramp.gradient = gradient

	particles.process_material = process_material

	var mesh = SphereMesh.new()
	mesh.radius = 0.05
	particles.draw_pass_1 = mesh

	return particles

func play_dust_effect(pos: Vector3):
	"""Play dust effect at position"""
	for particle in dust_particles:
		if not particle.emitting:
			particle.global_position = pos
			particle.global_position.y = 0.1  # Just above ground
			particle.emitting = true
			return

func create_screen_flash(color: Color, duration: float = 0.1):
	# Screen flash effect for heavy hits
	var flash = ColorRect.new()
	flash.color = color
	flash.color.a = 0.3
	flash.set_anchors_preset(Control.PRESET_FULL_RECT)

	get_tree().root.add_child(flash)

	var tween = create_tween()
	tween.tween_property(flash, "modulate:a", 0, duration)
	tween.tween_callback(flash.queue_free)

func shake_camera(strength: float):
	"""Trigger camera shake with given strength"""
	camera_shake_strength = strength

func apply_camera_shake(delta: float):
	"""Apply camera shake effect"""
	if not camera_node:
		return

	# Random shake offset
	var shake_offset = Vector3(
		randf_range(-1, 1),
		randf_range(-1, 1),
		randf_range(-1, 1)
	) * camera_shake_strength

	camera_node.position = camera_original_position + shake_offset

	# Decay shake
	camera_shake_strength = max(0, camera_shake_strength - camera_shake_decay * delta)

	# Reset camera when done
	if camera_shake_strength <= 0:
		camera_node.position = camera_original_position

func play_impact_effect(pos: Vector3, strength: float = 1.0):
	"""Play combined impact effect"""
	play_hit_effect(pos)
	play_dust_effect(pos)
	shake_camera(strength * 0.2)

	if strength > 15:
		create_screen_flash(Color(1, 1, 1), 0.1)
