/**
 * GlobalStateProvider Component
 * Wraps the app with global state context and initializes systems
 */

import React, { useEffect, useReducer, createContext } from 'react';
import { globalReducer, initialState } from './GlobalState';
import gameManager from '../systems/integration/GameManager';
import persistenceManager from '../utils/PersistenceManager';

export const GlobalContext = createContext();

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
      return savedState;
    }

    console.log('Starting new game with initial state');
    return initial;
  });

  // Initialize GameManager when state loads
  useEffect(() => {
    gameManager.initialize(state);
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
