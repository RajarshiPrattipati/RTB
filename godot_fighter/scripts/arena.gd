extends Node3D
class_name Arena

# Arena setup with floor, walls, and lighting

@export var arena_size: float = 20.0
@export var wall_height: float = 3.0

func _ready():
	create_floor()
	create_walls()
	create_lighting()

func create_floor():
	"""Create arena floor with collision"""
	# Floor mesh
	var floor_mesh = MeshInstance3D.new()
	var plane_mesh = PlaneMesh.new()
	plane_mesh.size = Vector2(arena_size, arena_size)
	floor_mesh.mesh = plane_mesh

	# Floor material
	var mat = StandardMaterial3D.new()
	mat.albedo_color = Color(0.3, 0.3, 0.35)
	mat.metallic = 0.2
	mat.roughness = 0.8
	floor_mesh.set_surface_override_material(0, mat)

	add_child(floor_mesh)

	# Collision shape
	var static_body = StaticBody3D.new()
	var collision_shape = CollisionShape3D.new()
	var shape = BoxShape3D.new()
	shape.size = Vector3(arena_size, 0.1, arena_size)
	collision_shape.shape = shape
	collision_shape.position.y = -0.05
	static_body.add_child(collision_shape)
	add_child(static_body)

func create_walls():
	"""Create boundary walls (invisible collision)"""
	var half_size = arena_size / 2.0

	# Create 4 walls
	var wall_positions = [
		Vector3(0, wall_height / 2, half_size),   # North
		Vector3(0, wall_height / 2, -half_size),  # South
		Vector3(half_size, wall_height / 2, 0),   # East
		Vector3(-half_size, wall_height / 2, 0)   # West
	]

	var wall_sizes = [
		Vector3(arena_size, wall_height, 0.5),  # North/South
		Vector3(arena_size, wall_height, 0.5),
		Vector3(0.5, wall_height, arena_size),  # East/West
		Vector3(0.5, wall_height, arena_size)
	]

	for i in range(4):
		var wall = StaticBody3D.new()
		var collision = CollisionShape3D.new()
		var shape = BoxShape3D.new()
		shape.size = wall_sizes[i]
		collision.shape = shape
		wall.add_child(collision)
		wall.position = wall_positions[i]
		add_child(wall)

func create_lighting():
	"""Create dramatic arena lighting"""
	# Main directional light (sun)
	var sun = DirectionalLight3D.new()
	sun.light_energy = 0.8
	sun.light_color = Color(1.0, 0.95, 0.9)
	sun.rotation_degrees = Vector3(-45, 45, 0)
	sun.shadow_enabled = true
	sun.shadow_blur = 1.0
	add_child(sun)

	# Rim light 1 (blue)
	var rim_light1 = OmniLight3D.new()
	rim_light1.light_energy = 2.0
	rim_light1.light_color = Color(0.3, 0.5, 1.0)  # Blue
	rim_light1.omni_range = 15.0
	rim_light1.position = Vector3(-8, 5, -8)
	add_child(rim_light1)

	# Rim light 2 (orange)
	var rim_light2 = OmniLight3D.new()
	rim_light2.light_energy = 2.0
	rim_light2.light_color = Color(1.0, 0.5, 0.2)  # Orange
	rim_light2.omni_range = 15.0
	rim_light2.position = Vector3(8, 5, 8)
	add_child(rim_light2)

	# Fill light (soft ambient)
	var fill_light = OmniLight3D.new()
	fill_light.light_energy = 0.5
	fill_light.light_color = Color(0.9, 0.9, 1.0)
	fill_light.omni_range = 20.0
	fill_light.position = Vector3(0, 8, 0)
	add_child(fill_light)

	# Environment
	var world_env = WorldEnvironment.new()
	var env = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.1, 0.1, 0.15)
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.2, 0.2, 0.25)
	env.ambient_light_energy = 0.5
	world_env.environment = env
	add_child(world_env)
