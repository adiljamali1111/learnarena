import {
  Headphones,
  GitBranch,
  Presentation,
  CreditCard,
  BarChart3,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import type { DenToolKey } from '../../types/dashboard';

interface Props {
  onSelectTool: (tool: DenToolKey) => void;
  onBack: () => void;
}

const tools: { key: DenToolKey; icon: typeof Headphones; label: string; desc: string }[] = [
  { key: 'audio-overview', icon: Headphones, label: 'Audio Overview', desc: 'Listen to a narrated summary of your material' },
  { key: 'mindmap', icon: GitBranch, label: 'Mind Map', desc: 'Explore concepts and their relationships visually' },
  { key: 'presentation', icon: Presentation, label: 'Presentation', desc: 'Slide-by-slide walkthrough of key topics' },
  { key: 'recall-cards', icon: CreditCard, label: 'Recall Cards', desc: 'Flip-card flashcards to test your memory' },
  { key: 'visual-breakdown', icon: BarChart3, label: 'Visual Breakdown', desc: 'Infographic-style overview with stats and timelines' },
  { key: 'study-report', icon: FileText, label: 'Study Report', desc: 'Comprehensive Q&A report with glossary, exportable' },
];

export default function LearnersDenView({ onSelectTool, onBack }: Props) {
  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="mb-2">
          <h2 className="font-heading text-xl font-bold text-foreground">Learner&apos;s Den</h2>
          <p className="text-sm text-muted mt-1">Deep-dive tools for mastering your material</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.key}
                onClick={() => onSelectTool(tool.key)}
                className="glass-card p-5 text-left hover:border-primary/40 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary group-hover:text-primary-light transition-colors" />
                </div>
                <h3 className="font-heading text-sm font-bold text-foreground mb-1">{tool.label}</h3>
                <p className="text-xs text-muted leading-relaxed">{tool.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}