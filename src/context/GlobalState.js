/**
 * Global State Schema
 * Manages all game state including hero, currencies, collection, and progression
 */

import React, { createContext, useReducer, useContext } from 'react';
import { getAllStarterSpells } from '../shared/starterSpells';

/**
 * Initial State
 * Version 1.3 - Includes Hero Death/Revival and Spell Lock systems
 */
export const initialState = {
  // Game metadata
  version: '1.3',
  initialized: false,
  lastSaved: null,

  // Player data
  player: {
    id: null,
    username: 'Player',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,

    // Hero system (NEW in v1.3)
    hero: null, // Will be Hero instance

    // Currencies
    currencies: {
      gold: 100,        // Earned from battles
      souls: 10,        // NEW: For hero revival (10→25→50 per revival)
      shards: 0,        // For spell upgrades
      wildcards: 0,     // Universal spell crafting
      gems: 50,         // Premium currency (cosmetics, Spell Unlockers)
    },

    // Inventory (NEW in v1.3)
    inventory: {
      spell_unlocker: 0, // Unlocks 1 spell slot (costs 100 Gems)
    },

    // Spell collection
    collection: getAllStarterSpells(), // Array of Spell objects - Start with 8 basic spells

    // Statistics
    stats: {
      battlesPlayed: 0,
      battlesWon: 0,
      battlesLost: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      spellsCast: 0,
      enemiesDefeated: 0,
      soulsEarned: 0,    // NEW: Total Souls earned
      soulsSpent: 0,     // NEW: Total Souls spent on revivals
      revivals: 0,       // NEW: Total hero revivals
      spellsUnlocked: 0, // NEW: Total spell unlocks
    },

    // Daily/Weekly progress
    dailyProgress: {
      lastLoginDate: null,
      loginStreak: 0,
      dailyMissionsCompleted: 0,
    },
  },

  // Battle state
  battle: {
    active: false,
    opponent: null,
    playerHp: 100,
    opponentHp: 100,
    interval: 0,
    playerAction: null,
    opponentAction: null,
    history: [],
  },

  // Progression systems
  progression: {
    missions: {
      daily: [],
      weekly: [],
    },
    achievements: [],
    battlePass: {
      tier: 0,
      xp: 0,
    },
  },

  // UI state
  ui: {
    currentScreen: 'home', // home, battle, collection, shop, hero
    modalOpen: null,
    notifications: [],
    loading: false,
  },
};

/**
 * Create Global Context
 */
export const GlobalContext = createContext();

/**
 * Global State Provider
 */
