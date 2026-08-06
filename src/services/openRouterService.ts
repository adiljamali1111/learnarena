/* ──────────────────────────────────────────
   LearnArena — OpenRouter AI Service
   (Legacy — kept for module-level generation if needed)
   ────────────────────────────────────────── */

import { retryFetch } from './retryFetch';
import { AIResponse, Module, GenerateModulesPayload } from '../types';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

interface OpenRouterResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function generateModulesOpenRouter(
  payload: GenerateModulesPayload,
  apiKey: string,
): Promise<AIResponse<Module[]>> {
  try {
    const prompt = buildModulePrompt(payload.notesText, payload.notesTitle);
    const response = await retryFetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'LearnArena',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are LearnArena. Respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });
    if (!response.ok) throw new Error(`OpenRouter error (${response.status})`);
    const data: OpenRouterResponse = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content.replace(/^```\w*\n?/, '').replace(/\n?```$/, ''));
    return { success: true, data: parsed.modules || [] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

function buildModulePrompt(notes: string, title: string): string {
  const truncated = notes.length > 8000 ? notes.slice(0, 8000) + '...(truncated)' : notes;
  return `Analyze "${title}" and create 3-5 modules as JSON:\n\n${truncated}\n\nRespond with: { "modules": [...] }`;
}
