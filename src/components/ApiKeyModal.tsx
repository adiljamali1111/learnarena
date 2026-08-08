import { useState } from 'react';
import { Key, X } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function ApiKeyModal() {
  const { setApiKey, setModal } = useDashboard();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please enter an API key');
      return;
    }
    if (!trimmed.startsWith('sk-or-') && !trimmed.startsWith('sk-')) {
      setError('Invalid key format. Should start with sk-or- or sk-');
      return;
    }
    setApiKey(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 relative animate-fade-in-up">
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
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Key className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">API Key</h2>
            <p className="text-xs text-muted">Enter your OpenRouter API key</p>
          </div>
        </div>

        <p className="text-sm text-muted mb-4 leading-relaxed">
          You'll need an OpenRouter API key to power LearnArena. Your key is
          stored only in your browser's localStorage and sent directly to
          OpenRouter.
        </p>

        <input
          type="password"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="sk-or-..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-glass-border text-foreground placeholder-muted-lighter font-mono text-sm focus:outline-none focus:border-accent transition-colors"
          autoFocus
        />

        {error && <p className="text-destructive text-xs mt-2">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setModal('none')}
            className="btn-base flex-1 py-3 rounded-xl bg-white/5 text-muted hover:text-foreground hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-base flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:shadow-glow-purple transition-all"
          >
            Save Key
          </button>
        </div>

        <p className="text-xs text-muted-lighter mt-4 text-center">
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Get a key at openrouter.ai/keys
          </a>
        </p>
      </div>
    </div>
  );
}