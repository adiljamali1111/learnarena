/* ──────────────────────────────────────────
   LearnArena — Constants & Config
   ────────────────────────────────────────── */

// ── XP / Level System ─────────────────────
// Each level requires progressively more XP
const XP_PER_LEVEL: Record<number, number> = {
  1: 0,       // Starting
  2: 100,
  3: 250,
  4: 500,
  5: 800,
  6: 1200,
  7: 1700,
  8: 2300,
  9: 3000,
  10: 3800,
  11: 4700,
  12: 5700,
  13: 6800,
  14: 8000,
  15: 9300,
  16: 10700,
  17: 12200,
  18: 13800,
  19: 15500,
  20: 17300,
};

const MAX_LEVEL = 20;

interface CumulativeLevel {
  level: number;
  current: number;   // XP earned within current level
  totalForNextLevel: number; // XP needed within this level
}

export function getCumulativeLevel(totalXp: number): CumulativeLevel {
  let level = 1;
  for (let lv = MAX_LEVEL; lv >= 1; lv--) {
    if (totalXp >= XP_PER_LEVEL[lv]) {
      level = lv;
      break;
    }
  }
  const nextLevel = level >= MAX_LEVEL ? MAX_LEVEL : level + 1;
  const base = XP_PER_LEVEL[level];
  const next = XP_PER_LEVEL[nextLevel];
  const current = totalXp - base;
  const totalForNextLevel = next - base;
  return { level, current, totalForNextLevel };
}

export function xpForAnswer(isCorrect: boolean, difficulty: 'easy' | 'medium' | 'hard'): number {
  if (!isCorrect) return 0;
  switch (difficulty) {
    case 'easy': return 25;
    case 'medium': return 50;
    case 'hard': return 100;
  }
}

// ── API Provider Defaults ─────────────────
export const PROVIDER_CONFIG = {
  openrouter: {
    name: 'OpenRouter',
    defaultModel: 'openai/gpt-4o-mini',
    localStorageKey: 'learnarena_openrouter_key',
  },
  google: {
    name: 'Google AI',
    defaultModel: 'gemini-2.0-flash',
    localStorageKey: 'learnarena_google_key',
  },
  anthropic: {
    name: 'Anthropic',
    defaultModel: 'claude-3-5-haiku-latest',
    localStorageKey: 'learnarena_anthropic_key',
  },
} as const;

// ── Demo / Placeholder ────────────────────
export const APP_NAME = 'LearnArena';
export const APP_TAGLINE = 'Upload your notes. Build your universe.';
