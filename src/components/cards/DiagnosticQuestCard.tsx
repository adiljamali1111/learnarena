import { useState, useMemo } from 'react';
import { BrainCircuit, HelpCircle, ChevronRight } from 'lucide-react';
import type { DiagnosticQuestion, DiagnosticCard } from '../../types/dashboard';

interface Props {
  data: DiagnosticCard;
  onRefresh?: () => void;
  onXpEarned?: (xp: number) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DiagnosticQuestCard({ data, onRefresh, onXpEarned }: Props) {
  const [shuffledQuestions] = useState(() => shuffleArray(data.questions));
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const question = shuffledQuestions[currentQ];
  const shuffledOptions = useMemo(
    () => (question ? shuffleArray(question.options.map((opt, i) => ({ text: opt, origIndex: i }))) : []),
    [question],
  );

  const handleSelect = (idx: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(idx);

    const correct = shuffledOptions[idx].origIndex === question.correctIndex;
    const newAnswers = [...answers, { correct }];
    setAnswers(newAnswers);

    if (correct) {
      onXpEarned?.(25);
      setTimeout(() => {
        if (currentQ < shuffledQuestions.length - 1) {
          setCurrentQ((q) => q + 1);
          setSelectedIndex(null);
          setShowHint(false);
        } else {
          setFinished(true);
        }
      }, 800);
    } else {
      setShowHint(true);
    }
  };

  const correctCount = answers.filter((a) => a.correct).length;
  const totalCorrect = answers.length > 0 ? correctCount : 0;
  const totalAnswered = answers.length;

  if (finished) {
    return (
      <div className="glass-card p-5 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <BrainCircuit className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Diagnostic Quest — Complete</h3>
        </div>
        <div className="text-center py-6">
          <p className="text-3xl font-heading font-bold text-primary mb-2">{totalCorrect}/{shuffledQuestions.length}</p>
          <p className="text-sm text-muted mb-4">Questions answered correctly</p>
          <p className="text-xs text-gold">+{totalCorrect * 25} XP earned</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-dark-base text-xs font-heading font-bold hover:bg-primary-light transition-colors cursor-pointer"
            >
              GENERATE FRESH QUESTIONS
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Diagnostic Quest</h3>
        </div>
        <span className="text-2xs text-muted-lighter">{currentQ + 1} / {shuffledQuestions.length}</span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mb-4">
        {shuffledQuestions.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i < currentQ ? 'bg-success' : i === currentQ ? 'bg-primary' : 'bg-dark-hover'
            }`}
          />
        ))}
      </div>

      <p className="text-sm text-foreground font-medium mb-4 leading-relaxed">{question.question}</p>

      <div className="space-y-2">
        {shuffledOptions.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrect = opt.origIndex === question.correctIndex;
          let btnClass = 'bg-dark-elevated/60 border-border hover:border-primary/40';

          if (selectedIndex !== null) {
            if (isCorrect) btnClass = 'border-success bg-success/10';
            else if (isSelected) btnClass = 'border-destructive bg-destructive/10';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selectedIndex !== null}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm text-foreground transition-all duration-200 cursor-pointer disabled:cursor-default ${btnClass}`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      {showHint && (
        <div className="mt-4 p-3 rounded-xl bg-accent/10 border border-accent/30">
          <div className="flex items-center gap-1.5 mb-1">
            <HelpCircle className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-accent">Hint</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">{question.hint}</p>
          <button
            onClick={() => {
              setShowHint(false);
              if (currentQ < shuffledQuestions.length - 1) {
                setCurrentQ((q) => q + 1);
                setSelectedIndex(null);
              } else {
                setFinished(true);
              }
            }}
            className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors cursor-pointer"
          >
            Continue <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Explanation on answered */}
      {selectedIndex !== null && (
        <div className="mt-4 p-3 rounded-xl bg-dark-elevated/60 border border-border">
          <p className="text-xs text-muted leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}