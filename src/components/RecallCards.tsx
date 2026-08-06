/* ──────────────────────────────────────────
   LearnArena — Recall Cards
   ────────────────────────────────────────── */

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle2, XCircle } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function RecallCards() {
  const { state, dispatch } = useDashboard();
  const cards = state.recallCardsState;
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState<'all' | 'known' | 'unknown'>('all');

  const filteredCards = useMemo(() => {
    if (filter === 'known') return cards.filter((c) => c.known === true);
    if (filter === 'unknown') return cards.filter((c) => c.known === null || c.known === false);
    return cards;
  }, [cards, filter]);

  const currentCard = filteredCards[current];
  const knownCount = cards.filter((c) => c.known === true).length;

  const handleKnown = (known: boolean) => {
    if (!currentCard) return;
    dispatch({ type: 'UPDATE_RECALL_CARD', payload: { id: currentCard.id, known } });
    if (current < filteredCards.length - 1) {
      setTimeout(() => { setFlipped(false); setCurrent((p) => p + 1); }, 300);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="dark-glass rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">🃏</div>
        <h3 className="font-heading text-lg text-text-primary mb-2">No Recall Cards Yet</h3>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          Generate a study module first, and recall cards will appear here for you to review key concepts.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl text-text-primary">Recall Cards</h2>
        <span className="text-text-muted text-sm">{knownCount}/{cards.length} mastered</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'unknown', 'known'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setCurrent(0); setFlipped(false); }}
            className={`text-xs px-3 py-1.5 rounded-full font-heading tracking-wider transition-all
              ${filter === f ? 'bg-primary text-white' : 'glass-button-ghost'}`}
          >
            {f === 'all' ? 'All' : f === 'unknown' ? 'To Review' : 'Mastered'}
          </button>
        ))}
      </div>

      {/* Card */}
      {currentCard ? (
        <>
          <div
            onClick={() => setFlipped(!flipped)}
            className="dark-glass rounded-xl p-8 min-h-[220px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-primary/30 mb-6"
          >
            {!flipped ? (
              <div className="text-center space-y-4">
                {currentCard.emoji && <div className="text-4xl">{currentCard.emoji}</div>}
                <p className="text-text-primary text-lg font-heading">{currentCard.front}</p>
                <p className="text-text-muted text-xs">Tap to reveal answer</p>
              </div>
            ) : (
              <div className="text-center space-y-4 animate-fade-in">
                <p className="text-accent text-base leading-relaxed">{currentCard.back}</p>
                <div className="flex gap-3 justify-center pt-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleKnown(false); }}
                    className="glass-button-ghost px-4 py-2 rounded-lg text-danger flex items-center gap-2 text-sm"
                  >
                    <XCircle size={16} /> Still Learning
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleKnown(true); }}
                    className="glass-button px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <CheckCircle2 size={16} /> Got It
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setFlipped(false); setCurrent((p) => Math.max(0, p - 1)); }}
              disabled={current === 0}
              className="glass-button-ghost p-2 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-text-muted text-sm">
              {current + 1} / {filteredCards.length}
            </span>
            <button
              onClick={() => { setFlipped(false); setCurrent((p) => p + 1); }}
              disabled={current === filteredCards.length - 1}
              className="glass-button-ghost p-2 rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Restart */}
          {current === filteredCards.length - 1 && flipped && (
            <div className="text-center mt-6">
              <button
                onClick={() => { setCurrent(0); setFlipped(false); }}
                className="glass-button px-4 py-2 rounded-lg flex items-center gap-2 mx-auto text-sm"
              >
                <RotateCw size={16} /> Start Over
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="dark-glass rounded-xl p-8 text-center">
          <p className="text-text-muted">No cards match this filter. Try a different filter or generate more cards.</p>
        </div>
      )}
    </div>
  );
}
