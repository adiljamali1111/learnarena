import { useState } from "react";
import { Sparkles, FileText } from "lucide-react";

interface NotesInputModalProps {
  onSubmit: (notes: string) => void;
  onDismiss?: () => void;
}

export default function NotesInputModal({
  onSubmit,
  onDismiss,
}: NotesInputModalProps) {
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim()) {
      onSubmit(notes.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass-card p-8 animate-fade-in-up">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-5">
          <FileText className="w-7 h-7 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-center font-heading text-xl font-bold text-foreground tracking-wide mb-2">
          Paste Your Course Notes
        </h2>
        <p className="text-center text-sm text-muted mb-6 leading-relaxed">
          Transform your raw notes into an interactive study dashboard with
          concept maps, quizzes, scenarios, and more.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Textarea */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Paste your lecture notes, textbook excerpts, or any study material here...

Example topics:
• Neuroscience & action potentials
• Machine learning fundamentals
• Organic chemistry reactions
• World history timelines
• Any subject you're studying!`}
            rows={10}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-lighter focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_rgba(0,240,255,0.15)] transition-all duration-200 resize-y min-h-[200px]"
            autoFocus
          />

          {/* Footer */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-lighter">
              Your notes are sent to OpenRouter's API for generation.
            </p>
            <div className="flex gap-3">
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="px-5 py-2.5 rounded-xl text-sm text-muted hover:text-foreground hover:bg-white/5 border border-white/10 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={!notes.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-primary text-white font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer hover:opacity-90 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <Sparkles className="w-4 h-4" />
                Generate My Study Universe
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}