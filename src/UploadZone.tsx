import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { Upload, FileText, FileImage, File as FileIcon, AlertCircle } from 'lucide-react';

export interface UploadFileItem {
  id: string;
  filename: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  error?: string;
}

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  queue: UploadFileItem[];
  disabled: boolean;
}

const ACCEPT = '.pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif';

export default function UploadZone({ onFilesSelected, queue, disabled }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      dragCounter.current = 0;

      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, disabled],
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) {
        onFilesSelected(files);
      }
      // Reset so re-selecting the same file works
      e.target.value = '';
    },
    [onFilesSelected],
  );

  const hasItems = queue.length > 0;

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload study materials"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center
          transition-all duration-200 cursor-pointer outline-none
          ${
            dragging
              ? 'border-accent bg-accent-glow/30 shadow-glow'
              : 'border-border hover:border-accent-light hover:bg-bg-card'
          }
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={handleFileChange}
          tabIndex={-1}
        />
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              dragging ? 'bg-accent text-white' : 'bg-bg-elevated text-text-dim'
            }`}
          >
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {dragging ? 'Drop files here' : 'Drop files here or click to browse'}
            </p>
            <p className="text-xs text-text-dim mt-1">
              PDF, DOCX, TXT, Images (JPG, PNG, WebP, GIF)
            </p>
          </div>
        </div>
      </div>

      {/* Queue progress list */}
      {hasItems && (
        <div className="space-y-1.5">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-bg-card border border-border text-sm"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-7 h-7 rounded-md bg-bg-elevated flex items-center justify-center">
                {item.status === 'error' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                ) : item.status === 'done' ? (
                  <FileIcon className="w-3.5 h-3.5 text-success" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-text-dim" />
                )}
              </div>

              {/* Name */}
              <span className="flex-1 truncate text-text-primary">{item.filename}</span>

              {/* Status indicator */}
              {item.status === 'queued' && (
                <span className="text-xs text-text-dim">Queued</span>
              )}
              {item.status === 'processing' && (
                <span className="flex items-center gap-1.5 text-xs text-accent-light">
                  <span className="inline-block w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Processing
                </span>
              )}
              {item.status === 'done' && (
                <span className="text-xs text-success">Done</span>
              )}
              {item.status === 'error' && (
                <span className="text-xs text-destructive truncate max-w-[180px]" title={item.error}>
                  {item.error ?? 'Error'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}