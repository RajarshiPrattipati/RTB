/**
 * GlobalStateProvider Component
 * Wraps the app with global state context and initializes systems
 */

import React, { useEffect, useReducer, createContext, useContext } from 'react';
import { globalReducer, initialState } from './GlobalState';
import gameManager from '../systems/integration/GameManager';
import persistenceManager from '../utils/PersistenceManager';

export const GlobalContext = createContext();

/**
 * Hook to use global state
 */
export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalStateProvider');
  }
  return context;
};

/**
 * GlobalStateProvider
 * Provides global state to the entire app
 */
export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState, (initial) => {
    // Try to load saved state
    const savedState = persistenceManager.load();

    if (savedState) {
      console.log('Loaded saved game state');

      // CRITICAL: Restore Hero class instance from plain object
      if (savedState.player?.hero) {
        const { Hero } = require('../models/Hero');
        const heroData = savedState.player.hero;

        // Create a proper Hero instance from the saved data
        const restoredHero = new Hero(
          heroData.id,
          heroData.name,
          heroData.avatar
        );

        // Restore all properties
        restoredHero.status = heroData.status;
        restoredHero.deathCount = heroData.deathCount;
        restoredHero.revivalCost = heroData.revivalCost;
        restoredHero.activeBuild = heroData.activeBuild;
        restoredHero.primary = heroData.primary;
        restoredHero.secondary = heroData.secondary;

        savedState.player.hero = restoredHero;
      }

      return savedState;
    }

    console.log('Starting new game with initial state');
    return initial;
  });

  // Initialize GameManager when component mounts
  useEffect(() => {
    gameManager.initialize(state, dispatch);

    // Initialize hero if it doesn't exist
    if (!state.player.hero) {
      const Hero = require('../models/Hero').Hero;
      const defaultHero = Hero.createDefault(state.player.username);
      dispatch({
        type: 'HERO_INIT',
        payload: { hero: defaultHero }
      });
    }

    // Initialize missions if they don't exist
    if (!state.player.missions) {
      const missionManager = require('../systems/progression/MissionManager').default;
      dispatch({
        type: 'MISSIONS_INIT',
        payload: {
          daily: missionManager.getDailyMissions(),
          weekly: missionManager.getWeeklyMissions(),
          dailyResetTime: Date.now(),
          weeklyResetTime: Date.now()
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update gameManager state when it changes
  useEffect(() => {
    gameManager.updateState(state);
  }, [state]);

  // Auto-save every 60 seconds
  useEffect(() => {
    const autoSaveId = persistenceManager.setupAutoSave(() => state, 60000);

    return () => {
      persistenceManager.clearAutoSave(autoSaveId);
    };
  }, [state]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      persistenceManager.save(state);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state]);

  // Emit daily login event on mount
  useEffect(() => {
    gameManager.emit('daily:login', { timestamp: Date.now() });
  }, []);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalStateProvider;
