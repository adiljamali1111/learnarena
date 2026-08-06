export const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_MODEL = 'openai/gpt-4o-mini';
export const OPENROUTER_MAX_TOKENS = 4096;
export const OPENROUTER_TEMPERATURE = 0.3;

export const GOOGLE_AI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';
export const GOOGLE_AI_MODEL = 'gemini-3.6-flash';
export const GOOGLE_AI_MAX_TOKENS = 4096;
export const GOOGLE_AI_TEMPERATURE = 0.3;

export const APP_TITLE = 'LearnArena';
export const APP_URL = window.location.origin;

export const FILE_LIMITS = {
  maxSizeMB: 15,
  maxFiles: 6,
  maxImagesPerFile: 8,
  maxTotalImages: 10,
} as const;

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
] as const;

export const XP_PER_QUESTION = 10;
export const XP_PER_CARD = 5;
export const XP_LEVEL_MULTIPLIER = 100;

export const TOPIC_MAX_XP = 400;
export const CUMULATIVE_LEVEL_1_XP = 1000;

export const DUEL_CONFIG = {
  totalQuestions: 10,
  timePerQuestion: 15,
  startingLives: 3,
  comboMultiplier: 1.5,
  rivalBaseSpeed: 8,
  rivalVariance: 4,
} as const;

export const DUEL_DIFFICULTY = {
  easy: { accuracy: 0.3, speed: 6, label: 'Easy', color: 'text-success' },
  medium: { accuracy: 0.5, speed: 8, label: 'Medium', color: 'text-warning' },
  hard: { accuracy: 0.7, speed: 10, label: 'Hard', color: 'text-danger' },
  extreme: { accuracy: 0.85, speed: 13, label: 'Extreme', color: 'text-purple-400' },
} as const;

export const STORAGE_KEYS = {
  apiKey: 'learnarena_openrouter_key',
  apiProvider: 'learnarena_api_provider',
  googleKey: 'learnarena_google_key',
  dashboard: 'learnarena_dashboard',
  modules: 'learnarena_modules',
  seenQuestions: 'learnarena_seen_questions',
  xp: 'learnarena_xp',
  cumulativeXp: 'learnarena_cumulative_xp',
  recallCards: 'learnarena_recall_cards',
  duel: 'learnarena_duel',
  activeNote: 'learnarena_active_note',
  activeTab: 'learnarena_active_tab',
  notifications: 'learnarena_notifications',
} as const;

export const RIVAL_NAMES_BY_DIFFICULTY: Record<string, string> = {
  easy: 'Novice-1',
  medium: 'Scholar-5',
  hard: 'Professor-X',
  extreme: 'Grandmaster-9',
} as const;

export const RIVAL_NAMES = [
  'RIVAL-9',
  'NEXUS-7',
  'PROTO-3',
  'QUANTUM-5',
  'VECTOR-X',
  'AURA-4',
  'ECHO-2',
  'ZENITH-8',
] as const;

export function getCumulativeLevel(totalXp: number): { level: number; current: number; totalForNextLevel: number } {
  if (totalXp <= 0) return { level: 1, current: 0, totalForNextLevel: CUMULATIVE_LEVEL_1_XP };
  // Level N requires total: 1000 * (2^N - 1)
  let level = 1;
  let required = CUMULATIVE_LEVEL_1_XP; // 1000
  let cumulativeRequired = required;
  while (totalXp >= cumulativeRequired) {
    level++;
    required *= 2;
    cumulativeRequired += required;
    if (level > 100) break;
  }
  const prevCumulative = cumulativeRequired - required;
  return {
    level: Math.min(level, 100),
    current: totalXp - prevCumulative,
    totalForNextLevel: required,
  };
}