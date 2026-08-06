import { DashboardData } from '../types';
import { OPENROUTER_ENDPOINT, OPENROUTER_MODEL, OPENROUTER_MAX_TOKENS, OPENROUTER_TEMPERATURE, APP_URL, APP_TITLE } from '../constants';
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

export async function generateDashboard(
  apiKey: string,
  textContent: string,
  images: string[] = []
): Promise<DashboardData> {
  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  // Build content parts — text first, then images
  const userContent: any[] = [
    {
      type: 'text',
      text: `Transform these study notes into a structured learning dashboard:\n\n${textContent}`,
    },
  ];

  // Add images as data URIs (only if we have them)
  for (const imageData of images.slice(0, 10)) {
    if (imageData.startsWith('data:')) {
      userContent.push({
        type: 'image_url',
        image_url: { url: imageData, detail: 'low' },
      });
    }
  }

  messages.push({ role: 'user', content: userContent });

  let response: Response;
  try {
    response = await fetchWithRetry(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': APP_URL,
        'X-OpenRouter-Title': APP_TITLE,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        max_tokens: OPENROUTER_MAX_TOKENS,
        temperature: OPENROUTER_TEMPERATURE,
        response_format: { type: 'json_object' },
      }),
    });
  } catch (err: any) {
    const errBody: string = err.responseBody || '';
    let errorMessage = err.message || 'Request failed';

    if (err.message?.includes('401')) {
      errorMessage = 'Invalid API key. Please check your OpenRouter key and try again.';
    } else if (err.message?.includes('402')) {
      errorMessage = 'Insufficient credits on your OpenRouter account. Please top up.';
    } else if (err.message?.includes('429')) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (err.message?.includes('503') || err.message?.includes('502')) {
      errorMessage = 'OpenRouter is temporarily busy. Please try again in a few seconds.';
    } else if (/too many connections|maxconnectionserror/i.test(err.message)) {
      errorMessage = 'OpenRouter connection limit reached. Waiting a moment before retrying...';
    }

    try {
      const parsed = JSON.parse(errBody);
      if (parsed.error?.message) {
        errorMessage += `: ${parsed.error.message}`;
      }
    } catch {}

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('No valid response from OpenRouter. Please try again.');
  }

  const rawContent = data.choices[0].message.content;

  try {
    const parsed = JSON.parse(rawContent);
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
  // Limit seen questions to keep prompt short
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
Make each question distinct, testing different aspects of the material.`;

  let response: Response;
  try {
    response = await fetchWithRetry(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': APP_URL,
        'X-OpenRouter-Title': APP_TITLE,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });
  } catch (err: any) {
    if (err.message?.includes('402')) {
      throw new Error('Insufficient OpenRouter credits. Please top up.');
    }
    if (err.message?.includes('401')) {
      throw new Error('Invalid API key. Please check your OpenRouter key.');
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
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Empty response from OpenRouter');
  }

  const parsed = JSON.parse(data.choices[0].message.content);
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

  const response = await fetchWithRetry(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': APP_URL,
      'X-OpenRouter-Title': APP_TITLE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemMsg },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}