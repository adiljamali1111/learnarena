import { getApiKey } from './store';

export const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
export const DEFAULT_MODEL = 'openai/gpt-4o-mini';

export const TUTOR_SYSTEM_PROMPT =
  'You are a helpful tutor. Base your answers only on the provided text. Do not use external knowledge.';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterOptions {
  model?: string;
  response_format?: { type: 'json_object' };
}

interface OpenRouterResponse {
  id: string;
  choices: {
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

function getAuthHeaders() {
  const key = getApiKey();
  if (!key) throw new Error('OpenRouter API key not found. Please add your key.');
  return {
    Authorization: `Bearer ${key}`,
    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
    'X-OpenRouter-Title': 'LearnArena',
    'Content-Type': 'application/json',
  };
}

/**
 * Non-streaming call to OpenRouter. Returns the full response as a parsed object.
 */
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  options?: OpenRouterOptions,
): Promise<OpenRouterResponse> {
  const headers = getAuthHeaders();
  const body = JSON.stringify({
    model: options?.model ?? DEFAULT_MODEL,
    messages,
    response_format: options?.response_format,
  });

  const res = await fetch(OPENROUTER_ENDPOINT, { method: 'POST', headers, body });

  if (!res.ok) {
    let errorMessage = `OpenRouter error ${res.status}`;
    try {
      const errBody = await res.json();
      errorMessage = errBody?.error?.message ?? errBody?.message ?? errorMessage;
    } catch {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Streaming call to OpenRouter. Calls `onChunk(text)` for each content token
 * as it arrives via SSE. Resolves when the stream ends or rejects on error.
 */
export async function streamOpenRouter(
  messages: OpenRouterMessage[],
  onChunk: (text: string) => void,
  options?: OpenRouterOptions,
): Promise<void> {
  const headers = getAuthHeaders();
  const body = JSON.stringify({
    model: options?.model ?? DEFAULT_MODEL,
    messages,
    stream: true,
  });

  const res = await fetch(OPENROUTER_ENDPOINT, { method: 'POST', headers, body });

  if (!res.ok) {
    let errorMessage = `OpenRouter error ${res.status}`;
    try {
      const errBody = await res.json();
      errorMessage = errBody?.error?.message ?? errBody?.message ?? errorMessage;
    } catch {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('ReadableStream not supported');

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
        const json = JSON.parse(trimmed.slice(6));
        const delta = json?.choices?.[0]?.delta?.content;
        if (delta) onChunk(delta);
      } catch {
        // Skip malformed lines
      }
    }
  }
}