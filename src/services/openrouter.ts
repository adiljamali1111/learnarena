import type {
  DashboardData,
  DiagnosticQuestion,
  DuelQuestion,
} from '../types/dashboard';

const API_BASE = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-4o-mini';
const APP_TITLE = 'LearnArena';

export class OpenRouterError extends Error {
  statusCode: number;
  code: string;
  constructor(
    message: string,
    statusCode: number,
    code: string,
  ) {
    super(message);
    this.name = 'OpenRouterError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function getAuthHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-OpenRouter-Title': APP_TITLE,
  };
}

async function apiCall<T>(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
  imageDataUrls?: string[],
): Promise<T> {
  const messages: { role: string; content: unknown }[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (imageDataUrls && imageDataUrls.length > 0) {
    const content: { type: string; text?: string; image_url?: { url: string } }[] = [];
    content.push({ type: 'text', text: userMessage });
    for (const dataUrl of imageDataUrls) {
      content.push({ type: 'image_url', image_url: { url: dataUrl } });
    }
    messages.push({ role: 'user', content });
  } else {
    messages.push({ role: 'user', content: userMessage });
  }

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: getAuthHeaders(apiKey),
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const codeMap: Record<number, string> = {
      401: 'invalid_key',
      402: 'insufficient_credits',
      429: 'rate_limited',
    };
    const code = codeMap[response.status] || 'server_error';
    const text = await response.text().catch(() => 'Unknown error');
    throw new OpenRouterError(
      `${response.status}: ${text}`,
      response.status,
      code,
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new OpenRouterError(
      'Empty response from OpenRouter',
      200,
      'empty_response',
    );
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new OpenRouterError(
      'Failed to parse LLM response as JSON',
      200,
      'malformed_json',
    );
  }
}

/* ===========================
   System Prompts
   =========================== */

const DASHBOARD_SYSTEM_PROMPT = `You are an expert study assistant. Given raw course notes (and optionally images), generate a comprehensive structured dashboard in JSON. Follow this exact schema:

{
  "moduleTitle": "string — concise title for this module",
  "moduleSynthesis": {
    "summary": "string — 3-4 sentence overview",
    "keyTakeaways": ["string — 5-8 bullet points"]
  },
  "coreConcepts": [
    {
      "id": "string — unique id",
      "term": "string — concept name",
      "definition": "string — clear definition",
      "analogy": "string — memorable analogy",
      "xp": "number — 10-50 XP value"
    }
  ],
  "contextMap": {
    "topic": "string — overall topic",
    "nodes": [
      {
        "id": "string",
        "label": "string",
        "description": "string",
        "category": "root|concept|subtopic|example|related",
        "importance": "number 1-5"
      }
    ],
    "edges": [
      {
        "source": "string — node id",
        "target": "string — node id",
        "label": "string — relationship type"
      }
    ]
  },
  "scenario": {
    "title": "string — scenario title",
    "context": "string — 2-3 sentence case study",
    "options": [
      {
        "id": "string",
        "text": "string — option text",
        "isCorrect": "boolean",
        "explanation": "string — why this is right/wrong"
      }
    ]
  },
  "diagnosticQuestions": [
    {
      "id": "string — unique id",
      "question": "string — MCQ question",
      "options": ["string — 4 options"],
      "correctIndex": "number — 0-3",
      "explanation": "string — full explanation",
      "topic": "string — topic tag",
      "difficulty": "easy|medium|hard"
    }
  ],
  "masteryProgress": {
    "totalXp": "number — total XP from this module (sum of concept XPs + 50 per diagnostic Q)",
    "level": "number — 1",
    "streak": "number — 0",
    "conceptsMastered": "number — count of coreConcepts",
    "quizzesPassed": "number — 0"
  }
}

Generate 5-8 core concepts, 8-12 context nodes with edges, exactly 1 scenario with 4 options (one correct), and exactly 6-8 diagnostic questions. Ensure all IDs are unique. Make the content educational and accurate based on the notes provided.`;

const DIAGNOSTIC_QUESTIONS_SYSTEM_PROMPT = `You are a diagnostic quiz generator. Given study notes, generate fresh multiple-choice questions to test understanding. Return exactly this JSON structure:

{
  "questions": [
    {
      "id": "string — unique id",
      "question": "string — MCQ question",
      "options": ["string — 4 options"],
      "correctIndex": "number — 0-3",
      "explanation": "string — full explanation of the correct answer",
      "distractorsExplanation": "string — explain why wrong answers are incorrect",
      "topic": "string — topic tag",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Generate exactly 6 diagnostic questions. Each must be unique and test different aspects of the notes. Do NOT repeat any questions that may have been generated previously. Make them increasingly difficult — first two easy, middle two medium, last two hard.`;

const DUEL_QUESTIONS_SYSTEM_PROMPT = `You are a quiz generator. Given study notes, generate unique multiple-choice questions for a timed duel game. Return exactly this JSON structure:

{
  "questions": [
    {
      "id": "string — unique id",
      "question": "string — question text",
      "options": ["string — 4 options"],
      "correctIndex": "number — 0-3",
      "explanation": "string — brief explanation",
      "distractorsExplanation": "string — explain why wrong answers are incorrect"
    }
  ]
}

Generate exactly 12 questions. Each question must test a different concept from the notes. Do NOT repeat questions from the dashboard's diagnosticQuestions. Make them increasingly difficult.`;

const DEN_CONTENT_SYSTEM_PROMPTS: Record<string, string> = {
  audio:
    'You are a scriptwriter. Given study notes, generate an audio overview script as JSON:\n{\n  "script": "string — full narrative script (~500 words)",\n  "segments": [\n    { "heading": "string — section heading", "text": "string — section text" }\n  ]\n}\n\nGenerate 4-6 segments with a comprehensive script.',
  mindmap:
    'You are a mind map designer. Given study notes, generate a mind map as JSON:\n{\n  "centralTopic": "string — central topic",\n  "branches": [\n    { "label": "string — branch name", "children": ["string — child concept 1", "string — child concept 2"] }\n  ]\n}\n\nGenerate 4-6 branches, each with 2-4 children.',
  presentation:
    'You are a slide deck creator. Given study notes, generate slide content as JSON:\n{\n  "slides": [\n    {\n      "title": "string — slide title",\n      "content": "string — 2-3 sentence explanation",\n      "bulletPoints": ["string — 3-5 bullet points"]\n    }\n  ]\n}\n\nGenerate 5-8 slides covering the key concepts.',
  recall:
    'You are a flashcard creator. Given study notes, generate recall cards as JSON:\n{\n  "cards": [\n    {\n      "front": "string — question or term",\n      "back": "string — answer or definition",\n      "hint": "string — optional hint"\n    }\n  ]\n}\n\nGenerate 8-12 cards. Front should be a question or term, back should be the answer. Include hints for harder cards.',
  visual:
    'You are an infographic designer. Given study notes, generate a visual breakdown as JSON:\n{\n  "title": "string — infographic title",\n  "sections": [\n    {\n      "heading": "string — section title",\n      "icon": "string — single emoji",\n      "items": ["string — 3-5 key points"],\n      "color": "string — hex color like #a855f7"\n    }\n  ]\n}\n\nGenerate 4-6 sections with distinct categories.',
  report:
    'You are a test creator. Given study notes, generate a study report as JSON:\n{\n  "objectiveQuestions": [\n    {\n      "question": "string — MCQ question",\n      "options": ["string — 4 options"],\n      "correctIndex": "number — 0-3"\n    }\n  ],\n  "subjectiveQuestions": [\n    {\n      "question": "string — open-ended question",\n      "sampleAnswer": "string — model answer"\n    }\n  ],\n  "glossary": [\n    {\n      "term": "string — key term",\n      "definition": "string — definition"\n    }\n  ]\n}\n\nGenerate 20 objective questions, 5 subjective questions, and 25 glossary entries.',
};

/* ===========================
   Public API
   =========================== */

export async function generateDashboard(
  apiKey: string,
  notes: string,
  imageDataUrls?: string[],
): Promise<DashboardData> {
  return apiCall<DashboardData>(
    apiKey,
    DASHBOARD_SYSTEM_PROMPT,
    `Generate a study dashboard from these notes:\n\n${notes}`,
    imageDataUrls,
  );
}

export async function generateDiagnosticQuestions(
  apiKey: string,
  notes: string,
): Promise<DiagnosticQuestion[]> {
  const result = await apiCall<{ questions: DiagnosticQuestion[] }>(
    apiKey,
    DIAGNOSTIC_QUESTIONS_SYSTEM_PROMPT,
    `Generate 6 fresh diagnostic questions from these notes:\n\n${notes}`,
  );
  return result.questions || [];
}

export async function generateFreshQuestions(
  apiKey: string,
  notes: string,
): Promise<DuelQuestion[]> {
  const result = await apiCall<{ questions: DuelQuestion[] }>(
    apiKey,
    DUEL_QUESTIONS_SYSTEM_PROMPT,
    `Generate 12 duel questions from these notes:\n\n${notes}`,
  );
  return result.questions || [];
}

export async function generateDenContent<T>(
  apiKey: string,
  toolKey: string,
  notes: string,
): Promise<T> {
  const systemPrompt =
    DEN_CONTENT_SYSTEM_PROMPTS[toolKey] || DEN_CONTENT_SYSTEM_PROMPTS.audio;
  return apiCall<T>(
    apiKey,
    systemPrompt,
    `Generate content for the ${toolKey} tool from these notes:\n\n${notes}`,
  );
}