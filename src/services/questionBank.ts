const SEEN_KEY = 'learnarena_seen_questions';

export function getSeenQuestions(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markSeen(questionText: string): void {
  const seen = getSeenQuestions();
  if (!seen.includes(questionText)) {
    seen.push(questionText);
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  }
}

export function markManySeen(questions: string[]): void {
  const seen = getSeenQuestions();
  const set = new Set(seen);
  for (const q of questions) set.add(q);
  localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(set)));
}

export function clearSeenQuestions(): void {
  localStorage.removeItem(SEEN_KEY);
}