extends Button

signal skill_selected(skill: Resource)

@export var current_skill: Resource:
	set(value):
		print("Setting skill resource:", value)
		current_skill = value
		if is_inside_tree():
			if value is Skill:
				print("Setting Skill resource with name:", value.skill_name)
			elif value is CharacterAbilities:
				print("Setting CharacterAbilities resource with name:", value.ability_name)
			_update_display()

func _ready():
	print("Enhanced Button _ready called")
	if current_skill:
		print("Initial skill: ", current_skill)
		_update_display()

	# Connect to mouse signals for juice effects
	mouse_entered.connect(_on_mouse_entered)
	mouse_exited.connect(_on_mouse_exited)

func setup(skill: Resource) -> void:
	print("Setup called with skill: ", skill)
	current_skill = skill
	_update_display()

func _update_display() -> void:
	print("Updating display for current_skill:", current_skill)
	var container = $HBoxContainer
	var name_label = container.get_node_or_null("VBoxContainer/HBox#SkillName")
	var desc_label = container.get_node_or_null("VBoxContainer/Description")
	var cost_label = container.get_node_or_null("HBox#SkillCost")
	var icon_rect = container.get_node_or_null("HBox#Icon")

	if current_skill is Skill:
		# Get skill emoji/icon based on type
		var skill_emoji = _get_skill_emoji(current_skill)

		name_label.text = skill_emoji + " " + current_skill.skill_name

		# Set description
		if desc_label:
			desc_label.text = current_skill.description if current_skill.description else "Deals damage to target"

		# Set cost with water drop emoji
		cost_label.text = "💧 " + str(current_skill.sp_cost) + " SP"

		if current_skill.icon and icon_rect:
			icon_rect.texture = current_skill.icon

		# Check if skill can be used and disable button if not
		var battle_manager = get_tree().get_first_node_in_group("battle_manager")
		var can_use = true
		if battle_manager and battle_manager.current_character:
			can_use = current_skill.can_use(battle_manager.current_character)

		disabled = !can_use
		if !can_use:
			modulate = Color(0.5, 0.5, 0.5, 0.7)  # Gray out disabled skills
			if desc_label:
				desc_label.text = "Not enough SP!"
		else:
			modulate = Color.WHITE
	elif current_skill is CharacterAbilities:
		# Here's where we need to map abilities to proper skill names
		var skill_name = ""
		match current_skill.ability_name.to_lower():
			"damage":
				skill_name = "🔥 Fireball"
			"heal":
				skill_name = "💚 Heal"
			_:
				skill_name = current_skill.ability_name

		name_label.text = skill_name
		cost_label.text = "💧 " + str(int(current_skill.number_value)) + " SP"

func _get_skill_emoji(skill: Skill) -> String:
	"""Return appropriate emoji based on skill type"""
	# Check skill name for keywords
	var name_lower = skill.skill_name.to_lower()

	if "fire" in name_lower or "flame" in name_lower:
		return "🔥"
	elif "ice" in name_lower or "frost" in name_lower:
		return "❄️"
	elif "thunder" in name_lower or "lightning" in name_lower or "bolt" in name_lower:
		return "⚡"
	elif "heal" in name_lower or "cure" in name_lower:
		return "💚"
	elif "attack" in name_lower or "strike" in name_lower:
		return "⚔️"
	elif "counter" in name_lower:
		return "🛡️"
	elif "wind" in name_lower or "air" in name_lower:
		return "💨"
	elif "earth" in name_lower or "stone" in name_lower:
		return "🪨"
	elif "water" in name_lower or "aqua" in name_lower:
		return "💧"
	elif "dark" in name_lower or "shadow" in name_lower:
		return "🌑"
	elif "light" in name_lower or "holy" in name_lower:
		return "✨"
	else:
		return "⚔️"  # Default sword

func _on_mouse_entered():
	# Pulse animation when hovering
	if has_node("AnimationPlayer"):
		$AnimationPlayer.play("pulse")

func _on_mouse_exited():
	# Stop pulse animation
	if has_node("AnimationPlayer"):
		$AnimationPlayer.stop()

func _pressed():
	# Add a quick scale animation on press
	var tween = create_tween()
	tween.set_ease(Tween.EASE_OUT)
	tween.set_trans(Tween.TRANS_ELASTIC)
	tween.tween_property(self, "scale", Vector2(0.95, 0.95), 0.1)
	tween.tween_property(self, "scale", Vector2(1.0, 1.0), 0.2)

	print("Button pressed, emitting skill:", current_skill)
	skill_selected.emit(current_skill)
