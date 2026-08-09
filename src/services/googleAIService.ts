import { DashboardData } from '../types';
import { GOOGLE_AI_ENDPOINT, GOOGLE_AI_MAX_TOKENS, GOOGLE_AI_TEMPERATURE } from '../constants';
import { fetchWithRetry } from './retryFetch';

const SYSTEM_PROMPT = `You are a study assistant that transforms raw lecture notes into structured learning material. Analyze the provided notes (text and images) and return a JSON object with this exact schema:

{
  "moduleTitle": "Short module name",
  "moduleEmoji": "One emoji representing the topic",
  "globalDifficulty": "beginner|intermediate|advanced|expert",
  "synthesis": {
    "summary": "2-3 paragraph comprehensive summary of the module",
    "audioTabs": [
      { "title": "Overview", "content": "~200 word spoken-style overview paragraph" },
      { "title": "Deep Dive", "content": "~200 word detailed explanation" },
      { "title": "Key Takeaways", "content": "~150 word bullet-point-friendly summary" }
    ]
  },
  "coreConcepts": [
    {
      "id": "cc-1",
      "term": "Concept Name",
      "definition": "Clear, concise definition",
      "emoji": "relevant emoji",
      "difficulty": "easy|medium|hard"
    }
  ],
  "contextGraph": [
    {
      "id": "node-1",
      "label": "Concept Label",
      "description": "Brief description",
      "group": 0,
      "connections": ["node-2", "node-3"]
    }
  ],
  "scenarios": [
    {
      "id": "sc-1",
      "title": "Scenario Title",
      "description": "Real-world application scenario",
      "difficulty": "beginner|intermediate|advanced",
      "exampleResponse": "A model answer or approach to this scenario"
    }
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "Multiple choice question",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct",
      "topic": "Topic name"
    }
  ],
  "xpAwarded": 50
}

Requirements:
- Generate 8-12 coreConcepts with increasing difficulty
- Generate 5-7 contextGraph nodes with meaningful connections
- Generate 3-4 scenarios for application practice
- Generate 8-12 quiz questions testing different levels of understanding
- Make all content directly based on the provided notes
- Use clear, student-friendly language
- For images: analyze any provided diagrams or figures and incorporate their content into the concepts and context`;

/**
 * Strip the data:image/...;base64, prefix from a data URI for Gemini's inline_data.
 */
function stripBase64Prefix(dataUri: string): { mimeType: string; data: string } {
  const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  // Fallback: assume png
  return { mimeType: 'image/png', data: dataUri.replace(/^data:image\/\w+;base64,/, '') };
}

/**
 * Some Gemini models wrap JSON in markdown code fences — extract the real JSON payload.
 */
function extractJson(rawText: string): string {
  const trimmed = rawText.trim();
  const codeFenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  return codeFenceMatch ? codeFenceMatch[1].trim() : trimmed;
}

/**
 * Build a Gemini API URL including the API key as a query parameter.
 */
function buildUrl(apiKey: string): string {
  return `${GOOGLE_AI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`;
}

