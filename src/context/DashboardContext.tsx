import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type {
  AppState,
  ModuleData,
  TabKey,
  ModalType,
  DuelState,
  DuelQuestion,
  Notification,
  DenToolKey,
  DashboardData,
  DocumentImage,
} from '../types/dashboard';
import { getComboMultiplier, getComboLevel } from '../types/dashboard';
import { generateDashboard, generateFreshQuestions, generateDenContent } from '../services/openrouter';
import { parseMultipleFiles } from '../services/fileParser';
import {
  isQuestionSeen,
  markQuestionSeen,
  getUnseenQuestionIds,
  clearSeenForModule,
} from '../services/questionBank';
import { getDocumentImages, clearDocumentImages } from '../services/documentContext';

/* ===========================
   Constants
   =========================== */
const STORAGE_KEY = 'learnarena_state';
const API_KEY_KEY = 'learnarena_openrouter_key';
const HIGH_SCORE_KEY = 'learnarena_high_score';

const INITIAL_DUEL: DuelState = {
  phase: 'idle',
  questions: [],
  currentIndex: 0,
  playerScore: 0,
  rivalScore: 0,
  playerLives: 3,
  combo: 0,
  comboLevel: 0,
  timeLeft: 15,
  hasShield: false,
  isAnswered: false,
  selectedAnswer: null,
  highScore: 0,
  hintOpen: false,
};

const DUEL_TIME_LIMIT = 15;
const DUEL_RIVAL_ACCURACY = 0.65;

/* ===========================
   Context
   =========================== */
interface DashboardContextValue {
  state: AppState;
  setActiveTab: (tab: TabKey) => void;
  setModal: (modal: ModalType) => void;
  setApiKey: (key: string) => void;
  generateFromNotes: (notes: string, files?: File[]) => Promise<void>;
  resetDashboard: () => void;
  saveCurrentModule: () => void;
  loadModule: (moduleId: string) => void;
  deleteModule: (moduleId: string) => void;
  addXp: (amount: number) => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
  // Duel actions
  startDuel: () => Promise<void>;
  answerDuelQuestion: (index: number) => void;
  nextDuelQuestion: () => void;
  tickDuelTimer: () => void;
  closeDuelHint: () => void;
  resetDuel: () => void;
  // Den actions
  openDenTool: (tool: DenToolKey) => void;
  closeDenTool: () => void;
  setActiveModule: (id: string | null) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

/* ===========================
   Helpers
   =========================== */
function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // Ensure duel is fresh on reload
      parsed.duel = { ...INITIAL_DUEL, highScore: loadHighScore() };
      return parsed;
    }
  } catch {
    // ignore
  }
  return createInitialState();
}

