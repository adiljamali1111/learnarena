import { Rocket, BookOpen, Sparkles } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function IntroPage() {
  const { setHasEntered, apiKey, setApiKey } = useDashboard();

  const handleContinue = () => {
    if (!apiKey?.trim()) {
      return;
    }
    setHasEntered(true);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-glow flex items-center justify-center animate-pulse-glow">
          <BookOpen className="w-10 h-10 text-primary" />
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4 text-glow-purple">
          TURN RAW NOTES
          <br />
          INTO A LIVING
          <br />
          <span className="text-primary">STUDY UNIVERSE</span>
        </h1>

        <p className="text-muted text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
          Upload your course materials and LearnArena transforms them into an immersive
          learning experience with synthesis, concept cards, quizzes, and more.
        </p>

        {/* API Key section */}
        <div className="glass-card p-6 mb-6 text-left">
          <label className="text-xs font-heading text-muted-lighter uppercase tracking-widest mb-2 block">
            OpenRouter API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey ?? ''}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="flex-1 bg-dark-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-lighter focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <p className="text-xs text-muted-lighter mt-2">
            Your key stays in your browser. Get one at{' '}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              openrouter.ai/keys
            </a>
          </p>
        </div>

        <button
          onClick={handleContinue}
          disabled={!apiKey?.trim()}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-dark-base font-heading font-bold text-sm tracking-wider hover:bg-primary-light transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-primary-glow"
        >
          <Rocket className="w-5 h-5" />
          ENTER THE ARENA
        </button>

        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-lighter">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> AI-Powered
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-accent" /> Your Data Stays Local
          </span>
        </div>
      </div>
    </div>
  );
}