import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, StopCircle, Send } from 'lucide-react';
import { getApiKey, addTutorMessage } from '../store';
import type { Module } from '../types';

interface Props {
  module: Module;
  onClose: () => void;
}

export default function BrainstormPanel({ module, onClose }: Props) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [response]);

  const generate = useCallback(async () => {
    if (!prompt.trim()) return;
    const key = getApiKey();
    if (!key) { setError('Set your OpenRouter API key first'); return; }

    setLoading(true);
    setError(null);
    setResponse('');
    abortRef.current = new AbortController();

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        signal: abortRef.current.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'LearnArena',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          stream: true,
          messages: [
            {
              role: 'system',
              content: `You are a creative thinking partner. Based on the given study material ("${module.title}"), brainstorm ideas, connections, thought-provoking questions, and possible project directions related to the user's prompt. Be creative and wide-ranging.`,
            },
            { role: 'user', content: `Study material:\n\n${module.content.slice(0, 8000)}\n\nUser prompt: ${prompt}` },
          ],
          temperature: 0.8,
          max_tokens: 4096,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Invalid API key');
        throw new Error(`Server error (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

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
            if (delta) {
              fullText += delta;
              setResponse(fullText);
            }
          } catch { /* skip */ }
        }
      }

      addTutorMessage(module.id, { role: 'assistant', content: `Brainstorm: ${fullText}` });
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Brainstorm failed');
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [prompt, module]);

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Brainstorm</h3>
        </div>
        <button onClick={onClose} className="text-muted hover:text-foreground text-xs transition-colors cursor-pointer">
          Back to content
        </button>
      </div>

      {error && (
        <div className="text-destructive text-sm mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) generate();
          }}
          placeholder="e.g. Essay topics about X, project ideas..."
          disabled={loading}
          className="flex-1 bg-dark-base border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-lighter focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
        />
        <button
          onClick={generate}
          disabled={!prompt.trim() || loading}
          className="w-10 h-10 rounded-xl bg-primary text-dark-base hover:bg-primary-light disabled:opacity-30 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:cursor-default"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Response */}
      <div
        ref={contentRef}
        className="max-h-80 overflow-y-auto text-sm text-foreground leading-relaxed whitespace-pre-wrap"
      >
        {loading && !response && (
          <div className="flex items-center gap-2 text-muted py-4">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Brainstorming ideas...</span>
          </div>
        )}
        {response}
      </div>

      {loading && response && (
        <button
          onClick={() => abortRef.current?.abort()}
          className="mt-3 flex items-center gap-1.5 text-xs text-muted hover:text-destructive transition-colors cursor-pointer"
        >
          <StopCircle className="w-3.5 h-3.5" /> Stop
        </button>
      )}
    </div>
  );
}