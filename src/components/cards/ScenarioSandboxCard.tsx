import { useState } from 'react';
import { FlaskConical, CheckCircle2, XCircle } from 'lucide-react';
import type { Scenario } from '../../types/dashboard';

interface Props {
  data: Scenario;
  onComplete?: (correct: boolean) => void;
}

export default function ScenarioSandboxCard({ data, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleSelect = (optionId: string) => {
    if (isRevealed) return;
    setSelected(optionId);
    setIsRevealed(true);

    const option = data.options.find((o) => o.id === optionId);
    if (option && onComplete) {
      onComplete(option.isCorrect);
    }
  };

  const handleReset = () => {
    setSelected(null);
    setIsRevealed(false);
  };

  const selectedOption = data.options.find((o) => o.id === selected);

  return (
    <div className="glass-card p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-warning/20 flex items-center justify-center">
          <FlaskConical size={18} className="text-warning" />
        </div>
        <h3 className="font-heading font-semibold text-lg">Scenario Sandbox</h3>
      </div>

      <h4 className="text-sm font-semibold text-glow-cyan mb-2">{data.title}</h4>
      <p className="text-sm text-muted leading-relaxed mb-4">{data.context}</p>

      <div className="flex-1 space-y-2">
        {data.options.map((option) => {
          const isSelected = selected === option.id;
          const isCorrectOption = option.isCorrect;
          let borderClass = 'border-glass-border hover:border-accent/40';

          if (isRevealed && isSelected) {
            borderClass = isCorrectOption
              ? 'border-success bg-success/10'
              : 'border-destructive bg-destructive/10';
          } else if (isRevealed && isCorrectOption) {
            borderClass = 'border-success/40 bg-success/5';
          } else if (isSelected) {
            borderClass = 'border-accent bg-accent/10';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={isRevealed}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer disabled:cursor-default ${borderClass}`}
            >
              <div className="flex items-start gap-2">
                {isRevealed && isCorrectOption && (
                  <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" />
                )}
                {isRevealed && isSelected && !isCorrectOption && (
                  <XCircle size={16} className="text-destructive mt-0.5 shrink-0" />
                )}
                <span className="text-sm text-foreground/80">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {isRevealed && selectedOption && (
        <div className="mt-4 glass-card p-3 bg-accent/5 border-accent/20 animate-fade-in-up">
          <p className="text-xs text-muted-lighter mb-1">Explanation</p>
          <p className="text-sm text-foreground/80">{selectedOption.explanation}</p>
        </div>
      )}

      {/* Retry */}
      {isRevealed && (
        <button
          onClick={handleReset}
          className="mt-4 text-xs text-accent hover:text-accent/80 transition-colors self-start cursor-pointer"
        >
          Try again →
        </button>
      )}
    </div>
  );
}