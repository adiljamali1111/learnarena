/* ──────────────────────────────────────────
   LearnArena — Type Definitions
   ────────────────────────────────────────── */

// ── Tab / Navigation ──────────────────────
export enum TabKey {
  Dashboard = 'dashboard',
  MyUniverse = 'my-universe',
  PracticeDuel = 'practice-duel',
  LearnersDen = 'learners-den',
}

// ── API ───────────────────────────────────
export type APIProvider = 'openrouter' | 'google' | 'anthropic';

// ── Core Concept ──────────────────────────
export interface CoreConcept {
  id: string;
  term: string;
  emoji: string;
  definition: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// ── Quiz / Diagnostic Question ────────────
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  conceptId?: string;
}

// ── Recall Card ───────────────────────────
export interface RecallCard {
  id: string;
  front: string;
  back: string;
  emoji?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  known: boolean | null;
}

// ── Context Graph Node ────────────────────
export interface ContextGraphNode {
  id: string;
  label: string;
  emoji?: string;
  children?: ContextGraphNode[];
}

// ── Synthesis ────────────────────────────
export interface SynthesisData {
  summary: string;
  keyTakeaways: string[];
  recommendedNext: string[];
}

// ── Dashboard Data ────────────────────────
export interface DashboardData {
  moduleTitle: string;
  moduleEmoji: string;
  globalDifficulty: 'beginner' | 'intermediate' | 'advanced';
  synthesis: SynthesisData;
  contextGraph: ContextGraphNode[];
  coreConcepts: CoreConcept[];
  quiz: QuizQuestion[];
  recallCards: RecallCard[];
}

// ── Notification ──────────────────────────
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  timestamp: number;
}

// ── XP State ─────────────────────────────
export interface XpState {
  level: number;
  current: number;
  totalForNextLevel: number;
}

// ── Parsed Document ──────────────────────
export interface ParsedDocument {
  title: string;
  content: string;
  type: 'pdf' | 'txt' | 'md' | 'docx' | 'pptx';
  pageCount?: number;
}

// ── Notes Input ──────────────────────────
export interface NotesInputData {
  text: string;
  images: string[];
  fileName?: string;
}

// ── Dashboard State ───────────────────────
export interface DashboardState {
  activeTab: TabKey;
  dashboard: DashboardData | null;
  apiKey: string | null;
  apiProvider: APIProvider;
  isGenerating: boolean;
  activeNote: string | null;
  modules: ModuleRecord[];
  recallCardsState: RecallCard[];
  seenQuestions: Set<string>;
  xp: XpState;
  notifications: Notification[];
  cumulativeXp: number;
}

export interface ModuleRecord {
  id: string;
  title: string;
  emoji: string;
  difficulty: string;
  createdAt: number;
  progress: number;
  questionCount: number;
  xp: number;
}

// ── Dashboard Actions ─────────────────────
export type DashboardAction =
  | { type: 'SET_ACTIVE_TAB'; payload: TabKey }
  | { type: 'SET_DASHBOARD'; payload: DashboardData | null }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_API_PROVIDER'; payload: APIProvider }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ACTIVE_NOTE'; payload: string | null }
  | { type: 'ADD_MODULE'; payload: ModuleRecord }
  | { type: 'UPDATE_MODULE_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'SET_RECALL_CARDS'; payload: RecallCard[] }
  | { type: 'UPDATE_RECALL_CARD'; payload: { id: string; known: boolean } }
  | { type: 'ADD_SEEN_QUESTION'; payload: string }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: { message: string; type: Notification['type'] } }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'RESET' };

// ── AI Response ───────────────────────────
export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
