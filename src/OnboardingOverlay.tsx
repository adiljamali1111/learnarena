import { useState, useCallback } from 'react';
import { setOnboardedFlag } from './store';

interface Step {
  title: string;
  description: string;
  position: 'top' | 'center';
}

const STEPS: Step[] = [
  {
    title: 'Upload Your Materials',
    description: 'Drop PDFs, DOCX files, text files, or images here.\nLearnArena extracts the text and turns it into interactive study modules.',
    position: 'top',
  },
  {
    title: 'Browse Your Modules',
    description: 'Each uploaded file becomes a module.\nClick any module to open it and start studying.',
    position: 'center',
  },
  {
    title: 'Export & Settings',
    description: 'Use the top-right controls to export your modules as JSON, or manage your OpenRouter API key.',
    position: 'top',
  },
  {
    title: "You're All Set!",
    description: 'Upload your first study material and dive in.\nHappy learning!',
    position: 'center',
  },
];

interface OnboardingOverlayProps {
  onComplete: () => void;
}

export default function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      setOnboardedFlag();
      onComplete();
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [isLast, onComplete]);

  const handleSkip = useCallback(() => {
    setOnboardedFlag();
    onComplete();
  }, [onComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      }
    },
    [handleNext, handleSkip],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="App tour"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content card */}
      <div className="relative z-10 w-full max-w-sm mx-4 animate-fade-in">
        <div className="bg-bg-card border border-border rounded-2xl p-6 shadow-2xl">
          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStepIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                  i === stepIndex
                    ? 'bg-accent w-5'
                    : 'bg-text-dim/30 hover:bg-text-dim/50'
                }`}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">{step.title}</h3>
            {step.description.split('\n').map((line, i) => (
              <p key={i} className="text-sm text-text-muted">
                {line}
              </p>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-text-dim hover:text-text-muted transition-colors cursor-pointer"
            >
              Skip tour
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-light transition-all duration-200 active:scale-[0.97] cursor-pointer"
            >
              {isLast ? "Let's go!" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}