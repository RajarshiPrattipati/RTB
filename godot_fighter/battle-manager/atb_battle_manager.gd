extends Node3D
class_name ATBBattleManager

## Active Time Battle Manager
## Handles simultaneous turn-based combat with automatic actions every 2 seconds

var players: Array[Battler] = []
var enemies: Array[Battler] = []

@onready var hud: BattleHud = $BattleHUD

func _ready():
	add_to_group("battle_manager")

	if not hud:
		push_error("BattleHUD node not found")
		return

	# Connect HUD signals for skill selection
	hud.action_selected.connect(_on_action_selected)

	call_deferred("_initialize_battle")

func _initialize_battle():
	await get_tree().process_frame
	await get_tree().process_frame

	# Get all battlers
	players.clear()
	enemies.clear()

	for node in get_tree().get_nodes_in_group("players"):
		if node is Battler:
			players.append(node as Battler)

	for node in get_tree().get_nodes_in_group("enemies"):
		if node is Battler:
			enemies.append(node as Battler)

	print("=== ATB BATTLE INITIALIZED ===")
	print("Players: ", players.size())
	print("Enemies: ", enemies.size())

	if players.is_empty() or enemies.is_empty():
		push_error("Cannot start battle - missing players or enemies")
		return

	# Initialize all battlers
	for player in players:
		_setup_battler(player)
		hud.on_add_character(player)

	for enemy in enemies:
		_setup_battler(enemy)
		hud.on_start_combat(enemy)

	# Show player controls
	if players.size() > 0:
		hud.set_activebattler(players[0])
		hud.show_action_buttons(players[0])

	print("[ATB] Battle started - all battlers acting automatically every 2s")

func _setup_battler(battler: Battler):
	"""Setup a battler for ATB combat"""
	battler.battle_idle()

	# Find ATB component
	var atb = battler.get_node_or_null("ATBComponent") as ATBComponent
	if not atb:
		push_error("Battler ", battler.character_name, " missing ATBComponent!")
		return

	# Connect signals
	atb.action_executed.connect(_on_battler_action_executed.bind(battler))

	# Start ATB for enemies, players act on button clicks
	if battler in enemies:
		atb.start()
		# Enemy auto-queues actions via AI
		_setup_enemy_ai(battler, atb)

func _setup_enemy_ai(enemy: Battler, atb: ATBComponent):
	"""Setup AI to automatically queue actions for enemies"""
	# Connect to action_ready to queue next action
	atb.action_ready.connect(func():
		# Simple AI: If has enough MP for a skill, use it; otherwise charge
		if enemy.skill_list.size() > 0 and enemy.current_sp >= 20:
			# Use first available skill
			var skill = enemy.skill_list[0]
			if skill and skill.can_use(enemy):
				# Pick random player as target
				var valid_players = players.filter(func(p): return !p.is_defeated())
				if valid_players.size() > 0:
					var target = valid_players[randi() % valid_players.size()]
					atb.queue_skill(skill, target)
					print("[AI] ", enemy.character_name, " queued ", skill.skill_name, " -> ", target.character_name)
		# If no skill queued, will auto-charge
	)

func _on_action_selected(action: String, usable: Resource = null):
	"""Handle player selecting a skill"""
	if players.is_empty():
		return

	var player = players[0]  # For now, single player
	var atb = player.get_node_or_null("ATBComponent") as ATBComponent
	if not atb:
		return

	# Start ATB if not started
	if not atb.is_active:
		atb.start()

	if action == "attack" or action == "skill":
		var skill = usable as Skill
		if not skill:
			skill = player.default_attack

		if skill and skill.can_use(player):
			# Get valid targets
			var valid_targets = enemies.filter(func(e): return !e.is_defeated())
			if valid_targets.size() > 0:
				# For now, target first enemy
				var target = valid_targets[0]
				atb.queue_skill(skill, target)
				print("[Player] Queued ", skill.skill_name, " -> ", target.character_name)
		else:
			print("[Player] Cannot use skill - insufficient MP")

func _on_battler_action_executed(battler: Battler):
	"""Called when any battler executes an action"""
	print("[ATB] ", battler.character_name, " executed action")

	# Update HUD
	hud.update_health_bars()
	hud.update_character_info()

	# Check for battle end
	_check_battle_end()

func _check_battle_end():
	"""Check if battle is over"""
	var players_alive = players.filter(func(p): return !p.is_defeated())
	var enemies_alive = enemies.filter(func(e): return !e.is_defeated())

	if players_alive.is_empty():
		_end_battle(false)
	elif enemies_alive.is_empty():
		_end_battle(true)

func _end_battle(victory: bool):
	"""End the battle"""
	# Stop all ATB components
	for battler in players + enemies:
		var atb = battler.get_node_or_null("ATBComponent") as ATBComponent
		if atb:
			atb.stop()

	if victory:
		hud.show_battle_result("Victory!")
		print("[ATB] Victory!")
	else:
		hud.show_battle_result("Defeat!")
		print("[ATB] Defeat!")
