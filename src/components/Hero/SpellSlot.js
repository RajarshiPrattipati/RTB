/**
 * SpellSlot Component
 * Individual spell slot with locked/unlocked states
 */

import React, { useState } from 'react';
import { UnlockConfirmation } from './UnlockConfirmation';
import './SpellSlot.css';

/**
 * Get spell icon emoji based on element or type
 */
const getSpellIcon = (spell) => {
  if (!spell) return '✨';

  // Map by element
  const elementIcons = {
    fire: '🔥',
    water: '🌊',
    ice: '❄️',
    lightning: '⚡',
    earth: '🌍',
    air: '💨',
    light: '✨',
    dark: '🌑',
    chaos: '🌀',
    cosmic: '🌟',
    neutral: '⭐'
  };

  return elementIcons[spell.element] || '✨';
};

/**
 * SpellSlot Component
 * Displays a single spell slot with lock icon and unlock capability
 */
export const SpellSlot = ({
  slot,
  slotIndex,
  buildType,
  onClick,
  onUnlock,
  disabled = false
}) => {
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  if (!slot) {
    return (
      <div className="spell-slot error">
        <div className="error-icon">⚠️</div>
        <div className="error-text">Invalid Slot</div>
      </div>
    );
  }

  const handleUnlockClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    setShowUnlockModal(true);
  };

  const handleUnlockConfirm = () => {
    setShowUnlockModal(false);
    onUnlock && onUnlock();
  };

  const handleUnlockCancel = () => {
    setShowUnlockModal(false);
  };

  // Locked slot with spell
  if (slot.locked && slot.spell) {
    return (
      <>
        <div
          className={`spell-slot locked ${disabled ? 'disabled' : ''}`}
          onClick={disabled ? undefined : handleUnlockClick}
          title={disabled ? 'Cannot unlock during battle' : `Click to unlock (100 💎)`}
        >
          <div className="spell-content">
            <div className="spell-icon-placeholder">
              {getSpellIcon(slot.spell)}
            </div>

            <div className="spell-details">
              <div className="spell-name">{slot.spell.name}</div>
              <div className="spell-type">{slot.spell.type}</div>
            </div>

            <div className="lock-icon" title="Locked">
              🔒
            </div>
          </div>

          <div className="unlock-hint">
            <span className="unlock-icon">🔓</span>
            <span className="unlock-text">100 💎 to unlock</span>
          </div>
        </div>

        {showUnlockModal && (
          <UnlockConfirmation
            slot={slot}
            slotIndex={slotIndex}
            buildType={buildType}
            onConfirm={handleUnlockConfirm}
            onCancel={handleUnlockCancel}
          />
        )}
      </>
    );
  }

  // Empty unlocked slot
  if (!slot.locked && !slot.spell) {
    return (
      <div
        className={`spell-slot empty ${disabled ? 'disabled' : ''}`}
        onClick={disabled ? undefined : onClick}
        title={disabled ? 'Cannot change during battle' : 'Click to add spell'}
      >
        <div className="add-icon">+</div>
        <div className="add-text">Add Spell</div>
        <div className="slot-number">Slot {slotIndex + 1}</div>
      </div>
    );
  }

  // Unlocked slot with spell (shouldn't happen in normal flow, but handle it)
  if (!slot.locked && slot.spell) {
    return (
      <div
        className={`spell-slot unlocked ${disabled ? 'disabled' : ''}`}
        onClick={disabled ? undefined : onClick}
        title="Click to change spell"
      >
        <div className="spell-content">
          <div className="spell-icon-placeholder">
            {getSpellIcon(slot.spell)}
          </div>

          <div className="spell-details">
            <div className="spell-name">{slot.spell.name}</div>
            <div className="spell-type">{slot.spell.type}</div>
          </div>

          <div className="unlock-icon" title="Unlocked">
            🔓
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="spell-slot unknown">
      <div className="error-icon">❓</div>
      <div className="error-text">Unknown State</div>
    </div>
  );
};

export default SpellSlot;
