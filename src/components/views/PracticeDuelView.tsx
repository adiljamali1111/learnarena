import {
  Swords,
  Timer,
  Heart,
  Zap,
  ChevronRight,
  Trophy,
  Shield,
  HelpCircle,
  RotateCcw,
  Star,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import {
  getComboLabel,
  getComboLevel,
  COMBO_COLORS,
} from '../../types/dashboard';

export default function PracticeDuelView() {
  const {
    state,
    startDuel,
    answerDuelQuestion,
    nextDuelQuestion,
    resetDuel,
  } = useDashboard();

  const { duel } = state;
  const currentQuestion = duel.questions[duel.currentIndex];
  const comboLevel = getComboLevel(duel.combo);
  const comboColor = COMBO_COLORS[comboLevel];

  /* ===========================
     IDLE
     =========================== */
  if (duel.phase === 'idle') {
    return (
      <div className="p-4 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 text-center max-w-md animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-warning/20 flex items-center justify-center mx-auto mb-4">
            <Swords size={32} className="text-warning" />
          </div>

          <h2 className="font-heading font-bold text-2xl mb-2 text-glow-cyan">
            Practice Duel
          </h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Face RIVAL-9 in a timed quiz duel. Answer questions faster and more
            accurately to climb the combo ladder and claim victory!
          </p>

          {/* Rules */}
          <div className="text-left space-y-2 mb-6">
            {[
              '15 seconds per question',
              '3 lives — lose them all and you\'re out',
              'Build combos: 3x → 5x → 10x → 20x (shield)',
              'RIVAL-9 answers with 65% accuracy',
              'Wrong answer or timeout = lost life',
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted">
                <span className="text-accent mt-0.5">•</span>
                {rule}
              </div>
            ))}
          </div>

          <button
            onClick={startDuel}
            disabled={!state.activeModuleId}
            className="btn-base w-full py-3 rounded-xl bg-gradient-to-r from-warning to-orange-500 text-white font-semibold hover:shadow-glow-purple transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {state.activeModuleId ? 'Start Duel' : 'Load a module first'}
          </button>

          {duel.highScore > 0 && (
            <p className="text-xs text-muted-lighter mt-3">
              🏆 High Score: {duel.highScore.toLocaleString()} XP
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ===========================
     PREPARING
     =========================== */
  if (duel.phase === 'preparing') {
    return (
      <div className="p-4 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 text-center animate-fade-in-up">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="font-heading font-bold text-xl mb-2">Preparing Duel...</h2>
          <p className="text-sm text-muted">
            RIVAL-9 is warming up. Generating your questions...
          </p>
        </div>
      </div>
    );
  }

  /* ===========================
     PLAYING
     =========================== */
  if (duel.phase === 'playing' && currentQuestion) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        {/* Status bar */}
        <div className="flex items-center gap-3 mb-4">
          {/* Timer */}
          <div className="flex items-center gap-1.5 glass-card px-3 py-2">
            <Timer
              size={16}
              className={
                duel.timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-accent'
              }
            />
            <span
              className={`text-sm font-mono font-bold ${
                duel.timeLeft <= 5 ? 'text-destructive' : 'text-accent'
              }`}
            >
              {duel.timeLeft}s
            </span>
          </div>

          {/* Score */}
          <div className="flex-1 flex items-center justify-center gap-4 text-xs">
            <span className="text-muted">You: {duel.playerScore}</span>
            <span className="text-muted-lighter">vs</span>
            <span className="text-muted">RIVAL-9: {duel.rivalScore}</span>
          </div>

          {/* Lives */}
          <div className="flex gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                size={16}
                className={
                  i < duel.playerLives
                    ? 'text-destructive'
                    : 'text-muted-lighter opacity-30'
                }
                fill={i < duel.playerLives ? '#ef4444' : 'none'}
              />
            ))}
          </div>
        </div>

        {/* Combo display */}
        {duel.combo >= 3 && (
          <div className="flex items-center justify-center gap-2 mb-3 animate-combo-pop">
            <div
              className="px-3 py-1 rounded-full border text-xs font-bold"
              style={{
                borderColor: comboColor,
                color: comboColor,
                background: `${comboColor}15`,
              }}
            >
              <span className="flex items-center gap-1">
                <Zap size={12} />
                {duel.combo}x Combo — {getComboLabel(duel.combo)}
                {duel.hasShield && <Shield size={12} className="text-accent" />}
              </span>
            </div>
          </div>
        )}

        {/* Question card */}
        <div className="glass-card p-6 animate-fade-in-up">
          {/* Progress */}
          <div className="flex gap-1 mb-4">
            {duel.questions.map((q, i) => (
              <div
                key={q.id}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  i < duel.currentIndex
                    ? 'bg-accent'
                    : i === duel.currentIndex
                      ? 'bg-primary'
                      : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <p className="text-sm font-semibold text-foreground mb-4 leading-relaxed">
            {currentQuestion.question}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option, i) => {
              let borderClass = 'border-glass-border hover:border-accent/40';

              if (duel.isAnswered) {
                if (i === currentQuestion.correctIndex) {
                  borderClass = 'border-success bg-success/10';
                } else if (i === duel.selectedAnswer) {
                  borderClass = 'border-destructive bg-destructive/10';
                }
              } else if (i === duel.selectedAnswer) {
                borderClass = 'border-accent bg-accent/10';
              }

              return (
                <button
                  key={i}
                  onClick={() => answerDuelQuestion(i)}
                  disabled={duel.isAnswered}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer disabled:cursor-default ${borderClass}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-muted-lighter w-5 shrink-0 mt-0.5 font-mono">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="text-sm text-foreground/80">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hint modal */}
          {duel.isAnswered && duel.selectedAnswer !== currentQuestion.correctIndex && (
            <div className="mt-4 glass-card p-3 bg-destructive/10 border-destructive/30 animate-fade-in-up">
              <div className="flex items-start gap-2">
                <HelpCircle size={16} className="text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-foreground/80 mb-1">
                    {currentQuestion.explanation}
                  </p>
                  {currentQuestion.distractorsExplanation && (
                    <p className="text-xs text-muted">
                      {currentQuestion.distractorsExplanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next button */}
        {duel.isAnswered && (
          <button
            onClick={nextDuelQuestion}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:shadow-glow-purple transition-all animate-fade-in-up cursor-pointer"
          >
            {duel.currentIndex >= duel.questions.length - 1
              ? 'See Results'
              : 'Next Question'}
            <ChevronRight size={16} className="inline ml-1" />
          </button>
        )}
      </div>
    );
  }

  /* ===========================
     DONE
     =========================== */
  const isDraw = duel.playerScore === duel.rivalScore;
  const playerWon = duel.playerScore > duel.rivalScore;
  const isNewHighScore = duel.playerScore >= duel.highScore && duel.playerScore > 0;

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <div className="glass-card p-8 text-center max-w-md animate-fade-in-up">
        {/* Result icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            playerWon
              ? 'bg-gold/20'
              : isDraw
                ? 'bg-accent/20'
                : 'bg-destructive/20'
          }`}
        >
          <Trophy
            size={32}
            className={
              playerWon
                ? 'text-gold'
                : isDraw
                  ? 'text-accent'
                  : 'text-destructive'
            }
          />
        </div>

        <h2
          className={`font-heading font-bold text-2xl mb-2 ${
            playerWon
              ? 'text-glow-gold'
              : isDraw
                ? 'text-glow-cyan'
                : 'text-muted'
          }`}
        >
          {playerWon ? 'Victory!' : isDraw ? 'Draw!' : 'Defeated'}
        </h2>

        <p className="text-sm text-muted mb-6">
          {playerWon
            ? 'You outscored RIVAL-9!'
            : isDraw
              ? 'You matched RIVAL-9!'
              : 'RIVAL-9 got you this time.'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card p-3">
            <p className="text-2xl font-bold text-gold">{duel.playerScore}</p>
            <p className="text-[10px] text-muted-lighter">Your Score</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-2xl font-bold text-destructive">{duel.rivalScore}</p>
            <p className="text-[10px] text-muted-lighter">RIVAL-9</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-lg font-bold text-accent">
              {duel.combo}x
            </p>
            <p className="text-[10px] text-muted-lighter">Best Combo</p>
          </div>
          <div className="glass-card p-3">
            <p className="text-lg font-bold text-muted">
              {duel.highScore.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-lighter">High Score</p>
          </div>
        </div>

        {/* New high score */}
        {isNewHighScore && (
          <div className="flex items-center justify-center gap-1 text-sm text-gold mb-4 animate-combo-golden">
            <Star size={16} fill="#fbbf24" />
            New High Score!
            <Star size={16} fill="#fbbf24" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => resetDuel()}
            className="btn-base flex-1 py-3 rounded-xl bg-white/5 text-muted hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer"
          >
            Back to Lobby
          </button>
          <button
            onClick={startDuel}
            className="btn-base flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:shadow-glow-purple transition-all cursor-pointer"
          >
            <RotateCcw size={14} className="inline mr-1" />
            Rematch
          </button>
        </div>
      </div>
    </div>
  );
}