# How to Add a New Spell - Quick Example

## Step-by-Step Guide

### 1. Open spells.json
Location: `/src/data/spells.json`

### 2. Add Your Spell to the Array
Copy this template and add it to the `"spells"` array:

```json
{
  "id": "your_spell_id",
  "name": "Your Spell Name",
  "description": "What your spell does - be creative!",
  "iconUrl": "/assets/spells/your_icon.png",
  "rarity": "common",
  "element": "fire",
  "type": "damage",
  "damageType": "magical",
  "baseDamage": 40,
  "manaCost": 30,
  "cooldown": 0,
  "level": 1,
  "tags": ["offensive"],
  "school": "evocation"
}
```

### 3. Customize the Values

**Required Fields:**
```json
{
  "id": "plasma_blast",              // Must be unique!
  "name": "Plasma Blast",            // Display name
  "description": "Fire superheated plasma at your enemy",
  "iconUrl": "/assets/spells/plasma.png",
  "rarity": "rare",                  // common, uncommon, rare, epic, legendary, mythic
  "element": "lightning",            // fire, water, earth, air, lightning, ice, light, dark, chaos, cosmic, neutral
  "type": "damage",                  // damage, heal, buff, debuff, control, summon, utility, ultimate
  "manaCost": 45
}
```

**Damage Spell Fields:**
```json
{
  "damageType": "magical",           // physical, magical, true, pure
  "baseDamage": 70
}
```

**Heal Spell Fields:**
```json
{
  "type": "heal",
  "baseHeal": 50
}
```

**Buff/Shield Spell Fields:**
```json
{
  "type": "buff",
  "shieldAmount": 60,
  "duration": 3                      // turns
}
```

**Debuff Spell Fields:**
```json
{
  "type": "debuff",
  "damageReduction": 0.3,            // 30% damage reduction
  "duration": 4
}
```

### 4. Add Status Effects (Optional)
```json
{
  "statusEffects": [
    {
      "type": "burn",                // burn, poison, freeze, stun, etc.
      "chance": 0.6,                 // 60% chance
      "duration": 3,                 // 3 turns
      "damagePerTurn": 10            // only for DoT effects
    }
  ]
}
```

### 5. Add Tags for Filtering
```json
{
  "tags": ["offensive", "aoe", "ultimate"]
}
```

**Common Tags:**
- `starter` - Given to new players
- `offensive` - Damage dealer
- `defensive` - Protection
- `support` - Healing/buffs
- `control` - CC effects
- `aoe` - Area of effect
- `single` - Single target
- `ultimate` - Ultimate ability

### 6. Save and Test!
1. Save `spells.json`
2. Restart dev server (`npm start`)
3. Clear browser cache (Ctrl+Shift+R)
4. Check if spell appears in game

## Complete Example - Fire Spell

```json
{
  "id": "inferno_wave",
  "name": "Inferno Wave",
  "description": "Unleash a devastating wave of fire that engulfs all enemies",
  "iconUrl": "/assets/spells/inferno_wave.png",
  "rarity": "epic",
  "element": "fire",
  "type": "damage",
  "damageType": "magical",
  "baseDamage": 85,
  "manaCost": 65,
  "cooldown": 2,
  "level": 1,
  "tags": ["offensive", "aoe", "fire"],
  "school": "evocation",
  "statusEffects": [
    {
      "type": "burn",
      "chance": 0.75,
      "duration": 3,
      "damagePerTurn": 12
    }
  ]
}
```

## Complete Example - Ice Control Spell

```json
{
  "id": "glacial_prison",
  "name": "Glacial Prison",
  "description": "Trap your enemy in an impenetrable cage of ice",
  "iconUrl": "/assets/spells/glacial_prison.png",
  "rarity": "rare",
  "element": "ice",
  "type": "control",
  "damageType": "magical",
  "baseDamage": 20,
  "manaCost": 55,
  "cooldown": 3,
  "level": 1,
  "tags": ["control", "defensive"],
  "school": "evocation",
  "statusEffects": [
    {
      "type": "freeze",
      "chance": 0.9,
      "duration": 2
    },
    {
      "type": "slow",
      "chance": 1.0,
      "duration": 3
    }
  ]
}
```

## Complete Example - Healing Spell

```json
{
  "id": "divine_restoration",
  "name": "Divine Restoration",
  "description": "Channel divine energy to restore health and cleanse wounds",
  "iconUrl": "/assets/spells/divine_restoration.png",
  "rarity": "rare",
  "element": "light",
  "type": "heal",
  "baseHeal": 60,
  "manaCost": 50,
  "cooldown": 1,
  "level": 1,
  "tags": ["support", "healing"],
  "school": "abjuration",
  "statusEffects": [
    {
      "type": "regen",
      "chance": 0.8,
      "duration": 3,
      "healPerTurn": 8
    }
  ]
}
```

## Complete Example - Ultimate Spell

```json
{
  "id": "armageddon",
  "name": "Armageddon",
  "description": "Call forth the end times - a cataclysmic explosion of pure destruction",
  "iconUrl": "/assets/spells/armageddon.png",
  "rarity": "mythic",
  "element": "chaos",
  "type": "ultimate",
  "damageType": "pure",
  "baseDamage": 200,
  "manaCost": 100,
  "cooldown": 5,
  "level": 1,
  "tags": ["ultimate", "offensive", "aoe", "legendary"],
  "school": "evocation",
  "statusEffects": [
    {
      "type": "burn",
      "chance": 1.0,
      "duration": 4,
      "damagePerTurn": 20
    },
    {
      "type": "stun",
      "chance": 0.5,
      "duration": 1
    }
  ]
}
```

## Balancing Tips

### Mana Cost Formula
```
Damage Spell:  baseDamage ÷ 1.3 = manaCost
Heal Spell:    baseHeal ÷ 1.0 = manaCost
Buff Spell:    shieldAmount ÷ 1.2 = manaCost
```

### Rarity Scaling
- **Common**: 30-40 damage for 25-35 mana
- **Uncommon**: 40-50 damage for 30-40 mana
- **Rare**: 60-75 damage for 45-55 mana
- **Epic**: 80-100 damage for 60-75 mana
- **Legendary**: 110-130 damage for 80-100 mana
- **Mythic**: 150-250 damage for 100-150 mana

### Status Effect Chance
```
Common:     30-40%
Uncommon:   40-50%
Rare:       50-60%
Epic:       60-75%
Legendary:  75-90%
Mythic:     90-100%
```

## Testing Checklist

After adding a spell:
- [ ] Spell appears in collection
- [ ] Icon displays correctly
- [ ] Stats are accurate
- [ ] Damage/heal calculations work
- [ ] Status effects apply correctly
- [ ] Mana cost is deducted
- [ ] Cooldown functions (if set)
- [ ] Elemental advantages work
- [ ] No console errors

## Common Mistakes

❌ **Duplicate ID**: Each spell needs a unique `id`
❌ **Wrong element name**: Use exact names from mechanics.json
❌ **Missing comma**: JSON requires commas between objects
❌ **String numbers**: Use `40` not `"40"` for numeric values
❌ **Invalid damage type**: Must be physical/magical/true/pure

## Need Help?

Check the full documentation in `src/data/README.md`
