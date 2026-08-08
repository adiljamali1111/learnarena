import { useState, useRef, useCallback } from 'react';
import { X, FileText, Upload, Sparkles } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotesInputModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<'paste' | 'upload'>('paste');
  const [notes, setNotes] = useState('');
  const { generateFromNotes, generateFromFiles, isLoading } = useDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = useCallback(async () => {
    if (mode === 'paste' && notes.trim()) {
      await generateFromNotes(notes);
      onClose();
    }
  }, [mode, notes, generateFromNotes, onClose]);

  const handleFiles = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    await generateFromFiles(files);
    onClose();
  }, [generateFromFiles, onClose]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    await generateFromFiles(files);
    onClose();
  }, [generateFromFiles, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg p-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-foreground">Import Study Material</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-dark-hover text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-4 bg-dark-elevated rounded-lg p-1">
          <button
            onClick={() => setMode('paste')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-heading transition-all cursor-pointer ${
              mode === 'paste'
                ? 'bg-primary text-dark-base font-bold'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> PASTE NOTES
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-heading transition-all cursor-pointer ${
              mode === 'upload'
                ? 'bg-primary text-dark-base font-bold'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> UPLOAD FILES
          </button>
        </div>

        {/* Paste mode */}
        {mode === 'paste' && (
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your notes, lecture transcripts, or study material here..."
              className="w-full h-44 bg-dark-elevated border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-lighter resize-none focus:outline-none focus:border-primary transition-colors font-mono"
            />
            <button
              onClick={handleGenerate}
              disabled={!notes.trim() || isLoading}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-dark-base font-heading font-bold text-sm tracking-wider hover:bg-primary-light transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-dark-base border-t-transparent rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> GENERATE STUDY UNIVERSE
                </span>
              )}
            </button>
          </div>
        )}

        {/* Upload mode */}
        {mode === 'upload' && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted" />
            <p className="text-sm text-muted mb-1">Drop files here or click to browse</p>
            <p className="text-xs text-muted-lighter">PDF, DOCX, PPTX, TXT, MD — Max 15 MB each, 6 files</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.pptx,.txt,.md"
              onChange={handleFiles}
              className="hidden"
            />
          </div>
        )}

        {isLoading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Processing your material...
          </div>
        )}
      </div>
    </div>
  );
}