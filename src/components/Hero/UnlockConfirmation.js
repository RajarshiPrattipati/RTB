/**
 * UnlockConfirmation Component
 * Confirmation modal for unlocking spell slots
 */

import React from 'react';
import { useHero } from '../../hooks/useHero';
import './UnlockConfirmation.css';

/**
 * UnlockConfirmation Component
 * Shows confirmation dialog with Gem cost and spell details
 */
export const UnlockConfirmation = ({
  slot,
  slotIndex,
  buildType,
  onConfirm,
  onCancel
}) => {
  const { hero, inventory, gems } = useHero();

  if (!slot || !slot.spell) {
    return null;
  }

  const UNLOCK_COST = 100; // Gems
  const hasGems = gems >= UNLOCK_COST;
  const hasUnlockerItem = inventory?.spell_unlocker > 0;
  const canUnlock = hasGems || hasUnlockerItem;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="unlock-confirmation-overlay" onClick={handleOverlayClick}>
      <div className="unlock-confirmation-modal">
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">🔓 Unlock Spell Slot?</h3>
          <button className="close-btn" onClick={onCancel}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Spell Preview */}
          <div className="spell-preview">
            <div className="spell-preview-card">
              <img
                src={slot.spell.iconUrl || '/assets/default-spell.png'}
                alt={slot.spell.name}
                className="spell-icon-large"
              />
              <div className="spell-info">
                <h4 className="spell-name">{slot.spell.name}</h4>
                <div className="spell-type">{slot.spell.type}</div>
                {slot.spell.description && (
                  <p className="spell-description">{slot.spell.description}</p>
                )}
              </div>
            </div>

            <div className="return-notice">
              ↩️ This spell will return to your collection
            </div>
          </div>

          {/* Slot Info */}
          <div className="slot-info">
            <div className="info-row">
              <span className="info-label">Build:</span>
              <span className="info-value">{buildType}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Slot:</span>
              <span className="info-value">#{slotIndex + 1}</span>
            </div>
          </div>

          {/* Cost Display */}
          <div className="cost-section">
            <h4 className="cost-title">Unlock Cost:</h4>

            {hasUnlockerItem ? (
              <div className="cost-option primary">
                <div className="option-icon">🔓</div>
                <div className="option-details">
                  <div className="option-name">Use Spell Unlocker</div>
                  <div className="option-cost">1 Spell Unlocker Item</div>
                  <div className="option-balance">
                    You have: {inventory.spell_unlocker} item(s)
                  </div>
                </div>
              </div>
            ) : (
              <div className={`cost-option ${hasGems ? 'affordable' : 'too-expensive'}`}>
                <div className="option-icon">💎</div>
                <div className="option-details">
                  <div className="option-name">Pay with Gems</div>
                  <div className="option-cost">{UNLOCK_COST} Gems</div>
                  <div className="option-balance">
                    You have: {gems} 💎
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="warning-box">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <strong>This cannot be undone.</strong>
              <p>Choose your build changes wisely!</p>
            </div>
          </div>

          {/* Error Messages */}
          {!canUnlock && (
            <div className="error-box">
              <div className="error-icon">❌</div>
              <div className="error-content">
                <strong>Cannot unlock this slot</strong>
                <p>
                  You need either:
                  <ul>
                    <li>{UNLOCK_COST} 💎 Gems (you have {gems})</li>
                    <li>1 Spell Unlocker item (you have {inventory?.spell_unlocker || 0})</li>
                  </ul>
                </p>
                <button className="shop-link" onClick={onCancel}>
                  Go to Shop
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className={`btn btn-confirm ${canUnlock ? '' : 'disabled'}`}
            onClick={canUnlock ? onConfirm : undefined}
            disabled={!canUnlock}
          >
            {hasUnlockerItem
              ? '🔓 Use Spell Unlocker'
              : `💎 Unlock for ${UNLOCK_COST} Gems`}
          </button>
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockConfirmation;
