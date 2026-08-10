import { useDashboard } from '../context/DashboardContext';
import LearnArenaLogo from './LearnArenaLogo';
import DemoModeButton from './DemoModeButton';

export default function IntroPage() {
  const { setModal } = useDashboard();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient neon glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/15 blur-3xl pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-accent/10 blur-3xl pointer-events-none animate-glow-pulse" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      {/* Neon horizon line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="relative z-10 text-center max-w-2xl animate-fade-in-up">
        {/* Logo — glowing colosseum with hovering book */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-2xl scale-125 animate-pulse-glow pointer-events-none" />
            <LearnArenaLogo size="lg" />
            {/* Corner neon accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-accent rounded-tl-md" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-accent rounded-tr-md" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-accent rounded-bl-md" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-accent rounded-br-md" />
          </div>
        </div>

        {/* Heading — neon split colors */}
        <h1
          className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight"
          style={{ textShadow: '0 0 40px rgba(168,85,247,0.35), 0 0 80px rgba(0,240,255,0.15)' }}
        >
          <span className="text-glow-purple text-primary-light">Learn</span>
          <span className="text-glow-cyan text-accent">Arena</span>
        </h1>

        <p className="text-lg md:text-xl text-muted mb-4 font-medium tracking-wide">
          Turn Raw Notes Into a Living Study Universe
        </p>

        <p className="text-sm text-muted-lighter mb-10 max-w-lg mx-auto leading-relaxed">
          Paste your notes or upload files — PDF, DOCX, PPTX, TXT, MD — and
          instantly get an interactive study dashboard. Generate quizzes, mind
          maps, flashcards, presentations, and more.
        </p>

        {/* Features grid — neon accents */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-lg mx-auto text-xs">
          {[
            { icon: '📊', label: 'Dashboard' },
            { icon: '🗺️', label: 'Context Map' },
            { icon: '⚔️', label: 'Practice Duel' },
            { icon: '🎨', label: '6 Den Tools' },
          ].map((feat) => (
            <div
              key={feat.label}
              className="glass-card px-3 py-3 flex flex-col items-center gap-1 border-primary/20 hover:border-accent/40 hover:shadow-glow-cyan-sm transition-all"
            >
              <span className="text-xl">{feat.icon}</span>
              <span className="text-muted font-medium">{feat.label}</span>
            </div>
          ))}
        </div>

        {/* CTA — neon glow */}
        <button
          onClick={() => setModal('apiKey')}
          className="btn-base px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-heading font-bold text-lg tracking-wider hover:shadow-glow-purple hover:opacity-90 transition-all relative overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse-glow" />
          <span className="relative">Get Started</span>
        </button>

        {/* Demo mode */}
        <div className="mt-4">
          <DemoModeButton size="lg" />
        </div>

        <p className="text-xs text-muted-lighter mt-6">
          Bring your own OpenRouter API key • Everything stays in your browser
        </p>
      </div>
    </div>
  );
}