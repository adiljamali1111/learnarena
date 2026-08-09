import { useState, useCallback } from 'react';
import { ClipboardCheck, ChevronRight, HelpCircle, Zap, RefreshCw } from 'lucide-react';
import type { DiagnosticQuestion } from '../../types/dashboard';
import { markQuestionSeen } from '../../services/questionBank';

interface Props {
  data: DiagnosticQuestion[];
  moduleId: string;
  onXpGained?: (amount: number) => void;
  onRefresh?: () => Promise<void>;
}

export default function DiagnosticQuestCard({ data, moduleId, onXpGained, onRefresh }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  const current = data[index];
  if (!current) return null;

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (isRevealed) return;
      setSelected(optionIndex);
      setIsRevealed(true);

      const isCorrect = optionIndex === current.correctIndex;
      setResults((prev) => ({ ...prev, [current.id]: isCorrect }));
      markQuestionSeen(current.id, moduleId);

      if (isCorrect && onXpGained) {
        const xp = current.difficulty === 'hard' ? 30 : current.difficulty === 'medium' ? 20 : 10;
        onXpGained(xp);
      }
    },
    [isRevealed, current, moduleId, onXpGained],
  );

  const handleNext = () => {
    if (index < data.length - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setIsRevealed(false);
      setShowHint(false);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    setIndex(0);
    setSelected(null);
    setIsRevealed(false);
    setShowHint(false);
    setResults({});
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const correctCount = Object.values(results).filter(Boolean).length;
  const isLast = index === data.length - 1;

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-success/20 flex items-center justify-center shrink-0 shadow-glow-purple-sm">
          <ClipboardCheck size={16} className="text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-base">Diagnostic Quest</h3>
          <p className="text-[11px] text-muted-lighter">
            {index + 1} of {data.length}
            {Object.keys(results).length > 0 && (
              <span className="ml-2">
                • {correctCount}/{Object.keys(results).length} correct
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-accent/20 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
              title="Generate new questions"
            >
              <RefreshCw
                size={13}
                className={`text-accent ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-muted capitalize">
            {current.difficulty || 'medium'}
          </span>
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-foreground mb-3 leading-relaxed">
        {current.question}
      </p>

      {/* Options — 2-column grid so they read like flashcards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {current.options.map((option, i) => {
          let borderClass = 'border-glass-border hover:border-accent/40';
          let bgClass = '';
          let ringClass = '';

          if (isRevealed) {
            if (i === current.correctIndex) {
              borderClass = 'border-success';
              bgClass = 'bg-success/10';
              ringClass = 'ring-1 ring-success/30';
            } else if (i === selected) {
              borderClass = 'border-destructive';
              bgClass = 'bg-destructive/10';
              ringClass = 'ring-1 ring-destructive/30';
            }
          } else if (i === selected) {
            borderClass = 'border-accent';
            bgClass = 'bg-accent/10';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isRevealed}
              className={`text-left px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer disabled:cursor-default ${borderClass} ${bgClass} ${ringClass}`}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-[11px] text-muted-lighter w-4 shrink-0 mt-0.5 font-mono">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="text-sm text-foreground/80 leading-snug">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint / Explanation */}
      {isRevealed && selected !== current.correctIndex && !showHint && (
        <button
          onClick={() => setShowHint(true)}
          className="mt-3 flex items-center gap-1.5 text-xs text-warning hover:text-warning/80 transition-colors cursor-pointer"
        >
          <HelpCircle size={13} />
          Show explanation
        </button>
      )}

      {showHint && (
        <div className="mt-3 p-3 rounded-xl bg-accent/5 border border-accent/20 animate-fade-in-up text-sm leading-relaxed">
          <p className="text-xs text-muted-lighter mb-1 font-semibold">Explanation</p>
          <p className="text-foreground/80">{current.explanation}</p>
          {current.distractorsExplanation && (
            <>
              <p className="text-xs text-muted-lighter mt-2 mb-1 font-semibold">Distractors</p>
              <p className="text-muted">{current.distractorsExplanation}</p>
            </>
          )}
        </div>
      )}

      {/* Footer — progress dots + next */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-glass-border">
        <div className="flex gap-1">
          {data.map((q) => (
            <div
              key={q.id}
              className={`w-2 h-2 rounded-full transition-colors ${
                results[q.id] === undefined
                  ? 'bg-white/20'
                  : results[q.id]
                    ? 'bg-success'
                    : 'bg-destructive'
              }`}
            />
          ))}
        </div>

        {isRevealed && !isLast && (
          <button
            onClick={handleNext}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer"
          >
            Next <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* Score summary */}
      {isRevealed && isLast && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gold">
          <Zap size={13} />
          <span>
            {correctCount}/{data.length} correct —{' '}
            {correctCount === data.length
              ? 'Perfect score! 🎉'
              : correctCount >= data.length * 0.7
                ? 'Great job!'
                : 'Keep practicing!'}
          </span>
        </div>
      )}
    </div>
  );
}