/**
 * SoulShop Component
 * Allows players to purchase Souls using Gold
 */

import React, { useState } from 'react';
import { useHero } from '../../hooks/useHero';
import './SoulShop.css';

/**
 * Soul Package Definition
 * Different Soul bundles with discounts for bulk purchases
 */
const SOUL_PACKAGES = [
  {
    id: 'souls_1',
    souls: 1,
    gold: 100,
    discount: 0,
    popular: false
  },
  {
    id: 'souls_10',
    souls: 10,
    gold: 900,
    discount: 10,
    popular: true
  },
  {
    id: 'souls_50',
    souls: 50,
    gold: 4000,
    discount: 20,
    popular: false
  },
  {
    id: 'souls_100',
    souls: 100,
    gold: 7000,
    discount: 30,
    popular: false
  }
];

/**
 * SoulShop Component
 * Displays Soul packages for purchase with Gold
 */
export const SoulShop = ({ gold, onPurchaseComplete }) => {
  const { souls, convertGoldToSouls } = useHero();
  const [purchasing, setPurchasing] = useState(null);
  const [message, setMessage] = useState(null);

  const handlePurchase = (pkg) => {
    if (gold < pkg.gold) {
      setMessage({
        type: 'error',
        text: `Not enough Gold! You need ${pkg.gold - gold} more.`
      });
      return;
    }

    setPurchasing(pkg.id);

    // Simulate purchase delay
    setTimeout(() => {
      const result = convertGoldToSouls(pkg.gold);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully purchased ${pkg.souls} Souls! 👻`
        });
        onPurchaseComplete && onPurchaseComplete(result);
      } else {
        setMessage({
          type: 'error',
          text: result.reason || 'Purchase failed. Please try again.'
        });
      }

      setPurchasing(null);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }, 500);
  };

  return (
    <div className="soul-shop">
      {/* Header */}
      <div className="shop-header">
        <h2 className="shop-title">👻 Soul Shop</h2>
        <p className="shop-description">
          Convert Gold to Souls for hero revival
        </p>
      </div>

      {/* Player Currencies */}
      <div className="player-currencies">
        <div className="currency-display">
          <span className="currency-icon">💰</span>
          <span className="currency-label">Gold:</span>
          <span className="currency-value">{gold}</span>
        </div>
        <div className="currency-display">
          <span className="currency-icon">👻</span>
          <span className="currency-label">Souls:</span>
          <span className="currency-value">{souls}</span>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`shop-message ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Soul Packages */}
      <div className="soul-packages">
        {SOUL_PACKAGES.map((pkg) => {
          const canAfford = gold >= pkg.gold;
          const isPurchasing = purchasing === pkg.id;
          const basePrice = pkg.souls * 100;
          const savings = basePrice - pkg.gold;

          return (
            <div
              key={pkg.id}
              className={`soul-package ${pkg.popular ? 'popular' : ''} ${!canAfford ? 'unaffordable' : ''}`}
            >
              {pkg.popular && (
                <div className="popular-badge">⭐ Best Value</div>
              )}

              <div className="package-content">
                <div className="package-icon">👻</div>

                <div className="package-info">
                  <div className="souls-amount">{pkg.souls} Souls</div>

                  {pkg.discount > 0 && (
                    <div className="discount-badge">
                      {pkg.discount}% OFF
                    </div>
                  )}
                </div>

                <div className="package-cost">
                  <div className="cost-amount">
                    <span className="cost-icon">💰</span>
                    <span className="cost-value">{pkg.gold}</span>
                  </div>

                  {savings > 0 && (
                    <div className="savings">
                      Save {savings} Gold!
                    </div>
                  )}
                </div>

                <button
                  className={`buy-btn ${isPurchasing ? 'purchasing' : ''}`}
                  onClick={() => handlePurchase(pkg)}
                  disabled={!canAfford || isPurchasing}
                >
                  {isPurchasing ? (
                    <>
                      <span className="spinner">⏳</span>
                      Purchasing...
                    </>
                  ) : canAfford ? (
                    'Buy Now'
                  ) : (
                    `Need ${pkg.gold - gold} more`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="info-box">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <strong>About Souls</strong>
          <p>
            Souls are required to revive your hero after defeat. Collect them through battles,
            missions, or purchase them here with Gold. Larger packages offer better value!
          </p>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="conversion-info">
        <span className="conversion-label">Conversion Rate:</span>
        <span className="conversion-rate">100 💰 Gold = 1 👻 Soul</span>
      </div>
    </div>
  );
};

export default SoulShop;