export async function generateDashboard(
  apiKey: string,
  textContent: string,
  images: string[] = []
): Promise<DashboardData> {
  const userParts: any[] = [
    { text: `Transform these study notes into a structured learning dashboard:\n\n${textContent}` },
  ];

  // Add images as inline_data
  for (const imageData of images.slice(0, 10)) {
    if (imageData.startsWith('data:')) {
      const { mimeType, data } = stripBase64Prefix(imageData);
      userParts.push({
        inline_data: { mime_type: mimeType, data },
      });
    }
  }

  const body: any = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        parts: userParts,
        role: 'user',
      },
    ],
    generationConfig: {
      temperature: GOOGLE_AI_TEMPERATURE,
      maxOutputTokens: GOOGLE_AI_MAX_TOKENS,
      responseMimeType: 'application/json',
    },
  };

  let response: Response;
  try {
    response = await fetchWithRetry(buildUrl(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    // If it's an API error that fetchWithRetry threw after exhausting retries,
    // it will have a responseBody property with the error details.
    const errBody: string = err.responseBody || '';
    let errorMessage = err.message || 'Request failed';

    if (err.message?.startsWith('API Error (400)')) {
      errorMessage = 'Invalid request. The content may be too large or unsupported.';
    } else if (err.message?.startsWith('API Error (403)')) {
      errorMessage = 'Invalid API key. Please check your Google AI Studio key and try again.';
    } else if (err.message?.includes('429')) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (err.message?.includes('503') || err.message?.includes('502')) {
      errorMessage = 'Google AI is temporarily busy. Please try again in a few seconds.';
    } else if (/too many connections|maxconnectionserror/i.test(err.message)) {
      errorMessage = 'Google AI connection limit reached. Waiting a moment before retrying...';
    }

    // Include API error details from body
    try {
      const parsed = JSON.parse(errBody);
      if (parsed.error?.message) {
        errorMessage += `: ${parsed.error.message}`;
      }
    } catch {}

    throw new Error(errorMessage);
  }

  const data = await response.json();

  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error('No valid response from Google AI. Please try again.');
  }

  try {
    const jsonText = extractJson(candidateText);
    const parsed = JSON.parse(jsonText);
    return parsed as DashboardData;
  } catch {
    throw new Error('Failed to parse the structured response. Please try again.');
  }
}

export async function generateDuelQuestions(
  apiKey: string,
  moduleTitle: string,
  synthesisSummary: string,
  coreConcepts: string,
  seenQuestions: string[],
  totalQuestions: number = 10
): Promise<Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>> {
  const recentSeen = seenQuestions.slice(-20);

  const prompt = `Generate ${totalQuestions} challenging multiple-choice questions for the module "${moduleTitle}".

Module Context:
${synthesisSummary.slice(0, 1500)}

Key Concepts:
${coreConcepts.slice(0, 2000)}

Seen Questions (DO NOT repeat any of these):
${recentSeen.join('\n')}

Return a JSON object with a "questions" key containing an array of exactly ${totalQuestions} question objects.
Each question object must have: { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..." }
Make each question distinct, testing different aspects of the material.
Only return valid JSON, no other text.`;

  const body = {
    contents: [{ parts: [{ text: prompt }], role: 'user' }],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };

  let response: Response;
  try {
    response = await fetchWithRetry(buildUrl(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    if (err.message?.includes('403')) {
      throw new Error('Invalid API key. Please check your Google AI Studio key.');
    }
    const errBody = err.responseBody || '';
    let msg = err.message || 'API request failed';
    try {
      const parsed = JSON.parse(errBody);
      if (parsed.error?.message) msg += `: ${parsed.error.message}`;
    } catch {}
    throw new Error(msg);
  }

  const data = await response.json();
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!candidateText) {
    throw new Error('Empty response from Google AI');
  }

  let parsed: any;
  try {
    const jsonText = extractJson(candidateText);
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Failed to parse duel questions response');
  }
  const questions = parsed.questions || [];

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('No questions in the response');
  }

  const valid = questions.every(
    (q: any) => q.question && Array.isArray(q.options) && q.options.length >= 2 && typeof q.correctIndex === 'number'
  );
  if (!valid) {
    throw new Error('Response contained malformed questions');
  }

  return questions.slice(0, totalQuestions);
}

export async function generateChatResponse(
  apiKey: string,
  moduleTitle: string,
  synthesisSummary: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const systemMsg = `You are a helpful study tutor for the module "${moduleTitle}". 
Module summary: ${synthesisSummary}

Answer questions clearly and concisely. Be encouraging and help the student understand the material.`;

  // Convert chat messages to Gemini contents format
  const contents = messages.map((m) => ({
    parts: [{ text: m.content }],
    role: m.role === 'assistant' ? 'model' : 'user',
  }));

  const body = {
    systemInstruction: { parts: [{ text: systemMsg }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetchWithRetry(buildUrl(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}
