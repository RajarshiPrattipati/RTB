import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

export const GodotGame = ({ onGameEnd }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadGodotGame = async () => {
      try {
        // Check if Godot files exist
        const indexPath = '/godot/index.js';

        // Dynamically load the Godot engine script
        const script = document.createElement('script');
        script.src = indexPath;
        script.async = true;

        script.onerror = () => {
          if (isMounted) {
            setError('Failed to load Godot game. Please build the game first using the export script.');
            setIsLoading(false);
          }
        };

        script.onload = () => {
          if (!isMounted) return;

          // Initialize the Godot engine
          const engine = new window.Engine({
            canvas: canvasRef.current,
            onProgress: (current, total) => {
              if (isMounted) {
                const progress = Math.round((current / total) * 100);
                setLoadingProgress(progress);
              }
            },
            onExit: () => {
              console.log('Godot game exited');
              if (onGameEnd) {
                onGameEnd();
              }
            },
          });

          engineRef.current = engine;

          // Start the engine
          engine.startGame({
            executable: '/godot/index',
            mainPack: '/godot/index.pck',
          }).then(() => {
            if (isMounted) {
              setIsLoading(false);
              console.log('Godot game loaded successfully');
            }
          }).catch((err) => {
            if (isMounted) {
              console.error('Error starting Godot game:', err);
              setError('Failed to start the game: ' + err.message);
              setIsLoading(false);
            }
          });
        };

        document.body.appendChild(script);

        return () => {
          isMounted = false;
          if (engineRef.current) {
            // Cleanup if needed
            engineRef.current = null;
          }
          if (script.parentNode) {
            document.body.removeChild(script);
          }
        };
      } catch (err) {
        if (isMounted) {
          console.error('Error loading Godot game:', err);
          setError('Failed to initialize game: ' + err.message);
          setIsLoading(false);
        }
      }
    };

    loadGodotGame();

    return () => {
      isMounted = false;
    };
  }, [onGameEnd]);

  const handleBackToMenu = () => {
    if (onGameEnd) {
      onGameEnd();
    }
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBox}>
          <h2>⚠️ Game Load Error</h2>
          <p>{error}</p>
          <div className={styles.instructions}>
            <h3>To build the Godot game:</h3>
            <ol>
              <li>Install Godot 4.2+ from <a href="https://godotengine.org/" target="_blank" rel="noopener noreferrer">godotengine.org</a></li>
              <li>Run the export script: <code>./godot_fighter/export_web.sh</code></li>
              <li>Or manually export in Godot Editor: Project → Export → Web</li>
            </ol>
          </div>
          <button className={styles.backButton} onClick={handleBackToMenu}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameContainer}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <h2>Loading Fighter Game...</h2>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p>{loadingProgress}%</p>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={styles.gameCanvas}
        width="1280"
        height="720"
      />

      {!isLoading && (
        <button className={styles.exitButton} onClick={handleBackToMenu}>
          Exit Game
        </button>
      )}
    </div>
  );
};