function loadHighScore(): number {
  try {
    return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function createInitialState(): AppState {
  const apiKey = localStorage.getItem(API_KEY_KEY) || '';
  return {
    hasEntered: !!apiKey,
    apiKey,
    activeModuleId: null,
    modules: [],
    activeTab: 'dashboard',
    modal: 'none',
    isLoading: false,
    error: null,
    notifications: [],
    duel: { ...INITIAL_DUEL, highScore: loadHighScore() },
    activeDenTool: null,
    documentImages: [],
  };
}

function persistState(state: AppState): void {
  try {
    // Don't persist duel (rehydrate fresh) or apiKey (stored separately)
    const toStore = {
      ...state,
      apiKey: '', // don't store key in main state
      duel: INITIAL_DUEL,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // localStorage might be full
  }
}

/* ===========================
   Provider
   =========================== */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const initial = loadState();
    // Restore apiKey from separate storage
    const key = localStorage.getItem(API_KEY_KEY) || '';
    initial.apiKey = key;
    initial.hasEntered = !!key;
    return initial;
  });

  const duelTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const saveState = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      persistState(next);
      return next;
    });
  }, []);

  /* ===========================
     Tab / Modal
     =========================== */
  const setActiveTab = useCallback((tab: TabKey) => {
    saveState((s) => ({ ...s, activeTab: tab }));
  }, [saveState]);

  const setModal = useCallback((modal: ModalType) => {
    saveState((s) => ({ ...s, modal }));
  }, [saveState]);

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem(API_KEY_KEY, key);
    saveState((s) => ({
      ...s,
      apiKey: key,
      hasEntered: true,
      modal: key ? 'notesInput' : 'apiKey',
    }));
  }, [saveState]);

  /* ===========================
     Notifications
     =========================== */
  const addNotification = useCallback(
    (n: Omit<Notification, 'id' | 'timestamp'>) => {
      const notification: Notification = {
        ...n,
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
      };
      saveState((s) => ({
        ...s,
        notifications: [notification, ...s.notifications].slice(0, 50),
      }));
    },
    [saveState],
  );

  const clearNotifications = useCallback(() => {
    saveState((s) => ({ ...s, notifications: [] }));
  }, [saveState]);

  const markNotificationRead = useCallback(
    (id: string) => {
      saveState((s) => ({
        ...s,
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
      }));
    },
    [saveState],
  );

  /* ===========================
     Dashboard Generation
     =========================== */
  const generateFromNotes = useCallback(
    async (notes: string, files?: File[]) => {
      saveState((s) => ({ ...s, isLoading: true, error: null }));

      try {
        let finalNotes = notes;
        let images: DocumentImage[] = [];

        if (files && files.length > 0) {
          const result = await parseMultipleFiles(files);
          finalNotes = result.text || notes;
          images = result.images;
          if (result.errors.length > 0) {
            addNotification({
              type: 'error',
              message: result.errors.join('\n'),
              read: false,
            });
          }
        }

        const apiKey = localStorage.getItem(API_KEY_KEY);
        if (!apiKey) {
          throw new Error('API key not found');
        }

        const imageDataUrls = images.map((img) => img.dataUrl);
        const dashboard = await generateDashboard(
          apiKey,
          finalNotes,
          imageDataUrls.length > 0 ? imageDataUrls : undefined,
        );

        // Create module
        const moduleId = `mod-${Date.now()}`;
        const moduleData: ModuleData = {
          id: moduleId,
          title: dashboard.moduleTitle || 'Untitled Module',
          notes: finalNotes,
          images,
          dashboard,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          xp: dashboard.masteryProgress.totalXp || 0,
        };

        saveState((s) => ({
          ...s,
          isLoading: false,
          activeModuleId: moduleId,
          modules: [...s.modules, moduleData],
          activeTab: 'dashboard',
          modal: 'none',
          documentImages: images,
          error: null,
        }));

        addNotification({
          type: 'xp',
          message: `Module created! +${dashboard.masteryProgress.totalXp || 0} XP`,
          read: false,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to generate dashboard';
        saveState((s) => ({
          ...s,
          isLoading: false,
          error: message,
        }));
        addNotification({ type: 'error', message, read: false });
      }
    },
    [saveState, addNotification],
  );

  const resetDashboard = useCallback(() => {
    saveState((s) => ({
      ...s,
      activeModuleId: null,
      error: null,
      documentImages: [],
    }));
    clearDocumentImages();
  }, [saveState]);

  /* ===========================
     Module Management
     =========================== */
  const saveCurrentModule = useCallback(() => {
    saveState((s) => {
      if (!s.activeModuleId) return s;
      return {
        ...s,
        modules: s.modules.map((m) =>
          m.id === s.activeModuleId ? { ...m, updatedAt: Date.now() } : m,
        ),
      };
    });
  }, [saveState]);

  const loadModule = useCallback(
    (moduleId: string) => {
      saveState((s) => {
        const mod = s.modules.find((m) => m.id === moduleId);
        if (!mod) return s;
        return {
          ...s,
          activeModuleId: moduleId,
          activeTab: 'dashboard',
          documentImages: mod.images || [],
        };
      });
    },
    [saveState],
  );

  const deleteModule = useCallback(
    (moduleId: string) => {
      saveState((s) => {
        const modules = s.modules.filter((m) => m.id !== moduleId);
        const newActiveId =
          s.activeModuleId === moduleId
            ? modules.length > 0
              ? modules[modules.length - 1].id
              : null
            : s.activeModuleId;
        clearSeenForModule(moduleId);
        return {
          ...s,
          modules,
          activeModuleId: newActiveId,
        };
      });
    },
    [saveState],
  );

  const setActiveModule = useCallback(
    (id: string | null) => {
      saveState((s) => ({ ...s, activeModuleId: id }));
    },
    [saveState],
  );

  /* ===========================
     XP
     =========================== */
  const addXp = useCallback(
    (amount: number) => {
      saveState((s) => ({
        ...s,
        modules: s.modules.map((m) =>
          m.id === s.activeModuleId ? { ...m, xp: m.xp + amount } : m,
        ),
      }));
    },
    [saveState],
  );

  /* ===========================
     Duel
     =========================== */
  const startDuel = useCallback(async () => {
    saveState((s) => ({
      ...s,
      duel: { ...s.duel, phase: 'preparing', highScore: loadHighScore() },
    }));

    try {
      const apiKey = localStorage.getItem(API_KEY_KEY);
      const activeModule = state.modules.find(
        (m) => m.id === state.activeModuleId,
      );
      if (!apiKey || !activeModule) throw new Error('No module or API key');

      const questions = await generateFreshQuestions(apiKey, activeModule.notes);

      saveState((s) => ({
        ...s,
        duel: {
          ...s.duel,
          phase: 'playing',
          questions,
          currentIndex: 0,
          playerScore: 0,
          rivalScore: 0,
          playerLives: 3,
          combo: 0,
          comboLevel: 0,
          timeLeft: DUEL_TIME_LIMIT,
          hasShield: false,
          isAnswered: false,
          selectedAnswer: null,
          hintOpen: false,
        },
      }));

      // Start timer
      if (duelTimerRef.current) clearInterval(duelTimerRef.current);
      duelTimerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.duel.phase !== 'playing' || prev.duel.isAnswered) {
            return prev;
          }
          const newTime = prev.duel.timeLeft - 1;
          if (newTime <= 0) {
            // Time's up — lose a life
            const lives = prev.duel.playerLives - 1;
            const isOver = lives <= 0;
            return {
              ...prev,
              duel: {
                ...prev.duel,
                timeLeft: 0,
                isAnswered: true,
                playerLives: lives,
                phase: isOver ? 'done' : 'playing',
                combo: 0,
                comboLevel: 0,
                hasShield: false,
              },
            };
          }
          return { ...prev, duel: { ...prev.duel, timeLeft: newTime } };
        });
      }, 1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to start duel';
      saveState((s) => ({
        ...s,
        duel: { ...s.duel, phase: 'idle' },
        error: message,
      }));
    }
  }, [saveState, state.modules, state.activeModuleId]);

  const answerDuelQuestion = useCallback(
    (index: number) => {
      setState((prev) => {
        if (prev.duel.isAnswered || prev.duel.phase !== 'playing') return prev;

        const current = prev.duel.questions[prev.duel.currentIndex];
        if (!current) return prev;

        const isCorrect = index === current.correctIndex;
        const newCombo = isCorrect ? prev.duel.combo + 1 : 0;
        const multiplier = getComboMultiplier(newCombo);
        const basePoints = isCorrect ? 100 : 0;
        const points = basePoints * multiplier;
        const comboLevelIdx = isCorrect
          ? ['none', 'bronze', 'silver', 'gold', 'platinum'].indexOf(
              getComboLevel(newCombo),
            )
          : 0;
        const hasShield = getComboLevel(newCombo) === 'platinum';

        // RIVAL-9 answers
        const rivalCorrect = Math.random() < DUEL_RIVAL_ACCURACY;
        const rivalPoints = rivalCorrect
          ? 80 + Math.floor(Math.random() * 40)
          : 0;

        const newLives = !isCorrect ? prev.duel.playerLives - 1 : prev.duel.playerLives;
        const isOver = newLives <= 0;
        const newPlayerScore = prev.duel.playerScore + points;
        const newRivalScore = prev.duel.rivalScore + rivalPoints;

        return {
          ...prev,
          duel: {
            ...prev.duel,
            isAnswered: true,
            selectedAnswer: index,
            playerScore: newPlayerScore,
            rivalScore: newRivalScore,
            playerLives: newLives,
            combo: newCombo,
            comboLevel: comboLevelIdx,
            hasShield,
            timeLeft: isCorrect ? prev.duel.timeLeft : 0,
            phase: isOver
              ? 'done'
              : prev.duel.currentIndex >= prev.duel.questions.length - 1
                ? 'done'
                : 'playing',
          },
        };
      });
    },
    [],
  );

  const nextDuelQuestion = useCallback(() => {
    setState((prev) => {
      const nextIdx = prev.duel.currentIndex + 1;
      if (nextIdx >= prev.duel.questions.length) {
        // Determine winner
        const playerWon = prev.duel.playerScore > prev.duel.rivalScore;
        const isDraw = prev.duel.playerScore === prev.duel.rivalScore;
        const newHighScore = Math.max(
          prev.duel.highScore,
          prev.duel.playerScore,
        );
        localStorage.setItem(HIGH_SCORE_KEY, String(newHighScore));

        return {
          ...prev,
          duel: {
            ...prev.duel,
            phase: 'done',
            highScore: newHighScore,
          },
        };
      }

      return {
        ...prev,
        duel: {
          ...prev.duel,
          currentIndex: nextIdx,
          timeLeft: DUEL_TIME_LIMIT,
          isAnswered: false,
          selectedAnswer: null,
          hintOpen: false,
        },
      };
    });
  }, []);

  const tickDuelTimer = useCallback(() => {
    // handled in interval
  }, []);

  const closeDuelHint = useCallback(() => {
    saveState((s) => ({ ...s, duel: { ...s.duel, hintOpen: false } }));
  }, [saveState]);

  const resetDuel = useCallback(() => {
    if (duelTimerRef.current) clearInterval(duelTimerRef.current);
    saveState((s) => ({
      ...s,
      duel: { ...INITIAL_DUEL, highScore: loadHighScore() },
    }));
  }, [saveState]);

  /* ===========================
     Learner's Den
     =========================== */
  const openDenTool = useCallback(
    (tool: DenToolKey) => {
      saveState((s) => ({ ...s, activeDenTool: tool, activeTab: 'den' }));
    },
    [saveState],
  );

  const closeDenTool = useCallback(() => {
    saveState((s) => ({ ...s, activeDenTool: null }));
  }, [saveState]);

  /* ===========================
     Value
     =========================== */
  const value: DashboardContextValue = {
    state,
    setActiveTab,
    setModal,
    setApiKey,
    generateFromNotes,
    resetDashboard,
    saveCurrentModule,
    loadModule,
    deleteModule,
    addXp,
    addNotification,
    clearNotifications,
    markNotificationRead,
    startDuel,
    answerDuelQuestion,
    nextDuelQuestion,
    tickDuelTimer,
    closeDuelHint,
    resetDuel,
    openDenTool,
    closeDenTool,
    setActiveModule,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}