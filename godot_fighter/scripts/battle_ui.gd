extends CanvasLayer
class_name BattleUI

signal action_button_pressed(action_type)

var battle_manager: BattleManager

# UI Elements
var player_health_bar: ProgressBar
var enemy_health_bar: ProgressBar
var turn_timer_label: Label
var action_buttons: Dictionary = {}
var combat_log: RichTextLabel

func _ready():
	setup_ui()

func setup_ui():
	# Health bars container
	var health_container = VBoxContainer.new()
	health_container.position = Vector2(20, 20)
	add_child(health_container)

	# Player health bar
	var player_health_container = HBoxContainer.new()
	health_container.add_child(player_health_container)

	var player_label = Label.new()
	player_label.text = "Player HP: "
	player_label.custom_minimum_size = Vector2(100, 0)
	player_health_container.add_child(player_label)

	player_health_bar = ProgressBar.new()
	player_health_bar.custom_minimum_size = Vector2(300, 30)
	player_health_bar.max_value = 100
	player_health_bar.value = 100
	player_health_bar.show_percentage = false

	var player_style = StyleBoxFlat.new()
	player_style.bg_color = Color(0.2, 0.8, 0.2)
	player_health_bar.add_theme_stylebox_override("fill", player_style)
	player_health_container.add_child(player_health_bar)

	# Enemy health bar
	var enemy_health_container = HBoxContainer.new()
	health_container.add_child(enemy_health_container)

	var enemy_label = Label.new()
	enemy_label.text = "Enemy HP: "
	enemy_label.custom_minimum_size = Vector2(100, 0)
	enemy_health_container.add_child(enemy_label)

	enemy_health_bar = ProgressBar.new()
	enemy_health_bar.custom_minimum_size = Vector2(300, 30)
	enemy_health_bar.max_value = 100
	enemy_health_bar.value = 100
	enemy_health_bar.show_percentage = false

	var enemy_style = StyleBoxFlat.new()
	enemy_style.bg_color = Color(0.8, 0.2, 0.2)
	enemy_health_bar.add_theme_stylebox_override("fill", enemy_style)
	enemy_health_container.add_child(enemy_health_bar)

	# Turn timer
	turn_timer_label = Label.new()
	turn_timer_label.position = Vector2(20, 100)
	turn_timer_label.add_theme_font_size_override("font_size", 24)
	add_child(turn_timer_label)

	# Action buttons at bottom center
	var action_container = HBoxContainer.new()
	action_container.position = Vector2(300, 550)
	action_container.add_theme_constant_override("separation", 15)
	add_child(action_container)

	# Create action buttons
	create_action_button(action_container, "Light Attack", Fighter.ActionType.LIGHT_ATTACK, Color(0.7, 0.7, 0.9))
	create_action_button(action_container, "Heavy Attack", Fighter.ActionType.HEAVY_ATTACK, Color(0.9, 0.4, 0.4))
	create_action_button(action_container, "Block", Fighter.ActionType.BLOCK, Color(0.5, 0.5, 0.8))
	create_action_button(action_container, "Special", Fighter.ActionType.SPECIAL, Color(1.0, 0.8, 0.2))
	create_action_button(action_container, "Dodge", Fighter.ActionType.DODGE, Color(0.4, 0.9, 0.4))

	# Combat log
	combat_log = RichTextLabel.new()
	combat_log.position = Vector2(700, 20)
	combat_log.custom_minimum_size = Vector2(350, 200)
	combat_log.bbcode_enabled = true
	combat_log.scroll_following = true
	add_child(combat_log)

	# Instructions
	var instructions = Label.new()
	instructions.position = Vector2(20, 140)
	instructions.text = "Select your action before the timer runs out!\nActions execute simultaneously every 2 seconds."
	instructions.add_theme_font_size_override("font_size", 14)
	add_child(instructions)

func create_action_button(container: HBoxContainer, button_text: String, action_type: Fighter.ActionType, color: Color):
	var button = Button.new()
	button.text = button_text
	button.custom_minimum_size = Vector2(120, 60)

	# Style the button
	var normal_style = StyleBoxFlat.new()
	normal_style.bg_color = color
	normal_style.set_border_width_all(2)
	normal_style.border_color = Color.WHITE
	normal_style.set_corner_radius_all(5)
	button.add_theme_stylebox_override("normal", normal_style)

	var hover_style = StyleBoxFlat.new()
	hover_style.bg_color = color.lightened(0.2)
	hover_style.set_border_width_all(3)
	hover_style.border_color = Color.YELLOW
	hover_style.set_corner_radius_all(5)
	button.add_theme_stylebox_override("hover", hover_style)

	var pressed_style = StyleBoxFlat.new()
	pressed_style.bg_color = color.darkened(0.2)
	pressed_style.set_border_width_all(2)
	pressed_style.border_color = Color.WHITE
	pressed_style.set_corner_radius_all(5)
	button.add_theme_stylebox_override("pressed", pressed_style)

	button.pressed.connect(_on_action_button_pressed.bind(action_type))

	container.add_child(button)
	action_buttons[action_type] = button

func _on_action_button_pressed(action_type: Fighter.ActionType):
	action_button_pressed.emit(action_type)
	highlight_selected_action(action_type)

func highlight_selected_action(action_type: Fighter.ActionType):
	# Reset all buttons
	for btn in action_buttons.values():
		btn.modulate = Color.WHITE

	# Highlight selected
	if action_type in action_buttons:
		action_buttons[action_type].modulate = Color.YELLOW

func update_player_health(current: int, maximum: int):
	player_health_bar.max_value = maximum
	player_health_bar.value = current

func update_enemy_health(current: int, maximum: int):
	enemy_health_bar.max_value = maximum
	enemy_health_bar.value = current

func update_timer(time_left: float):
	turn_timer_label.text = "Next turn in: %.1f" % time_left

func add_combat_log(message: String):
	combat_log.append_text(message + "\n")

func connect_to_battle_manager(manager: BattleManager):
	battle_manager = manager

	# Connect fighter health signals
	if manager.player_fighter:
		manager.player_fighter.health_changed.connect(update_player_health)
	if manager.enemy_fighter:
		manager.enemy_fighter.health_changed.connect(update_enemy_health)

	# Connect UI signals
	action_button_pressed.connect(manager.player_select_action)
