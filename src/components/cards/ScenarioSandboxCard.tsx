import { useState } from "react";
import { FlaskConical, Check, X, RotateCcw } from "lucide-react";
import type { Scenario } from "../../types/dashboard";

interface Props {
  data: Scenario;
}

export default function ScenarioSandboxCard({ data }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!data?.actions?.length) {
    return (
      <div className="glass-card p-4">
        <p className="text-muted-lighter text-sm">No scenario available.</p>
      </div>
    );
  }

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    setTimeout(() => setShowFeedback(true), 300);
  };

  const handleReset = () => {
    setSelectedIndex(null);
    setShowFeedback(false);
  };

  const selected = selectedIndex !== null ? data.actions[selectedIndex] : null;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-primary-light" />
        </div>
        <h3 className="font-heading text-sm font-bold text-foreground tracking-wide">
          Scenario Sandbox
        </h3>
      </div>

      {/* Setup */}
      <p className="text-sm text-foreground/90 leading-relaxed mb-3">
        {data.setup}
      </p>

      {/* Question */}
      <p className="text-sm text-accent font-semibold mb-4">
        {data.question}
      </p>

      {/* Action buttons */}
      <div className="space-y-2">
        {data.actions.map((action, i) => {
          const isSelected = selectedIndex === i;
          let btnClass =
            "w-full py-3 px-4 rounded-xl text-sm font-medium text-left transition-all duration-200 cursor-pointer border ";

          if (isSelected) {
            if (action.isCorrect) {
              btnClass +=
                "bg-success/20 border-success/50 text-success shadow-[0_0_12px_rgba(34,197,94,0.2)]";
            } else {
              btnClass +=
                "bg-destructive/20 border-destructive/50 text-destructive";
            }
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
              <span className="flex items-center gap-3">
                {isSelected && (
                  <span className="shrink-0">
                    {action.isCorrect ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </span>
                )}
                <span>{action.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showFeedback ? "max-h-96 mt-4" : "max-h-0 mt-0"
        }`}
      >
        {selected && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-fade-in-up">
            <p className="text-sm font-bold mb-2">
              {selected.isCorrect ? (
                <span className="text-success">✅ Correct!</span>
              ) : (
                <span className="text-destructive">❌ Not quite.</span>
              )}
            </p>
            <p className="text-xs text-muted leading-relaxed mb-3">
              {selected.explanation}
            </p>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors duration-200 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Try Another Scenario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}