/* ──────────────────────────────────────────
   LearnArena — Study Report (Export)
   ────────────────────────────────────────── */

import { useState } from 'react';
import { Download, Copy, CheckCircle2, Clock, BookOpen, Zap } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function StudyReport() {
  const { state } = useDashboard();
  const dashboard = state.dashboard;
  const [copied, setCopied] = useState(false);

  if (!dashboard) {
    return (
      <div className="dark-glass rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h3 className="font-heading text-lg text-text-primary mb-2">No Report Available</h3>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          Generate a study module first to create a downloadable study report.
        </p>
      </div>
    );
  }

  const reportText = generateReportText(dashboard, state);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dashboard.moduleTitle.replace(/\s+/g, '_')}_Study_Report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl text-text-primary">Study Report</h2>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="glass-button-ghost px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            {copied ? <CheckCircle2 size={16} className="text-success" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleDownload} className="glass-button px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <Download size={16} /> Download .md
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="dark-glass rounded-xl p-6 overflow-auto max-h-[65vh]">
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-glass">
            <span className="text-4xl">{dashboard.moduleEmoji}</span>
            <div>
              <h1 className="font-heading text-xl text-text-primary">{dashboard.moduleTitle}</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-heading
                ${dashboard.globalDifficulty === 'beginner' ? 'bg-success/20 text-success' :
                  dashboard.globalDifficulty === 'intermediate' ? 'bg-warning/20 text-warning' :
                  'bg-danger/20 text-danger'}`}
              >
                {dashboard.globalDifficulty.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className="flex items-center gap-1 text-text-muted"><Clock size={14} /> {new Date().toLocaleDateString()}</span>
            <span className="flex items-center gap-1 text-text-muted"><BookOpen size={14} /> {dashboard.coreConcepts.length} concepts</span>
            <span className="flex items-center gap-1 text-text-muted"><Zap size={14} /> Lv.{state.xp.level}</span>
          </div>

          <section className="mb-6">
            <h2 className="font-heading text-base text-text-primary mb-2">📋 Summary</h2>
            <p className="text-text-secondary text-sm">{dashboard.synthesis.summary}</p>
          </section>

          <section className="mb-6">
            <h2 className="font-heading text-base text-text-primary mb-2">🔑 Key Takeaways</h2>
            <ul className="space-y-1">
              {dashboard.synthesis.keyTakeaways.map((kt, i) => (
                <li key={i} className="text-text-secondary text-sm flex items-start gap-2">
                  <span className="text-primary shrink-0">▸</span> {kt}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="font-heading text-base text-text-primary mb-2">📚 Core Concepts</h2>
            <div className="space-y-3">
              {dashboard.coreConcepts.map((cc) => (
                <div key={cc.id} className="bg-bg-elevated rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{cc.emoji}</span>
                    <h3 className="font-heading text-sm text-text-primary">{cc.term}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full
                      ${cc.difficulty === 'easy' ? 'bg-success/20 text-success' :
                        cc.difficulty === 'medium' ? 'bg-warning/20 text-warning' :
                        'bg-danger/20 text-danger'}`}
                    >
                      {cc.difficulty}
                    </span>
                  </div>
                  <p className="text-text-secondary text-xs">{cc.definition}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="font-heading text-base text-text-primary mb-2">🚀 Recommended Next Steps</h2>
            <ul className="space-y-1">
              {dashboard.synthesis.recommendedNext.map((rn, i) => (
                <li key={i} className="text-text-secondary text-sm flex items-start gap-2">
                  <span className="text-accent shrink-0">→</span> {rn}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function generateReportText(
  dashboard: NonNullable<ReturnType<typeof useDashboard>['state']['dashboard']>,
  state: ReturnType<typeof useDashboard>['state'],
): string {
  return `# ${dashboard.moduleEmoji} ${dashboard.moduleTitle}
**Difficulty:** ${dashboard.globalDifficulty}  
**Generated:** ${new Date().toLocaleDateString()}  
**Concepts:** ${dashboard.coreConcepts.length}  
**Level:** ${state.xp.level}

---

## Summary
${dashboard.synthesis.summary}

## Key Takeaways
${dashboard.synthesis.keyTakeaways.map((k) => `- ${k}`).join('\n')}

## Core Concepts
${dashboard.coreConcepts.map((cc) =>
  `### ${cc.emoji} ${cc.term} (${cc.difficulty})
${cc.definition}`
).join('\n\n')}

## Recommended Next Steps
${dashboard.synthesis.recommendedNext.map((r) => `- ${r}`).join('\n')}

---
Generated by LearnArena
`;
}
