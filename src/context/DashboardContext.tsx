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
  Notification,
  DenToolKey,
  DocumentImage,
  AIProvider,
} from '../types/dashboard';
import { getComboMultiplier, getComboLevel } from '../types/dashboard';
import {
  generateDashboard,
  generateDiagnosticQuestions,
  generateFreshQuestions,
  generateScenario,
  AIServiceError,
  PROVIDER_CONFIG,
} from '../services/aiService';
import { parseMultipleFiles } from '../services/fileParser';
import {
  clearSeenForModule,
} from '../services/questionBank';
import { clearDocumentImages } from '../services/documentContext';
import {
  DEMO_DASHBOARD_DATA,
  DEMO_MASTERY_PROGRESS,
  DEMO_DEN_TOOL_DATA,
} from '../constants/demoData';

/* ===========================
   Constants
   =========================== */
const STORAGE_KEY = 'learnarena_state';
const API_KEY_KEY = 'learnarena_api_key';
const PROVIDER_KEY = 'learnarena_provider';
const HIGH_SCORE_KEY = 'learnarena_high_score';
const DEMO_MODE_KEY = 'learnarena_demo_mode';
const DEMO_API_KEY = 'demo_mode_key';
const DEMO_MODULE_ID = 'mod-demo';

const DEMO_NOTES = `DNA Extraction & Polymerase Chain Reaction (PCR)

DNA extraction is the first step in almost every molecular biology workflow. The goal is to isolate pure, high-molecular-weight DNA from cells and tissues. The classic organic method uses a lysis buffer containing SDS detergent and proteinase K to break open cells and digest histone proteins, followed by phenol:chloroform:isoamyl alcohol (25:24:1) extraction to partition proteins into the organic phase while DNA stays in the aqueous phase. DNA is then precipitated with ice-cold ethanol or isopropanol in the presence of salt (Na+ or NH4+), pelleted by centrifugation, washed with 70% ethanol, and resuspended in TE buffer or nuclease-free water.

Silica column-based kits are a faster, safer alternative: DNA binds to a silica membrane in high-salt conditions and elutes in low-salt buffer or water. Quality is assessed by spectrophotometry (A260/A280 ratio 1.8-2.0) or fluorometry (e.g. Qubit).

PCR amplifies a specific DNA target exponentially. A typical reaction contains template DNA, forward and reverse primers (18-24 nt, 40-60% GC, Tm 55-65C), dNTPs (200 uM each), MgCl2 (1.5-4 mM), Taq DNA polymerase, and reaction buffer. The thermocycler repeats 25-35 cycles of: denaturation at 94C (strands separate), annealing at 50-65C (primers bind), and extension at 72C (Taq synthesizes new strands at ~1000 nt/min). Each cycle doubles the target, giving ~10^9-fold amplification after 30 cycles.

Real-time PCR (qPCR) adds fluorescent reporters (SYBR Green or TaqMan probes) to measure amplification in real time; the Cq value is inversely proportional to starting template quantity. PCR products are typically verified by agarose gel electrophoresis, where smaller fragments migrate faster through the gel matrix.

Applications include forensic STR typing (multiplex PCR at 16+ loci), pathogen diagnostics, cloning, gene expression analysis, and sequencing library preparation. Common troubleshooting issues include primer-dimers, non-specific smears (lower annealing temperature), and no product (degraded template, inhibitors, or incorrect Tm).`;

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
  setProvider: (provider: AIProvider) => void;
  setApiKeyError: (error: string | null) => void;
  loadDemoData: () => void;
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
  // Diagnostic refresh
  refreshDiagnosticQuestions: () => Promise<void>;
  // Scenario refresh
  refreshScenario: () => Promise<void>;
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

function loadProvider(): AIProvider {
  try {
    const p = localStorage.getItem(PROVIDER_KEY);
    if (p === 'openrouter' || p === 'aimlapi') return p;
  } catch {
    // ignore
  }
  return 'openrouter';
}

