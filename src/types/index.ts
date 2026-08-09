// ─── API Provider ───
export type APIProvider = 'openrouter' | 'google';

// ─── Tab Navigation ───
export const TabKey = {
  Dashboard: 'dashboard',
  MyUniverse: 'my-universe',
  PracticeDuel: 'practice-duel',
  LearnersDen: 'learners-den',
} as const;
export type TabKey = (typeof TabKey)[keyof typeof TabKey];

// ─── OpenRouter Response ───
export interface DashboardData {
  moduleTitle: string;
  moduleEmoji: string;
  globalDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  synthesis: SynthesisData;
  coreConcepts: CoreConcept[];
  contextGraph: ContextNode[];
  scenarios: Scenario[];
  quiz: QuizQuestion[];
  xpAwarded: number;
}

// ─── ModuleSynthesis ───
export interface SynthesisData {
  summary: string;
  audioTabs: AudioTab[];
}

export interface AudioTab {
  title: string;
  content: string;
}

// ─── CoreConceptDeck ───
export interface CoreConcept {
  id: string;
  term: string;
  definition: string;
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ─── ContextMap ───
export interface ContextNode {
  id: string;
  label: string;
  description: string;
  group: number;
  connections: string[];
}

// ─── ScenarioSandbox / WhatIfLab ───
export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exampleResponse: string;
}

// ─── DiagnosticQuest ───
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

// ─── Practice Duel ───
export const DuelPhase = {
  Idle: 'idle',
  DifficultySelect: 'difficulty-select',
  Preparing: 'preparing',
  Playing: 'playing',
  Done: 'done',
} as const;
export type DuelPhase = (typeof DuelPhase)[keyof typeof DuelPhase];

export type DuelDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface DuelState {
  phase: DuelPhase;
  difficulty: DuelDifficulty;
  lives: number;
  score: number;
  combo: number;
  maxCombo: number;
  currentQuestionIndex: number;
  questions: QuizQuestion[];
  correctAnswers: number;
  wrongAnswers: number;
  timeLeft: number;
  rivalScore: number;
  playerAnswered: boolean;
  aiAnswered: boolean;
  lastAnswerCorrect: boolean | null;
  rivalChoice: number | null;
}

// ─── MasteryProgress ───
export interface XPState {
  current: number;
  level: number;
  totalForNextLevel: number;
}

// ─── RecallCards ───
export interface RecallCard {
  id: string;
  front: string;
  back: string;
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
  known: boolean | null;
}

// ─── Learner's Den Tools ───
export const DenToolId = {
  AudioOverview: 'audio-overview',
  MindMap: 'mind-map',
  Presentation: 'presentation',
  RecallCards: 'recall-cards',
  VisualBreakdown: 'visual-breakdown',
  StudyReport: 'study-report',
  WhatIfLab: 'what-if-lab',
} as const;
export type DenToolId = (typeof DenToolId)[keyof typeof DenToolId];

export interface DenTool {
  id: DenToolId;
  label: string;
  icon: string;
  description: string;
}

// ─── Notifications ───
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
}

// ─── Module Storage ───
export interface ModuleSummary {
  id: string;
  title: string;
  emoji: string;
  difficulty: string;
  createdAt: number;
  progress: number;
  questionCount: number;
  xp: number; // topic XP (0-400)
}

// ─── App State ───
export interface AppState {
  apiKey: string;
  apiProvider: APIProvider;
  activeTab: TabKey;
  dashboard: DashboardData | null;
  activeNote: string;
  isGenerating: boolean;
  modules: ModuleSummary[];
  seenQuestions: string[];
  duel: DuelState;
  xp: XPState;
  cumulativeXp: number;
  recallCards: RecallCard[];
  notifications: Notification[];
}

// ─── Actions ───
export type AppAction =
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_API_PROVIDER'; payload: APIProvider }
  | { type: 'SET_ACTIVE_TAB'; payload: TabKey }
  | { type: 'SET_DASHBOARD'; payload: DashboardData }
  | { type: 'SET_ACTIVE_NOTE'; payload: string }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'ADD_MODULE'; payload: ModuleSummary }
  | { type: 'REMOVE_MODULE'; payload: string }
  | { type: 'UPDATE_MODULE_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'SET_DUEL'; payload: Partial<DuelState> }
  | { type: 'RESET_DUEL' }
  | { type: 'ADD_SEEN_QUESTION'; payload: string }
  | { type: 'SET_XP'; payload: XPState }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'ADD_TOPIC_XP'; payload: { moduleId: string; amount: number } }
  | { type: 'SET_CUMULATIVE_XP'; payload: number }
  | { type: 'SET_RECALL_CARDS'; payload: RecallCard[] }
  | { type: 'UPDATE_RECALL_CARD'; payload: { id: string; known: boolean } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };