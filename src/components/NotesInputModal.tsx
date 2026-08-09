import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, AlertCircle, Sparkles } from 'lucide-react';
import { validateFiles, parseFile, ParsedFile, FileParseError } from '../services/fileParser';
import { FILE_LIMITS } from '../constants';

interface NotesInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, images: string[], noteContent: string) => void;
  onTryDemo: () => void;
  isGenerating: boolean;
  error?: string;
}

export default function NotesInputModal({ isOpen, onClose, onSubmit, onTryDemo, isGenerating, error }: NotesInputModalProps) {
  const [textInput, setTextInput] = useState('');
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [errors, setErrors] = useState<FileParseError[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const { valid, errors: validationErrors } = validateFiles(fileArray);
    setErrors(validationErrors);

    if (valid.length === 0) return;

    setIsParsing(true);

    try {
      const results = await Promise.allSettled(valid.map(parseFile));
      const parsed: ParsedFile[] = [];
      const parseErrors: FileParseError[] = [];

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled') {
          parsed.push(result.value);
        } else {
          parseErrors.push({
            fileName: valid[i].name,
            error: result.reason?.message || 'Failed to parse file',
          });
        }
      }

      setParsedFiles((prev) => [...prev, ...parsed]);
      setErrors((prev) => [...prev, ...parseErrors]);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setParsedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const allText = [
      textInput,
      ...parsedFiles.map((pf) => `--- ${pf.fileName} ---\n${pf.text}`),
    ]
      .filter(Boolean)
      .join('\n\n');

    const allImages = parsedFiles.flatMap((pf) => pf.images).slice(0, 10);

    if (!allText.trim()) return;

    onSubmit(allText, allImages, textInput || parsedFiles[0]?.fileName || 'Untitled');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-overlay animate-fade-in">
      <div className="dark-glass rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl text-text-primary">Import Your Notes</h2>
          <button onClick={onClose} className="glass-button-ghost p-2 rounded-lg" disabled={isGenerating}>
            <X size={20} />
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium mb-1">Generation failed</p>
              <p>{error}</p>
              <p className="mt-2 text-text-muted">
                Try pasting different text, or use the demo below to explore the app right away.
              </p>
            </div>
          </div>
        )}

        {/* Text paste area */}
        <div className="mb-6">
          <label className="text-text-secondary text-sm mb-2 block">Paste your notes here</label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste lecture notes, study material, or any text content..."
            className="glass-input w-full h-32 resize-none p-4 text-sm"
            disabled={isGenerating}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border-glass" />
          <span className="text-text-muted text-xs font-heading">OR</span>
          <div className="flex-1 h-px bg-border-glass" />
        </div>

        {/* File upload */}
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-border-glass rounded-xl p-8 text-center cursor-pointer
            hover:border-primary/50 hover:bg-bg-card-hover transition-all duration-200"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={36} className="mx-auto mb-3 text-text-muted" />
          <p className="text-text-secondary text-sm mb-1">
            Drop files here or click to browse
          </p>
          <p className="text-text-muted text-xs">
            PDF, DOCX, PPTX, TXT, MD — up to {FILE_LIMITS.maxFiles} files, {FILE_LIMITS.maxSizeMB}MB total
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.txt,.md"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={isGenerating}
          />
        </div>

        {/* File list */}
        {parsedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {parsedFiles.map((pf, i) => (
              <div key={i} className="flex items-center gap-3 bg-bg-elevated rounded-lg p-3">
                <FileText size={18} className="text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm truncate">{pf.fileName}</p>
                  <p className="text-text-muted text-xs">
                    {pf.text.length} chars · {pf.images.length} images
                  </p>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="glass-button-ghost p-1 rounded shrink-0"
                  disabled={isGenerating}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mt-4 space-y-1">
            {errors.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-danger text-xs">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{e.fileName}: {e.error}</span>
              </div>
            ))}
          </div>
        )}

        {/* Submit buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={(!textInput.trim() && parsedFiles.length === 0) || isGenerating || isParsing}
            className="glass-button flex-1 py-3 font-heading tracking-wider"
          >
            {isGenerating || isParsing ? 'Processing...' : 'GENERATE STUDY UNIVERSE'}
          </button>
          <button
            onClick={onTryDemo}
            disabled={isGenerating}
            className="glass-button-ghost px-5 py-3 font-heading tracking-wider text-sm flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            TRY DEMO
          </button>
        </div>
      </div>
    </div>
  );
}