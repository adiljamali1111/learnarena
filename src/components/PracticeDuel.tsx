/* ──────────────────────────────────────────
   LearnArena — Practice Duel (Quiz Mode)
   ────────────────────────────────────────── */

import { useState, useCallback } from 'react';
import { Swords, Trophy, Zap, CheckCircle2, XCircle, RotateCw, ArrowRight } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { xpForAnswer } from '../constants';

type DuelPhase = 'intro' | 'fighting' | 'results';

export default function PracticeDuel() {
  const { state, addXp } = useDashboard();
  const questions = state.dashboard?.quiz || [];

  const [phase, setPhase] = useState<DuelPhase>('intro');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const currentQ = questions[current];
  const total = questions.length;

  const isCorrect = selected !== null && selected === currentQ?.correctIndex;

  const handleSelect = useCallback((idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);

    const correct = idx === currentQ.correctIndex;
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      addXp(xpForAnswer(true, currentQ.difficulty));
    } else {
      setStreak(0);
    }
  }, [answered, currentQ, addXp]);

  const handleNext = () => {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setPhase('results');
    }
  };

  const handleRestart = () => {
    setPhase('intro');
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setStreak(0);
  };

  if (total === 0) {
    return (
      <div className="dark-glass rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">⚔️</div>
        <h3 className="font-heading text-lg text-text-primary mb-2">No Questions Yet</h3>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          Generate a study module with quiz questions to start your practice duel.
        </p>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-lg mx-auto text-center animate-fade-in">
        <div className="dark-glass rounded-xl p-8">
          <Swords size={48} className="mx-auto mb-4 text-primary" />
          <h2 className="font-heading text-2xl text-text-primary mb-2">Practice Duel ⚔️</h2>
          <p className="text-text-secondary text-sm mb-6">
            Test your knowledge against {total} questions. Earn XP for correct answers and build your streak!
          </p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-bg-elevated rounded-lg p-3">
              <p className="text-2xl font-bold text-text-primary">{total}</p>
              <p className="text-text-muted text-[10px]">Questions</p>
            </div>
            <div className="bg-bg-elevated rounded-lg p-3">
              <p className="text-2xl font-bold text-warning">+XP</p>
              <p className="text-text-muted text-[10px]">Per Correct</p>
            </div>
            <div className="bg-bg-elevated rounded-lg p-3">
              <p className="text-2xl font-bold text-primary">🔥</p>
              <p className="text-text-muted text-[10px]">Streaks</p>
            </div>
          </div>
          <button onClick={() => setPhase('fighting')} className="glass-button px-8 py-3 font-heading tracking-wider">
            START DUEL
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const percent = Math.round((score / total) * 100);
    return (
      <div className="max-w-lg mx-auto text-center animate-fade-in">
        <div className="dark-glass rounded-xl p-8">
          <Trophy size={48} className="mx-auto mb-4 text-warning" />
          <h2 className="font-heading text-2xl text-text-primary mb-2">Duel Complete!</h2>
          <p className="text-text-secondary text-sm mb-6">
            {percent >= 80 ? 'Outstanding! You\'re a master of this material! 🎉' :
             percent >= 60 ? 'Great work! Keep studying to fill in the gaps.' :
             'Keep practicing! Review the material and try again.'}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-bg-elevated rounded-lg p-4">
              <p className="text-3xl font-bold text-text-primary">{score}/{total}</p>
              <p className="text-text-muted text-xs">Correct</p>
            </div>
            <div className="bg-bg-elevated rounded-lg p-4">
              <p className="text-3xl font-bold text-primary">{percent}%</p>
              <p className="text-text-muted text-xs">Score</p>
            </div>
          </div>
          <button onClick={handleRestart} className="glass-button px-6 py-3 font-heading tracking-wider flex items-center gap-2 mx-auto">
            <RotateCw size={16} /> DUEL AGAIN
          </button>
        </div>
      </div>
    );
  }

  // Fighting phase
  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Swords size={20} className="text-primary" />
          <span className="font-heading text-sm text-text-primary">Question {current + 1}/{total}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 size={14} /> {score}
          </span>
          <span className="flex items-center gap-1 text-warning">
            <Zap size={14} /> Streak: {streak}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-bg-elevated rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
          style={{ width: `${((current + (answered ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="dark-glass rounded-xl p-6 mb-4">
        <div className="flex items-start gap-3 mb-6">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-heading shrink-0 mt-0.5
            ${currentQ.difficulty === 'easy' ? 'bg-success/20 text-success' :
              currentQ.difficulty === 'medium' ? 'bg-warning/20 text-warning' :
              'bg-danger/20 text-danger'}`}
          >
            {currentQ.difficulty.toUpperCase()}
          </span>
          <h3 className="text-text-primary font-heading text-base">{currentQ.question}</h3>
        </div>

        <div className="space-y-2">
          {currentQ.options.map((opt, idx) => {
            let borderClass = 'border-border-glass';
            if (answered) {
              if (idx === currentQ.correctIndex) borderClass = 'border-success/50 bg-success/10';
              else if (idx === selected && !isCorrect) borderClass = 'border-danger/50 bg-danger/10';
              else borderClass = 'border-border-glass opacity-50';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={answered}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center gap-3
                  ${!answered ? 'hover:border-primary/50 hover:bg-bg-elevated cursor-pointer' : 'cursor-default'}
                  ${borderClass}`}
              >
                <span className="w-7 h-7 rounded-full bg-bg-elevated text-text-muted text-xs flex items-center justify-center shrink-0 font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-text-primary text-sm">{opt}</span>
                {answered && idx === currentQ.correctIndex && (
                  <CheckCircle2 size={18} className="text-success ml-auto shrink-0" />
                )}
                {answered && idx === selected && !isCorrect && (
                  <XCircle size={18} className="text-danger ml-auto shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div className="mt-4 p-4 rounded-lg bg-bg-elevated animate-fade-in">
            <p className="text-text-secondary text-sm">{currentQ.explanation}</p>
            {streak > 0 && isCorrect && (
              <p className="text-warning text-xs mt-2 font-heading">🔥 {streak} in a row!</p>
            )}
          </div>
        )}
      </div>

      {/* Next button */}
      {answered && (
        <button
          onClick={handleNext}
          className="glass-button w-full py-3 font-heading tracking-wider flex items-center justify-center gap-2"
        >
          {current < total - 1 ? (
            <>Next Question <ArrowRight size={16} /></>
          ) : (
            <>See Results <Trophy size={16} /></>
          )}
        </button>
      )}
    </div>
  );
}
