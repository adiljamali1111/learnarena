/* ──────────────────────────────────────────
   LearnArena — Google AI Service
   (Legacy — kept for module-level generation if needed)
   ────────────────────────────────────────── */

import { retryFetch } from './retryFetch';
import { AIResponse, Module, GenerateModulesPayload } from '../types';

const GOOGLE_AI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export async function generateModulesGoogle(
  payload: GenerateModulesPayload,
  apiKey: string,
): Promise<AIResponse<Module[]>> {
  try {
    const prompt = buildModulePrompt(payload.notesText, payload.notesTitle);
    const response = await retryFetch(
      `${GOOGLE_AI_BASE}/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      },
    );
    if (!response.ok) throw new Error(`Google AI error (${response.status})`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = JSON.parse(text.replace(/^```\w*\n?/, '').replace(/\n?```$/, ''));
    return { success: true, data: parsed.modules || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

function buildModulePrompt(notes: string, title: string): string {
  const truncated = notes.length > 8000 ? notes.slice(0, 8000) + '...(truncated)' : notes;
  return `Analyze "${title}" and create 3-5 modules as JSON:\n\n${truncated}\n\nRespond with: { "modules": [...] }`;
}
