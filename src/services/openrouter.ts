// ── OpenRouter API Client ──
// Uses gpt-4o-mini with response_format: json_object

import type {
  DashboardData,
  DiagnosticQuestion,
  DenToolKey,
} from '../types/dashboard';

const API_BASE = 'https://openrouter.ai/api/v1/chat/completions';

// Runtime getter so key can change without re-import
function getApiKey(): string | null {
  try {
    return localStorage.getItem('learnarena_openrouter_key');
  } catch {
    return null;
  }
}

// ── Error types ──

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

// ── Generic call ──

async function callOpenRouter(
  messages: { role: 'system' | 'user' | 'assistant'; content: any }[],
  systemPrompt: string,
): Promise<any> {
  const key = getApiKey();
  if (!key) throw new OpenRouterError('No API key set — add one in settings', 401);

  const fullMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages,
  ];

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'LearnArena',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new OpenRouterError('Invalid API key', 401);
    if (res.status === 402) throw new OpenRouterError('Insufficient credits', 402);
    if (res.status === 429) throw new OpenRouterError('Rate limited — try again shortly', 429);
    throw new OpenRouterError(`Server error (${res.status})`, res.status);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new OpenRouterError('Empty response from AI', 500);

  try {
    return JSON.parse(cleanJson(content));
  } catch {
    throw new OpenRouterError('AI returned malformed JSON', 500);
  }
}

// ── Streaming call (for Tutor / Explain / Brainstorm / Summarize) ──

export async function* streamOpenRouter(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  systemPrompt: string,
): AsyncGenerator<string> {
  const key = getApiKey();
  if (!key) throw new OpenRouterError('No API key set', 401);

  const fullMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages,
  ];

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'LearnArena',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      stream: true,
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new OpenRouterError('Invalid API key', 401);
    if (res.status === 402) throw new OpenRouterError('Insufficient credits', 402);
    if (res.status === 429) throw new OpenRouterError('Rate limited', 429);
    throw new OpenRouterError(`Server error (${res.status})`, res.status);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new OpenRouterError('No response body', 500);
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const parsed = JSON.parse(trimmed.slice(6));
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed chunks
      }
    }
  }
}

// ── Helper ──

function cleanJson(text: string): string {
  // Strip markdown code fences if present
  return text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
}

// ── Multi-modal call (text + images) ──

function buildImageContent(text: string, images: string[]) {
  if (images.length === 0) return text;

  const parts: any[] = [{ type: 'text', text }];
  for (const img of images.slice(0, 4)) {
    // Only send first 4 images to keep payload manageable
    parts.push({
      type: 'image_url',
      image_url: { url: img, detail: 'low' },
    });
  }
  return parts;
}

// ── Tool call: generate full Dashboard ──

export async function generateDashboard(
  notes: string,
  images: string[] = [],
): Promise<DashboardData> {
  const systemPrompt = `You are an expert study-content generator. Given a student's notes, produce a JSON object with EXACTLY these keys:
- "moduleTitle": a concise title for the module (string)
- "synthesis": { "keyTakeaways": [3-6 bullet-point key takeaways] }
- "concepts": [ array of 4-7 concept cards, each with "term", "definition", "analogy", "xp" (10-50 integer) ]
- "contextMap": { "nodes": [ array of { id, label, x (0-1), y (0-1) } ], "edges": [ array of { from, to } ] } — 5-8 nodes showing concept relationships
- "scenario": { "scenario": "description", "options": [ 3-4 { id, text } ], "correctId": "id of correct option", "explanation": "why correct" }
- "diagnostic": { "questions": [ 3-5 questions, each with "id", "question", "options" (array of 4 strings), "correctIndex" (0-3), "explanation", "hint" (a Socratic prompt), "questionType" ("mcq"|"true-false"|"fill-in") ] }
- "mastery": { "totalXp": 0, "streak": 0, "level": 1 }
- "coworking": { "participants": [ array of 3-4 { name, xp: 0-1000, avatar: single emoji that conveys the person's field } ] }

Return ONLY valid JSON, no markdown, no other text.`;

  const content = buildImageContent(notes, images);
  const result = await callOpenRouter(
    [{ role: 'user', content }],
    systemPrompt,
  );

  return result as DashboardData;
}

// ── Tool call: fresh questions for diagnostic / duel ──

