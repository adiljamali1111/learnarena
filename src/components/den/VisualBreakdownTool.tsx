import { useDashboard } from '../../context/DashboardContext';
import { useDenTool } from './useDenTool';
import { generateDenContent } from '../../services/openrouter';
import DenToolShell from './DenToolShell';
import type { VisualBreakdownContent } from '../../types/dashboard';

interface Props {
  moduleTitle: string;
  sourceText: string;
  onBack: () => void;
}

export default function VisualBreakdownTool({ moduleTitle, sourceText, onBack }: Props) {
  const { generateDenToolContent } = useDashboard();

  const { data, loading, error, generating, regenerate } = useDenTool<VisualBreakdownContent>(
    () => generateDenContent('visual-breakdown', moduleTitle, sourceText, []) as Promise<VisualBreakdownContent>,
    `visual-breakdown_${moduleTitle}`,
  );

  return (
    <DenToolShell
      title="Visual Breakdown"
      loading={loading}
      error={error}
      generating={generating}
      onBack={onBack}
      onRegenerate={regenerate}
    >
      {data && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.stats.map((stat, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <p className="font-heading text-2xl font-bold text-accent mb-1">{stat.value}</p>
                <p className="text-2xs text-muted-lighter uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="glass-card p-5">
            <h3 className="font-heading text-sm font-bold text-primary mb-4">Timeline</h3>
            <div className="space-y-3">
              {data.timeline.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
                    {i < data.timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div>
                    <span className="text-xs text-accent font-mono">{item.period}</span>
                    <p className="text-sm text-foreground/90">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {data.sections.map((section, i) => (
              <div key={i} className="glass-card p-5">
                <h3 className="font-heading text-sm font-bold text-foreground mb-2">{section.heading}</h3>
                <p className="text-sm text-muted leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          {/* Fun fact */}
          <div className="glass-card p-5 border-l-2 border-gold">
            <p className="text-2xs text-gold uppercase tracking-wider mb-1">Fun Fact</p>
            <p className="text-sm text-foreground/90 italic">{data.funFact}</p>
          </div>
        </div>
      )}
    </DenToolShell>
  );
}