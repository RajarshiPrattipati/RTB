# Game Data Files

This directory contains master JSON files for game content and mechanics. These files allow you to add, modify, and balance game content without touching code.

## 📁 Files

### `spells.json`
Master database of all spells in the game.

**Structure:**
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-13",
  "spells": [
    {
      "id": "unique_spell_id",
      "name": "Spell Name",
      "description": "What the spell does",
      "iconUrl": "/assets/spells/icon.png",
      "rarity": "common|uncommon|rare|epic|legendary|mythic",
      "element": "fire|water|earth|air|lightning|ice|light|dark|chaos|cosmic|neutral",
      "type": "damage|heal|buff|debuff|control|summon|utility|ultimate",
      "damageType": "physical|magical|true|pure",
      "baseDamage": 40,
      "manaCost": 30,
      "cooldown": 0,
      "level": 1,
      "tags": ["starter", "offensive"],
      "school": "evocation|conjuration|necromancy|abjuration|transmutation|divination|enchantment|illusion",
      "statusEffects": [
        {
          "type": "burn",
          "chance": 0.8,
          "duration": 3,
          "damagePerTurn": 10
        }
      ]
    }
  ]
}
```

**Spell Properties:**
- `id` (required): Unique identifier (use snake_case)
- `name` (required): Display name
- `description` (required): Flavor text
- `iconUrl` (required): Path to spell icon
- `rarity` (required): Determines power and drop rate
- `element` (required): Elemental type
- `type` (required): Spell category
- `damageType` (optional): Only for damage spells
- `baseDamage` (optional): Base damage amount
- `baseHeal` (optional): Base heal amount
- `shieldAmount` (optional): Shield/barrier amount
- `manaCost` (required): Mana cost to cast
- `cooldown` (optional): Turns before reuse (0 = no cooldown)
- `level` (optional): Starting level (default 1)
- `tags` (optional): Array of tags for filtering
- `school` (optional): Magic school classification
- `statusEffects` (optional): Array of status effects
- `duration` (optional): Effect duration in turns

### `mechanics.json`
Master configuration for game mechanics, economy, and balance.

**Sections:**

#### 1. Rarity System
```json
"rarity": {
  "common": {
    "name": "Common",
    "color": "#9E9E9E",
    "multiplier": 1.0,
    "dropRate": 0.50
  }
}
```

#### 2. Elements
```json
"elements": {
  "fire": {
    "name": "Fire",
    "color": "#FF5722",
    "icon": "🔥",
    "advantages": ["ice", "earth"],
    "weaknesses": ["water"]
  }
}
```

#### 3. Status Effects
```json
"statusEffects": {
  "burn": {
    "name": "Burn",
    "type": "dot",
    "icon": "🔥",
    "description": "Takes fire damage over time"
  }
}
```

#### 4. Economy
```json
"economy": {
  "currencies": { ... },
  "conversion": {
    "goldToSouls": 100,
    "soulPackages": [ ... ]
  },
  "items": { ... }
}
```

#### 5. Progression
```json
"progression": {
  "hero": {
    "maxLevel": 100,
    "revivalCosts": [10, 25, 50],
    "buildSlots": 6,
    "secondaryBuildUnlockLevel": 15
  }
}
```

#### 6. Battle Settings
```json
"battle": {
  "startingHP": 100,
  "startingMana": 100,
  "manaRegenPerTurn": 20,
  "elementalAdvantageMultiplier": 1.5
}
```

#### 7. Rewards
```json
"rewards": {
  "battleWin": {
    "gold": 50,
    "souls": 1,
    "xp": 100
  }
}
```

## 🎮 How to Add New Spells

1. **Open** `spells.json`
2. **Add** a new spell object to the `spells` array
3. **Use** a unique `id` (e.g., `"fireball_advanced"`)
4. **Set** appropriate stats based on rarity
5. **Add** tags like `["starter", "offensive", "aoe"]` for filtering
6. **Save** the file
7. **Restart** the dev server to load changes

**Example - Adding a new spell:**
```json
{
  "id": "thunder_storm",
  "name": "Thunder Storm",
  "description": "Unleash a devastating storm of lightning bolts",
  "iconUrl": "/assets/spells/thunder_storm.png",
  "rarity": "epic",
  "element": "lightning",
  "type": "damage",
  "damageType": "magical",
  "baseDamage": 80,
  "manaCost": 60,
  "cooldown": 2,
  "level": 1,
  "tags": ["offensive", "aoe"],
  "school": "evocation",
  "statusEffects": [
    {
      "type": "stun",
      "chance": 0.3,
      "duration": 1
    }
  ]
}
```

## ⚖️ Balancing Guidelines

### Damage Spells
- **Common**: 30-40 damage, 25-35 mana
- **Uncommon**: 40-50 damage, 30-40 mana
- **Rare**: 60-75 damage, 45-55 mana
- **Epic**: 80-100 damage, 60-70 mana
- **Legendary**: 110-130 damage, 75-90 mana
- **Mythic**: 150+ damage, 100+ mana

### Heal Spells
- Generally 80% of equivalent damage spell power
- Example: Common heal = 30-35 HP for 30-40 mana

### Mana Cost Guidelines
- **DPM Ratio**: Aim for 1.2-1.5 damage per mana
- **HPM Ratio**: Aim for 0.8-1.0 heal per mana
- Higher rarity = better efficiency

### Status Effect Chances
- **Common**: 30-50%
- **Uncommon**: 40-60%
- **Rare**: 50-70%
- **Epic**: 60-80%
- **Legendary**: 70-90%
- **Mythic**: 80-100%

## 🛠️ Modifying Game Mechanics

### Adjust Economy
Edit `mechanics.json` → `economy` section:
```json
"conversion": {
  "goldToSouls": 100  // Change conversion rate
}
```

### Balance Elemental System
Edit `mechanics.json` → `elements` section:
```json
"fire": {
  "advantages": ["ice", "earth", "air"]  // Add more advantages
}
```

### Change Revival Costs
Edit `mechanics.json` → `progression.hero`:
```json
"revivalCosts": [5, 15, 30]  // Make revivals cheaper
```

### Adjust Battle Rewards
Edit `mechanics.json` → `rewards`:
```json
"battleWin": {
  "gold": 100,  // Double gold rewards
  "souls": 2,   // Double soul rewards
  "xp": 150
}
```

## 📊 Spell Tags Reference

**Combat Role:**
- `offensive` - Damage-dealing spells
- `defensive` - Protection/shield spells
- `support` - Healing/buff spells
- `control` - CC effects

**Availability:**
- `starter` - Available to new players
- `premium` - Only from gacha
- `event` - Limited time spells

**Target:**
- `single` - Single target
- `aoe` - Area of effect
- `self` - Self-cast only

**Special:**
- `ultimate` - Powerful ultimate ability
- `combo` - Part of spell combo
- `synergy` - Has element synergies

## 🔄 Version Control

When making changes:
1. **Update** the `version` field (use semantic versioning)
2. **Update** the `lastUpdated` date
3. **Document** major changes in comments
4. **Test** in game before committing

**Version Format:** `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes to spell structure
- **MINOR**: New spells or mechanics added
- **PATCH**: Balance adjustments or bug fixes

