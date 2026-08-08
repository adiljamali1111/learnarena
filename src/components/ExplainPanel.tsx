import { useState, useRef, useEffect, useCallback } from 'react';
import { Lightbulb, StopCircle } from 'lucide-react';
import { getApiKey, addTutorMessage } from '../store';
import type { Module } from '../types';

interface Props {
  module: Module;
  onClose: () => void;
}

export default function ExplainPanel({ module, onClose }: Props) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const generateExplain = useCallback(async () => {
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
              content: `You are a brilliant tutor. Explain the following study material in clear, intuitive terms. Use analogies, break down complex ideas, and connect concepts. Be thorough but engaging.`,
            },
            { role: 'user', content: `Study material:\n\n${module.content.slice(0, 8000)}` },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Invalid API key');
        if (res.status === 402) throw new Error('Insufficient credits');
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

      addTutorMessage(module.id, { role: 'assistant', content: `Explain: ${fullText}` });
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to generate explanation');
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [module]);

  useEffect(() => {
    generateExplain();
    return () => abortRef.current?.abort();
  }, [generateExplain]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [response]);

  const handleStop = () => {
    abortRef.current?.abort();
  };

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-gold" />
          <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Explain</h3>
        </div>
        <button onClick={onClose} className="text-muted hover:text-foreground text-xs transition-colors cursor-pointer">
          Back to content
        </button>
      </div>

      {error && (
        <div className="text-destructive text-sm mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30">
          {error}
          <button
            onClick={generateExplain}
            className="block mt-2 text-xs text-primary hover:text-primary-light cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      <div
        ref={contentRef}
        className="max-h-96 overflow-y-auto text-sm text-foreground leading-relaxed whitespace-pre-wrap"
      >
        {loading && !response && (
          <div className="flex items-center gap-2 text-muted">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Generating explanation...</span>
          </div>
        )}
        {response}
      </div>

      {loading && response && (
        <button
          onClick={handleStop}
          className="mt-3 flex items-center gap-1.5 text-xs text-muted hover:text-destructive transition-colors cursor-pointer"
        >
          <StopCircle className="w-3.5 h-3.5" /> Stop generating
        </button>
      )}
    </div>
  );
}