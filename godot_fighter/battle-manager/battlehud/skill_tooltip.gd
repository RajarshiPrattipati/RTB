extends PanelContainer

@onready var skill_name_label = $MarginContainer/VBoxContainer/Header/HeaderInfo/SkillName
@onready var skill_type_label = $MarginContainer/VBoxContainer/Header/HeaderInfo/SkillType
@onready var icon_rect = $MarginContainer/VBoxContainer/Header/IconRect
@onready var description_label = $MarginContainer/VBoxContainer/Description
@onready var power_value = $MarginContainer/VBoxContainer/Stats/Power/Value
@onready var accuracy_value = $MarginContainer/VBoxContainer/Stats/Accuracy/Value
@onready var crit_value = $MarginContainer/VBoxContainer/Stats/CritRate/Value
@onready var cost_value = $MarginContainer/VBoxContainer/Stats/Cost/Value
@onready var additional_info = $MarginContainer/VBoxContainer/AdditionalInfo

var current_skill: Skill

func setup(skill: Skill) -> void:
	if !skill:
		return

	current_skill = skill

	# Set skill name with emoji
	var skill_emoji = _get_skill_emoji(skill)
	skill_name_label.text = skill_emoji + " " + skill.skill_name

	# Set skill type and element
	var element_name = _get_element_name(skill.element)
	var skill_category = "Offensive" if skill.effect_type == Skill.EFFECT_TYPE.DAMAGE else ("Support" if skill.effect_type == Skill.EFFECT_TYPE.HEAL else "Enhancement")
	skill_type_label.text = skill_category + " • " + element_name + " Element"

	# Set icon color
	icon_rect.color = _get_skill_color(skill)

	# Set description with enhanced flavor text
	description_label.text = _get_enhanced_description(skill)

	# Set stats
	power_value.text = str(skill.base_power) if skill.base_power > 0 else "—"
	accuracy_value.text = str(skill.hit_chance) + "%"
	crit_value.text = str(skill.critical_rate) + "%"
	cost_value.text = str(skill.sp_cost)

	# Set additional info
	additional_info.text = _get_additional_info(skill)

func _get_enhanced_description(skill: Skill) -> String:
	var descriptions = {
		"fireball": "Unleashes a blazing sphere of concentrated flame that engulfs enemies, dealing devastating fire damage. The intense heat may leave targets burning.",
		"fire": "Unleashes a blazing sphere of concentrated flame that engulfs enemies, dealing devastating fire damage. The intense heat may leave targets burning.",
		"ice": "Conjures razor-sharp shards of ice that pierce through defenses. The frigid assault may freeze enemies in their tracks.",
		"thunder": "Calls down a devastating bolt of lightning from the heavens. The electrical discharge may paralyze foes momentarily.",
		"heal": "Channels restorative energy to mend wounds and restore vitality. The soothing light brings allies back from the brink.",
		"cure": "Channels restorative energy to mend wounds and restore vitality. The soothing light brings allies back from the brink.",
		"attack": "A swift and precise strike targeting the enemy's weak points. Reliable damage with minimal energy expenditure.",
		"strike": "A powerful physical assault that combines speed and strength. The force of the blow can devastate unprepared foes.",
		"counter": "Enter a defensive stance, ready to retaliate. When attacked, unleash a devastating counter-strike against the aggressor.",
		"wind": "Summons a vortex of cutting winds that slash at multiple enemies. The swirling tempest is difficult to evade.",
		"earth": "Raises massive stone pillars from the ground to crush enemies. The sheer weight deals tremendous damage.",
		"water": "Unleashes a torrential wave that washes over the battlefield. The cleansing waters can heal allies while hindering foes.",
		"dark": "Channels the power of shadow to corrupt and drain enemy life force. The void hungers for their essence.",
		"light": "Summons radiant holy energy that purifies and protects. Deals bonus damage to dark entities while bolstering allies.",
	}

	var skill_lower = skill.skill_name.to_lower()
	for key in descriptions.keys():
		if key in skill_lower:
			return descriptions[key]

	# Fallback
	if skill.description and skill.description != "":
		return skill.description
	return "A powerful technique that can turn the tide of battle."

