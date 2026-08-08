import { useState, useEffect, useRef, useCallback } from 'react';
import { getApiKey, setApiKey, removeApiKey } from './store';
import { Key, Eye, EyeOff, X } from 'lucide-react';
import { useToast } from './ToastContext';

interface KeyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function KeyModal({ open, onClose }: KeyModalProps) {
  const [value, setValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const { addToast } = useToast();

  // Track what had focus before opening
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      // Populate with existing key
      const existing = getApiKey();
      setSavedKey(existing);
      setValue(existing ?? '');
      // Focus the input on next frame
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      // Restore focus
      triggerRef.current?.focus();
      triggerRef.current = null;
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Trap focus inside the modal
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [],
  );

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      addToast('Please enter a valid API key', 'error');
      return;
    }
    setApiKey(trimmed);
    setSavedKey(trimmed);
    addToast('API key saved', 'success');
    onClose();
  };

  const handleRemove = () => {
    removeApiKey();
    setValue('');
    setSavedKey(null);
    addToast('API key removed', 'info');
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="key-modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="w-full max-w-md mx-4 bg-bg-card border border-border rounded-2xl shadow-glow animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-accent-glow flex items-center justify-center">
              <Key className="w-4.5 h-4.5 text-accent" />
            </div>
            <h2 id="key-modal-title" className="text-lg font-semibold text-text-primary">
              OpenRouter API Key
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-text-primary transition-colors cursor-pointer p-1 rounded-md hover:bg-bg-hover"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-4 space-y-3">
          <p className="text-sm text-text-muted leading-relaxed">
            Enter your{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-light underline underline-offset-2 transition-colors"
            >
              OpenRouter API key
            </a>{' '}
            to enable AI tutoring, quizzes, and more. Your key stays on your device.
          </p>

          <div className="relative">
            <input
              ref={inputRef}
              type={showKey ? 'text' : 'password'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              placeholder="sk-or-v1-..."
              className="w-full bg-bg-base border border-border rounded-lg px-3 py-2.5 pr-10 text-sm text-text-primary placeholder-text-dim outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              aria-label="OpenRouter API key"
            />
            <button
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-primary transition-colors cursor-pointer p-0.5"
              aria-label={showKey ? 'Hide key' : 'Show key'}
              type="button"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {savedKey && (
            <p className="text-xs text-success flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Key saved — you can update or remove it below.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 pb-5">
          {savedKey ? (
            <button
              onClick={handleRemove}
              className="text-sm text-destructive hover:text-red-400 transition-colors cursor-pointer"
            >
              Remove key
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-light rounded-lg transition-all duration-150 active:scale-[0.97] cursor-pointer"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}