export const GlobalStateProvider = ({ children, initialStateOverride = null }) => {
  const [state, dispatch] = useReducer(
    globalReducer,
    initialStateOverride || initialState
  );

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

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
 * Root reducer combining all sub-reducers
 */
export function globalReducer(state, action) {
  switch (action.type) {
    // ===== HERO ACTIONS =====
    case 'HERO_INIT':
      return {
        ...state,
        player: {
          ...state.player,
          hero: action.payload.hero,
        },
      };

    case 'HERO_DEATH':
      if (state.player.hero) {
        state.player.hero.die();
      }
      return {
        ...state,
        player: {
          ...state.player,
          hero: state.player.hero,
        },
      };

    case 'HERO_REVIVE':
      if (state.player.hero && state.player.currencies.souls >= state.player.hero.revivalCost) {
        const cost = state.player.hero.revivalCost;
        state.player.hero.revive();

        return {
          ...state,
          player: {
            ...state.player,
            hero: state.player.hero,
            currencies: {
              ...state.player.currencies,
              souls: state.player.currencies.souls - cost,
            },
            stats: {
              ...state.player.stats,
              soulsSpent: state.player.stats.soulsSpent + cost,
              revivals: state.player.stats.revivals + 1,
            },
          },
        };
      }
      return state;

    case 'HERO_SWITCH_BUILD':
      if (state.player.hero) {
        state.player.hero.switchBuild(action.payload.buildType);
      }
      return {
        ...state,
        player: {
          ...state.player,
          hero: state.player.hero,
        },
      };

    // ===== SPELL LOCK ACTIONS =====
    case 'SPELL_LOCK':
      if (state.player.hero) {
        const { buildType, slotIndex, spell } = action.payload;
        const build = state.player.hero.getBuild(buildType);
        const slot = build[slotIndex];

        if (slot && !slot.locked) {
          slot.equipSpell(spell);

          // Remove spell from collection
          const spellIndex = state.player.collection.findIndex(s => s.id === spell.id);
          if (spellIndex !== -1) {
            state.player.collection.splice(spellIndex, 1);
          }
        }
      }

      return {
        ...state,
        player: {
          ...state.player,
          hero: state.player.hero,
          collection: [...state.player.collection],
        },
      };

    case 'SPELL_UNLOCK':
      if (state.player.hero && state.player.inventory.spell_unlocker > 0) {
        const { buildType, slotIndex } = action.payload;
        const build = state.player.hero.getBuild(buildType);
        const slot = build[slotIndex];

        if (slot && slot.locked && slot.spell) {
          const returnedSpell = slot.spell;
          slot.unlock();

          // Use one Spell Unlocker
          state.player.inventory.spell_unlocker -= 1;

          // Return spell to collection
          state.player.collection.push(returnedSpell);

          return {
            ...state,
            player: {
              ...state.player,
              hero: state.player.hero,
              inventory: { ...state.player.inventory },
              collection: [...state.player.collection],
              stats: {
                ...state.player.stats,
                spellsUnlocked: state.player.stats.spellsUnlocked + 1,
              },
            },
          };
        }
      }
      return state;

    case 'SPELL_UNLOCK_WITH_GEMS':
      if (state.player.hero && state.player.currencies.gems >= 100) {
        const { buildType, slotIndex } = action.payload;
        const build = state.player.hero.getBuild(buildType);
        const slot = build[slotIndex];

        if (slot && slot.locked && slot.spell) {
          const returnedSpell = slot.spell;
          slot.unlock();

          // Spend 100 Gems
          state.player.currencies.gems -= 100;

          // Return spell to collection
          state.player.collection.push(returnedSpell);

          return {
            ...state,
            player: {
              ...state.player,
              hero: state.player.hero,
              currencies: { ...state.player.currencies },
              collection: [...state.player.collection],
              stats: {
                ...state.player.stats,
                spellsUnlocked: state.player.stats.spellsUnlocked + 1,
              },
            },
          };
        }
      }
      return state;

    // ===== SOUL ACTIONS =====
    case 'SOUL_GAIN':
      return {
        ...state,
        player: {
          ...state.player,
          currencies: {
            ...state.player.currencies,
            souls: state.player.currencies.souls + action.payload.amount,
          },
          stats: {
            ...state.player.stats,
            soulsEarned: state.player.stats.soulsEarned + action.payload.amount,
          },
        },
      };

    case 'SOUL_SPEND':
      if (state.player.currencies.souls >= action.payload.amount) {
        return {
          ...state,
          player: {
            ...state.player,
            currencies: {
              ...state.player.currencies,
              souls: state.player.currencies.souls - action.payload.amount,
            },
          },
        };
      }
      return state;

    case 'GOLD_TO_SOULS':
      const { goldAmount } = action.payload;
      const soulsToGain = Math.floor(goldAmount / 100); // 100 Gold = 1 Soul

      if (state.player.currencies.gold >= goldAmount && soulsToGain > 0) {
        return {
          ...state,
          player: {
            ...state.player,
            currencies: {
              ...state.player.currencies,
              gold: state.player.currencies.gold - goldAmount,
              souls: state.player.currencies.souls + soulsToGain,
            },
            stats: {
              ...state.player.stats,
              soulsEarned: state.player.stats.soulsEarned + soulsToGain,
            },
          },
        };
      }
      return state;

    // ===== INVENTORY ACTIONS =====
    case 'INVENTORY_ADD':
      return {
        ...state,
        player: {
          ...state.player,
          inventory: {
            ...state.player.inventory,
            [action.payload.item]: (state.player.inventory[action.payload.item] || 0) + action.payload.amount,
          },
        },
      };

    case 'INVENTORY_USE':
      const itemCount = state.player.inventory[action.payload.item] || 0;
      if (itemCount > 0) {
        return {
          ...state,
          player: {
            ...state.player,
            inventory: {
              ...state.player.inventory,
              [action.payload.item]: itemCount - 1,
            },
          },
        };
      }
      return state;

    // ===== CURRENCY ACTIONS =====
    case 'CURRENCY_ADD':
      return {
        ...state,
        player: {
          ...state.player,
          currencies: {
            ...state.player.currencies,
            [action.payload.currency]: state.player.currencies[action.payload.currency] + action.payload.amount,
          },
        },
      };

    case 'CURRENCY_SPEND':
      const currentAmount = state.player.currencies[action.payload.currency];
      if (currentAmount >= action.payload.amount) {
        return {
          ...state,
          player: {
            ...state.player,
            currencies: {
              ...state.player.currencies,
              [action.payload.currency]: currentAmount - action.payload.amount,
            },
          },
        };
      }
      return state;

    // ===== COLLECTION ACTIONS =====
    case 'SPELL_ADD':
      return {
        ...state,
        player: {
          ...state.player,
          collection: [...state.player.collection, action.payload.spell],
        },
      };

    case 'SPELL_REMOVE':
      return {
        ...state,
        player: {
          ...state.player,
          collection: state.player.collection.filter(s => s.id !== action.payload.spellId),
        },
      };

    // ===== PLAYER ACTIONS =====
    case 'PLAYER_GAIN_XP':
      let newXp = state.player.xp + action.payload.amount;
      let newLevel = state.player.level;
      let newXpToNext = state.player.xpToNextLevel;

      // Level up logic
      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.floor(newXpToNext * 1.15); // 15% increase per level
      }

      return {
        ...state,
        player: {
          ...state.player,
          level: newLevel,
          xp: newXp,
          xpToNextLevel: newXpToNext,
        },
      };

    // ===== UI ACTIONS =====
    case 'UI_SET_SCREEN':
      return {
        ...state,
        ui: {
          ...state.ui,
          currentScreen: action.payload.screen,
        },
      };

    case 'UI_OPEN_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modalOpen: action.payload.modal,
        },
      };

    case 'UI_CLOSE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modalOpen: null,
        },
      };

    case 'UI_ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.payload.notification],
        },
      };

    case 'UI_CLEAR_NOTIFICATIONS':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [],
        },
      };

    // ===== MISSION ACTIONS =====
    case 'MISSIONS_INIT':
      return {
        ...state,
        player: {
          ...state.player,
          missions: {
            daily: action.payload.daily,
            weekly: action.payload.weekly,
            dailyResetTime: action.payload.dailyResetTime,
            weeklyResetTime: action.payload.weeklyResetTime
          }
        }
      };

    // ===== BATTLE ACTIONS =====
    case 'BATTLE_START':
      return {
        ...state,
        battle: {
          ...state.battle,
          active: true,
          opponent: action.payload.opponent,
          playerHp: 100,
          opponentHp: 100,
          interval: 0,
          history: [],
        },
      };

    case 'BATTLE_END':
      const isWin = action.payload.winner === 'player';
      return {
        ...state,
        battle: {
          ...initialState.battle,
        },
        player: {
          ...state.player,
          stats: {
            ...state.player.stats,
            battlesPlayed: state.player.stats.battlesPlayed + 1,
            battlesWon: isWin ? state.player.stats.battlesWon + 1 : state.player.stats.battlesWon,
            battlesLost: !isWin ? state.player.stats.battlesLost + 1 : state.player.stats.battlesLost,
          },
        },
      };

    // ===== PERSISTENCE =====
    case 'STATE_LOAD':
      return {
        ...action.payload.state,
        ui: initialState.ui, // Don't restore UI state
      };

    case 'STATE_RESET':
      return initialState;

    default:
      return state;
  }
}

export default GlobalStateProvider;
