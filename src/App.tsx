import { useState, useCallback, useEffect } from 'react';
import { ToastProvider, useToast } from './ToastContext';
import { getModules, getModule, getApiKey, addModule, getOnboardedFlag } from './store';
import type { View } from './types';
import type { UploadFileItem } from './UploadZone';
import { Download, BookOpen, Key, FileText, Clock } from 'lucide-react';
import KeyModal from './KeyModal';
import UploadZone from './UploadZone';
import OnboardingOverlay from './OnboardingOverlay';
import { processFile } from './fileProcessing';

function NavBar({
  view,
  onBack,
  onExport,
  onOpenKeyModal,
}: {
  view: View;
  onBack: () => void;
  onExport: () => void;
  onOpenKeyModal: () => void;
}) {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-bg-base/95 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {view === 'module' && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Back to Dashboard"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-semibold tracking-tight text-text-primary">
            LearnArena
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenKeyModal}
          className="flex items-center justify-center w-8 h-8 rounded-md text-text-dim hover:text-text-primary hover:bg-bg-hover border border-border transition-all duration-200 cursor-pointer"
          aria-label="OpenRouter API Key"
          title="OpenRouter API Key"
        >
          <Key className="w-4 h-4" />
        </button>
        {view === 'dashboard' && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-bg-elevated hover:bg-bg-hover text-text-muted hover:text-text-primary border border-border transition-all duration-200 cursor-pointer"
            aria-label="Export modules as JSON"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        )}
      </div>
    </nav>
  );
}

function DashboardView({ onModuleClick }: { onModuleClick: (id: string) => void }) {
  const [modules, setModules] = useState(getModules);
  const [queue, setQueue] = useState<UploadFileItem[]>([]);
  const { addToast } = useToast();

  const refreshModules = useCallback(() => {
    setModules(getModules());
  }, []);

  const processFilesSequentially = useCallback(
    async (files: File[], startIndex: number) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const itemIndex = startIndex + i;

        setQueue((prev) => {
          const item = prev[itemIndex];
          if (!item) return prev;
          return prev.map((it) =>
            it.id === item.id ? { ...it, status: 'processing' as const } : it,
          );
        });

        try {
          const result = await processFile(file);
          const moduleType = result.type === 'image' ? 'image' as const
            : result.type === 'pdf' ? 'pdf' as const
            : result.type === 'docx' ? 'docx' as const
            : 'text' as const;

          addModule({
            id: result.id,
            filename: result.filename,
            title: result.filename.replace(/\.[^.]+$/, ''),
            content: result.content,
            type: moduleType,
            timestamp: Date.now(),
            tutorHistory: [],
          });

          setQueue((prev) => {
            const item = prev[itemIndex];
            if (!item) return prev;
            return prev.map((it) =>
              it.id === item.id ? { ...it, status: 'done' as const } : it,
            );
          });

          refreshModules();
          addToast(`${file.name} processed successfully`, 'success');
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Processing failed';
          setQueue((prev) => {
            const item = prev[itemIndex];
            if (!item) return prev;
            return prev.map((it) =>
              it.id === item.id ? { ...it, status: 'error' as const, error: msg } : it,
            );
          });
          addToast(msg, 'error');
        }
      }
    },
    [refreshModules, addToast],
  );

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const newItems: UploadFileItem[] = files.map((f) => ({
        id: crypto.randomUUID(),
        filename: f.name,
        status: 'queued' as const,
      }));

      setQueue((prev) => {
        const updated = [...prev, ...newItems];
        setTimeout(() => {
          processFilesSequentially(files, updated.length - files.length);
        }, 0);
        return updated;
      });
    },
    [processFilesSequentially],
  );

  // Show prominent upload area when no modules exist
  if (modules.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-16 h-16 rounded-full bg-accent-glow flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Welcome to LearnArena</h2>
        <p className="text-text-muted max-w-md text-center mb-6">
          Upload your first study material to get started. LearnArena will extract the text
          and create interactive study modules.
        </p>
        <div className="w-full max-w-lg">
          <UploadZone onFilesSelected={handleFilesSelected} queue={queue} disabled={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Upload zone (compact variant when modules exist) */}
        <div className="w-full max-w-lg mx-auto">
          <UploadZone onFilesSelected={handleFilesSelected} queue={queue} disabled={false} />
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => onModuleClick(mod.id)}
              className="group text-left bg-bg-card hover:bg-bg-hover border border-border hover:border-accent/40 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_16px_oklch(0.41_0.14_250/15%)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center mt-0.5">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                    {mod.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-text-dim" />
                    <span className="text-xs text-text-dim">
                      {new Date(mod.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-muted mt-3 line-clamp-3 leading-relaxed">
                {mod.content.slice(0, 200)}
                {mod.content.length > 200 ? '…' : ''}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuleView({ moduleId }: { moduleId: string }) {
  const mod = getModule(moduleId);

  if (!mod) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        Module not found
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <h2 className="text-xl font-semibold text-text-primary mb-4">{mod.title}</h2>
        <div className="flex-1 bg-bg-card border border-border rounded-xl p-4 overflow-y-auto">
          <pre className="font-mono text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
            {mod.content}
          </pre>
        </div>
        <div className="mt-4 p-4 bg-bg-card border border-border rounded-xl">
          <p className="text-text-muted text-sm">AI actions will appear here (Quiz, Explain, Tutor, etc.)</p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [view, setView] = useState<View>('dashboard');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { addToast } = useToast();

  // Prompt for API key on first load if not set
  useEffect(() => {
    if (!getApiKey()) {
      setKeyModalOpen(true);
    }
  }, []);

  // Show onboarding on first visit (after any key prompt)
  useEffect(() => {
    if (!keyModalOpen && !getOnboardedFlag()) {
      setShowOnboarding(true);
    }
  }, [keyModalOpen]);

  const handleModuleClick = useCallback((id: string) => {
    setActiveModuleId(id);
    setView('module');
  }, []);

  const handleBack = useCallback(() => {
    setActiveModuleId(null);
    setView('dashboard');
  }, []);

  const handleExport = useCallback(() => {
    try {
      const modules = getModules();
      const data = JSON.stringify(modules, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];
      const a = document.createElement('a');
      a.href = url;
      a.download = `learnarena-export-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Modules exported successfully', 'success');
    } catch {
      addToast('Failed to export modules', 'error');
    }
  }, [addToast]);

  return (
    <div className="h-dvh flex flex-col bg-bg-base">
      <NavBar
        view={view}
        onBack={handleBack}
        onExport={handleExport}
        onOpenKeyModal={() => setKeyModalOpen(true)}
      />
      {view === 'dashboard' ? (
        <DashboardView onModuleClick={handleModuleClick} />
      ) : (
        activeModuleId && <ModuleView moduleId={activeModuleId} />
      )}
      <KeyModal open={keyModalOpen} onClose={() => setKeyModalOpen(false)} />
      {showOnboarding && (
        <OnboardingOverlay onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}