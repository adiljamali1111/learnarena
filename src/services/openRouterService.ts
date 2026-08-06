/* ──────────────────────────────────────────
   LearnArena — OpenRouter AI Service
   ────────────────────────────────────────── */

import { retryFetch } from './retryFetch';
import { AIResponse, Module, GenerateModulesPayload } from '../types';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function generateModulesOpenRouter(
  payload: GenerateModulesPayload,
  apiKey: string,
): Promise<AIResponse<Module[]>> {
  try {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildModuleGenerationPrompt(payload.notesText, payload.notesTitle);

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

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
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `OpenRouter error (${response.status}): ${errorBody}` };
    }

    const data: OpenRouterResponse = await response.json();
    const parsed = parseModuleResponse(data.choices[0].message.content);
    return { success: true, data: parsed };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function generateContentOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
): Promise<AIResponse<string>> {
  try {
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

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
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `OpenRouter error (${response.status}): ${errorBody}` };
    }

    const data: OpenRouterResponse = await response.json();
    return { success: true, data: data.choices[0].message.content };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ── Helpers ───────────────────────────────
function buildSystemPrompt(): string {
  return `You are LearnArena, an expert educational content designer. Your job is to analyze study notes and create structured learning modules.

Always respond with valid JSON. Never include markdown fences or commentary.

You create modules, each with:
- An emoji that represents the topic
- A clear title
- A brief description
- Core concepts (term, emoji, definition, difficulty: easy/medium/hard)
- Diagnostic questions (multiple choice with 4 options, correct index, explanation)
- Practice duel questions (multiple choice with difficulty)
- Recall card pairs (front question, back answer)

Be concise, accurate, and pedagogically sound.`;
}

function buildModuleGenerationPrompt(notes: string, title: string): string {
  const truncated = notes.length > 8000 ? notes.slice(0, 8000) + '...(truncated)' : notes;
  return `Analyze these study notes titled "${title}" and create 3-5 learning modules.

Notes:
${truncated}

Respond with this exact JSON structure:
{
  "modules": [
    {
      "title": "Module Title",
      "emoji": "📚",
      "description": "Brief description of what this module covers",
      "concepts": [
        { "term": "Concept Name", "emoji": "🔑", "definition": "Clear, concise definition", "difficulty": "easy" }
      ],
      "diagnosticQuestions": [
        {
          "question": "What is...?",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 0,
          "explanation": "Because...",
          "conceptId": "references the concept by term (we'll link later)"
        }
      ],
      "practiceQuestions": [
        {
          "question": "Apply the concept...",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 1,
          "explanation": "The correct answer is...",
          "difficulty": "medium"
        }
      ],
      "recallCards": [
        { "front": "What is X?", "back": "X is..." }
      ]
    }
  ]
}`;
}

function parseModuleResponse(content: string): Module[] {
  // Try to extract JSON from the response
  let jsonStr = content.trim();

  // Strip markdown fences if present
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
  }

  const parsed = JSON.parse(jsonStr);
  const modulesData: any[] = parsed.modules || [];

  return modulesData.map((mod: any, index: number) => ({
    id: `mod-${Date.now()}-${index}`,
    title: mod.title || 'Untitled Module',
    emoji: mod.emoji || '📚',
    description: mod.description || '',
    content: '',
    concepts: (mod.concepts || []).map((c: any, ci: number) => ({
      id: `concept-${Date.now()}-${index}-${ci}`,
      term: c.term,
      emoji: c.emoji || '💡',
      definition: c.definition,
      difficulty: c.difficulty || 'medium',
      moduleId: `mod-${Date.now()}-${index}`,
    })),
    diagnosticQuestions: (mod.diagnosticQuestions || []).map((q: any, qi: number) => ({
      id: `dq-${Date.now()}-${index}-${qi}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      conceptId: q.conceptId || '',
    })),
    practiceQuestions: (mod.practiceQuestions || []).map((q: any, qi: number) => ({
      id: `pq-${Date.now()}-${index}-${qi}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty: q.difficulty || 'medium',
    })),
    recallCards: (mod.recallCards || []).map((rc: any, rci: number) => ({
      id: `rc-${Date.now()}-${index}-${rci}`,
      front: rc.front,
      back: rc.back,
      moduleId: `mod-${Date.now()}-${index}`,
    })),
    createdAt: Date.now(),
    xp: 0,
    mastery: 0,
    completed: false,
  }));
}
