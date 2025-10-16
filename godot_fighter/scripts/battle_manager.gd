extends Node3D
class_name TurnBasedBattleManager

signal turn_started(turn_number)
signal turn_resolved
signal battle_ended(winner)

@export var turn_interval: float = 2.0

var player_fighter: Fighter
var enemy_fighter: Fighter
var turn_count: int = 0
var turn_timer: float = 0.0
var is_battle_active: bool = false
var actions_locked: bool = false
var vfx_manager: VFXManager

@onready var ui: BattleUI

func _ready():
	# Get fighters from scene
	player_fighter = get_node_or_null("PlayerFighter")
	enemy_fighter = get_node_or_null("EnemyFighter")

	if player_fighter and enemy_fighter:
		setup_fighters()
		start_battle()
	else:
		push_error("Fighters not found in scene!")

func setup_fighters():
	# Connect signals
	player_fighter.fighter_defeated.connect(_on_fighter_defeated.bind(player_fighter))
	enemy_fighter.fighter_defeated.connect(_on_fighter_defeated.bind(enemy_fighter))

	# Set up target locking
	player_fighter.lock_onto_target(enemy_fighter)
	enemy_fighter.lock_onto_target(player_fighter)

func set_vfx_manager(vfx: VFXManager):
	vfx_manager = vfx

func start_battle():
	is_battle_active = true
	turn_count = 0
	turn_timer = turn_interval
	print("Battle started! Select your action within ", turn_interval, " seconds.")

func _process(delta):
	if not is_battle_active:
		return

	turn_timer -= delta

	# Update UI timer if exists
	if ui:
		ui.update_timer(turn_timer)

	if turn_timer <= 0:
		execute_turn()
		turn_timer = turn_interval

func execute_turn():
	turn_count += 1
	actions_locked = true
	turn_started.emit(turn_count)

	print("\n=== TURN ", turn_count, " ===")

	# Get actions from both fighters
	var player_action_data = player_fighter.execute_action()
	var enemy_action_data = enemy_fighter.execute_action()

	# Resolve actions simultaneously
	await get_tree().create_timer(0.5).timeout
	resolve_combat(player_action_data, enemy_action_data)

	# Wait for animations to complete
	await get_tree().create_timer(1.0).timeout

	# Check for battle end
	if player_fighter.is_defeated or enemy_fighter.is_defeated:
		end_battle()
		return

	# Return to idle
	player_fighter.play_animation("idle")
	enemy_fighter.play_animation("idle")

	actions_locked = false
	turn_resolved.emit()

func resolve_combat(player_data: Dictionary, enemy_data: Dictionary):
	var player_type = player_data.type
	var enemy_type = enemy_data.type

	# Handle dodge mechanics first
	if enemy_type == Fighter.ActionType.DODGE:
		print("Enemy dodges!")
	else:
		apply_damage(player_data.damage, player_type, enemy_fighter, player_fighter)

	if player_type == Fighter.ActionType.DODGE:
		print("Player dodges!")
	else:
		apply_damage(enemy_data.damage, enemy_type, player_fighter, enemy_fighter)

	# Special interactions
	if player_type == Fighter.ActionType.HEAVY_ATTACK and enemy_type == Fighter.ActionType.HEAVY_ATTACK:
		print("CLASH! Both fighters take recoil damage!")
		if vfx_manager:
			var midpoint = (player_fighter.global_position + enemy_fighter.global_position) / 2.0
			vfx_manager.play_impact_effect(midpoint + Vector3(0, 1, 0), 20)
			vfx_manager.shake_camera(0.5)

func apply_damage(damage: int, action_type: Fighter.ActionType, target: Fighter, attacker: Fighter):
	if damage > 0:
		# Get attacker position for knockback
		var attacker_pos = attacker.global_position if attacker else Vector3.ZERO
		target.take_damage(damage, action_type, attacker_pos)

		var damage_text = "blocked" if target.is_blocking else str(damage)
		print(target.fighter_name, " takes ", damage_text, " damage! HP: ", target.current_health, "/", target.max_health)

		# Play VFX if available
		if vfx_manager and not target.is_blocking and not target.is_dodging:
			vfx_manager.play_impact_effect(target.global_position + Vector3(0, 1, 0), damage)

func _on_fighter_defeated(fighter: Fighter):
	print(fighter.fighter_name, " has been defeated!")

func end_battle():
	is_battle_active = false
	var winner = player_fighter if not player_fighter.is_defeated else enemy_fighter
	print("\n=== BATTLE END ===")
	print(winner.fighter_name, " wins!")
	battle_ended.emit(winner)

func player_select_action(action: Fighter.ActionType):
	if not actions_locked and is_battle_active:
		player_fighter.select_action(action)
		print("Player selected: ", Fighter.ActionType.keys()[action])

func enemy_ai_select_action():
	# Simple AI: weighted decision making
	var rand_val = randf()
	var chosen_action: Fighter.ActionType

	if enemy_fighter.current_health < enemy_fighter.max_health * 0.3:
		# Low health: more defensive
		if rand_val < 0.4:
			chosen_action = Fighter.ActionType.BLOCK
		elif rand_val < 0.7:
			chosen_action = Fighter.ActionType.DODGE
		else:
			chosen_action = Fighter.ActionType.LIGHT_ATTACK
	else:
		# Normal health: balanced
		if rand_val < 0.4:
			chosen_action = Fighter.ActionType.LIGHT_ATTACK
		elif rand_val < 0.6:
			chosen_action = Fighter.ActionType.HEAVY_ATTACK
		elif rand_val < 0.8:
			chosen_action = Fighter.ActionType.BLOCK
		else:
			chosen_action = Fighter.ActionType.DODGE

	enemy_fighter.select_action(chosen_action)

func _on_turn_timer_timeout():
	enemy_ai_select_action()
