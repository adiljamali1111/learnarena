import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { DEN_TOOLS, type DenToolKey } from '../../types/dashboard';

interface Props {
  toolKey: DenToolKey;
  isLoading: boolean;
  error: string | null;
  onRegenerate: () => void;
  children: React.ReactNode;
}

export default function DenToolShell({
  toolKey,
  isLoading,
  error,
  onRegenerate,
  children,
}: Props) {
  const { closeDenTool } = useDashboard();
  const toolInfo = DEN_TOOLS.find((t) => t.key === toolKey);

  return (
    <div className="p-4 max-w-4xl mx-auto min-h-[60vh]">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={closeDenTool}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft size={18} className="text-muted" />
        </button>

        {toolInfo && (
          <>
            <span className="text-2xl">{toolInfo.icon}</span>
            <div className="flex-1">
              <h2 className="font-heading font-semibold text-lg">{toolInfo.title}</h2>
              <p className="text-xs text-muted">{toolInfo.description}</p>
            </div>
          </>
        )}

        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
          title="Regenerate"
        >
          <RefreshCw
            size={16}
            className={`text-muted ${isLoading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <Loader2 size={32} className="text-accent animate-spin mb-3" />
          <p className="text-sm text-muted">Generating {toolInfo?.title || 'content'}...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center">
          <p className="text-destructive text-sm mb-3">{error}</p>
          <button
            onClick={onRegenerate}
            className="btn-base px-4 py-2 rounded-xl bg-primary text-white text-sm hover:shadow-glow-purple transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="animate-fade-in-up">{children}</div>
      )}
    </div>
  );
}