## 🧪 Testing Changes

After modifying JSON files:

1. **Save** the file
2. **Restart** dev server (`npm start`)
3. **Clear** browser cache (Ctrl+Shift+R)
4. **Test** in game:
   - Check spell appears correctly
   - Verify stats are applied
   - Test in battle
   - Check for console errors

## 📝 Best Practices

1. **Always use unique IDs** - Never duplicate spell IDs
2. **Follow naming conventions** - Use snake_case for IDs, Title Case for names
3. **Validate JSON** - Use a JSON validator before saving
4. **Balance progressively** - Test with AI battles before releasing
5. **Document changes** - Add comments for major modifications
6. **Backup before major changes** - Keep previous versions

## 🚨 Common Issues

**Spell doesn't appear:**
- Check JSON syntax (missing comma, bracket)
- Verify unique ID
- Restart dev server

**Stats not working:**
- Check property names match exactly
- Verify numbers (not strings)
- Check for typos in element/type names

**Icons missing:**
- Verify iconUrl path is correct
- Place icon in `/public/assets/spells/`
- Use PNG or SVG format

## 📚 Resources

- [JSON Validator](https://jsonlint.com/)
- [Spell Balance Calculator](https://example.com/calculator)
- [Icon Resources](https://game-icons.net/)

---

**Remember:** All changes to spells and mechanics should be made in these JSON files, not in the code!
