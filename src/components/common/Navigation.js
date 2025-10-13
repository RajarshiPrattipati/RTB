/**
 * Navigation Component
 * Persistent navigation bar for switching between app sections
 */

import React from 'react';
import './Navigation.css';

export const Navigation = ({ currentMode, onNavigate, disabled = false }) => {
  const navItems = [
    { mode: 'start', label: 'Home', icon: '🏠' },
    { mode: 'hero', label: 'Hero', icon: '⚔️' },
    { mode: 'shop', label: 'Shop', icon: '🏪' },
  ];

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        {navItems.map(item => (
          <button
            key={item.mode}
            className={`nav-item ${currentMode === item.mode ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={() => !disabled && onNavigate(item.mode)}
            disabled={disabled}
            title={disabled ? 'Cannot navigate during battle' : item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
