import DenToolShell from '../den/DenToolShell';
import { useDenTool } from '../den/useDenTool';
import type {
  AudioOverviewData,
  MindMapData,
  PresentationData,
  RecallCardsData,
  VisualBreakdownData,
  StudyReportData,
} from '../../types/dashboard';
import { Play, Pause, Square } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';

/* ===========================
   Audio Overview Tool
   =========================== */
function AudioOverviewTool() {
  const { data, isLoading, error, regenerate } = useDenTool<AudioOverviewData>('audio');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(-1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const speakSegment = useCallback((segments: { heading: string; text: string }[], idx: number) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    if (idx >= segments.length) {
      setIsPlaying(false);
      setCurrentSegment(-1);
      return;
    }
    const seg = segments[idx];
    const utterance = new SpeechSynthesisUtterance(`${seg.heading}: ${seg.text}`);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onend = () => {
      setCurrentSegment((prev) => {
        const next = prev + 1;
        if (next < segments.length) {
          speakSegment(segments, next);
        } else {
          setIsPlaying(false);
        }
        return next < segments.length ? next : -1;
      });
    };
    utteranceRef.current = utterance;
    setCurrentSegment(idx);
    setIsPlaying(true);
    synthRef.current.speak(utterance);
  }, []);

  const handlePlayPause = () => {
    if (!data) return;
    if (isPlaying) {
      if (synthRef.current) synthRef.current.pause();
      setIsPlaying(false);
    } else if (currentSegment >= 0) {
      if (synthRef.current) synthRef.current.resume();
      setIsPlaying(true);
    } else {
      speakSegment(data.segments, 0);
    }
  };

  const handleStop = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsPlaying(false);
    setCurrentSegment(-1);
  };

  return (
    <DenToolShell toolKey="audio" isLoading={isLoading} error={error} onRegenerate={regenerate}>
      {data && (
        <div className="space-y-4">
          {/* Narration card */}
          <div className="glass-card p-6">
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">{data.script}</p>
          </div>

          {/* Audio player controls */}
          <div className="glass-card p-4 flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:shadow-glow-purple transition-all cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white" />}
            </button>

            <button
              onClick={handleStop}
              disabled={currentSegment < 0}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition-all cursor-pointer"
              aria-label="Stop"
            >
              <Square size={16} className="text-muted" />
            </button>

            <div className="flex-1">
              <div className="flex gap-1.5">
                {data.segments.map((seg, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      i < currentSegment
                        ? 'bg-accent'
                        : i === currentSegment
                          ? 'bg-primary animate-pulse'
                          : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            <span className="text-xs text-muted-lighter shrink-0">
              {currentSegment >= 0
                ? `${currentSegment + 1}/${data.segments.length}`
                : `${data.segments.length} segments`}
            </span>
          </div>

          {/* Segment list */}
          <div className="space-y-2">
            {data.segments.map((seg, i) => (
              <button
                key={i}
                onClick={() => { handleStop(); speakSegment(data.segments, i); }}
                className={`w-full text-left glass-card p-4 transition-all cursor-pointer ${
                  i === currentSegment ? 'border-accent/40 bg-accent/5' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                    {i + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground">{seg.heading}</h4>
                </div>
                <p className="text-xs text-muted line-clamp-2">{seg.text}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </DenToolShell>
  );
}

/* ===========================
   Mind Map Tool
   =========================== */
function MindMapTool() {
  const { data, isLoading, error, regenerate } = useDenTool<MindMapData>('mindmap');

  return (
    <DenToolShell toolKey="mindmap" isLoading={isLoading} error={error} onRegenerate={regenerate}>
      {data && (
        <div className="flex flex-col items-center">
          <div className="glass-card p-6 w-full overflow-x-auto">
            <svg viewBox="0 0 800 500" className="w-full h-auto" style={{ minHeight: 350 }}>
              {/* Central topic */}
              <circle cx={400} cy={250} r={60} fill="#a855f7" opacity={0.3} />
              <circle cx={400} cy={250} r={50} fill="#a855f7" opacity={0.5} />
              <circle cx={400} cy={250} r={40} fill="#a855f7" />
              <text x={400} y={255} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                {data.centralTopic}
              </text>

              {/* Branches */}
              {data.branches.map((branch, bIdx) => {
                const angle = (2 * Math.PI / data.branches.length) * bIdx - Math.PI / 2;
                const bx = 400 + 120 * Math.cos(angle);
                const by = 250 + 120 * Math.sin(angle);
                const colors = ['#a855f7', '#00f0ff', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

                return (
                  <g key={bIdx}>
                    {/* Branch line */}
                    <line x1={400} y1={250} x2={bx} y2={by} stroke={colors[bIdx % colors.length]} strokeWidth={2} opacity={0.5} />

                    {/* Branch node */}
                    <rect
                      x={bx - 50}
                      y={by - 18}
                      width={100}
                      height={36}
                      rx={18}
                      fill={colors[bIdx % colors.length]}
                      opacity={0.2}
                    />
                    <text x={bx} y={by + 5} textAnchor="middle" fill={colors[bIdx % colors.length]} fontSize="11" fontWeight="bold">
                      {branch.label}
                    </text>

                    {/* Children */}
                    {branch.children.map((child, cIdx) => {
                      const childAngle = angle + (cIdx - (branch.children.length - 1) / 2) * 0.3;
                      const cx = bx + 80 * Math.cos(childAngle);
                      const cy = by + 80 * Math.sin(childAngle);

                      return (
                        <g key={`${bIdx}-${cIdx}`}>
                          <line x1={bx} y1={by} x2={cx} y2={cy} stroke={colors[bIdx % colors.length]} strokeWidth={1} opacity={0.3} />
                          <circle cx={cx} cy={cy} r={6} fill={colors[bIdx % colors.length]} opacity={0.4} />
                          <text x={cx} y={cy + 18} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9">
                            {child.length > 22 ? child.slice(0, 22) + '…' : child}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </DenToolShell>
  );
}

/* ===========================
   Presentation Tool
   =========================== */
function PresentationTool() {
  const { data, isLoading, error, regenerate } = useDenTool<PresentationData>('presentation');
  const [slideIndex, setSlideIndex] = useState(0);

  if (!isLoading && data) {
    const slide = data.slides[slideIndex];
    if (!slide) return null;

    return (
      <DenToolShell toolKey="presentation" isLoading={isLoading} error={error} onRegenerate={regenerate}>
        {/* Progress bar */}
        <div className="flex gap-1 mb-4">
          {data.slides.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all cursor-pointer ${
                i <= slideIndex ? 'bg-accent' : 'bg-white/10'
              }`}
              onClick={() => setSlideIndex(i)}
            />
          ))}
        </div>

        {/* Slide */}
        <div className="glass-card p-8 min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] text-muted-lighter px-2 py-1 rounded-full bg-white/5">
              {slideIndex + 1} / {data.slides.length}
            </span>
          </div>

          <h3 className="font-heading font-bold text-xl text-glow-cyan mb-4">{slide.title}</h3>
          <p className="text-sm text-muted leading-relaxed mb-6">{slide.content}</p>

          <ul className="space-y-2 flex-1">
            {slide.bulletPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
            disabled={slideIndex === 0}
            className="btn-base px-4 py-2 rounded-xl bg-white/5 text-muted hover:text-foreground hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
          >
            ← Previous
          </button>
          <span className="text-xs text-muted-lighter">
            {slideIndex + 1} / {data.slides.length}
          </span>
          <button
            onClick={() => setSlideIndex((i) => Math.min(data.slides.length - 1, i + 1))}
            disabled={slideIndex >= data.slides.length - 1}
            className="btn-base px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm hover:shadow-glow-purple disabled:opacity-30 transition-all cursor-pointer"
          >
            Next →
          </button>
        </div>
      </DenToolShell>
    );
  }

  return (
    <DenToolShell toolKey="presentation" isLoading={isLoading} error={error} onRegenerate={regenerate}>
      {null}
    </DenToolShell>
  );
}

/* ===========================
   Recall Cards Tool
   =========================== */
function RecallCardsTool() {
  const { data, isLoading, error, regenerate } = useDenTool<RecallCardsData>('recall');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState<typeof data | null>(null);

  // Shuffle on load
  if (!shuffled && data) {
    const cards = [...data.cards];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    setShuffled({ cards });
  }

  const cards = shuffled?.cards || data?.cards || [];
  const card = cards[cardIndex];
  if (!card && !isLoading) {
    return (
      <DenToolShell toolKey="recall" isLoading={isLoading} error={error} onRegenerate={regenerate}>
        <div className="glass-card p-8 text-center">
          <p className="text-muted text-sm">No cards generated yet.</p>
        </div>
      </DenToolShell>
    );
  }

  const handleNext = () => {
    if (cardIndex < cards.length - 1) {
      setCardIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (cardIndex > 0) {
      setCardIndex((i) => i - 1);
      setIsFlipped(false);
    }
  };

  return (
    <DenToolShell toolKey="recall" isLoading={isLoading} error={error} onRegenerate={regenerate}>
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-lighter">
          Card {cardIndex + 1} of {cards.length}
        </span>
        <button
          onClick={() => {
            setShuffled(null);
            setIsFlipped(false);
            setCardIndex(0);
          }}
          className="text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer"
        >
          Reshuffle
        </button>
      </div>

      {/* Card — centered wrapper with physical flashcard proportions */}
      <div className="flex flex-col items-center justify-center w-full my-6">
        <div
          className={`flip-card w-full max-w-md mx-auto aspect-[5/3] min-h-[260px] ${isFlipped ? 'flipped' : ''}`}
          onClick={() => !isFlipped && setIsFlipped(true)}
        >
          <div className="flip-card-inner">
            {/* Front */}
            <div className="flip-card-front glass-card flex flex-col items-center justify-center p-8 text-center overflow-y-auto max-h-full">
              <span className="text-xs text-muted-lighter mb-3 shrink-0">Click to reveal</span>
              <p className="text-base font-semibold leading-relaxed">{card?.front}</p>
              {card?.hint && !isFlipped && (
                <p className="text-xs text-muted-lighter mt-3 italic shrink-0">{card.hint}</p>
              )}
            </div>

            {/* Back */}
            <div className="flip-card-back glass-card flex flex-col items-center justify-center p-8 text-center overflow-y-auto max-h-full bg-dark-elevated">
              <span className="text-xs text-success mb-3 shrink-0">Answer</span>
              <p className="text-base leading-relaxed text-foreground/90">{card?.back}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={cardIndex === 0}
          className="btn-base px-4 py-2 rounded-xl bg-white/5 text-muted hover:text-foreground hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
        >
          ← Prev
        </button>
        <button
          onClick={() => setIsFlipped((f) => !f)}
          className="btn-base px-4 py-2 rounded-xl bg-accent/20 text-accent text-sm hover:bg-accent/30 transition-all cursor-pointer"
        >
          {isFlipped ? 'Hide' : 'Reveal'}
        </button>
        <button
          onClick={handleNext}
          disabled={cardIndex >= cards.length - 1}
          className="btn-base px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm hover:shadow-glow-purple disabled:opacity-30 transition-all cursor-pointer"
        >
          Next →
        </button>
      </div>
    </DenToolShell>
  );
}

/* ===========================
   Visual Breakdown Tool
   =========================== */
function VisualBreakdownTool() {
  const { data, isLoading, error, regenerate } = useDenTool<VisualBreakdownData>('visual');

  return (
    <DenToolShell toolKey="visual" isLoading={isLoading} error={error} onRegenerate={regenerate}>
      {data && (
        <div className="space-y-4">
          {/* Title */}
          <div className="glass-card p-6 text-center">
            <h3 className="font-heading font-bold text-2xl text-glow-cyan">{data.title}</h3>
          </div>

          {/* Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.sections.map((section, i) => (
              <div
                key={i}
                className="glass-card p-5"
                style={{
                  borderLeft: `3px solid ${section.color}`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{section.icon}</span>
                  <h4 className="text-sm font-semibold text-foreground">{section.heading}</h4>
                </div>
                <ul className="space-y-1.5">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-muted">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                        style={{ background: section.color }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </DenToolShell>
  );
}

/* ===========================
   Study Report Tool
   =========================== */
function StudyReportTool() {
  const { data, isLoading, error, regenerate } = useDenTool<StudyReportData>('report');
  const [tab, setTab] = useState<'objective' | 'subjective' | 'glossary'>('objective');
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());

  if (!isLoading && data) {
    return (
      <DenToolShell toolKey="report" isLoading={isLoading} error={error} onRegenerate={regenerate}>
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {([
            { key: 'objective' as const, label: 'MCQs', count: data.objectiveQuestions.length },
            { key: 'subjective' as const, label: 'Open-Ended', count: data.subjectiveQuestions.length },
            { key: 'glossary' as const, label: 'Glossary', count: data.glossary.length },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                tab === t.key
                  ? 'bg-primary/20 text-primary'
                  : 'bg-white/5 text-muted hover:text-foreground'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Objective Questions */}
        {tab === 'objective' && (
          <div className="space-y-3">
            {data.objectiveQuestions.map((q, i) => {
              const isRevealed = revealedAnswers.has(i);
              return (
                <div key={i} className="glass-card p-4">
                  <p className="text-sm font-medium text-foreground mb-3">
                    {i + 1}. {q.question}
                  </p>
                  <div className="space-y-1.5 mb-2">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                          isRevealed && oi === q.correctIndex
                            ? 'border-success bg-success/10 text-success'
                            : 'border-glass-border text-muted'
                        }`}
                      >
                        <span className="font-mono mr-2 text-muted-lighter">
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setRevealedAnswers((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      })
                    }
                    className="text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer"
                  >
                    {isRevealed ? 'Hide answer' : 'Show answer'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Subjective Questions */}
        {tab === 'subjective' && (
          <div className="space-y-3">
            {data.subjectiveQuestions.map((q, i) => (
              <div key={i} className="glass-card p-4">
                <p className="text-sm font-medium text-foreground mb-2">
                  {i + 1}. {q.question}
                </p>
                <details className="group">
                  <summary className="text-xs text-accent cursor-pointer hover:text-accent/80 transition-colors list-none">
                    <span className="group-open:hidden">Show model answer →</span>
                    <span className="hidden group-open:inline">Hide answer</span>
                  </summary>
                  <div className="mt-2 glass-card p-3 bg-accent/5 text-xs text-muted leading-relaxed">
                    {q.sampleAnswer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {/* Glossary */}
        {tab === 'glossary' && (
          <div className="space-y-1">
            {data.glossary.map((entry, i) => (
              <div key={i} className="glass-card p-3 flex items-start gap-3">
                <span className="text-xs text-muted-lighter font-mono w-6 shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-accent">{entry.term}</span>
                  <p className="text-xs text-muted mt-0.5">{entry.definition}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DenToolShell>
    );
  }

  return (
    <DenToolShell toolKey="report" isLoading={isLoading} error={error} onRegenerate={regenerate}>
      {null}
    </DenToolShell>
  );
}

/* ===========================
   DenToolView — dispatcher
   =========================== */
export default function DenToolView() {
  const { state } = useDashboard();
  const tool = state.activeDenTool;

  switch (tool) {
    case 'audio':
      return <AudioOverviewTool />;
    case 'mindmap':
      return <MindMapTool />;
    case 'presentation':
      return <PresentationTool />;
    case 'recall':
      return <RecallCardsTool />;
    case 'visual':
      return <VisualBreakdownTool />;
    case 'report':
      return <StudyReportTool />;
    default:
      return null;
  }
}