import { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useDenTool } from './useDenTool';
import { generateDenContent } from '../../services/openrouter';
import DenToolShell from './DenToolShell';
import type { MindMapContent } from '../../types/dashboard';

interface Props {
  moduleTitle: string;
  sourceText: string;
  onBack: () => void;
}

export default function MindMapTool({ moduleTitle, sourceText, onBack }: Props) {
  const { generateDenToolContent } = useDashboard();
  const [expandedBranch, setExpandedBranch] = useState<number | null>(null);
  const [expandedChild, setExpandedChild] = useState<number | null>(null);

  const { data, loading, error, generating, regenerate } = useDenTool<MindMapContent>(
    () => generateDenContent('mindmap', moduleTitle, sourceText, []) as Promise<MindMapContent>,
    `mindmap_${moduleTitle}`,
  );

  return (
    <DenToolShell
      title="Mind Map"
      loading={loading}
      error={error}
      generating={generating}
      onBack={onBack}
      onRegenerate={regenerate}
    >
      {data && (
        <div className="glass-card p-6">
          {/* Central topic */}
          <div className="text-center mb-8">
            <div className="inline-block px-6 py-3 rounded-xl bg-primary/20 border border-primary/40">
              <p className="font-heading text-lg font-bold text-primary">{data.centralTopic}</p>
            </div>
          </div>

          {/* Branches */}
          <div className="space-y-4">
            {data.branches.map((branch, bi) => (
              <div key={bi} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedBranch(expandedBranch === bi ? null : bi)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-dark-elevated/60 hover:bg-dark-hover transition-colors cursor-pointer"
                >
                  <span className="font-heading text-sm font-bold text-foreground">{branch.label}</span>
                  <span className={`text-xs text-muted transition-transform ${expandedBranch === bi ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                </button>

                {expandedBranch === bi && (
                  <div className="p-3 space-y-2">
                    {branch.children.map((child, ci) => (
                      <div key={ci} className="border border-border/50 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedChild(expandedChild === ci ? null : ci)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-dark-hover transition-colors cursor-pointer"
                        >
                          <span>{child.label}</span>
                          <span className={`text-xs text-muted-lighter transition-transform ${expandedChild === ci ? 'rotate-90' : ''}`}>▶</span>
                        </button>
                        {expandedChild === ci && (
                          <div className="px-3 pb-2">
                            <p className="text-xs text-muted leading-relaxed">{child.meaning}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </DenToolShell>
  );
}