extends CanvasLayer
class_name PerformanceMonitor

# Performance monitoring and FPS display
var fps_label: Label
var stats_label: Label
var show_stats: bool = true

func _ready():
	# Create FPS label
	fps_label = Label.new()
	fps_label.position = Vector2(10, 10)
	fps_label.add_theme_font_size_override("font_size", 20)
	add_child(fps_label)

	# Create stats label
	stats_label = Label.new()
	stats_label.position = Vector2(10, 40)
	stats_label.add_theme_font_size_override("font_size", 14)
	add_child(stats_label)

func _process(_delta: float):
	if not show_stats:
		return

	# Update FPS
	var fps = Engine.get_frames_per_second()
	fps_label.text = "FPS: " + str(fps)

	# Color code FPS
	if fps >= 55:
		fps_label.modulate = Color.GREEN
	elif fps >= 40:
		fps_label.modulate = Color.YELLOW
	else:
		fps_label.modulate = Color.RED

	# Update stats
	var stats_text = ""
	stats_text += "Memory: " + str(Performance.get_monitor(Performance.MEMORY_STATIC_MAX) / 1024 / 1024) + " MB\n"
	stats_text += "Draw Calls: " + str(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)) + "\n"
	stats_text += "Objects: " + str(Performance.get_monitor(Performance.RENDER_TOTAL_OBJECTS_IN_FRAME)) + "\n"
	stats_text += "Vertices: " + str(Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME))

	stats_label.text = stats_text

func toggle_stats():
	show_stats = not show_stats
	fps_label.visible = show_stats
	stats_label.visible = show_stats

func _input(event: InputEvent):
	# Press F3 to toggle stats
	if event is InputEventKey and event.pressed and event.keycode == KEY_F3:
		toggle_stats()
