import styles from './styles.module.css';
import { useContext } from 'react';
import { GlobalContext } from '../../context/GlobalStateProvider';
import { playerStats } from 'shared';

export const EndMenu = ({ winner, onStartClick }) => {
  const { state } = useContext(GlobalContext);
  const playerWon = winner.name === playerStats.name;

  // Show basic rewards info
  const souls = state?.player?.currencies?.souls || 0;

  return (
    <div className={styles.main}>
      <h1>{winner.name} has won!</h1>

      {playerWon && (
        <div style={{
          background: 'rgba(76, 175, 80, 0.2)',
          border: '2px solid #4caf50',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '2rem',
          marginBottom: '2rem',
          color: 'white',
        }}>
          <h2 style={{ margin: '0 0 1rem 0', color: '#81c784' }}>Victory Rewards!</h2>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            + 1 Soul 👻
          </div>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            + 50 Gold 💰
          </div>
          <div style={{ fontSize: '1.2rem' }}>
            + 100 XP ⭐
          </div>
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.95rem',
            color: 'rgba(255, 255, 255, 0.8)',
          }}>
            Total Souls: {souls} 👻
          </div>
        </div>
      )}

      {!playerWon && (
        <div style={{
          background: 'rgba(233, 69, 96, 0.2)',
          border: '2px solid #e94560',
          borderRadius: '12px',
          padding: '1.5rem',
          marginTop: '2rem',
          marginBottom: '2rem',
          color: 'white',
        }}>
          <h2 style={{ margin: '0 0 1rem 0', color: '#f48fb1' }}>Defeat</h2>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            Your hero has fallen in battle!
          </p>
          {state?.player?.hero?.status === 'dead' && (
            <p style={{ margin: '1rem 0 0 0', color: '#ffb74d' }}>
              ⚠️ Hero needs revival to continue battling
            </p>
          )}
        </div>
      )}

      <button className={styles.startButton} onClick={onStartClick}>
        {playerWon ? 'Play Again' : 'Return to Menu'}
      </button>
    </div>
  );
};
