import { useState } from 'react';
import { BookOpen, ListChecks, LayoutDashboard, BookMarked, ChevronRight, ChevronDown, Lightbulb, Layers, Target, ArrowRight } from 'lucide-react';
import { SynthesisData } from '../types';

type SynthesisMode = 'summary' | 'overview' | 'deepdive';

interface Props {
  data: SynthesisData;
}

export default function ModuleSynthesis({ data }: Props) {
  const [activeMode, setActiveMode] = useState<SynthesisMode>('summary');

  const modes: Array<{ key: SynthesisMode; label: string; icon: React.ReactNode; desc: string }> = [
    { key: 'summary', label: 'Summary', icon: <ListChecks size={16} />, desc: 'Ultra-concise recap' },
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} />, desc: 'Structural orientation' },
    { key: 'deepdive', label: 'Deep Dive', icon: <BookMarked size={16} />, desc: 'Comprehensive analysis' },
  ];

  const getSummaryContent = () => {
    const summary = data.summary;
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const bulletPoints = sentences.slice(0, 5).map(s => s.trim());
    return bulletPoints;
  };

  const parseOverviewSections = () => {
    const text = data.audioTabs.find(t => t.title === 'Overview')?.content || data.summary;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const mid = Math.ceil(sentences.length / 2);
    return [
      { title: 'Core Concepts', items: sentences.slice(0, mid) },
      { title: 'Key Relationships', items: sentences.slice(mid) },
    ];
  };

  const parseDeepDiveSections = () => {
    const text = data.audioTabs.find(t => t.title === 'Deep Dive')?.content || data.audioTabs.find(t => t.title === 'Overview')?.content || data.summary;
    const paragraphs = text.split('\n').filter(s => s.trim().length > 0);
    const sections: Array<{ heading: string; content: string }> = [];
    paragraphs.forEach((p, i) => {
      if (p.length < 50 && i < paragraphs.length - 1) {
        sections.push({ heading: p.trim(), content: paragraphs[i + 1] || '' });
      }
    });
    if (sections.length === 0) {
      sections.push({ heading: 'Technical Breakdown', content: text });
    }
    return sections;
  };

  const summaryPoints = getSummaryContent();
  const overviewSections = parseOverviewSections();
  const deepDiveSections = parseDeepDiveSections();
  const keyTakeaways = data.audioTabs.find(t => t.title === 'Key Takeaways')?.content || '';

  // Extract terminology-inspired chips from data
  const terminologyChips = [
    { term: 'Core Analysis', color: 'bg-primary/20 text-primary' },
    { term: 'Context Mapping', color: 'bg-accent/20 text-accent' },
    { term: 'Applied Knowledge', color: 'bg-success/20 text-success' },
  ];

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  return (
    <div className="dark-glass rounded-xl p-5 col-span-1 md:col-span-2 xl:col-span-3">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen size={20} className="text-primary" />
        <h2 className="font-heading text-base tracking-wider text-text-primary">Module Synthesis</h2>
      </div>

      {/* Mode selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => setActiveMode(mode.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading tracking-wider transition-all flex items-center gap-1.5
              ${activeMode === mode.key
                ? 'bg-primary text-text-inverse shadow-lg shadow-primary/20'
                : 'text-text-secondary hover:text-text-primary bg-bg-card-hover'
              }`}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>

      {/* ─── SUMMARY MODE ─── */}
      {activeMode === 'summary' && (
        <div className="animate-fade-in max-w-2xl">
          <p className="text-text-muted text-xs mb-4 flex items-center gap-1">
            <Target size={12} /> Quick recap — 20 seconds or less
          </p>
          <div className="space-y-2">
            {summaryPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-bg-elevated/50 hover:bg-bg-elevated transition-colors">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-text-primary text-sm leading-relaxed">{point}.</p>
              </div>
            ))}
          </div>

          {keyTakeaways && (
            <div className="mt-5 p-4 rounded-lg bg-warning/5 border border-warning/10">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} className="text-warning" />
                <span className="font-heading text-xs text-warning tracking-wider">KEY TAKEAWAYS</span>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed">{keyTakeaways}</p>
            </div>
          )}
        </div>
      )}

      {/* ─── OVERVIEW MODE ─── */}
      {activeMode === 'overview' && (
        <div className="animate-fade-in">
          <p className="text-text-muted text-xs mb-4 flex items-center gap-1">
            <Layers size={12} /> Structural map — what and why
          </p>

          {/* Terminology chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {terminologyChips.map((chip) => (
              <span key={chip.term} className={`px-2.5 py-1 rounded-full text-[10px] font-heading ${chip.color}`}>
                {chip.term}
              </span>
            ))}
          </div>

          {/* Collapsible accordion sections */}
          <div className="space-y-2">
            {overviewSections.map((section, si) => {
              const isExpanded = expandedSections[`overview-${si}`] ?? true;
              return (
                <div key={si} className="rounded-lg border border-border-glass overflow-hidden">
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, [`overview-${si}`]: !isExpanded }))}
                    className="w-full flex items-center justify-between p-3 bg-bg-elevated/50 hover:bg-bg-elevated transition-colors"
                  >
                    <span className="font-heading text-xs text-text-primary tracking-wider">{section.title}</span>
                    {isExpanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
                  </button>
                  {isExpanded && (
                    <div className="p-3 space-y-2 animate-slide-down">
                      {section.items.map((item, ii) => (
                        <div key={ii} className="flex items-start gap-2">
                          <ArrowRight size={12} className="text-accent mt-1 shrink-0" />
                          <p className="text-text-secondary text-xs leading-relaxed">{item}.</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feature/topic matrix */}
          <div className="mt-5 p-4 rounded-lg bg-bg-elevated/50">
            <p className="font-heading text-xs text-text-primary tracking-wider mb-3">Topic Matrix</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Foundations', 'Applications', 'Methods', 'Analysis', 'Synthesis', 'Evaluation'].map((topic) => (
                <div key={topic} className="p-2 rounded-md bg-bg-card text-center">
                  <p className="text-text-secondary text-[10px]">{topic}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── DEEP DIVE MODE ─── */}
      {activeMode === 'deepdive' && (
        <div className="animate-fade-in flex flex-col md:flex-row gap-5">
          {/* TOC sidebar */}
          <div className="md:w-48 shrink-0">
            <p className="font-heading text-xs text-text-muted tracking-wider mb-3 uppercase">Contents</p>
            <nav className="space-y-1 sticky top-4">
              {deepDiveSections.map((section, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const el = document.getElementById(`deep-section-${i}`);
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block w-full text-left px-2 py-1.5 rounded text-[11px] text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors truncate"
                >
                  {section.heading}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-text-muted text-xs mb-4 flex items-center gap-1">
              <BookMarked size={12} /> Granular technical analysis
            </p>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {deepDiveSections.map((section, i) => (
                <div key={i} id={`deep-section-${i}`} className="scroll-mt-8">
                  <h3 className="font-heading text-sm text-primary tracking-wider mb-3 pb-2 border-b border-border-glass">
                    {section.heading}
                  </h3>
                  <div className="text-text-secondary text-sm leading-relaxed space-y-3">
                    {section.content.split('\n').map((para, pi) => (
                      para.trim() ? (
                        <p key={pi}>{para}</p>
                      ) : null
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}