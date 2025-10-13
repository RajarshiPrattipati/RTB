import styles from './styles.module.css';
import { useEffect, useState } from 'react';
import { useAIOpponent, useBattleSequence } from 'hooks';
import { opponentStats, playerStats, wait } from 'shared';
import { BattleMenu, PlayerSummary, BattleAnnouncer } from 'components';
import gameManager from '../../systems/integration/GameManager';

export const Battle = ({ onGameEnd }) => {
  const [sequence, setSequence] = useState({});
  const [battleData, setBattleData] = useState({
    spellsCast: 0,
    damageDealt: 0,
    hpHealed: 0,
    fireDamage: 0,
    damageTaken: 0,
  });

  const {
    turn,
    inSequence,
    playerHealth,
    opponentHealth,
    playerAnimation,
    opponentAnimation,
    announcerMessage,
  } = useBattleSequence(sequence);

  const aiChoice = useAIOpponent(turn);

  useEffect(() => {
    if (aiChoice && turn === 1 && !inSequence) {
      setSequence({ turn, mode: aiChoice });
    }
  }, [turn, aiChoice, inSequence]);

  // Track battle actions for mission progress
  useEffect(() => {
    if (sequence.mode && sequence.turn === 0) {
      setBattleData(prev => ({
        ...prev,
        spellsCast: prev.spellsCast + (sequence.mode === 'magic' ? 1 : 0),
      }));
    }
  }, [sequence]);

  useEffect(() => {
    if (playerHealth === 0 || opponentHealth === 0) {
      (async () => {
        await wait(1000);

        const playerVictory = playerHealth > 0;
        const winner = playerVictory ? playerStats : opponentStats;

        // Emit battle end event with complete data
        gameManager.emit('battle:end', {
          playerVictory,
          playerHp: playerHealth,
          opponentHp: opponentHealth,
          difficulty: 'normal',
          perfectVictory: playerVictory && battleData.damageTaken === 0,
          ...battleData,
        });

        onGameEnd(winner);
      })();
    }
  }, [playerHealth, opponentHealth, onGameEnd, battleData]);

  return (
    <>
      <div className={styles.opponent}>
        <div className={styles.summary}>
          <PlayerSummary
            main={false}
            health={opponentHealth}
            name={opponentStats.name}
            level={opponentStats.level}
            maxHealth={opponentStats.maxHealth}
          />
        </div>
      </div>

      <div className={styles.characters}>
        <div className={styles.gameHeader}>
          {playerStats.name} vs {opponentStats.name}
        </div>
        <div className={styles.gameImages}>
          <div className={styles.playerSprite}>
            <img
              alt={playerStats.name}
              src={playerStats.img}
              className={styles[playerAnimation]}
            />
          </div>
          <div className={styles.opponentSprite}>
            <img
              alt={opponentStats.name}
              src={opponentStats.img}
              className={styles[opponentAnimation]}
            />
          </div>
        </div>
      </div>

      <div className={styles.user}>
        <div className={styles.summary}>
          <PlayerSummary
            main={true}
            health={playerHealth}
            name={playerStats.name}
            level={playerStats.level}
            maxHealth={playerStats.maxHealth}
          />
        </div>

        <div className={styles.hud}>
          <div className={styles.hudChild}>
            <BattleAnnouncer
              message={
                announcerMessage || `What will ${playerStats.name} do?`
              }
            />
          </div>
          {!inSequence && turn === 0 && (
            <div className={styles.hudChild}>
              <BattleMenu
                onHeal={() => setSequence({ mode: 'heal', turn })}
                onMagic={() => setSequence({ mode: 'magic', turn })}
                onAttack={() => setSequence({ mode: 'attack', turn })}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
