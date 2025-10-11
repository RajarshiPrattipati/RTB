/**
 * ItemShop Component
 * Allows players to purchase premium items using Gems
 */

import React, { useState } from 'react';
import { useHero } from '../../hooks/useHero';
import './ItemShop.css';

/**
 * Spell Unlocker Item Definition
 */
const SPELL_UNLOCKER = {
  id: 'spell_unlocker',
  name: 'Spell Unlocker',
  description: 'Unlocks 1 spell slot in your hero build, returning the spell to your collection',
  cost: 100,
  currency: 'gems',
  icon: '🔓',
  type: 'consumable',
  rarity: 'premium'
};

/**
 * ItemShop Component
 * Displays premium items for purchase with Gems
 */
export const ItemShop = ({ gems, onPurchaseComplete }) => {
  const { inventory, purchaseSpellUnlocker } = useHero();
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState(null);

  const handlePurchase = (item) => {
    if (gems < item.cost) {
      setMessage({
        type: 'error',
        text: `Not enough Gems! You need ${item.cost - gems} more.`
      });
      return;
    }

    setPurchasing(true);

    // Simulate purchase delay
    setTimeout(() => {
      const result = purchaseSpellUnlocker();

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully purchased ${item.name}! 🔓`
        });
        onPurchaseComplete && onPurchaseComplete({ item, result });
      } else {
        setMessage({
          type: 'error',
          text: result.reason || 'Purchase failed. Please try again.'
        });
      }

      setPurchasing(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }, 500);
  };

  const canAfford = gems >= SPELL_UNLOCKER.cost;
  const unlockerCount = inventory?.spell_unlocker || 0;

  return (
    <div className="item-shop">
      {/* Header */}
      <div className="shop-header">
        <h2 className="shop-title">💎 Premium Items</h2>
        <p className="shop-description">
          Purchase powerful items using Gems
        </p>
      </div>

      {/* Player Currencies */}
      <div className="player-currencies">
        <div className="currency-display gems">
          <span className="currency-icon">💎</span>
          <span className="currency-label">Gems:</span>
          <span className="currency-value">{gems}</span>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`shop-message ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Items */}
      <div className="items-grid">
        {/* Spell Unlocker */}
        <div className={`item-card ${SPELL_UNLOCKER.rarity} ${!canAfford ? 'unaffordable' : ''}`}>
          <div className="item-header">
            <div className="item-icon">{SPELL_UNLOCKER.icon}</div>
            <div className="rarity-badge">{SPELL_UNLOCKER.rarity}</div>
          </div>

          <div className="item-body">
            <h3 className="item-name">{SPELL_UNLOCKER.name}</h3>
            <p className="item-description">{SPELL_UNLOCKER.description}</p>

            <div className="item-stats">
              <div className="stat-row">
                <span className="stat-label">Type:</span>
                <span className="stat-value">{SPELL_UNLOCKER.type}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Effect:</span>
                <span className="stat-value">Unlock 1 Slot</span>
              </div>
            </div>

            <div className="item-cost">
              <span className="cost-label">Price:</span>
              <div className="cost-amount">
                <span className="cost-icon">💎</span>
                <span className="cost-value">{SPELL_UNLOCKER.cost}</span>
                <span className="cost-currency">Gems</span>
              </div>
            </div>

            <button
              className={`purchase-btn ${purchasing ? 'purchasing' : ''}`}
              onClick={() => handlePurchase(SPELL_UNLOCKER)}
              disabled={!canAfford || purchasing}
            >
              {purchasing ? (
                <>
                  <span className="spinner">⏳</span>
                  Purchasing...
                </>
              ) : canAfford ? (
                `Purchase for ${SPELL_UNLOCKER.cost} 💎`
              ) : (
                `Need ${SPELL_UNLOCKER.cost - gems} more 💎`
              )}
            </button>
          </div>
        </div>

        {/* Future items can be added here */}
        <div className="item-card coming-soon">
          <div className="coming-soon-content">
            <div className="coming-soon-icon">🔮</div>
            <h3 className="coming-soon-text">More Items</h3>
            <p className="coming-soon-description">Coming Soon!</p>
          </div>
        </div>
      </div>

      {/* Inventory Section */}
      <div className="inventory-section">
        <h3 className="inventory-title">📦 Your Inventory</h3>

        <div className="inventory-grid">
          <div className="inventory-item">
            <div className="inventory-icon">🔓</div>
            <div className="inventory-info">
              <div className="inventory-name">Spell Unlockers</div>
              <div className="inventory-count">
                {unlockerCount} {unlockerCount === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>

          {unlockerCount === 0 && (
            <div className="empty-inventory">
              <span className="empty-icon">📭</span>
              <span className="empty-text">Your inventory is empty</span>
            </div>
          )}
        </div>

        {unlockerCount > 0 && (
          <div className="usage-tip">
            💡 Tip: Use Spell Unlockers in the Build Manager to unlock spell slots
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="info-box">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <strong>About Spell Unlockers</strong>
          <p>
            Once you lock a spell into your build, you cannot remove it without a Spell Unlocker.
            Use these items strategically to adjust your build and try new strategies!
          </p>
        </div>
      </div>

      {/* How to Get Gems */}
      <div className="gems-info">
        <h4 className="gems-info-title">How to Get Gems 💎</h4>
        <ul className="gems-sources">
          <li>Complete daily missions</li>
          <li>Win ranked battles</li>
          <li>Level up rewards</li>
          <li>Special events</li>
        </ul>
      </div>
    </div>
  );
};

export default ItemShop;
