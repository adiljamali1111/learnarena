/* ──────────────────────────────────────────
   LearnArena — Google AI Service
   ────────────────────────────────────────── */

import { retryFetch } from './retryFetch';
import { AIResponse, Module, GenerateModulesPayload } from '../types';

const GOOGLE_AI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

interface GoogleGenerateResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export async function generateModulesGoogle(
  payload: GenerateModulesPayload,
  apiKey: string,
): Promise<AIResponse<Module[]>> {
  try {
    const prompt = buildModuleGenerationPrompt(payload.notesText, payload.notesTitle);
    const model = 'gemini-2.0-flash';

    const response = await retryFetch(
      `${GOOGLE_AI_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `Google AI error (${response.status}): ${errorBody}` };
    }

    const data: GoogleGenerateResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = parseModuleResponse(text);

    return { success: true, data: parsed };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function generateContentGoogle(
  prompt: string,
  apiKey: string,
  model = 'gemini-2.0-flash',
): Promise<AIResponse<string>> {
  try {
    const response = await retryFetch(
      `${GOOGLE_AI_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `Google AI error (${response.status}): ${errorBody}` };
    }

    const data: GoogleGenerateResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return { success: true, data: text };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ── Helpers ───────────────────────────────
function buildModuleGenerationPrompt(notes: string, title: string): string {
  const truncated = notes.length > 8000 ? notes.slice(0, 8000) + '...(truncated)' : notes;
  return `You are LearnArena, an expert educational content designer. Analyze these study notes titled "${title}" and create 3-5 learning modules.

Notes:
${truncated}

Respond with ONLY valid JSON (no markdown fences, no commentary). Use this exact structure:
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
          "conceptId": "references the concept by term"
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
  let jsonStr = content.trim();
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
