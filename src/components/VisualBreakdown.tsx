/* ──────────────────────────────────────────
   LearnArena — Visual Breakdown
   ────────────────────────────────────────── */

import { useDashboard } from '../context/DashboardContext';
import { CoreConcept } from '../types';

export default function VisualBreakdown() {
  const { state } = useDashboard();
  const concepts = state.dashboard?.coreConcepts || [];

  if (concepts.length === 0) {
    return (
      <div className="dark-glass rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">📊</div>
        <h3 className="font-heading text-lg text-text-primary mb-2">No Concepts Yet</h3>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          Generate a study module to see visual concept breakdowns here.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="font-heading text-xl text-text-primary mb-6">Visual Breakdown</h2>

      {/* Concept Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {concepts.map((concept) => (
          <ConceptCard key={concept.id} concept={concept} />
        ))}
      </div>
    </div>
  );
}

function ConceptCard({ concept }: { concept: CoreConcept }) {
  return (
    <div className="dark-glass rounded-xl p-5 group hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="text-3xl shrink-0">{concept.emoji}</div>
        <div className="min-w-0">
          <h3 className="font-heading text-sm text-text-primary tracking-wider mb-2">{concept.term}</h3>
          <p className="text-text-secondary text-xs leading-relaxed">{concept.definition}</p>
          <span className={`inline-block mt-3 text-[10px] px-2 py-0.5 rounded-full font-heading
            ${concept.difficulty === 'easy' ? 'bg-success/20 text-success' :
              concept.difficulty === 'medium' ? 'bg-warning/20 text-warning' :
              'bg-danger/20 text-danger'}`}
          >
            {concept.difficulty.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
