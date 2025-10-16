extends Node

## Automatically sets up the attack animation to call damage at the right frame
## Attach this to the OgrorkEnemy root node

func _ready():
	await get_tree().process_frame

	print("=== OGRORK SETUP DEBUG ===")
	var parent = get_parent()
	print("Parent: ", parent.name)

	var ogrork_model = get_node_or_null("../OgrorkModel")
	if not ogrork_model:
		print("No OgrorkModel found")
		return

	print("OgrorkModel found, checking children:")
	_print_children(ogrork_model, 1)

	var anim_player = _find_animation_player(ogrork_model)
	if not anim_player:
		print("No AnimationPlayer found anywhere in OgrorkModel tree")
		return

	print("Found AnimationPlayer at: ", anim_player.get_path())
	print("Available animations: ", anim_player.get_animation_list())

	# Get the attack animation
	if not anim_player.has_animation("attack"):
		print("No attack animation found")
		return

	var attack_anim = anim_player.get_animation("attack")

	# Check if method track already exists
	var has_method_track = false
	for i in range(attack_anim.get_track_count()):
		if attack_anim.track_get_type(i) == Animation.TYPE_METHOD:
			has_method_track = true
			break

	# Add method track if it doesn't exist
	if not has_method_track:
		var track_idx = attack_anim.add_track(Animation.TYPE_METHOD)
		attack_anim.track_set_path(track_idx, "../..")  # Path to OgrorkEnemy root

		# Call attack at frame 15 (when the strike happens)
		var time = 15.0 / 30.0  # Frame 15 out of 30 frames = 0.5 seconds
		attack_anim.track_insert_key(track_idx, time, {
			"method": "call_attack",
			"args": []
		})

		print("Added attack call to Ogrork attack animation at time ", time)

func _find_animation_player(node: Node) -> AnimationPlayer:
	if node is AnimationPlayer:
		return node
	for child in node.get_children():
		var result = _find_animation_player(child)
		if result:
			return result
	return null

func _print_children(node: Node, depth: int):
	for child in node.get_children():
		var indent = ""
		for i in range(depth):
			indent += "  "
		print(indent, "- ", child.name, " (", child.get_class(), ")")
		if child.get_child_count() > 0:
			_print_children(child, depth + 1)
