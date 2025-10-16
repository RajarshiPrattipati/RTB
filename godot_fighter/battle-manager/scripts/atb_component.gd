extends Node
class_name ATBComponent

## Active Time Battle Component
## Handles automatic action timing for battlers

signal action_ready
signal action_executed

@export var action_time: float = 2.0  # Time between actions in seconds
@export var charge_mp_amount: int = 15  # MP restored per charge action

var action_timer: float = 0.0
var is_active: bool = false
var queued_skill: Skill = null
var queued_target: Battler = null
var owner_battler: Battler

func _ready():
	owner_battler = get_parent() as Battler
	if not owner_battler:
		push_error("ATBComponent must be child of Battler")
		return

	# Start with 0 MP
	if owner_battler.stats:
		owner_battler.current_sp = 0

func start():
	is_active = true
	action_timer = 0.0

func stop():
	is_active = false

func _process(delta: float):
	if not is_active or not owner_battler:
		return

	# Don't tick if defeated
	if owner_battler.is_defeated():
		return

	action_timer += delta

	if action_timer >= action_time:
		execute_action()
		action_timer = 0.0

func queue_skill(skill: Skill, target: Battler):
	"""Queue a skill to be used instead of charging on next action"""
	if skill and skill.can_use(owner_battler):
		queued_skill = skill
		queued_target = target
		print("[ATB] ", owner_battler.character_name, " queued skill: ", skill.skill_name)
	else:
		print("[ATB] ", owner_battler.character_name, " cannot use skill: ", skill.skill_name if skill else "null")

func clear_queue():
	"""Clear any queued skill"""
	queued_skill = null
	queued_target = null

func execute_action():
	"""Execute the queued action or default charge"""
	action_ready.emit()

	# Check if we have a queued skill
	if queued_skill and queued_target and not queued_target.is_defeated():
		# Use the skill
		if queued_skill.can_use(owner_battler):
			print("[ATB] ", owner_battler.character_name, " using skill: ", queued_skill.skill_name, " on ", queued_target.character_name)
			owner_battler.use_skill(queued_skill, queued_target)
			owner_battler.attack_anim(queued_target)
			clear_queue()
		else:
			# Can't use skill anymore, charge instead
			print("[ATB] ", owner_battler.character_name, " can't use queued skill, charging instead")
			perform_charge()
			clear_queue()
	else:
		# Default action: Charge (restore MP)
		perform_charge()

	action_executed.emit()

func perform_charge():
	"""Restore MP (charge action)"""
	if owner_battler.stats:
		var old_sp = owner_battler.current_sp
		owner_battler.current_sp = min(owner_battler.current_sp + charge_mp_amount, owner_battler.max_sp)
		var gained = owner_battler.current_sp - old_sp
		print("[ATB] ", owner_battler.character_name, " charged +", gained, " MP (", owner_battler.current_sp, "/", owner_battler.max_sp, ")")

func get_action_progress() -> float:
	"""Returns progress from 0.0 to 1.0"""
	return action_timer / action_time if action_time > 0 else 0.0
