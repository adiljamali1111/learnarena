interface IntroPageProps {
  onStart: () => void;
}

export default function IntroPage({ onStart }: IntroPageProps) {
  return (
    <div className="min-h-screen bg-nebula flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/8 blur-[120px] pointer-events-none" />

      <div className="text-center max-w-2xl animate-fade-in">
        <div className="text-6xl mb-6 animate-float">🎓</div>
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TURN RAW NOTES
          </span>
          <br />
          <span className="text-text-primary">
            INTO A LIVING
          </span>
          <br />
          <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            STUDY UNIVERSE
          </span>
        </h1>
        <p className="text-text-secondary text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
          Paste your lecture notes, upload files, and watch LearnArena transform them into
          quizzes, flip cards, mind maps, and interactive study tools — all in seconds.
        </p>
        <button onClick={onStart} className="glass-button px-10 py-4 text-lg tracking-wider font-heading">
          START
        </button>
        <p className="text-text-muted text-sm mt-6">
          You'll need an OpenRouter or Google AI Studio API key to begin
        </p>
      </div>
    </div>
  );
}