/* ──────────────────────────────────────────
   LearnArena — AI Service Orchestrator
   ────────────────────────────────────────── */

import { DashboardData, APIProvider } from '../types';
import { retryFetch } from './retryFetch';

// ── Prompt Builder ────────────────────────
function buildPrompt(text: string): string {
  const truncated = text.length > 6000 ? text.slice(0, 6000) + '...(truncated)' : text;
  return `You are LearnArena, an expert educational content designer. Analyze these study notes and create a comprehensive learning module.

Notes:
${truncated}

Respond with ONLY valid JSON (no markdown fences, no commentary):
{
  "moduleTitle": "Catchy, descriptive title",
  "moduleEmoji": "🔬",
  "globalDifficulty": "beginner" | "intermediate" | "advanced",
  "synthesis": {
    "summary": "1-2 sentence overview of the material",
    "keyTakeaways": ["3-5 key points"],
    "recommendedNext": ["2-3 topics to study next"]
  },
  "contextGraph": [
    {
      "id": "node-1",
      "label": "Main Topic",
      "emoji": "📚",
      "children": [
        { "id": "node-1-1", "label": "Subtopic", "emoji": "💡" }
      ]
    }
  ],
  "coreConcepts": [
    { "id": "cc-1", "term": "Concept Name", "emoji": "🔑", "definition": "Clear definition", "difficulty": "easy" }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "What is...?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Explanation of the correct answer",
      "difficulty": "medium",
      "conceptId": "cc-1"
    }
  ],
  "recallCards": [
    { "id": "rc-1", "front": "Question?", "back": "Answer", "emoji": "🧠", "difficulty": "easy" }
  ]
}`;
}

// ── Parse AI Response ─────────────────────
function parseDashboardResponse(content: string): DashboardData {
  let jsonStr = content.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
  }
  const parsed = JSON.parse(jsonStr);
  return {
    moduleTitle: parsed.moduleTitle || 'Study Module',
    moduleEmoji: parsed.moduleEmoji || '📚',
    globalDifficulty: parsed.globalDifficulty || 'beginner',
    synthesis: {
      summary: parsed.synthesis?.summary || 'Your personalized study module is ready.',
      keyTakeaways: parsed.synthesis?.keyTakeaways || [],
      recommendedNext: parsed.synthesis?.recommendedNext || [],
    },
    contextGraph: parsed.contextGraph || [],
    coreConcepts: parsed.coreConcepts || [],
    quiz: parsed.quiz || [],
    recallCards: (parsed.recallCards || []).map((rc: any) => ({
      ...rc,
      known: null,
    })),
  };
}

// ── Main Export ───────────────────────────
export async function generateDashboard(
  provider: APIProvider,
  apiKey: string,
  text: string,
  _images: string[] = [],
): Promise<DashboardData> {
  const prompt = buildPrompt(text);

  if (provider === 'google') {
    const res = await retryFetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      },
    );
    if (!res.ok) throw new Error(`Google AI error: ${res.status}`);
    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseDashboardResponse(content);
  }

  // OpenRouter (and Anthropic via OpenRouter)
  const res = await retryFetch('https://openrouter.ai/api/v1/chat/completions', {
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
        { role: 'system', content: 'You are LearnArena, an expert educational content designer. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return parseDashboardResponse(content);
}

export type { DashboardData };
