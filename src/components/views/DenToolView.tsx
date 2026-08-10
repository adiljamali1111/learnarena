import DenToolShell from '../den/DenToolShell';
import MindMapTool from '../den/MindMapTool';
import AudioOverviewTool from '../den/AudioOverviewTool';
import { useDenTool } from '../den/useDenTool';
import type {
  MindMapData,
  PresentationData,
  RecallCardsData,
  VisualBreakdownData,
  StudyReportData,
} from '../../types/dashboard';
import { FileDown, Loader2 } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { useDashboard } from '../../context/DashboardContext';

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
/* ===========================
   DOCX Download Helper
   =========================== */
async function downloadDocx(data: StudyReportData, moduleTitle: string) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle, WidthType } = await import('docx');

  const children: (typeof Paragraph | typeof Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      text: `Study Report: ${moduleTitle}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }) as any,
  );

  // --- Section A: Objective Questions ---
  children.push(
    new Paragraph({
      text: 'Section A: Multiple Choice Questions',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    }) as any,
  );

  data.objectiveQuestions.forEach((q, i) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true, size: 22 }),
          new TextRun({ text: q.question, size: 22 }),
        ],
        spacing: { before: 200, after: 100 },
      }) as any,
    );
    q.options.forEach((opt, oi) => {
      const isCorrect = oi === q.correctIndex;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${String.fromCharCode(65 + oi)}.  `, bold: true, size: 20 }),
            new TextRun({ text: opt, bold: isCorrect, size: 20 }),
            ...(isCorrect ? [new TextRun({ text: '  ✓', bold: true, color: '2563EB', size: 20 })] : []),
          ],
          indent: { left: 400 },
          spacing: { before: 40, after: 40 },
        }) as any,
      );
    });
    children.push(new Paragraph({ spacing: { after: 120 } }) as any);
  });

  // --- Section B: Open-Ended Questions ---
  children.push(
    new Paragraph({
      text: 'Section B: Open-Ended Questions',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
      pageBreakBefore: true,
    }) as any,
  );

  data.subjectiveQuestions.forEach((q, i) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Question ${i + 1}`, bold: true, size: 24 }),
        ],
        spacing: { before: 300, after: 60 },
      }) as any,
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: q.question, italics: true, size: 22 })],
        spacing: { after: 120 },
      }) as any,
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Model Answer:', bold: true, color: '2563EB', size: 22 }),
        ],
        spacing: { before: 80, after: 60 },
      }) as any,
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: q.sampleAnswer, size: 21 })],
        spacing: { after: 300 },
      }) as any,
    );
  });

  // --- Section C: Glossary ---
  children.push(
    new Paragraph({
      text: 'Section C: Glossary',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
      pageBreakBefore: true,
    }) as any,
  );

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 600, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true, size: 20 })] })],
      }),
      new TableCell({
        width: { size: 2500, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: 'Term', bold: true, size: 20 })] })],
      }),
      new TableCell({
        width: { size: 7000, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: 'Definition', bold: true, size: 20 })] })],
      }),
    ],
  });

  const dataRows = data.glossary.map((entry, i) =>
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(i + 1), size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: entry.term, bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: entry.definition, size: 20 })] })] }),
      ],
    }),
  );

  children.push(new Table({ rows: [headerRow, ...dataRows] }) as any);

  const doc = new Document({
    sections: [{ children }],
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Study-Report-${moduleTitle.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').slice(0, 60)}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function StudyReportTool() {
  const { data, isLoading, error, regenerate } = useDenTool<StudyReportData>('report');
  const { state } = useDashboard();
  const [tab, setTab] = useState<'objective' | 'subjective' | 'glossary'>('objective');
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [docxLoading, setDocxLoading] = useState(false);

  const activeModule = state.modules.find((m) => m.id === state.activeModuleId);
  const moduleTitle = activeModule?.dashboard?.moduleTitle || activeModule?.title || 'Untitled Module';

  const handleDownload = useCallback(async () => {
    if (!data) return;
    setDocxLoading(true);
    try {
      await downloadDocx(data, moduleTitle);
    } catch (err) {
      console.error('Failed to download .docx:', err);
    } finally {
      setDocxLoading(false);
    }
  }, [data, moduleTitle]);

  if (!isLoading && data) {
    return (
      <DenToolShell toolKey="report" isLoading={isLoading} error={error} onRegenerate={regenerate}>
        {/* Download button & Tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
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
          <button
            onClick={handleDownload}
            disabled={docxLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-semibold hover:shadow-glow-green transition-all disabled:opacity-50 cursor-pointer"
          >
            {docxLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileDown size={14} />
            )}
            {docxLoading ? 'Generating...' : 'Download .docx'}
          </button>
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