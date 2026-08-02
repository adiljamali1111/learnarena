export interface DashboardData {
  moduleTitle: string;
  synthesis: ModuleSynthesis;
  concepts: CoreConcept[];
  contextMap: ContextMapNode[];
  scenario: Scenario;
  diagnosticQuest: DiagnosticQuest;
  masteryProgress: MasteryProgress;
  coWorkingArena: CoWorkingArenaLeaderboard;
}

export interface ModuleSynthesis {
  keyTakeaways: string[];
}

export interface CoreConcept {
  term: string;
  definition: string;
  analogy: string;
  xpBadge: number;
}

export interface ContextMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  connections: string[];
}

export interface Scenario {
  setup: string;
  question: string;
  actions: ScenarioAction[];
}

export interface ScenarioAction {
  label: string;
  isCorrect: boolean;
  explanation: string;
}

export interface DiagnosticQuest {
  questions: DiagnosticQuestion[];
}

export interface DiagnosticQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  socraticHint: string;
}

export interface MasteryProgress {
  currentXp: number;
  maxXp: number;
  streak: number;
}

export interface CoWorkingArenaLeaderboard {
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  isCurrentUser?: boolean;
}