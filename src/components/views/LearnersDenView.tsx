import { Sparkles, ArrowRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { DEN_TOOLS } from '../../types/dashboard';

export default function LearnersDenView() {
  const { state, openDenTool } = useDashboard();
  const activeModule = state.modules.find((m) => m.id === state.activeModuleId);

  if (!activeModule) {
    return (
      <div className="p-4 max-w-4xl mx-auto mt-12 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="glass-card p-8 text-center max-w-md animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-accent" />
          </div>
          <h2 className="font-heading font-bold text-xl mb-2">Learner's Den</h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Generate interactive study tools — audio overviews, mind maps,
            presentations, flashcards, visual breakdowns, and study reports.
            Load a module first to get started.
          </p>
          <p className="text-xs text-muted-lighter">
            Go to{' '}
            <span className="text-accent">My Universe</span> and load a module,
            or create a new one from the Dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shadow-glow-cyan-sm">
          <Sparkles size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-xl">Learner's Den</h2>
          <p className="text-xs text-muted">
            Generating study aids for <span className="text-accent">{activeModule.title}</span>
          </p>
        </div>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEN_TOOLS.map((tool) => (
          <button
            key={tool.key}
            onClick={() => openDenTool(tool.key)}
            className="glass-card-interactive p-5 text-left group cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 text-2xl`}>
              {tool.icon}
            </div>
            <h3 className="font-heading font-semibold text-sm mb-1 group-hover:text-accent transition-colors truncate">
              {tool.title}
            </h3>
            <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-3">
              {tool.description}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-accent opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight size={10} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}