func _get_additional_info(skill: Skill) -> String:
	var info_parts = []
	var skill_lower = skill.skill_name.to_lower()

	# Status effects based on element/skill type
	if "fire" in skill_lower or "flame" in skill_lower:
		info_parts.append("🔥 Burn Chance: 25% (3 turns)")
		info_parts.append("💥 Extra damage vs Ice/Nature enemies")
	elif "ice" in skill_lower or "frost" in skill_lower:
		info_parts.append("❄️ Freeze Chance: 20% (2 turns)")
		info_parts.append("💥 Extra damage vs Water/Fire enemies")
	elif "thunder" in skill_lower or "lightning" in skill_lower:
		info_parts.append("⚡ Paralyze Chance: 30% (2 turns)")
		info_parts.append("💥 Extra damage vs Water/Metal enemies")
	elif "heal" in skill_lower or "cure" in skill_lower:
		info_parts.append("💚 Restores " + str(skill.base_power) + " HP")
		info_parts.append("✨ Can remove minor debuffs")
	elif "counter" in skill_lower:
		info_parts.append("🛡️ Reduces incoming damage by 50%")
		info_parts.append("⚔️ Counter deals 150% of blocked damage")
	elif "dark" in skill_lower or "shadow" in skill_lower:
		info_parts.append("🌑 Life Drain: 30% of damage dealt")
		info_parts.append("💥 Extra damage vs Light enemies")
	elif "light" in skill_lower or "holy" in skill_lower:
		info_parts.append("✨ May dispel negative status (50%)")
		info_parts.append("💥 Extra damage vs Dark/Undead enemies")
	elif "wind" in skill_lower or "air" in skill_lower:
		info_parts.append("💨 Evasion boost: +15% for 2 turns")
		info_parts.append("🎯 Hits all enemies")
	elif "earth" in skill_lower or "stone" in skill_lower:
		info_parts.append("🪨 Defense boost: +20% for 3 turns")
		info_parts.append("💥 Ignores 25% of enemy defense")
	elif "water" in skill_lower or "aqua" in skill_lower:
		info_parts.append("💧 Cleanses 1 debuff from user")
		info_parts.append("🌊 Reduced damage vs Fire enemies")
	else:
		# Default attack info
		info_parts.append("⚔️ Reliable and efficient")
		info_parts.append("🎯 Never misses")

	return "\n".join(info_parts)

func _get_element_name(element: int) -> String:
	match element:
		0: return "Physical"
		1: return "Magical"
		2: return "Ice"
		3: return "Fire"
		4: return "Thunder"
		5: return "Water"
		6: return "Earth"
		7: return "Wind"
		8: return "Light"
		9: return "Dark"
		_: return "Neutral"

func _get_skill_emoji(skill: Skill) -> String:
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
		return "⚔️"

func _get_skill_color(skill: Skill) -> Color:
	var name_lower = skill.skill_name.to_lower()

	if "fire" in name_lower or "flame" in name_lower:
		return Color(1.0, 0.3, 0.2)
	elif "ice" in name_lower or "frost" in name_lower:
		return Color(0.4, 0.7, 1.0)
	elif "thunder" in name_lower or "lightning" in name_lower or "bolt" in name_lower:
		return Color(1.0, 1.0, 0.3)
	elif "heal" in name_lower or "cure" in name_lower:
		return Color(0.3, 1.0, 0.3)
	elif "attack" in name_lower or "strike" in name_lower:
		return Color(0.8, 0.2, 0.2)
	elif "counter" in name_lower:
		return Color(0.5, 0.5, 0.9)
	elif "wind" in name_lower or "air" in name_lower:
		return Color(0.7, 0.9, 0.7)
	elif "earth" in name_lower or "stone" in name_lower:
		return Color(0.6, 0.5, 0.3)
	elif "water" in name_lower or "aqua" in name_lower:
		return Color(0.3, 0.5, 0.9)
	elif "dark" in name_lower or "shadow" in name_lower:
		return Color(0.3, 0.2, 0.4)
	elif "light" in name_lower or "holy" in name_lower:
		return Color(1.0, 1.0, 0.8)
	else:
		return Color(0.5, 0.6, 0.8)

func show_tooltip() -> void:
	visible = true
	# Fade in animation
	var tween = create_tween()
	tween.set_ease(Tween.EASE_OUT)
	tween.set_trans(Tween.TRANS_CUBIC)
	tween.tween_property(self, "modulate", Color(1, 1, 1, 1), 0.2)

func hide_tooltip() -> void:
	# Fade out animation
	var tween = create_tween()
	tween.set_ease(Tween.EASE_IN)
	tween.set_trans(Tween.TRANS_CUBIC)
	tween.tween_property(self, "modulate", Color(1, 1, 1, 0), 0.15)
	await tween.finished
	visible = false
