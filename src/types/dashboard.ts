// ── Tab Navigation ──
export type TabKey = 'dashboard' | 'universe' | 'duel' | 'den';

// ── Den Tool Keys ──
export type DenToolKey =
  | 'audio-overview'
  | 'mindmap'
  | 'presentation'
  | 'recall-cards'
  | 'visual-breakdown'
  | 'study-report';

// ── Dashboard Data (returned by OpenRouter) ──

export interface DashboardData {
  moduleTitle: string;
  synthesis: SynthesisCard;
  concepts: ConceptCard[];
  contextMap: ContextMapData;
  scenario: ScenarioCard;
  diagnostic: DiagnosticCard;
  mastery: MasteryCard;
  coworking: CoWorkingCard;
}

export interface SynthesisCard {
  keyTakeaways: string[];
}

export interface ConceptCard {
  term: string;
  definition: string;
  analogy: string;
  xp: number; // 10–50
}

export interface ContextMapNode {
  id: string;
  label: string;
  x: number; // 0–1 relative
  y: number; // 0–1 relative
}

export interface ContextMapEdge {
  from: string;
  to: string;
}

export interface ContextMapData {
  nodes: ContextMapNode[];
  edges: ContextMapEdge[];
}

export interface ScenarioCard {
  scenario: string;
  options: ScenarioOption[];
  correctId: string;
  explanation: string;
}

export interface ScenarioOption {
  id: string;
  text: string;
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;       // shown regardless of correct/incorrect
  hint: string;              // Socratic prompt shown on wrong answer
  questionType: 'mcq' | 'true-false' | 'fill-in';
}

export interface DiagnosticCard {
  questions: DiagnosticQuestion[];
}

export interface MasteryCard {
  totalXp: number;
  streak: number;
  level: number;
}

export interface CoWorkingCard {
  participants: CoWorker[];
}

export interface CoWorker {
  name: string;
  xp: number;
  avatar: string; // emoji (to be replaced by SVG later)
}

// ── Saved Module (persisted in localStorage) ──

export interface SavedModule {
  id: string;
  title: string;
  timestamp: number;
  dashboardData: DashboardData;
}

// ── Notifications ──

export type NotificationType = 'streak' | 'duel' | 'leaderboard';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

// ── Practice Duel ──

export interface DuelQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  questionType: 'mcq' | 'true-false' | 'fill-in';
}

export type DuelPhase = 'idle' | 'preparing' | 'playing' | 'done';
export type DuelResult = 'victory' | 'defeat' | 'draw';

export interface DuelState {
  phase: DuelPhase;
  playerScore: number;
  rivalScore: number;
  lives: number;
  combo: number;
  maxCombo: number;
  bestStreak: number;
  currentStreak: number;
  questionIndex: number;
  questions: DuelQuestion[];
  answerHistory: { questionId: string; correct: boolean }[];
  result: DuelResult | null;
}

// ── Den Tool Content ──

export interface AudioOverviewContent {
  sections: { heading: string; text: string }[];
}

export interface MindMapContent {
  centralTopic: string;
  branches: MindMapBranch[];
}

export interface MindMapBranch {
  label: string;
  children: { label: string; meaning: string }[];
}

export interface PresentationContent {
  slides: PresentationSlide[];
}

export interface PresentationSlide {
  title: string;
  bullets: string[];
  note?: string;
}

export interface RecallCard {
  id: string;
  term: string;
  definition: string;
  known: boolean;
}

export interface RecallCardsContent {
  cards: Omit<RecallCard, 'id' | 'known'>[];
}

export interface VisualBreakdownContent {
  stats: { label: string; value: string }[];
  timeline: { period: string; event: string }[];
  sections: { heading: string; body: string }[];
  funFact: string;
}

export interface StudyReportContent {
  objective: { question: string; answer: string }[];
  subjective: { question: string; answer: string }[];
  glossary: { term: string; definition: string }[];
}