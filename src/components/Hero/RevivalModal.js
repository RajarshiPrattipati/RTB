/**
 * RevivalModal Component
 * Modal dialog for hero revival with Soul cost display
 */

import React from 'react';
import { useHero } from '../../hooks/useHero';
import './RevivalModal.css';

/**
 * RevivalModal Component
 * Shows revival confirmation with cost and player's Soul balance
 */
export const RevivalModal = ({ isOpen, onRevive, onCancel, onGoToShop }) => {
  const { hero, souls, canRevive, reviveHero } = useHero();

  if (!isOpen || !hero) {
    return null;
  }

  const handleRevive = () => {
    const result = reviveHero();
    if (result.success) {
      onRevive && onRevive(result);
    }
  };

  const shortfall = hero.revivalCost - souls;

  return (
    <div className="revival-modal-overlay" onClick={onCancel}>
      <div className="revival-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">💀 Hero Defeated</h2>
          <button className="close-btn" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="hero-display">
            <div className="hero-avatar-large grayscale">
              <img src={hero.avatar} alt={hero.name} />
              <div className="death-overlay-large">💀</div>
            </div>
            <h3 className="hero-name">{hero.name}</h3>
            <p className="death-message">Your hero has fallen in battle!</p>
          </div>

          <div className="revival-info">
            <div className="cost-display">
              <div className="cost-label">Revival Cost:</div>
              <div className={`cost-amount ${canRevive ? 'affordable' : 'too-expensive'}`}>
                <span className="icon">👻</span>
                <span className="amount">{hero.revivalCost}</span>
                <span className="label">Souls</span>
              </div>
            </div>

            <div className="balance-display">
              <div className="balance-label">Your Souls:</div>
              <div className="balance-amount">
                <span className="icon">👻</span>
                <span className="amount">{souls}</span>
                <span className="label">Souls</span>
              </div>
            </div>

            {!canRevive && (
              <div className="shortfall-warning">
                <div className="warning-icon">⚠️</div>
                <div className="warning-text">
                  <strong>Not enough Souls!</strong>
                  <p>You need {shortfall} more Soul{shortfall > 1 ? 's' : ''}.</p>
                </div>
              </div>
            )}
          </div>

          <div className="death-count-info">
            <div className="info-item">
              <span className="info-label">Total Deaths:</span>
              <span className="info-value">{hero.deathCount}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Next Revival Cost:</span>
              <span className="info-value">
                👻 {hero.deathCount === 0 ? 25 : hero.deathCount === 1 ? 50 : 50} Souls
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {canRevive ? (
            <>
              <button
                className="btn btn-revive pulse"
                onClick={handleRevive}
              >
                ✨ Revive Hero for {hero.revivalCost} Souls
              </button>
              <button className="btn btn-cancel" onClick={onCancel}>
                Not Now
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-shop"
                onClick={() => {
                  onCancel();
                  onGoToShop && onGoToShop();
                }}
              >
                🛒 Get More Souls
              </button>
              <button className="btn btn-cancel" onClick={onCancel}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevivalModal;
