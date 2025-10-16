extends Node
class_name InputBuffer

# Input buffer system for responsive fighting game controls
const BUFFER_WINDOW: float = 0.15  # 150ms buffer window

var buffered_actions: Array[String] = []
var buffer_times: Array[int] = []

func buffer_action(action: String):
	"""Add an action to the buffer"""
	buffered_actions.append(action)
	buffer_times.append(Time.get_ticks_msec())

func get_buffered_action() -> String:
	"""Get and consume the most recent buffered action within the window"""
	var current_time = Time.get_ticks_msec()

	# Check from most recent to oldest
	for i in range(buffered_actions.size() - 1, -1, -1):
		var time_diff = (current_time - buffer_times[i]) / 1000.0
		if time_diff < BUFFER_WINDOW:
			var action = buffered_actions[i]
			buffered_actions.remove_at(i)
			buffer_times.remove_at(i)
			return action

	return ""

func clear_old_inputs():
	"""Remove inputs that are too old"""
	var current_time = Time.get_ticks_msec()

	for i in range(buffered_actions.size() - 1, -1, -1):
		var time_diff = (current_time - buffer_times[i]) / 1000.0
		if time_diff >= BUFFER_WINDOW:
			buffered_actions.remove_at(i)
			buffer_times.remove_at(i)

func clear_all():
	"""Clear all buffered inputs"""
	buffered_actions.clear()
	buffer_times.clear()

func has_buffered_action() -> bool:
	"""Check if there are any valid buffered actions"""
	clear_old_inputs()
	return buffered_actions.size() > 0
