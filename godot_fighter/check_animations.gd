extends Node

func _ready():
	var scene = load("res://battle-manager/enemies/Ogrork_Goblimp_rigged.glb")
	var instance = scene.instantiate()
	add_child(instance)

	print("=== CHECKING OGRORK ANIMATIONS ===")

	# Find AnimationPlayer
	var anim_player = _find_animation_player(instance)
	if anim_player:
		print("Found AnimationPlayer at: ", anim_player.get_path())
		var animations = anim_player.get_animation_list()
		print("Available animations: ", animations)
		for anim_name in animations:
			print("  - ", anim_name)
	else:
		print("No AnimationPlayer found")

	# Print scene structure
	print("\n=== SCENE STRUCTURE ===")
	_print_tree(instance, 0)

	queue_free()

func _find_animation_player(node: Node) -> AnimationPlayer:
	if node is AnimationPlayer:
		return node
	for child in node.get_children():
		var result = _find_animation_player(child)
		if result:
			return result
	return null

func _print_tree(node: Node, depth: int):
	var indent = ""
	for i in range(depth):
		indent += "  "
	print(indent, node.name, " (", node.get_class(), ")")
	for child in node.get_children():
		_print_tree(child, depth + 1)
