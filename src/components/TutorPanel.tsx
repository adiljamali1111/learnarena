import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Trash2, User } from 'lucide-react';
import { getApiKey, getTutorHistory, addTutorMessage } from '../store';
import type { Module, Message } from '../types';

interface Props {
  module: Module;
  onClose: () => void;
}

export default function TutorPanel({ module, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => getTutorHistory(module.id));
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    addTutorMessage(module.id, userMsg);

    const key = getApiKey();
    if (!key) { setError('Set your OpenRouter API key first'); return; }

    setStreaming(true);
    setStreamText('');
    setError(null);
    abortRef.current = new AbortController();

    try {
      const historyForApi = updatedMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

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
              content: `You are a patient, expert tutor for the module "${module.title}". Help the student understand the material deeply. Use the Socratic method — ask guiding questions rather than giving direct answers when appropriate. Base ALL answers strictly on the provided study material. Be encouraging and thorough.`,
            },
            { role: 'user', content: `Here is my study material:\n\n${module.content.slice(0, 8000)}` },
            { role: 'assistant', content: 'I have reviewed the material. I am ready to help you learn. What would you like to explore?' },
            ...historyForApi,
          ],
          temperature: 0.7,
          max_tokens: 2048,
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
              setStreamText(fullText);
            }
          } catch { /* skip */ }
        }
      }

      const assistantMsg: Message = { role: 'assistant', content: fullText };
      setMessages((prev) => [...prev, assistantMsg]);
      addTutorMessage(module.id, assistantMsg);
      setStreamText('');
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Chat failed');
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, messages, module]);

  const clearHistory = () => {
    if (messages.length === 0) return;
    setMessages([]);
    // Clear from store
    const modules = JSON.parse(localStorage.getItem('learnarena_modules') || '[]');
    const idx = modules.findIndex((m: any) => m.id === module.id);
    if (idx !== -1) {
      modules[idx].tutorHistory = [];
      localStorage.setItem('learnarena_modules', JSON.stringify(modules));
    }
  };

  return (
    <div className="glass-card p-5 animate-fade-in-up flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-accent" />
          <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Tutor</h3>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs text-muted hover:text-destructive transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
          <button onClick={onClose} className="text-muted hover:text-foreground text-xs transition-colors cursor-pointer">
            Back to content
          </button>
        </div>
      </div>

      {error && (
        <div className="text-destructive text-xs mb-3 p-2 rounded-lg bg-destructive/10 border border-destructive/30 flex-shrink-0">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-3 space-y-3 scrollbar-thin">
        {messages.length === 0 && !streaming && (
          <div className="text-center py-8 text-muted text-xs">
            <Bot className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>Ask a question about your material</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-accent" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-dark-base rounded-tr-sm'
                  : 'bg-dark-elevated/60 border border-border rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
          </div>
        ))}

        {/* Streaming */}
        {streaming && streamText && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed bg-dark-elevated/60 border border-border rounded-tl-sm">
              {streamText}
              <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />
            </div>
          </div>
        )}

        {/* Loading dots when streaming just started */}
        {streaming && !streamText && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-dark-elevated/60 border border-border rounded-tl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask a question..."
          disabled={streaming}
          className="flex-1 bg-dark-base border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-lighter focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || streaming}
          className="w-10 h-10 rounded-xl bg-primary text-dark-base hover:bg-primary-light disabled:opacity-30 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:cursor-default"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}