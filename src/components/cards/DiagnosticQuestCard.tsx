import { useState, useCallback } from "react";
import { Target, Check, X, RotateCcw, Sparkles } from "lucide-react";
import type { DiagnosticQuest } from "../../types/dashboard";

interface Props {
  data: DiagnosticQuest;
  onXpGained?: (xp: number) => void;
}

export default function DiagnosticQuestCard({ data, onXpGained }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<boolean[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  if (!data?.questions?.length) {
    return (
      <div className="glass-card p-4">
        <p className="text-muted-lighter text-sm">No questions available.</p>
      </div>
    );
  }

  const questions = data.questions;
  const total = questions.length;
  const question = questions[currentQ];

  const handleSelect = useCallback(
    (index: number) => {
      if (selectedIndex !== null) return;
      setSelectedIndex(index);

      const isCorrect = index === question.correctIndex;
      const newAnswered = [...questionsAnswered];
      newAnswered[currentQ] = isCorrect;
      setQuestionsAnswered(newAnswered);

      if (isCorrect) {
        const earned = 10;
        setCorrectCount((c) => c + 1);
        setXpEarned((x) => x + earned);

        // Auto-advance after delay
        setTimeout(() => {
          if (currentQ < total - 1) {
            setCurrentQ((q) => q + 1);
            setSelectedIndex(null);
            setShowHint(false);
          } else {
            setShowSummary(true);
          }
        }, 1500);
      } else {
        setShowHint(true);
      }
    },
    [currentQ, question, questionsAnswered, total, selectedIndex]
  );

  const handleRetry = () => {
    setSelectedIndex(null);
    setShowHint(false);
  };

  const handleRetryAll = () => {
    setCurrentQ(0);
    setSelectedIndex(null);
    setShowHint(false);
    setCorrectCount(0);
    setQuestionsAnswered([]);
    setShowSummary(false);
    setXpEarned(0);
  };

  // Summary screen
  if (showSummary) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-primary-light" />
          </div>
          <h3 className="font-heading text-sm font-bold text-foreground tracking-wide">
            Diagnostic Quest
          </h3>
        </div>
        <div className="text-center py-6 animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent/60 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <p className="font-heading text-lg font-bold text-foreground mb-2">
            Quest Complete!
          </p>
          <p className="text-3xl font-bold text-accent mb-1">
            {correctCount} / {total}
          </p>
          <p className="text-sm text-muted mb-1">Questions Correct</p>
          <p className="text-sm text-gold font-semibold mb-5">
            +{xpEarned} XP Earned
          </p>
          <button
            onClick={handleRetryAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/20 text-primary-light hover:bg-primary/30 border border-primary/30 transition-all duration-200 cursor-pointer mx-auto text-sm font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Quest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Target className="w-4 h-4 text-primary-light" />
        </div>
        <h3 className="font-heading text-sm font-bold text-foreground tracking-wide">
          Diagnostic Quest
        </h3>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted">
          Question {currentQ + 1} of {total}
        </span>
        <div className="flex items-center gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === currentQ
                  ? "bg-accent shadow-[0_0_6px_rgba(0,240,255,0.5)]"
                  : questionsAnswered[i] === true
                  ? "bg-success"
                  : questionsAnswered[i] === false
                  ? "bg-destructive"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-semibold text-foreground mb-4 leading-relaxed">
        {question.question}
      </p>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {question.options.map((option, i) => {
          const labels = ["A", "B", "C", "D"];
          const isSelected = selectedIndex === i;
          const isCorrectOption = i === question.correctIndex;

          let btnClass =
            "w-full py-2.5 px-3 rounded-xl text-xs font-medium text-left transition-all duration-200 cursor-pointer border flex items-center gap-3 ";

          if (isSelected) {
            if (isCorrectOption) {
              btnClass +=
                "bg-success/20 border-success/50 text-success";
            } else {
              btnClass +=
                "bg-destructive/20 border-destructive/50 text-destructive";
            }
          } else if (selectedIndex !== null && isCorrectOption) {
            // Reveal correct answer after selection
            btnClass +=
              "bg-success/20 border-success/50 text-success";
          } else if (selectedIndex !== null) {
            btnClass +=
              "bg-white/5 border-white/10 text-muted cursor-not-allowed";
          } else {
            btnClass +=
              "bg-white/5 border-white/10 text-foreground hover:bg-white/10 hover:border-accent/30";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selectedIndex !== null}
              className={btnClass}
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                {labels[i]}
              </span>
              <span>{option}</span>
              {isSelected && (
                <span className="ml-auto shrink-0">
                  {isCorrectOption ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Socratic Hint Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showHint ? "max-h-48" : "max-h-0"
        }`}
      >
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 animate-fade-in-up">
          <p className="text-[11px] text-accent font-semibold mb-1">
            💡 Socratic Hint
          </p>
          <p className="text-xs text-muted leading-relaxed mb-2">
            {question.socraticHint}
          </p>
          <button
            onClick={handleRetry}
            className="text-xs text-accent hover:text-accent/80 transition-colors duration-200 cursor-pointer"
          >
            Try again →
          </button>
        </div>
      </div>
    </div>
  );
}