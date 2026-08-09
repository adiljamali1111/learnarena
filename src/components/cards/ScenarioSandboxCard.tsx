import { useState, useRef } from 'react';
import { FlaskConical, Eye, EyeOff, PenLine, RefreshCw } from 'lucide-react';
import type { Scenario } from '../../types/dashboard';

interface Props {
  data: Scenario;
  onRefresh?: () => Promise<void>;
}

export default function ScenarioSandboxCard({ data, onRefresh }: Props) {
  const [answer, setAnswer] = useState('');
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const correctOption = data.options.find((o) => o.isCorrect);

  const handleReveal = () => {
    setShowModelAnswer((prev) => !prev);
  };

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    setAnswer('');
    setShowModelAnswer(false);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-warning/20 flex items-center justify-center">
          <FlaskConical size={18} className="text-warning" />
        </div>
        <h3 className="font-heading font-semibold text-lg flex-1">Scenario Sandbox</h3>

        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-warning/20 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shrink-0"
            title="Generate new scenario"
            aria-label="Generate new scenario"
          >
            <RefreshCw
              size={14}
              className={`text-warning ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Scenario */}
      <h4 className="text-sm font-semibold text-glow-cyan mb-2 break-words">{data.title}</h4>
      <p className="text-sm text-muted leading-relaxed mb-4 break-words">{data.context}</p>

      {/* Your answer */}
      <label className="text-xs text-muted-lighter font-medium mb-1.5 flex items-center gap-1.5">
        <PenLine size={12} />
        Your response
      </label>
      <textarea
        ref={textareaRef}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your detailed answer here... Apply what you've learned to explain how you'd approach this situation."
        className="w-full min-h-[140px] px-4 py-3 rounded-xl bg-white/5 border border-glass-border text-foreground placeholder-muted-lighter text-sm focus:outline-none focus:border-accent transition-colors resize-none flex-1"
      />

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4 shrink-0">
        <span className="text-[10px] text-muted-lighter">
          {answer.length > 0
            ? `${answer.length} characters`
            : 'Write your answer then compare with a model response'}
        </span>

        <button
          onClick={handleReveal}
          disabled={!correctOption}
          className="btn-base ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {showModelAnswer ? (
            <>
              <EyeOff size={14} /> Hide Model Answer
            </>
          ) : (
            <>
              <Eye size={14} /> Show Model Answer
            </>
          )}
        </button>
      </div>

      {/* Model answer */}
      {showModelAnswer && correctOption && (
        <div className="mt-4 glass-card p-4 bg-accent/5 border border-accent/20 rounded-xl animate-fade-in-up shrink-0">
          <p className="text-xs text-accent font-semibold mb-1.5">Model Answer</p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {correctOption.explanation}
          </p>
        </div>
      )}

      {/* Reset */}
      {answer.length > 0 && (
        <button
          onClick={() => {
            setAnswer('');
            setShowModelAnswer(false);
            textareaRef.current?.focus();
          }}
          className="mt-3 text-[10px] text-muted hover:text-foreground transition-colors self-start cursor-pointer shrink-0"
        >
          Clear response
        </button>
      )}
    </div>
  );
}