export async function generateFreshQuestions(
  moduleTitle: string,
  sourceText: string,
  images: string[],
  excluded: string[],
  count: number,
): Promise<DiagnosticQuestion[]> {
  const systemPrompt = `You are a quiz generator. Create ${count} fresh diagnostic questions from the given study material.

Rules:
- Each question must have "id" (unique), "question" (string), "options" (array of 4 strings), "correctIndex" (0-3), "explanation" (detailed), "hint" (Socratic prompt), "questionType" ("mcq" | "true-false" | "fill-in").
- NEVER repeat or rephrase questions from the excluded list.
- Vary question types (mix mcq, true-false, fill-in).
- Return ONLY valid JSON with a key "questions" containing the array.`;

  const excludeText = excluded.length
    ? `\n\nDO NOT include any questions similar to these:\n${excluded.join('\n')}`
    : '';

  const content = buildImageContent(
    `Module: ${moduleTitle}\n\nNotes:\n${sourceText.slice(0, 15000)}${excludeText}`,
    images,
  );

  const result = await callOpenRouter(
    [{ role: 'user', content }],
    systemPrompt,
  );

  return (result as { questions: DiagnosticQuestion[] }).questions;
}

// ── Tool call: Den content (typed per tool) ──

export async function generateDenContent(
  tool: DenToolKey,
  moduleTitle: string,
  sourceText: string,
  images: string[],
): Promise<any> {
  const prompts: Record<DenToolKey, string> = {
    'audio-overview': `Generate an audio overview script for "${moduleTitle}" as JSON with key "sections": [{ "heading": string, "text": string }]. Each section text should be 2-4 sentences suitable for speech synthesis.`,
    mindmap: `Generate a mind map for "${moduleTitle}" as JSON with keys: "centralTopic" (string), "branches": [{ "label": string, "children": [{ "label": string, "meaning": string }] }]. Aim for 4-6 branches, 2-4 children each.`,
    presentation: `Generate a slide deck for "${moduleTitle}" as JSON with key "slides": [{ "title": string, "bullets": string[], "note"?: string }]. Aim for 5-8 slides.`,
    'recall-cards': `Generate flashcard-style recall cards for "${moduleTitle}" as JSON with key "cards": [{ "term": string, "definition": string }]. Aim for 8-15 cards covering key terms.`,
    'visual-breakdown': `Generate a visual breakdown/infographic for "${moduleTitle}" as JSON with keys: "stats": [{ "label": string, "value": string }], "timeline": [{ "period": string, "event": string }], "sections": [{ "heading": string, "body": string }], "funFact": string.`,
    'study-report': `Generate a comprehensive study report for "${moduleTitle}" as JSON with keys: "objective": [{ "question": string, "answer": string }] (20 items), "subjective": [{ "question": string, "answer": string }] (5 items), "glossary": [{ "term": string, "definition": string }] (25 items).`,
  };

  const systemPrompt = prompts[tool] + '\n\nReturn ONLY valid JSON, no markdown.';
  const content = buildImageContent(
    `Module: ${moduleTitle}\n\nNotes:\n${sourceText.slice(0, 15000)}`,
    images,
  );

  const result = await callOpenRouter(
    [{ role: 'user', content }],
    systemPrompt,
  );

  return result;
}

// ── Streaming text generation (Explain, Summarize, Brainstorm) ──

export async function* generateStreamingText(
  action: 'explain' | 'summarize' | 'brainstorm',
  moduleTitle: string,
  sourceText: string,
): AsyncGenerator<string> {
  const prompts: Record<string, string> = {
    explain: `You are a brilliant tutor. Explain the following study material ("${moduleTitle}") in clear, intuitive terms. Use analogies, break down complex ideas, and connect concepts. Be thorough but engaging.`,
    summarize: `You are a summarization expert. Produce a concise, well-structured summary of "${moduleTitle}". Include key points, important definitions, and the overall takeaway. Use bullet points for clarity.`,
    brainstorm: `You are a creative thinking partner. Based on the following material ("${moduleTitle}"), brainstorm related ideas, connections to other fields, thought-provoking questions, and possible research or project directions. Be creative and wide-ranging.`,
  };

  const systemPrompt = prompts[action] ?? prompts.explain;
  const snippet = sourceText.slice(0, 12000);

  yield* streamOpenRouter(
    [{ role: 'user', content: `Here is my study material:\n\n${snippet}` }],
    systemPrompt,
  );
}

// ── Tutor chat ──

export async function* generateTutorResponse(
  moduleTitle: string,
  sourceText: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string,
): AsyncGenerator<string> {
  const systemPrompt = `You are a patient, expert tutor for the module "${moduleTitle}". Help the student understand the material deeply. Use the Socratic method — ask guiding questions rather than giving direct answers when appropriate. Be encouraging and thorough.`;

  const snippet = sourceText.slice(0, 12000);
  const messages = [
    { role: 'user' as const, content: `Here is my study material:\n\n${snippet}` },
    { role: 'assistant' as const, content: 'I have reviewed the material. I am ready to help you learn. What would you like to explore?' },
    ...history.slice(-10), // keep last 10 messages for context
    { role: 'user' as const, content: userMessage },
  ];

  yield* streamOpenRouter(messages, systemPrompt);
}