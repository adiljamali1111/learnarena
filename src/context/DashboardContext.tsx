import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import type {
  TabKey,
  DashboardData,
  SavedModule,
  AppNotification,
  DuelState,
  DuelQuestion,
  DuelResult,
} from '../types/dashboard';
import { generateDashboard, generateFreshQuestions, generateDenContent, OpenRouterError } from '../services/openrouter';
import { validateFiles, parseFile } from '../services/fileParser';
import { setDocumentImages, getDocumentImages } from '../services/documentContext';
import { getSeenQuestions, markManySeen, clearSeenQuestions } from '../services/questionBank';

// ── Storage keys ──
const DASHBOARD_KEY = 'learnarena_dashboard';
const SAVED_MODULES_KEY = 'learnarena_saved_modules';
const NOTIFICATIONS_KEY = 'learnarena_notifications';
const HAS_ENTERED_KEY = 'learnarena_has_entered';
const XP_KEY = 'learnarena_xp';
const XP_FOR_DUEL = 200;

// ── Context shape ──

interface DashboardContextValue {
  // Auth / entry
  hasEntered: boolean;
  setHasEntered: (v: boolean) => void;
  apiKey: string | null;
  setApiKey: (key: string) => void;

  // Active dashboard
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  generateFromNotes: (notes: string) => Promise<void>;
  generateFromFiles: (files: File[]) => Promise<void>;
  resetDashboard: () => void;
  exportDashboard: () => void;

  // Saved modules
  savedModules: SavedModule[];
  saveModule: (title: string) => void;
  loadModule: (id: string) => void;
  deleteModule: (id: string) => void;

