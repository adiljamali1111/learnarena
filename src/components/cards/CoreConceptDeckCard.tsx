import { Layers, Star } from "lucide-react";
import type { CoreConcept } from "../../types/dashboard";

interface Props {
  data: CoreConcept[];
}

export default function CoreConceptDeckCard({ data }: Props) {
  if (!data?.length) {
    return (
      <div className="glass-card p-4">
        <p className="text-muted-lighter text-sm">No concepts available.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Layers className="w-4 h-4 text-primary-light" />
        </div>
        <h3 className="font-heading text-sm font-bold text-foreground tracking-wide">
          Core Concept Deck
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {data.map((concept, i) => (
          <div
            key={i}
            className="min-w-[220px] max-w-[260px] shrink-0 snap-start bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-[0_0_12px_rgba(168,85,247,0.1)]"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-sm text-foreground">
                {concept.term}
              </h4>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary-light text-[10px] font-semibold shrink-0 ml-2">
                <Star className="w-2.5 h-2.5" />
                {concept.xpBadge} XP
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed mb-2">
              {concept.definition}
            </p>
            <p className="text-xs text-accent italic leading-relaxed">
              💡 {concept.analogy}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}