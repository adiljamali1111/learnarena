import { useState } from 'react';
import { BarChart3, Lightbulb, Target, ArrowRight, Rocket, TrendingUp, Layers, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function VisualBreakdown({ onClose: _onClose }: { onClose?: () => void }) {
  const { state } = useDashboard();
  const d = state.dashboard;

  const [expandedTakeaways, setExpandedTakeaways] = useState<Set<number>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  if (!d) return null;

  const core = d.coreConcepts;
  const topicTitle = d.moduleTitle;

  const toggleTakeaway = (i: number) => {
    setExpandedTakeaways((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const toggleStep = (i: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  // Generate key takeaways from core concepts
  const keyTakeaways = core.slice(0, 6).map((c) => ({
    title: c.term,
    fullDescription: c.definition,
    truncatedDescription: c.definition.length > 80 ? c.definition.slice(0, 80) + '...' : c.definition,
    icon: c.emoji,
    difficulty: c.difficulty,
  }));

  // Generate process flow from context graph
  const processSteps = d.contextGraph.slice(0, 5).map((node, i) => ({
    step: i + 1,
    label: node.label,
    desc: node.description,
  }));

  // Generate comparison pillars
  const comparisonPillars = [
    { title: 'Applications', icon: Rocket, items: core.filter(c => c.difficulty === 'hard').slice(0, 3).map(c => c.term), color: 'text-primary' },
    { title: 'Challenges', icon: TrendingUp, items: core.filter(c => c.difficulty === 'medium').slice(0, 3).map(c => c.term), color: 'text-warning' },
    { title: 'Foundations', icon: Layers, items: core.filter(c => c.difficulty === 'easy').slice(0, 3).map(c => c.term), color: 'text-success' },
  ];

  return (
    <div className="dark-glass rounded-xl p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={24} className="text-primary" />
        <h2 className="font-heading text-xl text-text-primary">Visual Study Infographic</h2>
      </div>

      {/* Topic title */}
      <div className="text-center mb-8">
        <p className="text-3xl mb-2">{d.moduleEmoji}</p>
        <h3 className="font-heading text-lg text-text-primary tracking-wider">{topicTitle}</h3>
        <span className="text-text-muted text-xs">{core.length} core concepts · {d.contextGraph.length} connections</span>
      </div>

      {/* Key Takeaways Cards - 3 column grid */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={16} className="text-warning" />
          <h4 className="font-heading text-sm text-text-primary tracking-wider">Key Takeaways</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {keyTakeaways.map((takeaway, i) => {
            const isExpanded = expandedTakeaways.has(i);
            const canExpand = takeaway.fullDescription.length > 80;
            return (
              <div key={i} className="bg-bg-elevated/50 rounded-xl p-4 hover:bg-bg-elevated transition-all border border-border-glass/30 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{takeaway.icon}</span>
                    <h5 className="font-heading text-xs text-text-primary tracking-wider">{takeaway.title}</h5>
                  </div>
                  {canExpand && (
                    <button
                      onClick={() => toggleTakeaway(i)}
                      className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-md hover:bg-bg-card-hover"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-text-muted text-[11px] leading-relaxed">
                    {isExpanded ? takeaway.fullDescription : takeaway.truncatedDescription}
                  </p>
                  {canExpand && !isExpanded && (
                    <button
                      onClick={() => toggleTakeaway(i)}
                      className="text-primary/70 hover:text-primary text-[10px] font-medium mt-1 transition-colors"
                    >
                      Expand
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Process Flow / Timeline Diagram */}
      {processSteps.length > 1 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={16} className="text-accent" />
            <h4 className="font-heading text-sm text-text-primary tracking-wider">Process Flow</h4>
          </div>
          <div className="space-y-3">
            {processSteps.map((step, i) => {
              const isExpanded = expandedSteps.has(i);
              return (
                <div key={i} className="relative">
                  {/* Vertical connector line */}
                  {i < processSteps.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border-glass/40" />
                  )}
                  <div
                    className="bg-bg-elevated/50 rounded-xl border border-border-glass/40 hover:border-border-glass-hover transition-all cursor-pointer"
                    onClick={() => toggleStep(i)}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm text-primary font-bold shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-heading text-sm text-text-primary tracking-wider">{step.label}</h5>
                        {!isExpanded && (
                          <p className="text-text-muted text-xs mt-0.5 line-clamp-1">{step.desc}</p>
                        )}
                      </div>
                      <div className="text-text-muted hover:text-text-primary transition-colors shrink-0">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-border-glass/30 mt-0">
                        <p className="text-text-secondary text-xs leading-relaxed mt-3">{step.desc}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-[10px] text-text-muted font-heading tracking-wider">STEP {step.step} OF {processSteps.length}</span>
                          <div className="flex-1 h-1 bg-bg-elevated rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${((step.step) / processSteps.length) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Arrow between steps (visible on wider screens) */}
                  {i < processSteps.length - 1 && (
                    <div className="hidden sm:flex justify-center py-1">
                      <ArrowRight size={14} className="text-text-muted/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison / Core Pillar Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-danger" />
          <h4 className="font-heading text-sm text-text-primary tracking-wider">Core Pillars</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {comparisonPillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div key={i} className="bg-bg-elevated/50 rounded-xl p-4 border border-border-glass/30">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={16} className={pillar.color} />
                  <h5 className="font-heading text-xs text-text-primary tracking-wider">{pillar.title}</h5>
                </div>
                <ul className="space-y-1.5">
                  {pillar.items.length > 0 ? pillar.items.map((item, ii) => (
                    <li key={ii} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-text-muted/40" />
                      <span className="text-text-secondary text-[11px]">{item}</span>
                    </li>
                  )) : (
                    <li className="text-text-muted text-[11px] italic">No items</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}