import { useState } from 'react';
import { Layers, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { CoreConcept } from '../types';

interface Props {
  concepts: CoreConcept[];
}

export default function CoreConceptDeck({ concepts }: Props) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Record<string, boolean>>({});

  const concept = concepts[current];
  const total = concepts.length;
  const knownCount = Object.values(known).filter(Boolean).length;

  const next = () => {
    setFlipped(false);
    setCurrent((prev) => Math.min(prev + 1, total - 1));
  };

  const prev = () => {
    setFlipped(false);
    setCurrent((prev) => Math.max(prev - 1, 0));
  };

  const markKnown = () => {
    setKnown((prev) => ({ ...prev, [concept.id]: true }));
    if (current < total - 1) setTimeout(next, 300);
  };

  const markUnknown = () => {
    setKnown((prev) => ({ ...prev, [concept.id]: false }));
    if (current < total - 1) setTimeout(next, 300);
  };

  if (!concept) return null;

  return (
    <div className="dark-glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Layers size={20} className="text-accent" />
          <h2 className="font-heading text-base tracking-wider text-text-primary">Core Concept Deck</h2>
        </div>
        <span className="text-text-muted text-xs">
          {knownCount}/{total} known
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-bg-elevated rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div
        className="relative cursor-pointer min-h-[180px]"
        onClick={() => setFlipped(!flipped)}
      >
        <div className={`dark-glass-hover rounded-xl p-5 text-center transition-all duration-300 ${flipped ? 'border-accent/50' : ''}`}>
          {!flipped ? (
            <div className="space-y-3">
              <div className="text-4xl">{concept.emoji}</div>
              <h3 className="font-heading text-lg text-text-primary">{concept.term}</h3>
              <p className="text-text-muted text-xs">Tap to reveal definition</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl">{concept.emoji}</div>
              <p className="text-text-secondary text-sm leading-relaxed">{concept.definition}</p>
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-heading
                ${concept.difficulty === 'easy' ? 'bg-success/20 text-success' :
                  concept.difficulty === 'medium' ? 'bg-warning/20 text-warning' :
                  'bg-danger/20 text-danger'}`}
              >
                {concept.difficulty.toUpperCase()}
              </span>
              <p className="text-text-muted text-xs">Tap to flip back</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 gap-2">
        <button onClick={prev} disabled={current === 0} className="glass-button-ghost p-2 rounded-lg disabled:opacity-30">
          <ChevronLeft size={18} />
        </button>

        {flipped && (
          <div className="flex gap-2">
            <button onClick={markUnknown} className="glass-button-ghost px-3 py-1.5 text-xs text-danger flex items-center gap-1">
              <XCircle size={14} /> Don't Know
            </button>
            <button onClick={markKnown} className="glass-button px-3 py-1.5 text-xs flex items-center gap-1">
              <CheckCircle size={14} /> Know
            </button>
          </div>
        )}

        <button onClick={next} disabled={current === total - 1} className="glass-button-ghost p-2 rounded-lg disabled:opacity-30">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
