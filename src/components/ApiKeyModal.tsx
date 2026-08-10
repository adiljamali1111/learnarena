import { useEffect, useRef, useState } from 'react';
import { Key, X, Check } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { PROVIDER_CONFIG } from '../services/aiService';
import type { AIProvider } from '../types/dashboard';
import DemoModeButton from './DemoModeButton';

const PROVIDER_ORDER: AIProvider[] = ['openrouter', 'aimlapi'];

export default function ApiKeyModal() {
  const {
    state,
    setApiKey,
    setProvider,
    setModal,
    setApiKeyError,
  } = useDashboard();

  const [provider, setLocalProvider] = useState<AIProvider>(state.provider);
  const [key, setKey] = useState(state.apiKey);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const config = PROVIDER_CONFIG[provider];
  const storedError = state.apiKeyError;

  // Focus the key input when the modal opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModal('none');
        setApiKeyError(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setModal, setApiKeyError]);

  const handleProviderChange = (p: AIProvider) => {
    setLocalProvider(p);
    setError('');
    setApiKeyError(null);
  };

  const handleSubmit = () => {
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please enter an API key');
      return;
    }
    if (provider === 'openrouter' && !trimmed.startsWith('sk-or-')) {
      setError('That doesn\u2019t look like an OpenRouter key \u2014 it should start with sk-or-');
      return;
    }
    if (trimmed.length < 12) {
      setError('That key looks too short \u2014 double-check you copied it fully');
      return;
    }
    setProvider(provider);
    setApiKey(trimmed);
    setApiKeyError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apikey-modal-title"
    >
      <div className="glass-card w-full max-w-md p-6 relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={() => {
            setModal('none');
            setApiKeyError(null);
          }}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Key className="text-primary" size={20} />
          </div>
          <div>
            <h2 id="apikey-modal-title" className="font-heading font-bold text-lg">
              AI Provider
            </h2>
            <p className="text-xs text-muted">
              Pick a provider and enter its API key
            </p>
          </div>
        </div>

        {/* Persisted error feedback (e.g. 401 from a failed call) */}
        {storedError && (
          <div
            role="alert"
            className="mb-4 px-3 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs leading-relaxed"
          >
            {storedError}
          </div>
        )}

        {/* Provider selector */}
        <fieldset className="mb-4">
          <legend className="sr-only">Choose an AI provider</legend>
          <div className="grid grid-cols-1 gap-2">
            {PROVIDER_ORDER.map((p) => {
              const pc = PROVIDER_CONFIG[p];
              const isSelected = provider === p;
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleProviderChange(p)}
                  className={`text-left w-full p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50 shadow-glow-purple-sm'
                      : 'bg-white/5 border-glass-border hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {pc.label}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/20'
                          : 'border-muted-lighter/40'
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && <Check size={12} className="text-primary" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted mt-1 leading-relaxed">
                    {pc.description}
                  </p>
                  <p className="text-[10px] text-muted-lighter mt-1.5 font-mono">
                    default model: {pc.defaultModel}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <p className="text-sm text-muted mb-3 leading-relaxed">
          Your {config.label} key is stored only in your browser&apos;s
          localStorage and sent directly to {config.label} when you use it.
        </p>

        <label htmlFor="apikey-input" className="sr-only">
          {config.label} API key
        </label>
        <input
          id="apikey-input"
          ref={inputRef}
          type="password"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setError('');
            setApiKeyError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={config.keyPlaceholder}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border text-foreground placeholder-muted-lighter font-mono text-sm focus:outline-none focus:border-accent transition-colors"
        />

        {error && <p className="text-destructive text-xs mt-2">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setModal('none');
              setApiKeyError(null);
            }}
            className="btn-base flex-1 py-3 rounded-xl bg-white/5 text-muted hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-base flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:shadow-glow-purple transition-all cursor-pointer active:scale-[0.97]"
          >
            Save Key
          </button>
        </div>

        <p className="text-xs text-muted-lighter mt-4 text-center">
          <a
            href={config.keyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Get a {config.label} key
          </a>
        </p>

        {/* Demo mode divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-glass-border" />
          <span className="text-[10px] text-muted-lighter uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-glass-border" />
        </div>

        {/* Try Demo Mode */}
        <DemoModeButton />
      </div>
    </div>
  );
}
