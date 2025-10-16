extends PanelContainer

@onready var label = $MarginContainer/Label

var effect_type: String = ""
var tooltip_visible: bool = false
var tooltip_label: Label = null

const EFFECT_DATA = {
	"burn": {
		"name": "🔥 Burn",
		"color": Color(1.0, 0.4, 0.2),
		"border": Color(1.0, 0.5, 0.2),
		"description": "BURN EFFECT\nDeals fire damage over time for 3 turns.\nReduces enemy defense by 10%.\nExtra effective against Ice/Nature types."
	},
	"freeze": {
		"name": "❄️ Freeze",
		"color": Color(0.3, 0.6, 1.0),
		"border": Color(0.5, 0.8, 1.0),
		"description": "FREEZE EFFECT\nImmobilizes the target for 2 turns.\n50% chance to skip their turn.\nExtra effective against Water/Fire types."
	},
	"paralyze": {
		"name": "⚡ Paralyze",
		"color": Color(1.0, 1.0, 0.3),
		"border": Color(1.0, 1.0, 0.5),
		"description": "PARALYZE EFFECT\nReduces speed by 50% for 2 turns.\n30% chance to fail actions.\nExtra effective against Water/Metal types."
	},
	"poison": {
		"name": "☠️ Poison",
		"color": Color(0.5, 0.2, 0.6),
		"border": Color(0.7, 0.4, 0.8),
		"description": "POISON EFFECT\nDeals increasing damage each turn.\nReduces healing received by 30%.\nLasts until cleansed or battle ends."
	},
	"lifedrain": {
		"name": "🌑 Drain",
		"color": Color(0.3, 0.2, 0.4),
		"border": Color(0.5, 0.3, 0.5),
		"description": "LIFE DRAIN\nRestore 30% of damage dealt as HP.\nExtra effective against Light enemies.\nCannot be dispelled."
	},
	"defense": {
		"name": "🛡️ Defense",
		"color": Color(0.4, 0.5, 0.9),
		"border": Color(0.6, 0.7, 1.0),
		"description": "DEFENSE BOOST\nReduces incoming damage by 50%.\nCounter-attacks deal 150% damage.\nLasts 2 turns or until hit."
	},
	"evasion": {
		"name": "💨 Evasion",
		"color": Color(0.7, 0.9, 0.7),
		"border": Color(0.8, 1.0, 0.8),
		"description": "EVASION BOOST\nIncreases dodge chance by 15%.\nLasts 2 turns.\nStacks with natural agility."
	},
	"cleanse": {
		"name": "✨ Cleanse",
		"color": Color(1.0, 1.0, 0.8),
		"border": Color(1.0, 1.0, 0.9),
		"description": "CLEANSE EFFECT\nRemoves negative status effects.\nDispels debuffs and curses.\n50% chance to remove major afflictions."
	},
	"physical": {
		"name": "⚔️ Physical",
		"color": Color(0.7, 0.3, 0.3),
		"border": Color(0.9, 0.4, 0.4),
		"description": "PHYSICAL DAMAGE\nAffected by armor and defense.\nCan be blocked or parried.\nReliable and consistent."
	},
	"magical": {
		"name": "✨ Magical",
		"color": Color(0.5, 0.4, 0.9),
		"border": Color(0.7, 0.6, 1.0),
		"description": "MAGICAL DAMAGE\nIgnores physical armor.\nAffected by magic resistance.\nHigher critical potential."
	},
	"aoe": {
		"name": "🌊 AoE",
		"color": Color(0.3, 0.5, 0.8),
		"border": Color(0.5, 0.7, 1.0),
		"description": "AREA OF EFFECT\nHits all enemies on field.\nSlightly reduced damage per target.\nCannot be dodged individually."
	}
}

func _ready():
	mouse_entered.connect(_on_mouse_entered)
	mouse_exited.connect(_on_mouse_exited)

func setup(effect: String):
	effect_type = effect.to_lower()

	if effect_type in EFFECT_DATA:
		var data = EFFECT_DATA[effect_type]
		label.text = data.name

		# Update badge colors
		var style = get_theme_stylebox("panel").duplicate()
		style.bg_color = data.color
		style.bg_color.a = 0.9
		style.border_color = data.border
		add_theme_stylebox_override("panel", style)

func _on_mouse_entered():
	if !effect_type or !effect_type in EFFECT_DATA:
		return

	# Create tooltip
	tooltip_label = Label.new()
	tooltip_label.text = EFFECT_DATA[effect_type].description
	tooltip_label.add_theme_color_override("font_color", Color.WHITE)
	tooltip_label.add_theme_color_override("font_shadow_color", Color.BLACK)
	tooltip_label.add_theme_constant_override("shadow_offset_x", 1)
	tooltip_label.add_theme_constant_override("shadow_offset_y", 1)
	tooltip_label.add_theme_font_size_override("font_size", 13)
	tooltip_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tooltip_label.custom_minimum_size = Vector2(220, 0)

	# Create tooltip background
	var tooltip_bg = PanelContainer.new()
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.05, 0.05, 0.08, 0.98)
	style.border_width_left = 2
	style.border_width_top = 2
	style.border_width_right = 2
	style.border_width_bottom = 2
	style.border_color = EFFECT_DATA[effect_type].border
	style.corner_radius_top_left = 6
	style.corner_radius_top_right = 6
	style.corner_radius_bottom_right = 6
	style.corner_radius_bottom_left = 6
	style.shadow_size = 8
	style.shadow_color = Color(0, 0, 0, 0.8)
	tooltip_bg.add_theme_stylebox_override("panel", style)

	var margin = MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_bottom", 10)

	tooltip_bg.add_child(margin)
	margin.add_child(tooltip_label)

	# Add to canvas layer
	var canvas_layer = get_tree().get_first_node_in_group("BattleHud")
	if canvas_layer:
		canvas_layer.add_child(tooltip_bg)

		# Position tooltip
		var badge_rect = get_global_rect()
		var tooltip_pos = Vector2.ZERO
		tooltip_pos.x = badge_rect.position.x
		tooltip_pos.y = badge_rect.position.y - tooltip_bg.size.y - 5

		# Keep on screen
		var viewport_size = get_viewport_rect().size
		if tooltip_pos.y < 0:
			tooltip_pos.y = badge_rect.position.y + badge_rect.size.y + 5
		if tooltip_pos.x + tooltip_bg.size.x > viewport_size.x:
			tooltip_pos.x = viewport_size.x - tooltip_bg.size.x - 10

		tooltip_bg.global_position = tooltip_pos
		tooltip_visible = true

		# Store reference for cleanup
		set_meta("tooltip_bg", tooltip_bg)

func _on_mouse_exited():
	if has_meta("tooltip_bg"):
		var tooltip_bg = get_meta("tooltip_bg")
		if tooltip_bg and is_instance_valid(tooltip_bg):
			tooltip_bg.queue_free()
		remove_meta("tooltip_bg")
	tooltip_visible = false
	tooltip_label = null
