interface SeenQuestion {
  id: string;
  moduleId: string;
}

const STORAGE_KEY = 'learnarena_seen_questions';

function getSeen(): SeenQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSeen(questions: SeenQuestion[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

export function isQuestionSeen(questionId: string, moduleId: string): boolean {
  return getSeen().some((q) => q.id === questionId && q.moduleId === moduleId);
}

export function markQuestionSeen(questionId: string, moduleId: string): void {
  const seen = getSeen();
  if (!seen.some((q) => q.id === questionId && q.moduleId === moduleId)) {
    seen.push({ id: questionId, moduleId });
    saveSeen(seen);
  }
}

export function getUnseenQuestionIds(
  allIds: string[],
  moduleId: string,
): string[] {
  const seen = getSeen()
    .filter((q) => q.moduleId === moduleId)
    .map((q) => q.id);
  return allIds.filter((id) => !seen.includes(id));
}

export function clearSeenForModule(moduleId: string): void {
  const seen = getSeen().filter((q) => q.moduleId !== moduleId);
  saveSeen(seen);
}

export function clearAllSeen(): void {
  localStorage.removeItem(STORAGE_KEY);
}