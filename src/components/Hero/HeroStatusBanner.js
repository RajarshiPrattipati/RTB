/**
 * HeroStatusBanner Component
 * Displays hero status (alive/dead) with revival prompt
 */

import React from 'react';
import { useHero } from '../../hooks/useHero';
import './HeroStatusBanner.css';

/**
 * HeroStatusBanner Component
 * Shows hero avatar, status, and revival button when dead
 */
export const HeroStatusBanner = ({ onReviveClick }) => {
  const { hero, heroStatus, souls, canRevive } = useHero();

  if (!hero) {
    return (
      <div className="hero-status-banner no-hero">
        <div className="message">No hero found. Initialize hero first.</div>
      </div>
    );
  }

  // Dead state
  if (heroStatus.dead) {
    return (
      <div className="hero-status-banner dead">
        <div className="hero-avatar grayscale">
          <img src={hero.avatar} alt={hero.name} />
          <div className="death-overlay">💀</div>
        </div>

        <div className="hero-info">
          <h3 className="hero-name">{hero.name}</h3>
          <div className="status-badge dead-badge">💀 Defeated</div>
        </div>

        <div className="revival-section">
          <div className="revival-cost">
            <span className="label">Revival Cost:</span>
            <span className={`cost ${canRevive ? 'affordable' : 'too-expensive'}`}>
              👻 {hero.revivalCost} Souls
            </span>
          </div>

          <div className="soul-balance">
            <span className="label">You have:</span>
            <span className="amount">👻 {souls} Souls</span>
          </div>

          {!canRevive && (
            <div className="warning">
              ⚠️ Not enough Souls! Need {hero.revivalCost - souls} more.
            </div>
          )}

          <button
            className={`revive-btn ${canRevive ? 'pulse' : 'disabled'}`}
            onClick={onReviveClick}
            disabled={!canRevive}
          >
            {canRevive ? '✨ Revive Hero' : '🔒 Insufficient Souls'}
          </button>
        </div>
      </div>
    );
  }

  // Alive state
  return (
    <div className="hero-status-banner alive">
      <div className="hero-avatar">
        <img src={hero.avatar} alt={hero.name} />
      </div>

      <div className="hero-info">
        <h3 className="hero-name">{hero.name}</h3>
        <div className="status-badge alive-badge">✅ Ready</div>
      </div>

      <div className="hero-stats">
        <div className="stat">
          <span className="stat-label">Active Build:</span>
          <span className="stat-value">{hero.activeBuild}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Deaths:</span>
          <span className="stat-value">{hero.deathCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Next Revival:</span>
          <span className="stat-value">👻 {hero.revivalCost} Souls</span>
        </div>
      </div>
    </div>
  );
};

export default HeroStatusBanner;
