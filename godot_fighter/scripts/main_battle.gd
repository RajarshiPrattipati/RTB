extends Node3D

var battle_manager: BattleManager
var battle_ui: BattleUI
var vfx_manager: VFXManager

func _ready():
	setup_battle()

func setup_battle():
	"""Initialize battle system"""
	battle_manager = get_node_or_null("BattleManager")
	battle_ui = get_node_or_null("BattleUI")
	vfx_manager = get_node_or_null("VFXManager")

	if not battle_manager:
		push_error("Battle manager not found!")
		return

	# Connect VFX manager if it exists
	if vfx_manager:
		battle_manager.set_vfx_manager(vfx_manager)

	# Connect UI to battle manager
	if battle_ui:
		battle_ui.connect_to_battle_manager(battle_manager)
		battle_manager.ui = battle_ui

	print("=== Battle System Initialized ===")
	print("Press 1-5 for actions | R to restart")

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
