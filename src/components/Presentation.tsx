/* ──────────────────────────────────────────
   LearnArena — Presentation (Slide View)
   ────────────────────────────────────────── */

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function Presentation() {
  const { state } = useDashboard();
  const dashboard = state.dashboard;
  const [slide, setSlide] = useState(0);

  if (!dashboard) {
    return (
      <div className="dark-glass rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">📽️</div>
        <h3 className="font-heading text-lg text-text-primary mb-2">No Presentation Available</h3>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          Generate a study module to view it as a slide-based presentation.
        </p>
      </div>
    );
  }

  const slides = buildSlides(dashboard);
  const total = slides.length;
  const current = slides[slide];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl text-text-primary">Presentation</h2>
        <span className="text-text-muted text-sm">{slide + 1} / {total}</span>
      </div>

      {/* Slide */}
      <div className="dark-glass rounded-xl p-8 md:p-12 min-h-[400px] flex flex-col justify-center transition-all duration-300">
        <div className="text-center mb-6">
          <span className="text-5xl">{current.emoji}</span>
        </div>
        <h3 className="font-heading text-xl md:text-2xl text-text-primary text-center mb-4 tracking-wider">
          {current.title}
        </h3>
        <div className="text-text-secondary text-sm md:text-base leading-relaxed text-center max-w-lg mx-auto">
          {current.content}
        </div>
        {current.bullets && current.bullets.length > 0 && (
          <ul className="mt-6 space-y-2 max-w-md mx-auto">
            {current.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                <span className="text-primary shrink-0 mt-0.5">▸</span>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setSlide((p) => Math.max(0, p - 1))}
          disabled={slide === 0}
          className="glass-button-ghost p-3 rounded-lg disabled:opacity-30"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === slide ? 'bg-primary scale-125' : 'bg-text-muted/30 hover:bg-text-muted/50'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setSlide((p) => Math.min(total - 1, p + 1))}
          disabled={slide === total - 1}
          className="glass-button-ghost p-3 rounded-lg disabled:opacity-30"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}

interface Slide {
  emoji: string;
  title: string;
  content: string;
  bullets?: string[];
}

function buildSlides(dashboard: NonNullable<ReturnType<typeof useDashboard>['state']['dashboard']>): Slide[] {
  return [
    {
      emoji: dashboard.moduleEmoji,
      title: dashboard.moduleTitle,
      content: dashboard.synthesis.summary,
      bullets: dashboard.synthesis.keyTakeaways,
    },
    ...dashboard.coreConcepts.map((cc) => ({
      emoji: cc.emoji,
      title: cc.term,
      content: cc.definition,
    })),
    {
      emoji: '🚀',
      title: 'Next Steps',
      content: 'Continue your learning journey with these recommended topics:',
      bullets: dashboard.synthesis.recommendedNext,
    },
  ];
}