function getCredentials(): { apiKey: string; provider: AIProvider } {
  return {
    apiKey: localStorage.getItem(API_KEY_KEY) || '',
    provider: loadProvider(),
  };
}

function createInitialState(): AppState {
  const apiKey = localStorage.getItem(API_KEY_KEY) || '';
  return {
    hasEntered: !!apiKey,
    isDemoMode: apiKey === DEMO_API_KEY,
    apiKey,
    provider: loadProvider(),
    apiKeyError: null,
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
    // Restore apiKey and provider from separate storage
    const key = localStorage.getItem(API_KEY_KEY) || '';
    initial.apiKey = key;
    initial.hasEntered = !!key;
    initial.isDemoMode = key === DEMO_API_KEY;
    initial.provider = loadProvider();
    initial.apiKeyError = null;
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
    localStorage.removeItem(DEMO_MODE_KEY);
    saveState((s) => ({
      ...s,
      apiKey: key,
      isDemoMode: false,
      hasEntered: true,
      modal: key ? 'notesInput' : 'apiKey',
      apiKeyError: null,
    }));
  }, [saveState]);

  const setProvider = useCallback(
    (provider: AIProvider) => {
      localStorage.setItem(PROVIDER_KEY, provider);
      saveState((s) => ({ ...s, provider, apiKeyError: null }));
    },
    [saveState],
  );

  const setApiKeyError = useCallback(
    (error: string | null) => {
      saveState((s) => ({ ...s, apiKeyError: error }));
    },
    [saveState],
  );

  /* ===========================
     Notifications — defined early because loadDemoData depends on them
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

  /**
   * Load the built-in demo universe ("DNA Extraction & PCR") so users can
   * explore LearnArena without an API key. Seeds the module dashboard, the
   * den-tool caches, marks demo mode, and drops the user straight into the
   * Dashboard tab.
   */
  const loadDemoData = useCallback(() => {
    // Seed den-tool mock content so useDenTool serves it from cache
    // without any API call.
    try {
      Object.entries(DEMO_DEN_TOOL_DATA).forEach(([toolKey, content]) => {
        localStorage.setItem(
          `learnarena_den_cache_${toolKey}_${DEMO_MODULE_ID}`,
          JSON.stringify(content),
        );
      });
    } catch {
      // localStorage may be full — the dashboards still work
    }

    const now = Date.now();
    const demoModule: ModuleData = {
      id: DEMO_MODULE_ID,
      title: DEMO_DASHBOARD_DATA.moduleTitle,
      notes: DEMO_NOTES,
      images: [],
      dashboard: DEMO_DASHBOARD_DATA,
      createdAt: now,
      updatedAt: now,
      xp: DEMO_MASTERY_PROGRESS.totalXp,
    };

    // A placeholder key keeps hasEntered true and den-tool hooks happy.
    localStorage.setItem(API_KEY_KEY, DEMO_API_KEY);
    localStorage.setItem(DEMO_MODE_KEY, 'true');

    saveState((s) => ({
      ...s,
      hasEntered: true,
      isDemoMode: true,
      apiKey: DEMO_API_KEY,
      apiKeyError: null,
      activeModuleId: DEMO_MODULE_ID,
      modules: [demoModule],
      activeTab: 'dashboard',
      modal: 'none',
      isLoading: false,
      error: null,
      activeDenTool: null,
      documentImages: [],
    }));

    addNotification({
      type: 'achievement',
      message: 'Loaded Demo Universe: DNA Extraction & PCR',
      read: false,
    });
  }, [saveState, addNotification]);

  /**
   * Inspect an AI-service error. If the key was rejected (401) it opens the
   * API-key modal with provider-specific feedback; otherwise it just returns
   * a human-readable message.
   */
  const handleAiError = useCallback(
    (err: unknown): string => {
      if (err instanceof AIServiceError && err.code === 'invalid_key') {
        const label = PROVIDER_CONFIG[err.provider]?.label || 'AI';
        saveState((s) => ({
          ...s,
          modal: 'apiKey',
          apiKeyError: `Your ${label} API key was rejected (401). Check the key and try again.`,
        }));
        return `Your ${label} API key was rejected. Open settings to re-enter it.`;
      }
      if (err instanceof Error) return err.message;
      return 'Something went wrong';
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

        const { apiKey, provider } = getCredentials();
        if (!apiKey) {
          saveState((s) => ({
            ...s,
            isLoading: false,
            modal: 'apiKey',
            apiKeyError: 'No API key found — add your key to get started.',
          }));
          return;
        }

        const imageDataUrls = images.map((img) => img.dataUrl);
        const dashboard = await generateDashboard(
          apiKey,
          provider,
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
        const message = handleAiError(err);
        saveState((s) => ({
          ...s,
          isLoading: false,
          error: message,
        }));
        addNotification({ type: 'error', message, read: false });
      }
    },
    [saveState, addNotification, handleAiError],
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
      const { apiKey, provider } = getCredentials();
      const activeModule = state.modules.find(
        (m) => m.id === state.activeModuleId,
      );
      if (!apiKey) {
        saveState((s) => ({
          ...s,
          duel: { ...s.duel, phase: 'idle' },
          modal: 'apiKey',
          apiKeyError: 'No API key found — add your key to start a duel.',
        }));
        return;
      }
      if (!activeModule) throw new Error('No module selected');

      const questions = await generateFreshQuestions(
        apiKey,
        provider,
        activeModule.notes,
      );

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
      const message = handleAiError(err);
      saveState((s) => ({
        ...s,
        duel: { ...s.duel, phase: 'idle' },
        error: message,
      }));
    }
  }, [saveState, state.modules, state.activeModuleId, handleAiError]);

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
     Diagnostic Refresh
     =========================== */
  const refreshDiagnosticQuestions = useCallback(async () => {
    const { apiKey, provider } = getCredentials();
    const activeModule = state.modules.find(
      (m) => m.id === state.activeModuleId,
    );
    if (!apiKey || !activeModule || !activeModule.dashboard) return;

    try {
      const newQuestions = await generateDiagnosticQuestions(
        apiKey,
        provider,
        activeModule.notes,
      );

      saveState((s) => ({
        ...s,
        modules: s.modules.map((m) =>
          m.id === s.activeModuleId
            ? {
                ...m,
                dashboard: m.dashboard
                  ? { ...m.dashboard, diagnosticQuestions: newQuestions }
                  : m.dashboard,
              }
            : m,
        ),
      }));

      addNotification({
        type: 'info',
        message: 'Diagnostic questions refreshed with new AI-generated ones!',
        read: false,
      });
    } catch (err) {
      const message = handleAiError(err);
      addNotification({ type: 'error', message, read: false });
    }
  }, [saveState, addNotification, state.modules, state.activeModuleId, handleAiError]);

  /* ===========================
     Scenario Refresh
     =========================== */
  const refreshScenario = useCallback(async () => {
    const { apiKey, provider } = getCredentials();
    const activeModule = state.modules.find(
      (m) => m.id === state.activeModuleId,
    );
    if (!apiKey || !activeModule || !activeModule.dashboard) return;

    try {
      const newScenario = await generateScenario(
        apiKey,
        provider,
        activeModule.notes,
      );

      saveState((s) => ({
        ...s,
        modules: s.modules.map((m) =>
          m.id === s.activeModuleId
            ? {
                ...m,
                dashboard: m.dashboard
                  ? { ...m.dashboard, scenario: newScenario }
                  : m.dashboard,
              }
            : m,
        ),
      }));

      addNotification({
        type: 'info',
        message: 'New scenario generated! Apply what you\'ve learned.',
        read: false,
      });
    } catch (err) {
      const message = handleAiError(err);
      addNotification({ type: 'error', message, read: false });
    }
  }, [saveState, addNotification, state.modules, state.activeModuleId, handleAiError]);

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
    setProvider,
    setApiKeyError,
    loadDemoData,
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
    refreshDiagnosticQuestions,
    refreshScenario,
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