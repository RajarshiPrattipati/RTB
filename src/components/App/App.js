import styles from './styles.module.css';
import { useContext, useEffect, useState } from 'react';
import { Battle, EndMenu, StartMenu } from 'components';
import { HeroStatusBanner } from '../Hero/HeroStatusBanner';
import { RevivalModal } from '../Hero/RevivalModal';
import { SoulCounter } from '../common/SoulCounter';
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

  return (
    <div className={styles.main}>
      {/* Hero Status HUD - Always visible except in battle */}
      {mode !== 'battle' && hero && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
          <SoulCounter showLabel={true} />
        </div>
      )}

      {mode === 'start' && (
        <>
          {hero && (
            <div style={{ marginBottom: '2rem' }}>
              <HeroStatusBanner
                onReviveClick={() => setShowRevivalModal(true)}
              />
            </div>
          )}
          <StartMenu onStartClick={handleStartBattle} />
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className={styles.startButton}
              onClick={() => setMode('hero')}
            >
              Manage Hero
            </button>
            <button
              className={styles.startButton}
              onClick={() => setMode('shop')}
            >
              Shop
            </button>
          </div>
        </>
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
        <div className={styles.main}>
          <h1>Hero Management</h1>
          <p style={{ color: 'white', marginBottom: '2rem' }}>
            Coming soon: Build Manager and Hero customization!
          </p>
          <button
            className={styles.startButton}
            onClick={() => setMode('start')}
          >
            Back to Menu
          </button>
        </div>
      )}

      {mode === 'shop' && (
        <div className={styles.main}>
          <h1>Shop</h1>
          <p style={{ color: 'white', marginBottom: '2rem' }}>
            Coming soon: Soul Shop and Item Shop!
          </p>
          <button
            className={styles.startButton}
            onClick={() => setMode('start')}
          >
            Back to Menu
          </button>
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
