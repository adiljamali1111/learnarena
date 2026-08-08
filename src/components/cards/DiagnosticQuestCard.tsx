import { useState, useCallback } from 'react';
import { ClipboardCheck, ChevronRight, HelpCircle, Zap } from 'lucide-react';
import type { DiagnosticQuestion } from '../../types/dashboard';
import { markQuestionSeen } from '../../services/questionBank';

interface Props {
  data: DiagnosticQuestion[];
  moduleId: string;
  onXpGained?: (amount: number) => void;
}

export default function DiagnosticQuestCard({ data, moduleId, onXpGained }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

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

  const correctCount = Object.values(results).filter(Boolean).length;
  const isLast = index === data.length - 1;

  return (
    <div className="glass-card p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-success/20 flex items-center justify-center">
          <ClipboardCheck size={18} className="text-success" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-lg">Diagnostic Quest</h3>
          <p className="text-xs text-muted-lighter">
            {index + 1} of {data.length}
            {Object.keys(results).length > 0 && (
              <span className="ml-2">
                • {correctCount}/{Object.keys(results).length} correct
              </span>
            )}
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-muted capitalize">
          {current.difficulty || 'medium'}
        </span>
      </div>

      <p className="text-sm font-medium text-foreground mb-4">{current.question}</p>

      {/* Options */}
      <div className="flex-1 space-y-2">
        {current.options.map((option, i) => {
          let borderClass = 'border-glass-border hover:border-accent/40';
          let bgClass = '';

          if (isRevealed) {
            if (i === current.correctIndex) {
              borderClass = 'border-success bg-success/10';
            } else if (i === selected) {
              borderClass = 'border-destructive bg-destructive/10';
            }
          } else if (i === selected) {
            borderClass = 'border-accent bg-accent/10';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isRevealed}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer disabled:cursor-default ${borderClass} ${bgClass}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xs text-muted-lighter w-5 shrink-0 mt-0.5 font-mono">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="text-sm text-foreground/80">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint button */}
      {isRevealed && selected !== current.correctIndex && !showHint && (
        <button
          onClick={() => setShowHint(true)}
          className="mt-3 flex items-center gap-2 text-xs text-warning hover:text-warning/80 transition-colors cursor-pointer"
        >
          <HelpCircle size={14} />
          Show explanation
        </button>
      )}

      {/* Explanation */}
      {showHint && (
        <div className="mt-3 glass-card p-3 bg-accent/5 border-accent/20 animate-fade-in-up">
          <p className="text-xs text-muted-lighter mb-1">Explanation</p>
          <p className="text-sm text-foreground/80">{current.explanation}</p>
          {current.distractorsExplanation && (
            <>
              <p className="text-xs text-muted-lighter mt-2 mb-1">Distractors</p>
              <p className="text-sm text-muted">{current.distractorsExplanation}</p>
            </>
          )}
        </div>
      )}

      {/* Progress dots + Next */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-glass-border">
        <div className="flex gap-1">
          {data.map((q, i) => (
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
            Next <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Score summary */}
      {isRevealed && isLast && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gold">
          <Zap size={14} />
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