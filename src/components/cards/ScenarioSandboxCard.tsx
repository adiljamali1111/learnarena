import { useState } from 'react';
import { Target, RefreshCw } from 'lucide-react';
import type { ScenarioCard } from '../../types/dashboard';

interface Props {
  data: ScenarioCard;
}

export default function ScenarioSandboxCard({ data }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setFeedback({
      correct: id === data.correctId,
      explanation: data.explanation,
    });
  };

  const handleReset = () => {
    setSelectedId(null);
    setFeedback(null);
  };

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" />
          <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Scenario Sandbox</h3>
        </div>
        {feedback && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Try Another
          </button>
        )}
      </div>

      <div className="bg-dark-elevated/60 border border-border rounded-xl p-4 mb-4">
        <p className="text-sm text-foreground leading-relaxed">{data.scenario}</p>
      </div>

      <div className="space-y-2">
        {data.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isCorrect = opt.id === data.correctId;
          let btnClass = 'bg-dark-elevated/60 border-border hover:border-primary/40';

          if (feedback) {
            if (isCorrect) btnClass = 'border-success bg-success/10';
            else if (isSelected) btnClass = 'border-destructive bg-destructive/10';
          }

          return (
            <button
              key={opt.id}
              onClick={() => !feedback && handleSelect(opt.id)}
              disabled={!!feedback}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm text-foreground transition-all duration-200 cursor-pointer disabled:cursor-default ${btnClass}`}
            >
              <span className="text-muted-lighter mr-2">{String.fromCharCode(65 + data.options.indexOf(opt))}.</span>
              {opt.text}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`mt-4 p-3 rounded-xl text-sm ${
          feedback.correct ? 'bg-success/10 border border-success/30' : 'bg-destructive/10 border border-destructive/30'
        }`}>
          <p className={`font-bold mb-1 ${feedback.correct ? 'text-success' : 'text-destructive'}`}>
            {feedback.correct ? '✓ Correct!' : '✗ Not quite.'}
          </p>
          <p className="text-muted leading-relaxed">{feedback.explanation}</p>
        </div>
      )}
    </div>
  );
}