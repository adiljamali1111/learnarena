import { useState } from "react";
import { Eye, EyeOff, ExternalLink, Key } from "lucide-react";

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

export default function ApiKeyModal({ onSave }: ApiKeyModalProps) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card p-8 animate-fade-in-up">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent/60 flex items-center justify-center mx-auto mb-5">
          <Key className="w-7 h-7 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-center font-heading text-xl font-bold text-foreground tracking-wide mb-2">
          Enter Your OpenRouter API Key
        </h2>
        <p className="text-center text-sm text-muted mb-6 leading-relaxed">
          Your key is stored locally in your browser and never sent anywhere
          except OpenRouter.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input */}
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-lighter focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_rgba(0,240,255,0.15)] transition-all duration-200"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
              aria-label={showKey ? "Hide API key" : "Show API key"}
            >
              {showKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* External link */}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-muted hover:text-accent transition-colors duration-200"
          >
            Get your free API key at openrouter.ai/keys
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Submit */}
          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent/80 text-white font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer hover:opacity-90 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            Save &amp; Continue
          </button>
        </form>
      </div>
    </div>
  );
}