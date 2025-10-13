import styles from './styles.module.css';
import { useContext, useEffect, useState } from 'react';
import { Battle, EndMenu, StartMenu } from 'components';
import { HeroStatusBanner } from '../Hero/HeroStatusBanner';
import { RevivalModal } from '../Hero/RevivalModal';
import { BuildManager } from '../Hero/BuildManager';
import { SoulCounter } from '../common/SoulCounter';
import { SoulShop } from '../Shop/SoulShop';
import { ItemShop } from '../Shop/ItemShop';
import { Navigation } from '../common/Navigation';
import { SpellCollection } from '../Hero/SpellCollection';
import { GlobalContext } from '../../context/GlobalStateProvider';

export const App = () => {
  const { state } = useContext(GlobalContext);
  const [winner, setWinner] = useState();
  const [mode, setMode] = useState('start');
  const [showRevivalModal, setShowRevivalModal] = useState(false);

  const hero = state?.player?.hero;
  const heroDead = hero?.status === 'dead';

  useEffect(() => {
    if (mode === 'battle') {
      setWinner(undefined);
    }
  }, [mode]);

  // Show revival modal when hero dies
  useEffect(() => {
    if (heroDead && mode !== 'battle') {
      setShowRevivalModal(true);
    }
  }, [heroDead, mode]);

  const handleStartBattle = () => {
    if (heroDead) {
      setShowRevivalModal(true);
    } else {
      setMode('battle');
    }
  };

  const handleNavigate = (newMode) => {
    // Ensure 'start' mode shows the home/start screen
    if (newMode === 'start' && mode !== 'start') {
      setWinner(undefined);
    }
    setMode(newMode);
  };

  return (
    <div className={styles.main}>
      {/* Main Navigation - Always visible except in battle and gameOver */}
      {mode !== 'battle' && mode !== 'gameOver' && (
        <Navigation
          currentMode={mode}
          onNavigate={handleNavigate}
          disabled={false}
        />
      )}

      {/* Hero Status HUD - Always visible except in battle */}
      {mode !== 'battle' && hero && (
        <div style={{ position: 'fixed', top: '5rem', right: '1rem', zIndex: 1000 }}>
          <SoulCounter showLabel={true} />
        </div>
      )}

      {mode === 'start' && (
        <div style={{ paddingTop: '5rem' }}>
          {hero && (
            <div style={{ marginBottom: '2rem' }}>
              <HeroStatusBanner
                onReviveClick={() => setShowRevivalModal(true)}
              />
            </div>
          )}
          <StartMenu onStartClick={handleStartBattle} />
        </div>
      )}

      {mode === 'battle' && (
        <Battle
          onGameEnd={winner => {
            setWinner(winner);
            setMode('gameOver');
          }}
        />
      )}

      {mode === 'gameOver' && !!winner && (
        <EndMenu winner={winner} onStartClick={() => setMode('start')} />
      )}

      {mode === 'hero' && (
        <div className={styles.main} style={{ paddingTop: '5rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
              ⚔️ Hero Customization
            </h1>

            {hero && (
              <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Hero Info Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(15, 156, 255, 0.2) 0%, rgba(15, 156, 255, 0.05) 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '2px solid rgba(15, 156, 255, 0.3)',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      border: '3px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      ⚔️
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>{hero.name}</h2>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: hero.status === 'alive' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                          border: `1px solid ${hero.status === 'alive' ? '#10b981' : '#ef4444'}`,
                          borderRadius: '20px',
                          fontSize: '0.9rem'
                        }}>
                          {hero.status === 'alive' ? '✅ Ready for Battle' : '💀 Deceased'}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '20px',
                          fontSize: '0.9rem'
                        }}>
                          🔄 {hero.deathCount} Deaths
                        </span>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '20px',
                          fontSize: '0.9rem'
                        }}>
                          👻 Revival: {hero.revivalCost} Souls
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Build Manager */}
                <div>
                  <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>
                    🎯 Spell Builds
                  </h2>
                  <BuildManager
                    availableSpells={state.player.collection || []}
                    onLockSpell={(result) => {
                      console.log('Spell locked:', result);
                    }}
                    onUnlockSpell={(result) => {
                      console.log('Spell unlocked:', result);
                    }}
                  />
                </div>

                {/* Spell Collection */}
                <div>
                  <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.5rem' }}>
                    📚 Spell Inventory
                  </h2>
                  <SpellCollection
                    spells={state.player.collection || []}
                    onSpellSelect={(spell) => {
                      console.log('Selected spell:', spell);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'shop' && (
        <div className={styles.main} style={{ paddingTop: '5rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
              Shop
            </h1>

            <div style={{ display: 'grid', gap: '2rem', marginBottom: '2rem' }}>
              {/* Soul Shop Section */}
              <div>
                <SoulShop
                  gold={state.player.currencies.gold}
                  onPurchaseComplete={(result) => {
                    console.log('Soul purchase completed:', result);
                  }}
                />
              </div>

              {/* Item Shop Section */}
              <div>
                <ItemShop
                  gems={state.player.currencies.gems}
                  onPurchaseComplete={(result) => {
                    console.log('Item purchase completed:', result);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revival Modal */}
      {showRevivalModal && hero && (
        <RevivalModal
          isOpen={showRevivalModal}
          onRevive={() => {
            setShowRevivalModal(false);
          }}
          onCancel={() => {
            setShowRevivalModal(false);
          }}
          onGoToShop={() => {
            setShowRevivalModal(false);
            setMode('shop');
          }}
        />
      )}
    </div>
  );
};
