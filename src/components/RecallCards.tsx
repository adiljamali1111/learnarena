import { useState, useCallback, useEffect } from 'react';
import { FlipHorizontal, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function RecallCards({ onClose: _onClose }: { onClose?: () => void }) {
  const { state, dispatch } = useDashboard();
  const cards = state.recallCards;
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [current]);

  if (cards.length === 0) {
    return (
      <div className="dark-glass rounded-xl p-6 text-center max-w-md mx-auto">
        <div className="text-4xl mb-4">🃏</div>
        <p className="text-text-secondary">No recall cards yet. Generate a module first.</p>
      </div>
    );
  }

  const card = cards[current];
  const known = Object.values(cards).filter((c) => c.known === true).length;
  const total = cards.length;

  const mark = useCallback((knownVal: boolean) => {
    dispatch({ type: 'UPDATE_RECALL_CARD', payload: { id: card.id, known: knownVal } });
  }, [dispatch, card.id]);

  const goTo = useCallback((index: number, dir: 'left' | 'right') => {
    if (isAnimating) return;
    setSlideDir(dir);
    setIsAnimating(true);
    setFlipped(false);
    setTimeout(() => {
      setCurrent(index);
      setSlideDir(null);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);

  return (
    <div className="dark-glass rounded-xl p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FlipHorizontal size={24} className="text-primary" />
          <h2 className="font-heading text-xl text-text-primary">Recall Cards</h2>
        </div>
        <span className="text-text-muted text-xs">{known}/{total} known</span>
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 bg-bg-elevated rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      {/* Card container with 3D flip + slide */}
      <div className="relative min-h-[220px]" style={{ perspective: '1000px' }}>
        {/* Slide wrapper */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            slideDir === 'left' ? '-translate-x-full opacity-0 absolute inset-0' :
            slideDir === 'right' ? 'translate-x-full opacity-0 absolute inset-0' :
            'translate-x-0 opacity-100'
          }`}
        >
          {/* 3D flip container */}
          <div
            className="cursor-pointer min-h-[220px]"
            style={{ perspective: '1000px' }}
            onClick={() => setFlipped(!flipped)}
          >
            <div
              className="relative w-full min-h-[220px] transition-all duration-[600ms] ease-in-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <div
                className="dark-glass-hover rounded-xl p-6 text-center flex items-center justify-center absolute inset-0"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="space-y-3">
                  <div className="text-4xl">{card.emoji}</div>
                  <h3 className="font-heading text-lg text-text-primary">{card.front}</h3>
                  <p className="text-text-muted text-xs">Tap to reveal</p>
                </div>
              </div>

              {/* Back */}
              <div
                className="dark-glass-hover rounded-xl p-6 text-center flex items-center justify-center absolute inset-0"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="space-y-3">
                  <p className="text-text-secondary text-sm leading-relaxed">{card.back}</p>
                  <p className="text-text-muted text-xs">Tap to flip back</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {flipped && (
        <div className="flex items-center justify-center gap-4 mt-6 animate-fade-in">
          <button onClick={() => mark(false)} className="glass-button-ghost px-5 py-3 rounded-lg flex items-center gap-2 text-sm text-danger">
            <XCircle size={18} /> Don't Know
          </button>
          <button onClick={() => mark(true)} className="glass-button px-5 py-3 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle size={18} /> Know
          </button>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => goTo(Math.max(0, current - 1), 'right')}
          disabled={current === 0}
          className="glass-button-ghost p-2 rounded-lg disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-text-muted text-xs">{current + 1} / {total}</span>
        <button
          onClick={() => goTo(Math.min(total - 1, current + 1), 'left')}
          disabled={current === total - 1}
          className="glass-button-ghost p-2 rounded-lg disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}