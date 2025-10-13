/**
 * SpellCollection Component
 * Displays player's spell inventory/collection
 */

import React, { useState } from 'react';
import './SpellCollection.css';

/**
 * Get spell icon emoji based on element
 */
const getSpellIcon = (spell) => {
  if (!spell) return '✨';
  const elementIcons = {
    fire: '🔥', water: '🌊', ice: '❄️', lightning: '⚡',
    earth: '🌍', air: '💨', light: '✨', dark: '🌑',
    chaos: '🌀', cosmic: '🌟', neutral: '⭐'
  };
  return elementIcons[spell.element] || '✨';
};

/**
 * Get type badge color
 */
const getTypeBadgeClass = (type) => {
  const typeMap = {
    damage: 'type-damage',
    heal: 'type-heal',
    buff: 'type-buff',
    debuff: 'type-debuff',
    utility: 'type-utility',
  };
  return typeMap[type] || 'type-default';
};

/**
 * SpellCollection Component
 * Shows all spells in player's collection
 */
export const SpellCollection = ({ spells = [], onSpellSelect = null }) => {
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [filterElement, setFilterElement] = useState('all');
  const [filterType, setFilterType] = useState('all');

  if (spells.length === 0) {
    return (
      <div className="spell-collection empty">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-text">No spells in collection</div>
          <div className="empty-hint">Win battles to collect spells!</div>
        </div>
      </div>
    );
  }

  // Get unique elements and types
  const elements = ['all', ...new Set(spells.map(s => s.element))];
  const types = ['all', ...new Set(spells.map(s => s.type))];

  // Filter spells
  const filteredSpells = spells.filter(spell => {
    if (filterElement !== 'all' && spell.element !== filterElement) return false;
    if (filterType !== 'all' && spell.type !== filterType) return false;
    return true;
  });

  const handleSpellClick = (spell) => {
    setSelectedSpell(spell);
    if (onSpellSelect) {
      onSpellSelect(spell);
    }
  };

  return (
    <div className="spell-collection">
      {/* Header */}
      <div className="collection-header">
        <h3>Spell Collection</h3>
        <div className="collection-count">
          {filteredSpells.length} / {spells.length} spells
        </div>
      </div>

      {/* Filters */}
      <div className="collection-filters">
        <div className="filter-group">
          <label>Element:</label>
          <select
            value={filterElement}
            onChange={(e) => setFilterElement(e.target.value)}
            className="filter-select"
          >
            {elements.map(element => (
              <option key={element} value={element}>
                {element === 'all' ? 'All Elements' : element}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Spell Grid */}
      <div className="spell-grid">
        {filteredSpells.map(spell => (
          <div
            key={spell.id}
            className={`spell-item ${selectedSpell?.id === spell.id ? 'selected' : ''}`}
            onClick={() => handleSpellClick(spell)}
          >
            <div className="spell-item-icon">
              {getSpellIcon(spell)}
            </div>
            <div className="spell-item-info">
              <div className="spell-item-name">{spell.name}</div>
              <div className={`spell-item-type ${getTypeBadgeClass(spell.type)}`}>
                {spell.type}
              </div>
            </div>
            {spell.baseDamage && (
              <div className="spell-item-stat">
                ⚔️ {spell.baseDamage}
              </div>
            )}
            {spell.healAmount && (
              <div className="spell-item-stat">
                ❤️ {spell.healAmount}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Spell Details */}
      {selectedSpell && (
        <div className="spell-details-panel">
          <div className="details-header">
            <div className="details-icon">
              {getSpellIcon(selectedSpell)}
            </div>
            <div>
              <h4>{selectedSpell.name}</h4>
              <div className={`spell-type-badge ${getTypeBadgeClass(selectedSpell.type)}`}>
                {selectedSpell.type} • {selectedSpell.element}
              </div>
            </div>
          </div>

          <div className="details-body">
            {selectedSpell.description && (
              <p className="spell-description">{selectedSpell.description}</p>
            )}

            <div className="spell-stats">
              {selectedSpell.baseDamage && (
                <div className="stat-item">
                  <span className="stat-label">Base Damage:</span>
                  <span className="stat-value">{selectedSpell.baseDamage}</span>
                </div>
              )}
              {selectedSpell.healAmount && (
                <div className="stat-item">
                  <span className="stat-label">Heal Amount:</span>
                  <span className="stat-value">{selectedSpell.healAmount}</span>
                </div>
              )}
              {selectedSpell.cooldown && (
                <div className="stat-item">
                  <span className="stat-label">Cooldown:</span>
                  <span className="stat-value">{selectedSpell.cooldown}s</span>
                </div>
              )}
              {selectedSpell.manaCost && (
                <div className="stat-item">
                  <span className="stat-label">Mana Cost:</span>
                  <span className="stat-value">{selectedSpell.manaCost}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellCollection;
