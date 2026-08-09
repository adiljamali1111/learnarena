import { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Zap } from 'lucide-react';
import type { CoreConcept } from '../../types/dashboard';

interface Props {
  data: CoreConcept[];
}

export default function CoreConceptDeckCard({ data }: Props) {
  const [index, setIndex] = useState(0);
  const current = data[index];

  if (!current) return null;

  return (
    <div className="glass-card p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center shadow-glow-cyan-sm">
          <BookOpen size={18} className="text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-lg">Core Concepts</h3>
          <p className="text-xs text-muted-lighter">
            {index + 1} of {data.length}
          </p>
        </div>
      </div>

      {/* Neon divider */}
      <div className="h-px bg-gradient-to-r from-accent/40 via-primary/20 to-transparent mb-4" />

      <div className="flex-1 flex flex-col min-w-0">
        <h4 className="text-lg font-bold text-glow-purple mb-2 break-words">{current.term}</h4>
        <p className="text-sm text-muted leading-relaxed mb-3 break-words">{current.definition}</p>

        <div className="mt-auto">
          <div className="glass-card p-3 mb-3 bg-accent/5 border-accent/20">
            <p className="text-xs text-muted-lighter mb-1">💡 Analogy</p>
            <p className="text-sm text-foreground/80 italic">{current.analogy}</p>
          </div>

          <div className="flex items-center gap-1 text-xs text-gold">
            <Zap size={12} />
            <span>+{current.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-glass-border">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="p-2 rounded-lg bg-white/5 hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer hover:shadow-glow-cyan-sm"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex gap-1.5">
          {data.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === index ? 'bg-accent w-4 shadow-glow-cyan-sm' : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setIndex((i) => Math.min(data.length - 1, i + 1))}
          disabled={index === data.length - 1}
          className="p-2 rounded-lg bg-white/5 hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer hover:shadow-glow-cyan-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}