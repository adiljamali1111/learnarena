import { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Heart, Timer, Swords, RotateCw, ChevronRight, Brain, Shield, AlertTriangle, Skull, Check, HelpCircle } from 'lucide-react';
import { useDashboard, useNotification } from '../context/DashboardContext';
import { DuelPhase, DuelDifficulty, QuizQuestion } from '../types';
import { generateDuelQuestions } from '../services/aiService';
import { DUEL_CONFIG, RIVAL_NAMES_BY_DIFFICULTY, DUEL_DIFFICULTY } from '../constants';

const DIFFICULTY_META = [
  { key: 'easy' as DuelDifficulty, icon: Shield, color: 'text-success', desc: 'AI answers correctly ~30% of the time' },
  { key: 'medium' as DuelDifficulty, icon: Brain, color: 'text-warning', desc: 'AI answers correctly ~50% of the time' },
  { key: 'hard' as DuelDifficulty, icon: AlertTriangle, color: 'text-danger', desc: 'AI answers correctly ~70% of the time' },
  { key: 'extreme' as DuelDifficulty, icon: Skull, color: 'text-purple-400', desc: 'AI answers correctly ~85% of the time' },
];

export default function PracticeDuel() {
  const { state, dispatch } = useDashboard();
  const { notify } = useNotification();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DuelDifficulty>('medium');
  const rivalName = RIVAL_NAMES_BY_DIFFICULTY[selectedDifficulty];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { duel } = state;

  // Start duel
  const startDuel = useCallback(async () => {
    if (!state.dashboard || !state.apiKey) return;

    setIsGenerating(true);
    dispatch({
      type: 'SET_DUEL',
      payload: { phase: DuelPhase.Preparing },
    });

    try {
      const ccText = state.dashboard.coreConcepts.map((c) => `${c.term}: ${c.definition}`).join('\n');
      const rawQuestions = await generateDuelQuestions(
        state.apiProvider,
        state.apiKey,
        state.dashboard.moduleTitle,
        state.dashboard.synthesis.summary,
        ccText,
        state.seenQuestions,
        DUEL_CONFIG.totalQuestions
      );

      const questions: QuizQuestion[] = rawQuestions.map((q, i) => ({
        id: `duel-${i}`,
        ...q,
        topic: 'duel',
      }));

      // Track all questions as seen
      for (const q of questions) {
        dispatch({ type: 'ADD_SEEN_QUESTION', payload: q.question });
      }

      dispatch({
        type: 'SET_DUEL',
        payload: {
          phase: DuelPhase.Playing,
          difficulty: selectedDifficulty,
          questions,
          currentQuestionIndex: 0,
          timeLeft: DUEL_CONFIG.timePerQuestion,
          lives: DUEL_CONFIG.startingLives,
          score: 0,
          combo: 0,
          maxCombo: 0,
          rivalScore: 0,
          playerAnswered: false,
          aiAnswered: false,
          lastAnswerCorrect: null,
          rivalChoice: null,
          correctAnswers: 0,
          wrongAnswers: 0,
        },
      });
    } catch (err: any) {
      notify(err?.message || 'Failed to generate duel questions. Try again.', 'error');
      dispatch({ type: 'RESET_DUEL' });
    } finally {
      setIsGenerating(false);
    }
  }, [state.dashboard, state.apiKey, state.apiProvider, state.seenQuestions, dispatch, notify, selectedDifficulty]);

  useEffect(() => {
    if (duel.phase !== DuelPhase.Playing || duel.playerAnswered) return;

    timerRef.current = setInterval(() => {
      dispatch({
        type: 'SET_DUEL',
        payload: { timeLeft: Math.max(0, duel.timeLeft - 1) },
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [duel.phase, duel.playerAnswered, duel.timeLeft, dispatch]);

  // Time's up
  useEffect(() => {
    if (duel.timeLeft <= 0 && duel.phase === DuelPhase.Playing && !duel.playerAnswered) {
      handleAnswer(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duel.timeLeft]);

  const handleAnswer = useCallback((selectedIndex: number) => {
    if (duel.playerAnswered || duel.phase !== DuelPhase.Playing) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const currentQ = duel.questions[duel.currentQuestionIndex];
    if (!currentQ) return;

    const isCorrect = selectedIndex === currentQ.correctIndex;
    const newCombo = isCorrect ? duel.combo + 1 : 0;
    const pointsGained = isCorrect
      ? Math.floor(DUEL_CONFIG.comboMultiplier * newCombo * 10)
      : 0;

    // Determine AI answer with difficulty-based accuracy
    const diffConfig = DUEL_DIFFICULTY[duel.difficulty];
    const aiGetsItRight = Math.random() < diffConfig.accuracy;
    const aiChoice = aiGetsItRight ? currentQ.correctIndex : Math.floor(Math.random() * 4);
    const aiPoints = aiGetsItRight ? 10 : 0;

    dispatch({
      type: 'SET_DUEL',
      payload: {
        playerAnswered: true,
        aiAnswered: true,
        lastAnswerCorrect: isCorrect,
        combo: newCombo,
        maxCombo: Math.max(duel.maxCombo, newCombo),
        score: isCorrect ? duel.score + pointsGained : duel.score,
        lives: isCorrect ? duel.lives : duel.lives - 1,
        correctAnswers: isCorrect ? duel.correctAnswers + 1 : duel.correctAnswers,
        wrongAnswers: isCorrect ? duel.wrongAnswers : duel.wrongAnswers + 1,
        rivalScore: duel.rivalScore + aiPoints,
        rivalChoice: aiChoice,
        timeLeft: 0,
      },
    });

    if (isCorrect && pointsGained > 0) {
      dispatch({ type: 'ADD_XP', payload: pointsGained });
    }
  }, [duel, dispatch]);

  const nextQuestion = useCallback(() => {
    const nextIndex = duel.currentQuestionIndex + 1;

    if (duel.lives <= 0 || nextIndex >= DUEL_CONFIG.totalQuestions) {
      dispatch({
        type: 'SET_DUEL',
        payload: {
          phase: DuelPhase.Done,
          playerAnswered: false,
          aiAnswered: false,
        },
      });
      return;
    }

    dispatch({
      type: 'SET_DUEL',
      payload: {
        currentQuestionIndex: nextIndex,
        timeLeft: DUEL_CONFIG.timePerQuestion,
        playerAnswered: false,
        aiAnswered: false,
        lastAnswerCorrect: null,
        rivalChoice: null,
      },
    });
  }, [duel, dispatch]);

  // ─── RENDER ───

  // DIFFICULTY SELECT
  if (duel.phase === DuelPhase.Idle) {
    return (
      <div className="flex flex-col items-center justify-center py-10 md:py-20 animate-fade-in max-w-3xl mx-auto">
        <div className="text-6xl mb-6 animate-float">⚔️</div>
        <h2 className="font-heading text-2xl text-text-primary mb-2">Practice Duel</h2>
        <p className="text-text-secondary text-sm mb-2 text-center max-w-md">
          Face off against <span className="text-danger font-bold">{rivalName}</span> in a rapid-fire quiz duel.
          {state.dashboard ? ` Based on "${state.dashboard.moduleTitle}".` : ''}
        </p>
        <p className="text-text-muted text-xs mb-6">
          {DUEL_CONFIG.totalQuestions} questions · {DUEL_CONFIG.timePerQuestion}s each · {DUEL_CONFIG.startingLives} lives
        </p>

        {/* Difficulty Selection */}
        <div className="w-full max-w-lg mb-8">
          <p className="font-heading text-sm text-text-primary mb-4 text-center tracking-wider">SELECT OPPONENT DIFFICULTY</p>
          <div className="grid grid-cols-2 gap-3">
            {DIFFICULTY_META.map((d) => {
              const Icon = d.icon;
              const isSelected = selectedDifficulty === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDifficulty(d.key)}
                  className={`dark-glass rounded-xl p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/30'
                      : 'hover:border-border-glass-hover'
                  }`}
                >
                  <Icon size={24} className={`mb-2 ${d.color}`} />
                  <p className={`font-heading text-sm tracking-wider mb-1 ${isSelected ? 'text-text-primary' : 'text-text-muted'}`}>
                    {d.key.charAt(0).toUpperCase() + d.key.slice(1)}
                  </p>
                  <p className="text-text-muted text-[10px]">{d.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={startDuel}
          disabled={isGenerating || !state.dashboard}
          className="glass-button px-10 py-4 text-lg font-heading tracking-wider flex items-center gap-3"
        >
          {isGenerating ? 'Preparing Battle...' : <><Swords size={24} /> CHALLENGE {rivalName}</>}
        </button>
      </div>
    );
  }

  // PREPARING
  if (duel.phase === DuelPhase.Preparing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="text-4xl mb-4 animate-pulse">🤖</div>
        <p className="font-heading text-lg text-text-primary mb-2">{rivalName} is preparing...</p>
        <p className="text-text-muted text-sm">Generating fresh questions just for you</p>
        <div className="mt-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // DONE
  if (duel.phase === DuelPhase.Done) {
    const won = duel.score > duel.rivalScore;
    const total = duel.correctAnswers + duel.wrongAnswers;
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-scale-in">
        <div className="text-6xl mb-4">{won ? '🏆' : '💪'}</div>
        <h2 className="font-heading text-2xl text-text-primary mb-2">
          {won ? 'Victory!' : 'Great Effort!'}
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          {won
            ? `You defeated ${rivalName}!`
            : `${rivalName} got you this time. Try again!`}
        </p>

        <div className="dark-glass rounded-xl p-6 w-full max-w-sm mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">{duel.score}</p>
              <p className="text-text-muted text-xs">Your Score</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-danger">{duel.rivalScore}</p>
              <p className="text-text-muted text-xs">{rivalName}</p>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border-glass">
            <div className="text-center">
              <p className="text-text-primary text-sm font-bold">{duel.correctAnswers}/{total}</p>
              <p className="text-text-muted text-[10px]">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-text-primary text-sm font-bold">{duel.maxCombo}x</p>
              <p className="text-text-muted text-[10px]">Best Combo</p>
            </div>
          </div>
        </div>

        <button onClick={() => dispatch({ type: 'RESET_DUEL' })} className="glass-button px-6 py-3 text-sm flex items-center gap-2">
          <RotateCw size={16} /> Rematch
        </button>
      </div>
    );
  }

  // PLAYING
  const question = duel.questions[duel.currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Battle HUD */}
      <div className="dark-glass rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <span className="text-text-primary font-bold text-sm">You</span>
          </div>
          <div className="font-heading text-xs text-text-muted tracking-wider">
            Q{duel.currentQuestionIndex + 1}/{DUEL_CONFIG.totalQuestions}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-danger font-bold text-sm">{rivalName}</span>
            <span className="text-lg">🤖</span>
          </div>
        </div>

        {/* HP & Score bars */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1 text-text-muted">
                <Heart size={12} className="text-danger" /> {duel.lives}
              </span>
              <span className="text-primary font-bold">{duel.score}</span>
            </div>
            <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min((duel.score / Math.max(duel.rivalScore, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-danger font-bold">{duel.rivalScore}</span>
              <span className="flex items-center gap-1 text-text-muted">
                <Timer size={12} className={duel.timeLeft <= 5 ? 'text-danger animate-pulse' : ''} /> {duel.timeLeft}s
              </span>
            </div>
            <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-danger rounded-full transition-all duration-500"
                style={{ width: `${Math.min((duel.rivalScore / Math.max(duel.score, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Combo */}
        {duel.combo > 1 && (
          <div className="text-center mt-2 animate-scale-in">
            <span className="inline-flex items-center gap-1 text-warning text-xs font-bold bg-warning/10 px-3 py-1 rounded-full">
              <Zap size={12} /> {duel.combo}x Combo!
            </span>
          </div>
        )}
      </div>

      {/* Question */}
      <div className={`dark-glass rounded-xl p-5 mb-4 transition-all ${duel.lastAnswerCorrect === true ? 'border-success/40' : duel.lastAnswerCorrect === false ? 'border-danger/40' : ''}`}>
        <p className="text-text-primary text-sm font-medium mb-4">{question?.question}</p>

        <div className="space-y-2">
          {question?.options.map((opt, i) => {
            let borderClass = 'border-border-glass';
            let rightIcon = null;
            if (duel.playerAnswered) {
              if (i === question.correctIndex) {
                borderClass = 'border-success bg-success/10';
                rightIcon = <Check size={16} className="text-success shrink-0" />;
              } else if (i === duel.rivalChoice && i !== question.correctIndex) {
                borderClass = 'border-danger/40 bg-danger/5';
              }
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={duel.playerAnswered}
                className={`w-full text-left p-3 rounded-lg text-sm border transition-all ${borderClass}
                  ${!duel.playerAnswered ? 'hover:border-primary/50 hover:bg-bg-card-hover cursor-pointer' : 'cursor-default'}
                  flex items-center justify-between gap-2
                `}
              >
                <div>
                  <span className="text-text-muted mr-2">{String.fromCharCode(65 + i)}.</span>
                  <span className="text-text-primary">{opt}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {duel.playerAnswered && i === duel.rivalChoice && (
                    <span className="text-[10px] text-danger font-bold flex items-center gap-0.5">
                      <Swords size={10} /> AI
                    </span>
                  )}
                  {rightIcon}
                </div>
              </button>
            );
          })}
        </div>

        {/* AI answered indicator */}
        {duel.aiAnswered && !duel.playerAnswered && (
          <div className="mt-3 p-2 rounded-lg bg-danger/5 text-danger/60 text-[10px] animate-fade-in flex items-center gap-1.5">
            <HelpCircle size={12} />
            {rivalName} has selected an answer...
          </div>
        )}

        {/* Feedback */}
        {duel.lastAnswerCorrect === true && (
          <div className="mt-3 p-3 rounded-lg bg-success/10 text-success text-xs animate-fade-in">
            Correct! +{Math.floor(DUEL_CONFIG.comboMultiplier * duel.combo * 10)} pts
          </div>
        )}
        {duel.lastAnswerCorrect === false && (
          <div className="mt-3 p-3 rounded-lg bg-danger/10 text-danger text-xs animate-fade-in">
            Wrong! The answer was: {question?.options[question?.correctIndex]}
          </div>
        )}
      </div>

      {/* Next */}
      {duel.playerAnswered && (
        <button
          onClick={nextQuestion}
          className="glass-button w-full py-3 text-sm flex items-center justify-center gap-2 animate-fade-in"
        >
          <ChevronRight size={18} />
          {duel.currentQuestionIndex >= DUEL_CONFIG.totalQuestions - 1 || duel.lives <= 0
            ? 'See Results'
            : 'Next Question'}
        </button>
      )}
    </div>
  );
}