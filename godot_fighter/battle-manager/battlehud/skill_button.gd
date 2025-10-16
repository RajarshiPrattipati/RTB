extends Button

signal skill_selected(skill: Resource)

@onready var tooltip_scene = preload("res://battle-manager/battlehud/skill-tooltip.tscn")
@onready var badge_scene = preload("res://battle-manager/battlehud/effect-badge.tscn")
var tooltip_instance = null
var hover_timer: Timer = null

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

	# Create hover timer for tooltip delay
	hover_timer = Timer.new()
	hover_timer.wait_time = 0.5  # 500ms delay before showing tooltip
	hover_timer.one_shot = true
	add_child(hover_timer)
	hover_timer.timeout.connect(_show_tooltip)

	# Connect to mouse signals for juice effects
	mouse_entered.connect(_on_mouse_entered)
	mouse_exited.connect(_on_mouse_exited)

func setup(skill: Resource) -> void:
	print("Setup called with skill: ", skill)
	current_skill = skill
	_update_display()

func _update_display() -> void:
	if !is_inside_tree():
		return

	print("Updating display for current_skill:", current_skill)

	if !has_node("HBoxContainer"):
		return

	var container = $HBoxContainer
	var name_label = container.get_node_or_null("VBoxContainer/HBox#SkillName")
	var cost_label = container.get_node_or_null("HBox#SkillCost")
	var icon_rect = container.get_node_or_null("HBox#Icon")  # Now a ColorRect instead of TextureRect

	# Safety check - make sure we have the required nodes
	if !name_label or !cost_label:
		print("Warning: Required UI nodes not found in skill button")
		return

	if current_skill is Skill:
		# Get skill emoji/icon based on type
		var skill_emoji = _get_skill_emoji(current_skill)

		name_label.text = skill_emoji + " " + current_skill.skill_name

		# Set cost with water drop emoji
		cost_label.text = "💧 " + str(current_skill.sp_cost) + " SP"

		# Add effect badges
		_setup_badges(current_skill)

		# Set icon color based on skill type (icon_rect is now a ColorRect)
		if icon_rect and icon_rect is ColorRect:
			icon_rect.color = _get_skill_color(current_skill)

		# Check if skill can be used and disable button if not
		var battle_manager = get_tree().get_first_node_in_group("battle_manager")
		var can_use = true
		if battle_manager and battle_manager.current_character:
			can_use = current_skill.can_use(battle_manager.current_character)

		disabled = !can_use
		if !can_use:
			modulate = Color(0.5, 0.5, 0.5, 0.7)  # Gray out disabled skills
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

		if name_label:
			name_label.text = skill_name
		if cost_label:
			cost_label.text = "💧 " + str(int(current_skill.number_value)) + " SP"

func _setup_badges(skill: Skill) -> void:
	"""Create effect badges based on skill properties"""
	if !has_node("HBoxContainer/VBoxContainer/BadgeContainer"):
		return

	var badge_container = $HBoxContainer/VBoxContainer/BadgeContainer

	# Clear existing badges
	for child in badge_container.get_children():
		child.queue_free()

	var badges = []
	var skill_lower = skill.skill_name.to_lower()

	# Determine damage type
	if skill.effect_type == Skill.EFFECT_TYPE.DAMAGE:
		if skill.element == 0:  # Physical
			badges.append("physical")
		else:
			badges.append("magical")

	# Add elemental/effect badges based on skill name/element
	if "fire" in skill_lower or "flame" in skill_lower:
		badges.append("burn")
	elif "ice" in skill_lower or "frost" in skill_lower:
		badges.append("freeze")
	elif "thunder" in skill_lower or "lightning" in skill_lower:
		badges.append("paralyze")
	elif "poison" in skill_lower or "toxic" in skill_lower:
		badges.append("poison")
	elif "dark" in skill_lower or "shadow" in skill_lower:
		badges.append("lifedrain")
	elif "counter" in skill_lower:
		badges.append("defense")
	elif "wind" in skill_lower or "air" in skill_lower:
		badges.append("evasion")
	elif "heal" in skill_lower or "cure" in skill_lower:
		badges.append("cleanse")

	# Check if AoE
	if skill.target_type == Skill.TARGETS_TYPES.MULTIPLE_ENEMIES or skill.target_type == Skill.TARGETS_TYPES.ALL_TARGETS:
		badges.append("aoe")

	# Create badge instances
	for badge_type in badges:
		var badge = badge_scene.instantiate()
		badge_container.add_child(badge)
		badge.setup(badge_type)

