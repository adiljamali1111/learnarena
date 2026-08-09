import { useDashboard } from '../context/DashboardContext';

export default function IntroPage() {
  const { setModal } = useDashboard();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl animate-fade-in-up">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-purple">
            <span className="text-4xl">🧠</span>
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight"
          style={{ textShadow: '0 0 30px rgba(168,85,247,0.3)' }}
        >
          <span className="text-glow-purple">Learn</span>
          <span className="text-glow-cyan">Arena</span>
        </h1>

        <p className="text-lg md:text-xl text-muted mb-4 font-medium tracking-wide">
          Turn Raw Notes Into a Living Study Universe
        </p>

        <p className="text-sm text-muted-lighter mb-10 max-w-lg mx-auto leading-relaxed">
          Paste your notes or upload files — PDF, DOCX, PPTX, TXT, MD — and
          instantly get an interactive study dashboard. Generate quizzes, mind
          maps, flashcards, presentations, and more.
        </p>

        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-lg mx-auto text-xs">
          {[
            { icon: '📊', label: 'Dashboard' },
            { icon: '🗺️', label: 'Context Map' },
            { icon: '⚔️', label: 'Practice Duel' },
            { icon: '🎨', label: '6 Den Tools' },
          ].map((feat) => (
            <div
              key={feat.label}
              className="glass-card px-3 py-3 flex flex-col items-center gap-1"
            >
              <span className="text-xl">{feat.icon}</span>
              <span className="text-muted font-medium">{feat.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => setModal('apiKey')}
          className="btn-base px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-bold text-lg tracking-wider hover:shadow-glow-purple hover:opacity-90 transition-all"
        >
          Get Started
        </button>

        <p className="text-xs text-muted-lighter mt-6">
          Bring your own OpenRouter API key • Everything stays in your browser
        </p>
      </div>
    </div>
  );
}