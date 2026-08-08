import { useState, useMemo, useCallback } from 'react';
import { Shuffle, RefreshCw, Check, X } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useDenTool } from './useDenTool';
import { generateDenContent } from '../../services/openrouter';
import DenToolShell from './DenToolShell';
import type { RecallCardsContent, RecallCard } from '../../types/dashboard';

interface Props {
  moduleTitle: string;
  sourceText: string;
  onBack: () => void;
}

export default function RecallCardsTool({ moduleTitle, sourceText, onBack }: Props) {
  const { generateDenToolContent } = useDashboard();
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [unknownIds, setUnknownIds] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  const { data, loading, error, generating, regenerate } = useDenTool<RecallCardsContent>(
    () => generateDenContent('recall-cards', moduleTitle, sourceText, []) as Promise<RecallCardsContent>,
    `recall-cards_${moduleTitle}`,
  );

  const cards: RecallCard[] = useMemo(() => {
    const raw = data?.cards ?? [];
    return raw.map((c, i) => ({
      id: `card-${i}`,
      term: c.term,
      definition: c.definition,
      known: false,
    }));
  }, [data]);

  const remaining = useMemo(
    () => cards.filter((c) => !knownIds.has(c.id) && !unknownIds.has(c.id)),
    [cards, knownIds, unknownIds],
  );

  const currentIndex = useMemo(
    () => cards.findIndex((c) => !knownIds.has(c.id) && !unknownIds.has(c.id)),
    [cards, knownIds, unknownIds],
  );

  const current = cards[currentIndex];

  const handleFlip = useCallback((id: string) => {
    setFlippedId((prev) => (prev === id ? null : id));
  }, []);

  const markKnown = useCallback((id: string) => {
    setKnownIds((prev) => new Set(prev).add(id));
    setFlippedId(null);
    if (remaining.length <= 1) setDone(true);
  }, [remaining]);

  const markUnknown = useCallback((id: string) => {
    setUnknownIds((prev) => new Set(prev).add(id));
    setFlippedId(null);
    if (remaining.length <= 1) setDone(true);
  }, [remaining]);

  const handleReset = useCallback(() => {
    setFlippedId(null);
    setKnownIds(new Set());
    setUnknownIds(new Set());
    setDone(false);
  }, []);

  if (done) {
    return (
      <DenToolShell
        title="Recall Cards"
        loading={false}
        error={null}
        generating={false}
        onBack={onBack}
        onRegenerate={regenerate}
      >
        <div className="glass-card p-8 text-center">
          <p className="font-heading text-2xl font-bold text-primary mb-2">Deck Complete!</p>
          <p className="text-sm text-muted mb-2">{knownIds.size} known · {unknownIds.size} to review</p>
          <p className="text-xs text-muted-lighter mb-4">
            {Math.round((knownIds.size / cards.length) * 100)}% mastery
          </p>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 mx-auto px-4 py-2 rounded-xl bg-primary text-dark-base text-xs font-heading font-bold hover:bg-primary-light transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> SHUFFLE & REVIEW AGAIN
          </button>
        </div>
      </DenToolShell>
    );
  }

  return (
    <DenToolShell
      title="Recall Cards"
      loading={loading}
      error={error}
      generating={generating}
      onBack={onBack}
      onRegenerate={regenerate}
    >
      {data && current && (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-muted-lighter mb-2">
            <span>{knownIds.size + unknownIds.size} / {cards.length} reviewed</span>
            <span>{remaining.length} remaining</span>
          </div>
          <div className="h-1 bg-dark-hover rounded-full mb-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{ width: `${((knownIds.size + unknownIds.size) / cards.length) * 100}%` }}
            />
          </div>

          {/* Card */}
          <div
            className="cursor-pointer"
            style={{ perspective: '1200px' }}
            onClick={() => handleFlip(current.id)}
          >
            <div
              className={`relative w-full min-h-[200px] transition-transform duration-500 cursor-pointer`}
              style={{
                transformStyle: 'preserve-3d',
                transform: flippedId === current.id ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <div
                className="glass-card p-6 flex items-center justify-center min-h-[200px] backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <p className="font-heading text-xl font-bold text-foreground text-center">{current.term}</p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 glass-card p-6 flex items-center justify-center min-h-[200px]"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <p className="text-sm text-foreground/90 text-center leading-relaxed">{current.definition}</p>
              </div>
            </div>
          </div>

          {/* Mark buttons */}
          {flippedId === current.id && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => markKnown(current.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-success/20 border border-success/30 text-success text-sm font-medium hover:bg-success/30 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" /> Known
              </button>
              <button
                onClick={() => markUnknown(current.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-destructive/20 border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/30 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" /> Review
              </button>
            </div>
          )}

          {/* Hint */}
          {flippedId !== current.id && (
            <p className="text-center text-xs text-muted-lighter mt-4">Tap the card to reveal the definition</p>
          )}
        </>
      )}
    </DenToolShell>
  );
}