func _get_skill_color(skill: Skill) -> Color:
	"""Return color based on skill type"""
	var name_lower = skill.skill_name.to_lower()

	if "fire" in name_lower or "flame" in name_lower:
		return Color(1.0, 0.3, 0.2)  # Red-orange
	elif "ice" in name_lower or "frost" in name_lower:
		return Color(0.4, 0.7, 1.0)  # Light blue
	elif "thunder" in name_lower or "lightning" in name_lower or "bolt" in name_lower:
		return Color(1.0, 1.0, 0.3)  # Yellow
	elif "heal" in name_lower or "cure" in name_lower:
		return Color(0.3, 1.0, 0.3)  # Green
	elif "attack" in name_lower or "strike" in name_lower:
		return Color(0.8, 0.2, 0.2)  # Red
	elif "counter" in name_lower:
		return Color(0.5, 0.5, 0.9)  # Blue
	elif "wind" in name_lower or "air" in name_lower:
		return Color(0.7, 0.9, 0.7)  # Light green
	elif "earth" in name_lower or "stone" in name_lower:
		return Color(0.6, 0.5, 0.3)  # Brown
	elif "water" in name_lower or "aqua" in name_lower:
		return Color(0.3, 0.5, 0.9)  # Blue
	elif "dark" in name_lower or "shadow" in name_lower:
		return Color(0.3, 0.2, 0.4)  # Dark purple
	elif "light" in name_lower or "holy" in name_lower:
		return Color(1.0, 1.0, 0.8)  # Light yellow
	else:
		return Color(0.5, 0.6, 0.8)  # Default gray-blue

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

	# Start tooltip timer
	if hover_timer and current_skill is Skill:
		hover_timer.start()

func _on_mouse_exited():
	# Stop pulse animation
	if has_node("AnimationPlayer"):
		$AnimationPlayer.stop()

	# Cancel tooltip timer and hide tooltip
	if hover_timer:
		hover_timer.stop()
	_hide_tooltip()

func _show_tooltip():
	if !current_skill or !(current_skill is Skill):
		return

	# Get the canvas layer (BattleHUD)
	var canvas_layer = get_tree().get_first_node_in_group("BattleHud")
	if !canvas_layer:
		return

	# Create tooltip if it doesn't exist
	if !tooltip_instance:
		tooltip_instance = tooltip_scene.instantiate()
		canvas_layer.add_child(tooltip_instance)
		tooltip_instance.setup(current_skill)

	# Force tooltip size to match Battle Skills panel (500x430)
	tooltip_instance.custom_minimum_size = Vector2(500, 0)
	tooltip_instance.size = Vector2(500, min(430, tooltip_instance.size.y))

	# Position tooltip next to the button
	var button_rect = get_global_rect()
	var tooltip_pos = Vector2.ZERO

	# Position to the left of the button
	tooltip_pos.x = button_rect.position.x - 500 - 20
	tooltip_pos.y = button_rect.position.y

	# Ensure tooltip stays on screen
	var viewport_size = get_viewport_rect().size
	if tooltip_pos.x < 10:
		# If it goes off left side, show on right
		tooltip_pos.x = button_rect.position.x + button_rect.size.x + 20
	if tooltip_pos.y + 430 > viewport_size.y:
		tooltip_pos.y = viewport_size.y - 430 - 10
	if tooltip_pos.y < 10:
		tooltip_pos.y = 10

	tooltip_instance.global_position = tooltip_pos
	tooltip_instance.show_tooltip()

func _hide_tooltip():
	if tooltip_instance and is_instance_valid(tooltip_instance):
		tooltip_instance.hide_tooltip()
		# Clean up after animation
		await get_tree().create_timer(0.2).timeout
		if tooltip_instance and is_instance_valid(tooltip_instance):
			tooltip_instance.queue_free()
			tooltip_instance = null

func _pressed():
	# Add a quick scale animation on press
	var tween = create_tween()
	tween.set_ease(Tween.EASE_OUT)
	tween.set_trans(Tween.TRANS_ELASTIC)
	tween.tween_property(self, "scale", Vector2(0.95, 0.95), 0.1)
	tween.tween_property(self, "scale", Vector2(1.0, 1.0), 0.2)

	print("Button pressed, emitting skill:", current_skill)
	skill_selected.emit(current_skill)
