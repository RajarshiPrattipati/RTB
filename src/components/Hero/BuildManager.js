/**
 * BuildManager Component
 * Manages hero builds (Primary/Secondary) with spell slot configuration
 */

import React, { useState } from 'react';
import { useHero } from '../../hooks/useHero';
import { SpellSlot } from './SpellSlot';
import './BuildManager.css';

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
 * BuildManager Component
 * Allows switching between Primary/Secondary builds and managing spell slots
 */
export const BuildManager = ({
  onLockSpell,
  onUnlockSpell,
  availableSpells = [],
  disabled = false
}) => {
  const { hero, lockSpell, unlockSpell } = useHero();
  const [activeBuild, setActiveBuild] = useState(hero?.activeBuild || 'primary');
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!hero) {
    return (
      <div className="build-manager no-hero">
        <div className="message">No hero available. Initialize hero first.</div>
      </div>
    );
  }

  const handleBuildSwitch = (buildType) => {
    if (disabled) return;
    if (buildType === 'secondary' && hero.level < 15) return;
    setActiveBuild(buildType);
  };

  const handleSlotClick = (slotIndex, slot) => {
    if (disabled) return;
    setSelectedSlot({ index: slotIndex, slot, buildType: activeBuild });
  };

  const handleSpellSelect = (spell) => {
    if (!selectedSlot || disabled) return;

    const result = lockSpell(selectedSlot.buildType, selectedSlot.index, spell);

    if (result.success) {
      onLockSpell && onLockSpell(result);
      setSelectedSlot(null);
    } else {
      console.error('Failed to lock spell:', result.reason);
    }
  };

  const handleUnlock = (slotIndex) => {
    if (disabled) return;

    const result = unlockSpell(activeBuild, slotIndex);

    if (result.success) {
      onUnlockSpell && onUnlockSpell(result);
    } else {
      console.error('Failed to unlock spell:', result.message);
    }
  };

  const currentBuild = hero[activeBuild] || [];
  const secondaryLocked = hero.level < 15;
  const lockedSlotsCount = currentBuild.filter(slot => slot.locked).length;
  const canBattle = lockedSlotsCount === 6;

  return (
    <div className={`build-manager ${disabled ? 'disabled' : ''}`}>
      {/* Build Tabs */}
      <div className="build-tabs">
        <button
          className={`build-tab ${activeBuild === 'primary' ? 'active' : ''}`}
          onClick={() => handleBuildSwitch('primary')}
          disabled={disabled}
        >
          <span className="tab-icon">⚔️</span>
          <span className="tab-label">Primary Build</span>
        </button>

        <button
          className={`build-tab ${activeBuild === 'secondary' ? 'active' : ''} ${secondaryLocked ? 'locked' : ''}`}
          onClick={() => handleBuildSwitch('secondary')}
          disabled={disabled || secondaryLocked}
          title={secondaryLocked ? 'Unlocks at Level 15' : 'Secondary Build'}
        >
          <span className="tab-icon">{secondaryLocked ? '🔒' : '🛡️'}</span>
          <span className="tab-label">
            Secondary Build
            {secondaryLocked && <span className="unlock-level"> (Lv. 15)</span>}
          </span>
        </button>
      </div>

      {/* Build Info */}
      <div className="build-info">
        <div className="build-status">
          <span className="status-label">Locked Slots:</span>
          <span className={`status-value ${canBattle ? 'complete' : 'incomplete'}`}>
            {lockedSlotsCount} / 6
          </span>
        </div>

        {!canBattle && (
          <div className="warning-banner">
            ⚠️ Lock all 6 spell slots to battle
          </div>
        )}
      </div>

      {/* Spell Slot Grid */}
      <div className="spell-slot-grid">
        {currentBuild.map((slot, index) => (
          <SpellSlot
            key={`${activeBuild}-${index}`}
            slot={slot}
            slotIndex={index}
            buildType={activeBuild}
            onClick={() => handleSlotClick(index, slot)}
            onUnlock={() => handleUnlock(index)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Available Spells (when slot selected) */}
      {selectedSlot && !selectedSlot.slot.locked && (
        <div className="spell-selector">
          <div className="selector-header">
            <h4>Select a spell for Slot {selectedSlot.index + 1}</h4>
            <button
              className="close-selector"
              onClick={() => setSelectedSlot(null)}
            >
              ✕
            </button>
          </div>

          <div className="available-spells">
            {availableSpells.length === 0 ? (
              <div className="no-spells">
                No spells available. Collect spells first!
              </div>
            ) : (
              availableSpells.map(spell => (
                <div
                  key={spell.id}
                  className="spell-card"
                  onClick={() => handleSpellSelect(spell)}
                >
                  <div className="spell-icon-emoji">
                    {getSpellIcon(spell)}
                  </div>
                  <div className="spell-info">
                    <div className="spell-name">{spell.name}</div>
                    <div className="spell-type">{spell.type}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Battle Ready Indicator */}
      {canBattle && (
        <div className="battle-ready-banner">
          ✅ Build Complete - Ready for Battle!
        </div>
      )}
    </div>
  );
};

export default BuildManager;
