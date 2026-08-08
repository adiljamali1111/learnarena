import { useMemo } from 'react';
import {
  Swords,
  Heart,
  Zap,
  Timer,
  Trophy,
  Target,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function PracticeDuelView() {
  const { duel, startDuel, answerDuelQuestion, resetDuel, addXp } = useDashboard();

  // Combo label
  const comboLabel = useMemo(() => {
    if (duel.combo >= 10) return { text: 'GOLDEN', color: 'text-gold' };
    if (duel.combo >= 5) return { text: 'PHENOMENAL', color: 'text-primary' };
    if (duel.combo >= 3) return { text: 'COMBO', color: 'text-accent' };
    return null;
  }, [duel.combo]);

  // ── Idle screen ──
  if (duel.phase === 'idle') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/20 flex items-center justify-center">
            <Swords className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Practice Duel</h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Face off against RIVAL-9, an AI opponent that learns from the same material.
            Answer questions correctly to build combos and earn bonus points.
            <br /><strong className="text-foreground">3 lives. Infinite combos. No repeats.</strong>
          </p>
          <div className="flex items-center justify-center gap-4 mb-6 text-xs text-muted-lighter">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-destructive" /> 3 Lives</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-gold" /> Combo System</span>
            <span className="flex items-center gap-1"><Timer className="w-3 h-3 text-accent" /> 15s Timer</span>
          </div>
          <button
            onClick={startDuel}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-destructive text-foreground font-heading font-bold text-sm hover:opacity-90 transition-all duration-200 cursor-pointer shadow-lg"
          >
            <Swords className="w-4 h-4" /> START DUEL
          </button>
        </div>
      </div>
    );
  }

  // ── Preparing ──
  if (duel.phase === 'preparing') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted">RIVAL-9 is preparing your questions...</p>
        </div>
      </div>
    );
  }

  // ── Playing ──
  if (duel.phase === 'playing') {
    const q = duel.questions[duel.questionIndex];
    if (!q) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted">No more questions. Loading results...</p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full space-y-4">

          {/* Score bar */}
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xs text-muted-lighter uppercase">You</p>
              <p className="text-xl font-heading font-bold text-accent">{duel.playerScore}</p>
            </div>
            <div className="text-center">
              <p className="text-2xs text-muted-lighter uppercase">Lives</p>
              <div className="flex gap-1 justify-center">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 ${i < duel.lives ? 'text-destructive' : 'text-muted-lighter'}`}
                    fill={i < duel.lives ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xs text-muted-lighter uppercase">RIVAL-9</p>
              <p className="text-xl font-heading font-bold text-destructive">{duel.rivalScore}</p>
            </div>
          </div>

          {/* Combo display */}
          {duel.combo >= 3 && (
            <div className={`text-center animate-combo-pop ${comboLabel?.color}`}>
              <span className="font-heading font-bold text-lg">
                <Zap className="w-4 h-4 inline mr-1" />
                {comboLabel?.text} x{duel.combo}
              </span>
            </div>
          )}

          {/* Lives indicator (when hit) */}
          {duel.lives < 3 && (
            <div className="text-center text-2xs text-muted-lighter">
              {duel.lives <= 0 ? 'No lives remaining' : `${duel.lives} lives remaining`}
            </div>
          )}

          {/* Question */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xs text-muted-lighter">Question {duel.questionIndex + 1} of {duel.questions.length}</span>
              <span className="text-2xs text-muted-lighter">{q.questionType}</span>
            </div>
            <p className="text-sm text-foreground font-medium mb-4">{q.question}</p>

            <div className="space-y-2">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => answerDuelQuestion(idx)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-dark-elevated/60 border border-border hover:border-primary/40 text-sm text-foreground transition-all duration-200 cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Done ──
  if (duel.phase === 'done') {
    const isVictory = duel.result === 'victory';
    const isDraw = duel.result === 'draw';

    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {isVictory && (
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-success/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-success" />
            </div>
          )}
          {isDraw && (
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gold/20 flex items-center justify-center">
              <Target className="w-8 h-8 text-gold" />
            </div>
          )}
          {!isVictory && !isDraw && (
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/20 flex items-center justify-center">
              <Swords className="w-8 h-8 text-destructive" />
            </div>
          )}

          <h2 className={`font-heading text-2xl font-bold mb-2 ${
            isVictory ? 'text-success' : isDraw ? 'text-gold' : 'text-destructive'
          }`}>
            {isVictory ? 'VICTORY!' : isDraw ? 'DRAW' : 'DEFEAT'}
          </h2>

          <div className="glass-card p-4 mb-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Your Score</span>
              <span className="text-accent font-bold">{duel.playerScore}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">RIVAL-9 Score</span>
              <span className="text-destructive font-bold">{duel.rivalScore}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-sm">
              <span className="text-muted">Correct Answers</span>
              <span className="text-foreground">{duel.answerHistory.filter(a => a.correct).length} / {duel.answerHistory.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Best Combo</span>
              <span className="text-gold font-bold">x{duel.maxCombo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Best Streak</span>
              <span className="text-primary font-bold">{duel.bestStreak}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Lives Lost</span>
              <span className="text-destructive">{3 - duel.lives}</span>
            </div>
          </div>

          {isVictory && (
            <p className="text-xs text-gold mb-4">+200 XP earned!</p>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetDuel}
              className="px-4 py-2 rounded-xl bg-dark-hover text-muted hover:text-foreground text-xs font-heading font-bold transition-colors cursor-pointer"
            >
              BACK TO LOBBY
            </button>
            <button
              onClick={async () => {
                if (isVictory) addXp(200);
                await startDuel();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-dark-base text-xs font-heading font-bold hover:bg-primary-light transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> REMATCH
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}