  // XP system
  totalXp: number;
  addXp: (amount: number) => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (type: AppNotification['type'], title: string, body: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;

  // Duel state
  duel: DuelState;
  startDuel: () => Promise<void>;
  answerDuelQuestion: (selectedIndex: number) => void;
  resetDuel: () => void;

  // Den tool cached generation
  generateDenToolContent: (tool: string, title: string, text: string) => Promise<any>;
  denToolCache: Record<string, any>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}

// ── Helper: generate unique id ──
const uid = () => crypto.randomUUID();

// ── Provider ──

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [hasEntered, setHasEnteredState] = useState<boolean>(() => {
    return localStorage.getItem(HAS_ENTERED_KEY) === 'true';
  });
  const [apiKey, setApiKeyState] = useState<string | null>(() => localStorage.getItem('learnarena_openrouter_key'));

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(() => {
    try {
      const raw = localStorage.getItem(DASHBOARD_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedModules, setSavedModules] = useState<SavedModule[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_MODULES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const [totalXp, setTotalXp] = useState<number>(() => {
    try { return Number(localStorage.getItem(XP_KEY)) || 0; } catch { return 0; }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const [denToolCache, setDenToolCache] = useState<Record<string, any>>({});

  // ── Duel state ──
  const [duel, setDuel] = useState<DuelState>({
    phase: 'idle',
    playerScore: 0,
    rivalScore: 0,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    bestStreak: 0,
    currentStreak: 0,
    questionIndex: 0,
    questions: [],
    answerHistory: [],
    result: null,
  });

  const duelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Persist helpers ──
  const persistDashboard = useCallback((data: DashboardData | null) => {
    setDashboardData(data);
    if (data) {
      localStorage.setItem(DASHBOARD_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(DASHBOARD_KEY);
    }
  }, []);

  const persistSavedModules = useCallback((modules: SavedModule[]) => {
    setSavedModules(modules);
    localStorage.setItem(SAVED_MODULES_KEY, JSON.stringify(modules));
  }, []);

  const persistXp = useCallback((xp: number) => {
    setTotalXp(xp);
    localStorage.setItem(XP_KEY, String(xp));
  }, []);

  const persistNotifications = useCallback((notes: AppNotification[]) => {
    setNotifications(notes);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notes));
  }, []);

  const setHasEntered = useCallback((v: boolean) => {
    setHasEnteredState(v);
    if (v) localStorage.setItem(HAS_ENTERED_KEY, 'true');
    else localStorage.removeItem(HAS_ENTERED_KEY);
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localStorage.setItem('learnarena_openrouter_key', key);
  }, []);

  // ── Generate from pasted notes ──
  const generateFromNotes = useCallback(async (notes: string) => {
    if (!notes.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateDashboard(notes);
      persistDashboard(data);
      toast.success('Dashboard generated!');
    } catch (err) {
      const msg = err instanceof OpenRouterError ? err.message : 'Generation failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [persistDashboard]);

  // ── Generate from uploaded files ──
  const generateFromFiles = useCallback(async (files: File[]) => {
    const validation = validateFiles(files);
    if (!validation.valid) {
      toast.error(validation.error ?? 'Invalid files');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let allText = '';
      let allImages: string[] = [];
      for (const file of files) {
        const result = await parseFile(file);
        allText += `\n\n--- ${file.name} ---\n\n${result.text}`;
        allImages = [...allImages, ...result.images].slice(0, 10);
      }

      // Store images for context
      const tempTitle = files.map(f => f.name).join(', ');
      setDocumentImages(tempTitle, allImages);

      const data = await generateDashboard(allText, allImages);
      persistDashboard(data);
      toast.success('Dashboard generated from files!');
    } catch (err) {
      const msg = err instanceof OpenRouterError ? err.message : 'File processing failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [persistDashboard]);

  // ── Reset ──
  const resetDashboard = useCallback(() => {
    persistDashboard(null);
    setError(null);
    toast.success('Dashboard cleared');
  }, [persistDashboard]);

  // ── Export ──
  const exportDashboard = useCallback(() => {
    try {
      const data = localStorage.getItem(DASHBOARD_KEY);
      if (!data) { toast.error('No dashboard to export'); return; }
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learnarena-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Dashboard exported');
    } catch {
      toast.error('Export failed');
    }
  }, []);

  // ── Save / Load / Delete modules ──
  const saveModule = useCallback((title: string) => {
    if (!dashboardData) { toast.error('No dashboard to save'); return; }
    const mod: SavedModule = {
      id: uid(),
      title,
      timestamp: Date.now(),
      dashboardData,
    };
    persistSavedModules([...savedModules, mod]);
    toast.success(`Saved "${title}"`);
  }, [dashboardData, savedModules, persistSavedModules]);

  const loadModule = useCallback((id: string) => {
    const mod = savedModules.find(m => m.id === id);
    if (!mod) { toast.error('Module not found'); return; }
    persistDashboard(mod.dashboardData);
    toast.success(`Loaded "${mod.title}"`);
  }, [savedModules, persistDashboard]);

  const deleteModule = useCallback((id: string) => {
    persistSavedModules(savedModules.filter(m => m.id !== id));
    toast.success('Module deleted');
  }, [savedModules, persistSavedModules]);

  // ── XP ──
  const addXp = useCallback((amount: number) => {
    persistXp(totalXp + amount);
  }, [totalXp, persistXp]);

  // ── Notifications ──
  const addNotification = useCallback((type: AppNotification['type'], title: string, body: string) => {
    const notif: AppNotification = {
      id: uid(),
      type,
      title,
      body,
      timestamp: Date.now(),
      read: false,
    };
    persistNotifications([notif, ...notifications]);
  }, [notifications, persistNotifications]);

  const markNotificationRead = useCallback((id: string) => {
    persistNotifications(
      notifications.map(n => n.id === id ? { ...n, read: true } : n),
    );
  }, [notifications, persistNotifications]);

  const clearNotifications = useCallback(() => {
    persistNotifications([]);
  }, [persistNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Duel ──
  const startDuel = useCallback(async () => {
    if (!dashboardData) { toast.error('No study material loaded'); return; }
    setDuel(prev => ({ ...prev, phase: 'preparing', questions: [], questionIndex: 0, playerScore: 0, rivalScore: 0, lives: 3, combo: 0, maxCombo: 0, currentStreak: 0, bestStreak: 0, answerHistory: [], result: null }));

    try {
      const excluded = getSeenQuestions();
      const sourceText = [
        dashboardData.synthesis.keyTakeaways.join('\n'),
        ...dashboardData.concepts.map(c => `${c.term}: ${c.definition}`),
        dashboardData.scenario.scenario,
      ].join('\n\n');

      const questions = await generateFreshQuestions(
        dashboardData.moduleTitle,
        sourceText,
        getDocumentImages(dashboardData.moduleTitle),
        excluded,
        12,
      );

      setDuel(prev => ({
        ...prev,
        phase: 'playing',
        questions,
        questionIndex: 0,
        combo: 0,
        currentStreak: 0,
      }));

      // Mark these questions as seen
      markManySeen(questions.map(q => q.question));
    } catch (err) {
      const msg = err instanceof OpenRouterError ? err.message : 'Failed to prepare duel';
      toast.error(msg);
      setDuel(prev => ({ ...prev, phase: 'idle' }));
    }
  }, [dashboardData]);

  const answerDuelQuestion = useCallback((selectedIndex: number) => {
    setDuel(prev => {
      if (prev.phase !== 'playing') return prev;
      const q = prev.questions[prev.questionIndex];
      if (!q) return prev;

      const correct = selectedIndex === q.correctIndex;
      const newCombo = correct ? prev.combo + 1 : 0;
      const newStreak = correct ? prev.currentStreak + 1 : 0;

      // Score multiplier from combo
      let multiplier = 1;
      if (newCombo >= 10) multiplier = 20;
      else if (newCombo >= 5) multiplier = 5;
      else if (newCombo >= 3) multiplier = 3;

      // RIVAL-9: 65% accuracy, 1.8-4.2s simulated response
      const rivalCorrect = Math.random() < 0.65;
      const rivalPoints = rivalCorrect ? 100 : 0;

      const newPlayerScore = prev.playerScore + (correct ? 100 * multiplier : 0);
      const newRivalScore = prev.rivalScore + rivalPoints;
      const newLives = correct ? prev.lives : prev.lives - 1;
      const newQuestionIndex = prev.questionIndex + 1;

      const answerHistory = [...prev.answerHistory, { questionId: q.id, correct }];

      // Check game over
      const isGameOver = newLives <= 0 || newQuestionIndex >= prev.questions.length;

      if (isGameOver) {
        let result: DuelResult;
        if (newPlayerScore > newRivalScore) result = 'victory';
        else if (newPlayerScore < newRivalScore) result = 'defeat';
        else result = 'draw';

        // Award XP for duel
        if (result === 'victory') {
          toast.success(`Victory! +${XP_FOR_DUEL} XP`);
          // XP added via the summary screen
        }

        return {
          ...prev,
          playerScore: newPlayerScore,
          rivalScore: newRivalScore,
          lives: newLives,
          combo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          bestStreak: Math.max(prev.bestStreak, newStreak),
          currentStreak: newStreak,
          questionIndex: newQuestionIndex,
          answerHistory,
          phase: 'done',
          result,
        };
      }

      return {
        ...prev,
        playerScore: newPlayerScore,
        rivalScore: newRivalScore,
        lives: newLives,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        bestStreak: Math.max(prev.bestStreak, newStreak),
        currentStreak: newStreak,
        questionIndex: newQuestionIndex,
        answerHistory,
      };
    });
  }, []);

  const resetDuel = useCallback(() => {
    setDuel({
      phase: 'idle',
      playerScore: 0,
      rivalScore: 0,
      lives: 3,
      combo: 0,
      maxCombo: 0,
      bestStreak: 0,
      currentStreak: 0,
      questionIndex: 0,
      questions: [],
      answerHistory: [],
      result: null,
    });
  }, []);

  // ── Den tool cache ──
  const generateDenToolContent = useCallback(async (tool: string, title: string, text: string) => {
    const cacheKey = `${tool}::${title}`;
    if (denToolCache[cacheKey]) return denToolCache[cacheKey];

    try {
      const images = getDocumentImages(title);
      const data = await generateDenContent(tool as any, title, text, images);
      setDenToolCache(prev => ({ ...prev, [cacheKey]: data }));
      return data;
    } catch (err) {
      throw err;
    }
  }, [denToolCache]);

  // ── Clean up timer on unmount ──
  useEffect(() => {
    return () => {
      if (duelTimerRef.current) clearTimeout(duelTimerRef.current);
    };
  }, []);

  const value: DashboardContextValue = {
    hasEntered,
    setHasEntered,
    apiKey,
    setApiKey,
    dashboardData,
    isLoading,
    error,
    generateFromNotes,
    generateFromFiles,
    resetDashboard,
    exportDashboard,
    savedModules,
    saveModule,
    loadModule,
    deleteModule,
    totalXp,
    addXp,
    notifications,
    addNotification,
    markNotificationRead,
    clearNotifications,
    unreadCount,
    duel,
    startDuel,
    answerDuelQuestion,
    resetDuel,
    generateDenToolContent,
    denToolCache,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}