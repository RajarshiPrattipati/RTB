/**
 * SoulCounter Component
 * Displays player's Soul count in the HUD
 */

import React from 'react';
import { useHero } from '../../hooks/useHero';
import './SoulCounter.css';

/**
 * SoulCounter Component
 * Shows Soul count with icon
 */
export const SoulCounter = ({ className = '', showLabel = false }) => {
  const { souls } = useHero();

  return (
    <div className={`soul-counter hud-item ${className}`}>
      <span className="soul-icon" title="Souls (used for hero revival)">
        👻
      </span>
      {showLabel && <span className="soul-label">Souls:</span>}
      <span className="soul-count">{souls}</span>
    </div>
  );
};

export default SoulCounter;
