import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  AppState,
  AppAction,
  TabKey,
  DuelPhase,
  DuelState,
  XPState,
  Notification,
  APIProvider,
} from '../types';
import { STORAGE_KEYS, DUEL_CONFIG, CUMULATIVE_LEVEL_1_XP, getCumulativeLevel } from '../constants';

const initialDuel: DuelState = {
  phase: DuelPhase.Idle,
  difficulty: 'medium',
  lives: DUEL_CONFIG.startingLives,
  score: 0,
  combo: 0,
  maxCombo: 0,
  currentQuestionIndex: 0,
  questions: [],
  correctAnswers: 0,
  wrongAnswers: 0,
  timeLeft: DUEL_CONFIG.timePerQuestion,
  rivalScore: 0,
  playerAnswered: false,
  aiAnswered: false,
  lastAnswerCorrect: null,
  rivalChoice: null,
};

const initialXP: XPState = {
  current: 0,
  level: 1,
  totalForNextLevel: CUMULATIVE_LEVEL_1_XP,
};

const initialState: AppState = {
  apiKey: '',
  apiProvider: 'openrouter' as APIProvider,
  activeTab: TabKey.Dashboard,
  dashboard: null,
  activeNote: '',
  isGenerating: false,
  modules: [],
  seenQuestions: [],
  duel: initialDuel,
  xp: initialXP,
  cumulativeXp: 0,
  recallCards: [],
  notifications: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };

    case 'SET_API_PROVIDER':
      return { ...state, apiProvider: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_DASHBOARD':
      return { ...state, dashboard: action.payload };

    case 'SET_ACTIVE_NOTE':
      return { ...state, activeNote: action.payload };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'ADD_MODULE':
      return { ...state, modules: [...state.modules, action.payload] };

    case 'REMOVE_MODULE':
      return {
        ...state,
        modules: state.modules.filter((m) => m.id !== action.payload),
      };

    case 'UPDATE_MODULE_PROGRESS':
      return {
        ...state,
        modules: state.modules.map((m) =>
          m.id === action.payload.id
            ? { ...m, progress: action.payload.progress }
            : m
        ),
      };

    case 'SET_DUEL':
      return { ...state, duel: { ...state.duel, ...action.payload } };

    case 'RESET_DUEL':
      return { ...state, duel: initialDuel };

    case 'ADD_SEEN_QUESTION':
      if (state.seenQuestions.includes(action.payload)) return state;
      return {
        ...state,
        seenQuestions: [...state.seenQuestions, action.payload],
      };

    case 'SET_XP':
      return { ...state, xp: action.payload };

    case 'ADD_XP': {
      const total = state.xp.current + action.payload;
      const levelCap = state.xp.totalForNextLevel;
      if (total >= levelCap) {
        const remainder = total - levelCap;
        const newLevel = state.xp.level + 1;
        const newTotalForNext = state.xp.totalForNextLevel * 2;
        return {
          ...state,
          xp: {
            current: remainder,
            level: newLevel,
            totalForNextLevel: newTotalForNext,
          },
        };
      }
      return { ...state, xp: { ...state.xp, current: total } };
    }

    case 'ADD_TOPIC_XP': {
      const { moduleId, amount } = action.payload;
      const updatedModules = state.modules.map((m) =>
        m.id === moduleId
          ? { ...m, xp: Math.min(m.xp + amount, 400) }
          : m
      );
      const newCumulativeXp = updatedModules.reduce((sum, m) => sum + m.xp, 0);
      const xpLevel = getCumulativeLevel(newCumulativeXp);
      return {
        ...state,
        modules: updatedModules,
        cumulativeXp: newCumulativeXp,
        xp: xpLevel,
      };
    }

    case 'SET_CUMULATIVE_XP': {
      const xpLevel = getCumulativeLevel(action.payload);
      return {
        ...state,
        cumulativeXp: action.payload,
        xp: xpLevel,
      };
    }

    case 'SET_RECALL_CARDS':
      return { ...state, recallCards: action.payload };

    case 'UPDATE_RECALL_CARD':
      return {
        ...state,
        recallCards: state.recallCards.map((c) =>
          c.id === action.payload.id
            ? { ...c, known: action.payload.known }
            : c
        ),
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50),
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

interface DashboardContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

function loadFromStorage(): Partial<AppState> {
  try {
    const partial: Partial<AppState> = {};

    // Load provider preference (default to openrouter)
    const provider = localStorage.getItem(STORAGE_KEYS.apiProvider) as APIProvider | null;
    const apiProvider = (provider === 'google' ? 'google' : 'openrouter') as APIProvider;
    partial.apiProvider = apiProvider;

    // Load the appropriate key based on provider
    if (apiProvider === 'google') {
      const googleKey = localStorage.getItem(STORAGE_KEYS.googleKey);
      if (googleKey) partial.apiKey = googleKey;
    } else {
      const apiKey = localStorage.getItem(STORAGE_KEYS.apiKey);
      if (apiKey) partial.apiKey = apiKey;
    }

    const dashboard = localStorage.getItem(STORAGE_KEYS.dashboard);
    if (dashboard) partial.dashboard = JSON.parse(dashboard);

    const modules = localStorage.getItem(STORAGE_KEYS.modules);
    if (modules) {
      const parsed = JSON.parse(modules);
      // Ensure xp field exists on older modules
      partial.modules = parsed.map((m: any) => ({ ...m, xp: m.xp || 0 }));
    }

    const seenQuestions = localStorage.getItem(STORAGE_KEYS.seenQuestions);
    if (seenQuestions) partial.seenQuestions = JSON.parse(seenQuestions);

    const xpVal = localStorage.getItem(STORAGE_KEYS.xp);
    if (xpVal) partial.xp = JSON.parse(xpVal);

    const cumulativeXp = localStorage.getItem(STORAGE_KEYS.cumulativeXp);
    if (cumulativeXp) partial.cumulativeXp = JSON.parse(cumulativeXp);

    const recallCards = localStorage.getItem(STORAGE_KEYS.recallCards);
    if (recallCards) partial.recallCards = JSON.parse(recallCards);

    const activeTab = localStorage.getItem(STORAGE_KEYS.activeTab) as TabKey;
    if (activeTab && Object.values(TabKey).includes(activeTab)) {
      partial.activeTab = activeTab;
    }

    const notifications = localStorage.getItem(STORAGE_KEYS.notifications);
    if (notifications) partial.notifications = JSON.parse(notifications);

    return partial;
  } catch {
    return {};
  }
}

function persistSlice(key: string, value: any) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, () => {
    const saved = loadFromStorage();
    return { ...initialState, ...saved };
  });

  // Persist individual slices
  useEffect(() => {
    // Save key to the provider-specific storage
    if (state.apiProvider === 'google') {
      if (state.apiKey) {
        localStorage.setItem(STORAGE_KEYS.googleKey, state.apiKey);
      } else {
        localStorage.removeItem(STORAGE_KEYS.googleKey);
      }
      localStorage.removeItem(STORAGE_KEYS.apiKey); // clean up old key
    } else {
      if (state.apiKey) {
        localStorage.setItem(STORAGE_KEYS.apiKey, state.apiKey);
      } else {
        localStorage.removeItem(STORAGE_KEYS.apiKey);
      }
      localStorage.removeItem(STORAGE_KEYS.googleKey); // clean up old key
    }
  }, [state.apiKey, state.apiProvider]);
  useEffect(() => { persistSlice(STORAGE_KEYS.apiProvider, state.apiProvider); }, [state.apiProvider]);
  useEffect(() => { persistSlice(STORAGE_KEYS.dashboard, state.dashboard); }, [state.dashboard]);
  useEffect(() => { persistSlice(STORAGE_KEYS.modules, state.modules); }, [state.modules]);
  useEffect(() => { persistSlice(STORAGE_KEYS.seenQuestions, state.seenQuestions); }, [state.seenQuestions]);
  useEffect(() => { persistSlice(STORAGE_KEYS.xp, state.xp); }, [state.xp]);
  useEffect(() => { persistSlice(STORAGE_KEYS.cumulativeXp, state.cumulativeXp); }, [state.cumulativeXp]);
  useEffect(() => { persistSlice(STORAGE_KEYS.recallCards, state.recallCards); }, [state.recallCards]);
  useEffect(() => { persistSlice(STORAGE_KEYS.activeTab, state.activeTab); }, [state.activeTab]);
  useEffect(() => { persistSlice(STORAGE_KEYS.notifications, state.notifications); }, [state.notifications]);

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return ctx;
}

export function useNotification() {
  const { dispatch } = useDashboard();

  const notify = useCallback(
    (message: string, type: Notification['type'] = 'info') => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message,
        type,
        timestamp: Date.now(),
        read: false,
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    },
    [dispatch]
  );

  return { notify };
}