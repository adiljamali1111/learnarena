import { useState, useRef, useCallback } from 'react';
import { FileText, Upload, X, File, AlertCircle } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const ACCEPTED_TYPES = '.pdf,.docx,.pptx,.txt,.md';
const MAX_FILES = 6;

export default function NotesInputModal() {
  const { setModal, generateFromNotes, state } = useDashboard();
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) =>
        f.name.match(/\.(pdf|docx|pptx|txt|md)$/i) && f.size <= 15 * 1024 * 1024,
    );
    setFiles((prev) => {
      const combined = [...prev, ...droppedFiles].slice(0, MAX_FILES);
      return combined;
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => {
      const combined = [...prev, ...selected].slice(0, MAX_FILES);
      return combined;
    });
    if (e.target) e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const trimmedNotes = notes.trim();
    if (!trimmedNotes && files.length === 0) return;

    setIsSubmitting(true);
    await generateFromNotes(trimmedNotes, files.length > 0 ? files : undefined);
    setIsSubmitting(false);
  };

  const hasContent = notes.trim().length > 0 || files.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl p-6 relative animate-fade-in-up max-h-[90vh] flex flex-col">
        {/* Close */}
        <button
          onClick={() => setModal('none')}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <FileText className="text-accent" size={20} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">New Study Module</h2>
            <p className="text-xs text-muted">
              Paste your notes or upload course materials
            </p>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your notes here... (or upload files below)"
          className="w-full flex-1 min-h-[160px] px-4 py-3 rounded-xl bg-white/5 border border-glass-border text-foreground placeholder-muted-lighter font-mono text-sm focus:outline-none focus:border-accent transition-colors resize-none"
        />

        {/* File drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`mt-4 border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer ${
            dragActive
              ? 'drop-zone-active'
              : 'border-glass-border hover:border-accent/40'
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload
            size={24}
            className={`mx-auto mb-2 ${dragActive ? 'text-accent' : 'text-muted-lighter'}`}
          />
          <p className="text-sm text-muted">
            {dragActive
              ? 'Drop files here'
              : 'Drop files or click to upload'}
          </p>
          <p className="text-xs text-muted-lighter mt-1">
            PDF, DOCX, PPTX, TXT, MD (max 15MB each, up to {MAX_FILES} files)
          </p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-3 space-y-1.5 max-h-[120px] overflow-y-auto">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-sm"
              >
                <File size={14} className="text-accent shrink-0" />
                <span className="text-foreground truncate flex-1">{file.name}</span>
                <span className="text-muted-lighter text-xs shrink-0">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="text-muted hover:text-destructive transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Warning */}
        {!hasContent && (
          <div className="mt-3 flex items-start gap-2 text-xs text-warning">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p>
              Paste some notes or upload at least one file to generate your
              dashboard.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setModal('none')}
            className="btn-base flex-1 py-3 rounded-xl bg-white/5 text-muted hover:text-foreground hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!hasContent || isSubmitting}
            className="btn-base flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:shadow-glow-purple transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate Dashboard'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}