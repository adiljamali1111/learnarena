/* ──────────────────────────────────────────
   LearnArena — Constants & Config
   ────────────────────────────────────────── */

export { FILE_LIMITS } from '../services/fileParser';
export { getCumulativeLevel } from '../context/DashboardContext';

export const APP_NAME = 'LearnArena';
export const APP_TAGLINE = 'Upload your notes. Build your universe.';

export const STORAGE_KEYS = {
  modules: 'learnarena_modules',
  xp: 'learnarena_xp',
  apiKey: 'learnarena_openrouter_key',
} as const;

export const TOPIC_MAX_XP = 500;

// XP per correct answer
export function xpForAnswer(isCorrect: boolean, difficulty: 'easy' | 'medium' | 'hard'): number {
  if (!isCorrect) return 0;
  switch (difficulty) {
    case 'easy': return 25;
    case 'medium': return 50;
    case 'hard': return 100;
  }
}
