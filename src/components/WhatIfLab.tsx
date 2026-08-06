import { useState, useCallback } from 'react';
import { Send, Sparkles, FlaskConical } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { generateChatResponse } from '../services/aiService';

export default function WhatIfLab() {
  const { state } = useDashboard();
  const scenarios = state.dashboard?.scenarios || [];
  const moduleTitle = state.dashboard?.moduleTitle || '';
  const synthesisSummary = state.dashboard?.synthesis.summary || '';
  const [activeScenario, setActiveScenario] = useState(0);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scenario = scenarios[activeScenario];

  const startScenario = useCallback(() => {
    if (!scenario) return;
    setMessages([
      {
        role: 'assistant',
        content: `**${scenario.title}**\n\n${scenario.description}\n\n*How would you approach this? Try to work through it step by step, and I'll help you along the way.*`,
      },
    ]);
  }, [scenario]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || !state.apiKey) return;

    const userMsg = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(
        state.apiProvider,
        state.apiKey,
        moduleTitle,
        synthesisSummary,
        [...messages, userMsg]
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, state.apiKey, state.apiProvider, messages, moduleTitle, synthesisSummary]);

  if (!state.dashboard || scenarios.length === 0) {
    return (
      <div className="dark-glass rounded-xl p-6 text-center max-w-lg mx-auto">
        <div className="text-4xl mb-4">🧪</div>
        <p className="text-text-secondary">No scenarios available. Generate a module first.</p>
      </div>
    );
  }

  return (
    <div className="dark-glass rounded-xl p-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <FlaskConical size={20} className="text-success" />
        <h2 className="font-heading text-base tracking-wider text-text-primary">What-If Lab</h2>
      </div>

      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setActiveScenario(i); setMessages([]); }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-heading tracking-wider transition-all
              ${activeScenario === i
                ? 'bg-success/20 text-success border border-success/30'
                : 'text-text-muted bg-bg-card-hover border border-transparent'
              }`}
          >
            {s.difficulty === 'beginner' ? '🟢' : s.difficulty === 'intermediate' ? '🟡' : '🔴'} {s.title}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 min-h-[200px] max-h-[350px] overflow-y-auto mb-3 space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted text-sm mb-3">Select a scenario and start practicing</p>
            <button onClick={startScenario} className="glass-button px-4 py-2 text-sm">
              <Sparkles size={14} className="inline mr-1" /> Start Scenario
            </button>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-bg-elevated text-text-secondary'
                  : 'bg-primary/10 text-text-primary ml-6'
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-text-muted text-sm p-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      {messages.length > 0 && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your approach..."
            className="glass-input flex-1 px-3 py-2 text-sm"
            disabled={isLoading}
          />
          <button onClick={sendMessage} disabled={isLoading || !input.trim()} className="glass-button px-3 py-2">
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  );
}