import { ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  title: string;
  loading: boolean;
  error: string | null;
  generating: boolean;
  onBack: () => void;
  onRegenerate: () => void;
  children: React.ReactNode;
}

export default function DenToolShell({ title, loading, error, generating, onBack, onRegenerate, children }: Props) {
  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Den
          </button>
          <button
            onClick={onRegenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-hover text-muted hover:text-foreground text-xs transition-colors cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Regenerate'}
          </button>
        </div>

        {/* Title */}
        <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted">Loading...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <button
              onClick={onRegenerate}
              disabled={generating}
              className="px-4 py-2 rounded-xl bg-primary text-dark-base text-xs font-heading font-bold hover:bg-primary-light transition-colors cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && children}
      </div>
    </div>
  );
}