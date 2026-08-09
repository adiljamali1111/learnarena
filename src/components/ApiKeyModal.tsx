import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, ExternalLink, ChevronDown, Check } from 'lucide-react';
import { APIProvider } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSubmit: (key: string, provider: APIProvider) => void;
  error?: string;
  currentProvider?: APIProvider;
}

const PROVIDERS: Array<{
  id: APIProvider;
  label: string;
  description: string;
  keyPrefix: string;
  linkUrl: string;
  linkLabel: string;
}> = [
  {
    id: 'openrouter',
    label: 'OpenRouter',
    description: 'Multi-model API gateway with GPT-4o-mini and more',
    keyPrefix: 'sk-or-v1-...',
    linkUrl: 'https://openrouter.ai/keys',
    linkLabel: 'Get an OpenRouter key',
  },
  {
    id: 'google',
    label: 'Google AI Studio',
    description: 'Google Gemini 2.0 Flash — fast and free tier available',
    keyPrefix: 'AIza...',
    linkUrl: 'https://aistudio.google.com/apikey',
    linkLabel: 'Get a Google AI Studio key',
  },
];

export default function ApiKeyModal({ isOpen, onSubmit, error, currentProvider }: ApiKeyModalProps) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<APIProvider>(currentProvider || 'openrouter');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Reset key when provider changes
  useEffect(() => {
    setKey('');
    setShowKey(false);
  }, [provider]);

  // Sync provider from parent when modal opens
  useEffect(() => {
    if (isOpen && currentProvider) {
      setProvider(currentProvider);
    }
  }, [isOpen, currentProvider]);

  const selectedProvider = PROVIDERS.find((p) => p.id === provider)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSubmit(key.trim(), provider);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-overlay animate-fade-in">
      <div className="dark-glass rounded-xl p-8 w-full max-w-md animate-scale-in">
        <div className="text-center mb-6">
          <Key size={40} className="mx-auto text-primary mb-3" />
          <h2 className="font-heading text-xl text-text-primary mb-2">API Key Setup</h2>
          <p className="text-text-secondary text-sm">
            LearnArena uses your own API key to generate study content.
            Your key stays in your browser — it's never sent to our servers.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Provider Selector Dropdown */}
        <div className="mb-4">
          <label className="block text-text-muted text-xs mb-2 font-heading tracking-wider">API PROVIDER</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="glass-input w-full p-3 pr-10 text-sm flex items-center justify-between text-left"
            >
              <span className="text-text-primary">{selectedProvider.label}</span>
              <ChevronDown
                size={16}
                className={`text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 dark-glass rounded-xl p-1.5 z-10 shadow-2xl animate-slide-up">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProvider(p.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center justify-between gap-3 ${
                      provider === p.id
                        ? 'bg-primary/10 text-text-primary'
                        : 'text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">{p.label}</p>
                      <p className="text-text-muted text-xs mt-0.5">{p.description}</p>
                    </div>
                    {provider === p.id && <Check size={16} className="text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={selectedProvider.keyPrefix}
              className="glass-input w-full pr-10 p-3 text-sm font-mono"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!key.trim()}
            className="glass-button w-full py-3 font-heading tracking-wider"
          >
            CONNECT
          </button>
        </form>

        <div className="mt-4 text-center">
          <a
            href={selectedProvider.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted text-xs hover:text-accent inline-flex items-center gap-1 transition-colors"
          >
            {selectedProvider.linkLabel} <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
