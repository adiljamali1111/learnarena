import { useState } from 'react';
import { Presentation as PresentationIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function Presentation({ onClose: _onClose }: { onClose?: () => void }) {
  const { state } = useDashboard();
  const d = state.dashboard;
  const [slide, setSlide] = useState(0);

  if (!d) return null;

  const slides = [
    { title: 'Module Overview', content: `# ${d.moduleEmoji} ${d.moduleTitle}\n\n${d.synthesis.summary.split('. ').slice(0, 3).join('. ')}.`, type: 'intro' },
    { title: 'Core Concepts', content: d.coreConcepts.map((c) => `• ${c.emoji} **${c.term}**: ${c.definition}`).join('\n\n'), type: 'concepts' },
    { title: 'Key Relationships', content: d.contextGraph.map((n) => `• **${n.label}** — ${n.description}`).join('\n\n'), type: 'context' },
    { title: 'Practice Scenarios', content: d.scenarios.map((s) => `## ${s.title}\n${s.description}`).join('\n\n'), type: 'scenarios' },
    { title: 'Quiz Review', content: `Test yourself with ${d.quiz.length} questions covering all topics.`, type: 'quiz' },
  ];

  const currentSlide = slides[slide];

  return (
    <div className="dark-glass rounded-xl p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <PresentationIcon size={24} className="text-accent" />
        <h2 className="font-heading text-xl text-text-primary">Presentation Mode</h2>
      </div>

      {/* Slide counter */}
      <div className="text-center text-text-muted text-xs mb-4 font-heading">
        {slide + 1} / {slides.length}
      </div>

      {/* Slide content */}
      <div className="min-h-[300px] bg-bg-elevated rounded-xl p-8 mb-6 animate-fade-in">
        <h3 className="font-heading text-lg text-primary mb-4">{currentSlide.title}</h3>
        <div className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
          {currentSlide.content}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setSlide((s) => Math.max(0, s - 1))} disabled={slide === 0}
          className="glass-button-ghost px-4 py-2 rounded-lg flex items-center gap-2 text-sm disabled:opacity-30">
          <ChevronLeft size={18} /> Previous
        </button>
        <button onClick={() => setSlide((s) => Math.min(slides.length - 1, s + 1))} disabled={slide === slides.length - 1}
          className="glass-button px-4 py-2 rounded-lg flex items-center gap-2 text-sm disabled:opacity-40">
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}