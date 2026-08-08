import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useDenTool } from './useDenTool';
import { generateDenContent } from '../../services/openrouter';
import DenToolShell from './DenToolShell';
import type { PresentationContent } from '../../types/dashboard';

interface Props {
  moduleTitle: string;
  sourceText: string;
  onBack: () => void;
}

export default function PresentationTool({ moduleTitle, sourceText, onBack }: Props) {
  const { generateDenToolContent } = useDashboard();
  const [slideIndex, setSlideIndex] = useState(0);
  const [showOutline, setShowOutline] = useState(false);

  const { data, loading, error, generating, regenerate } = useDenTool<PresentationContent>(
    () => generateDenContent('presentation', moduleTitle, sourceText, []) as Promise<PresentationContent>,
    `presentation_${moduleTitle}`,
  );

  const slides = data?.slides ?? [];
  const slide = slides[slideIndex];

  const goNext = useCallback(() => {
    if (slideIndex < slides.length - 1) setSlideIndex((i) => i + 1);
  }, [slideIndex, slides.length]);

  const goPrev = useCallback(() => {
    if (slideIndex > 0) setSlideIndex((i) => i - 1);
  }, [slideIndex]);

  // Keyboard arrows
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  return (
    <DenToolShell
      title="Presentation"
      loading={loading}
      error={error}
      generating={generating}
      onBack={onBack}
      onRegenerate={regenerate}
    >
      {data && slide && (
        <>
          {/* Slide counter */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-lighter">
              Slide {slideIndex + 1} of {slides.length}
            </span>
            <button
              onClick={() => setShowOutline(!showOutline)}
              className="text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              {showOutline ? 'Hide Outline' : 'Show Outline'}
            </button>
          </div>

          {/* Outline panel */}
          {showOutline && (
            <div className="glass-card p-3 mb-3 space-y-1">
              {slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setSlideIndex(i); setShowOutline(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    i === slideIndex ? 'bg-primary/20 text-primary' : 'text-muted hover:text-foreground hover:bg-dark-hover'
                  }`}
                >
                  {i + 1}. {s.title}
                </button>
              ))}
            </div>
          )}

          {/* Slide content */}
          <div className="glass-card p-6 min-h-[300px]">
            <h3 className="font-heading text-lg font-bold text-primary mb-4">{slide.title}</h3>
            {slide.note && (
              <p className="text-xs text-muted-lighter italic mb-3">{slide.note}</p>
            )}
            <ul className="space-y-2.5">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={slideIndex === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-dark-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {/* Dots */}
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    i === slideIndex ? 'bg-primary w-4' : 'bg-dark-hover hover:bg-muted-lighter'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={slideIndex >= slides.length - 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-dark-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </DenToolShell>
  );
}