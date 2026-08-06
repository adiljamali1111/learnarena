/* ──────────────────────────────────────────
   LearnArena — Dashboard Context
   ────────────────────────────────────────── */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  DashboardState,
  DashboardAction,
  TabKey,
  APIProvider,
  XpState,
  RecallCard,
  Notification,
} from '../types';

// ── XP / Level System ─────────────────────
const XP_PER_LEVEL: Record<number, number> = {
  1: 0, 2: 100, 3: 250, 4: 500, 5: 800,
  6: 1200, 7: 1700, 8: 2300, 9: 3000, 10: 3800,
  11: 4700, 12: 5700, 13: 6800, 14: 8000, 15: 9300,
  16: 10700, 17: 12200, 18: 13800, 19: 15500, 20: 17300,
};

export function getCumulativeLevel(totalXp: number): XpState {
  let level = 1;
  for (let lv = 20; lv >= 1; lv--) {
    if (totalXp >= XP_PER_LEVEL[lv]) { level = lv; break; }
  }
  const nextLevel = level >= 20 ? 20 : level + 1;
  return {
    level,
    current: totalXp - XP_PER_LEVEL[level],
    totalForNextLevel: XP_PER_LEVEL[nextLevel] - XP_PER_LEVEL[level],
  };
}

// ── Initial State ─────────────────────────
function getInitialState(): DashboardState {
  return {
    activeTab: TabKey.Dashboard,
    dashboard: null,
    apiKey: null,
    apiProvider: 'openrouter',
    isGenerating: false,
    activeNote: null,
    modules: [],
    recallCardsState: [],
    seenQuestions: new Set(),
    xp: { level: 1, current: 0, totalForNextLevel: 100 },
    notifications: [],
    cumulativeXp: 0,
  };
}

// ── Reducer ───────────────────────────────
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_DASHBOARD':
      return { ...state, dashboard: action.payload };

    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };

    case 'SET_API_PROVIDER':
      return { ...state, apiProvider: action.payload };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'SET_ACTIVE_NOTE':
      return { ...state, activeNote: action.payload };

    case 'ADD_MODULE':
      return { ...state, modules: [...state.modules, action.payload] };

    case 'UPDATE_MODULE_PROGRESS':
      return {
        ...state,
        modules: state.modules.map((m) =>
          m.id === action.payload.id ? { ...m, progress: action.payload.progress } : m,
        ),
      };

    case 'SET_RECALL_CARDS':
      return { ...state, recallCardsState: action.payload };

    case 'UPDATE_RECALL_CARD':
      return {
        ...state,
        recallCardsState: state.recallCardsState.map((rc) =>
          rc.id === action.payload.id ? { ...rc, known: action.payload.known } : rc,
        ),
      };

    case 'ADD_SEEN_QUESTION': {
      const next = new Set(state.seenQuestions);
      next.add(action.payload);
      return { ...state, seenQuestions: next };
    }

    case 'ADD_XP': {
      const total = state.cumulativeXp + action.payload;
      return {
        ...state,
        cumulativeXp: total,
        xp: getCumulativeLevel(total),
      };
    }

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            message: action.payload.message,
            type: action.payload.type,
            read: false,
            timestamp: Date.now(),
          },
          ...state.notifications,
        ].slice(0, 50),
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n,
        ),
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'RESET':
      return {
        ...getInitialState(),
        apiKey: state.apiKey,
        apiProvider: state.apiProvider,
      };

    default:
      return state;
  }
}

// ── Context Value ─────────────────────────
interface DashboardContextValue {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  navigate: (tab: TabKey) => void;
  setApiKey: (key: string) => void;
  setApiProvider: (provider: APIProvider) => void;
  startStudy: (noteContent: string) => void;
  addXp: (amount: number) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

// ── Notification Context ──────────────────
interface NotificationContextValue {
  notify: (message: string, type?: Notification['type']) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notify: () => {},
});

// ── Provider ──────────────────────────────
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, undefined, getInitialState);

  // Load API key from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('learnarena_openrouter_key');
    if (stored) {
      dispatch({ type: 'SET_API_KEY', payload: stored });
    }
  }, []);

  // Persist cumulative XP
  useEffect(() => {
    if (state.cumulativeXp > 0) {
      localStorage.setItem('learnarena_xp', String(state.cumulativeXp));
    }
  }, [state.cumulativeXp]);

  const navigate = useCallback((tab: TabKey) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const setApiKey = useCallback((key: string) => {
    dispatch({ type: 'SET_API_KEY', payload: key });
    localStorage.setItem('learnarena_openrouter_key', key);
  }, []);

  const setApiProvider = useCallback((provider: APIProvider) => {
    dispatch({ type: 'SET_API_PROVIDER', payload: provider });
  }, []);

  const startStudy = useCallback((noteContent: string) => {
    dispatch({ type: 'SET_ACTIVE_NOTE', payload: noteContent });
  }, []);

  const addXp = useCallback((amount: number) => {
    dispatch({ type: 'ADD_XP', payload: amount });
  }, []);

  const notify = useCallback((message: string, type: Notification['type'] = 'info') => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type } });
  }, []);

  return (
    <DashboardContext.Provider value={{ state, dispatch, navigate, setApiKey, setApiProvider, startStudy, addXp }}>
      <NotificationContext.Provider value={{ notify }}>
        {children}
      </NotificationContext.Provider>
    </DashboardContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────
export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within a DashboardProvider');
  return ctx;
}

export function useNotification(): NotificationContextValue {
  return useContext(NotificationContext);
}

export type { TabKey };
