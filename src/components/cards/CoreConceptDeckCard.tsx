import { Zap } from 'lucide-react';
import type { ConceptCard } from '../../types/dashboard';

interface Props {
  concepts: ConceptCard[];
}

export default function CoreConceptDeckCard({ concepts }: Props) {
  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-accent" />
        <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Core Concepts</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin">
        {concepts.map((c, i) => (
          <div
            key={i}
            className="min-w-[200px] flex-shrink-0 bg-dark-elevated/60 border border-border rounded-xl p-4 snap-start hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-heading text-sm font-bold text-primary-light">{c.term}</h4>
              <span className="flex items-center gap-0.5 text-2xs text-muted-lighter bg-dark-surface px-1.5 py-0.5 rounded-full">
                <Zap className="w-2.5 h-2.5 text-gold" /> +{c.xp} XP
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed mb-2">{c.definition}</p>
            <div className="bg-dark-base/40 rounded-lg p-2.5">
              <p className="text-2xs text-muted-lighter uppercase tracking-wider mb-0.5">Analogy</p>
              <p className="text-xs text-foreground/80 italic">{c.analogy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}