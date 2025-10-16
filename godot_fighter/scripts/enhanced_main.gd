extends Node3D

# Enhanced main scene with all features
var battle_manager: BattleManager
var battle_ui: BattleUI
var fighting_camera: FightingCamera
var vfx_manager: VFXManager
var arena: Arena
var performance_monitor: PerformanceMonitor

func _ready():
	setup_components()
	setup_battle()

func setup_components():
	"""Initialize all game systems"""
	# Get references to scene nodes
	arena = get_node_or_null("Arena")
	fighting_camera = get_node_or_null("FightingCamera")
	vfx_manager = get_node_or_null("VFXManager")
	performance_monitor = get_node_or_null("PerformanceMonitor")

	# Set up camera for VFX system
	if fighting_camera and vfx_manager:
		var cam = fighting_camera.get_node_or_null("Camera3D")
		if cam:
			vfx_manager.set_camera(cam)

func setup_battle():
	"""Initialize battle system"""
	battle_manager = get_node_or_null("BattleManager")
	battle_ui = get_node_or_null("BattleUI")

	if not battle_manager:
		push_error("Battle manager not found!")
		return

	# Connect VFX manager to battle
	if vfx_manager:
		battle_manager.set_vfx_manager(vfx_manager)

	# Connect UI to battle manager
	if battle_ui:
		battle_ui.connect_to_battle_manager(battle_manager)
		battle_manager.ui = battle_ui

	# Set up camera to follow fighters
	if fighting_camera:
		var player = battle_manager.get_node_or_null("PlayerFighter")
		var enemy = battle_manager.get_node_or_null("EnemyFighter")
		if player and enemy:
			fighting_camera.set_fighters(player, enemy)

	print("=== Enhanced Battle System Initialized ===")
	print("Press 1-5 for actions | R to restart | F3 for performance stats")

func _input(event):
	# Keyboard shortcuts for actions
	if not battle_manager:
		return

	if event is InputEventKey and event.pressed:
		match event.keycode:
			KEY_1:
				battle_manager.player_select_action(Fighter.ActionType.LIGHT_ATTACK)
			KEY_2:
				battle_manager.player_select_action(Fighter.ActionType.HEAVY_ATTACK)
			KEY_3:
				battle_manager.player_select_action(Fighter.ActionType.BLOCK)
			KEY_4:
				battle_manager.player_select_action(Fighter.ActionType.SPECIAL)
			KEY_5:
				battle_manager.player_select_action(Fighter.ActionType.DODGE)
			KEY_R:
				# Restart battle
				get_tree().reload_current_scene()
