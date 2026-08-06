import { useState, useCallback } from 'react';
import { Brain, CheckCircle, XCircle, ArrowRight, RotateCw, RefreshCw } from 'lucide-react';
import { QuizQuestion } from '../types';
import { useDashboard } from '../context/DashboardContext';


interface Props {
  questions: QuizQuestion[];
}

export default function DiagnosticQuest({ questions }: Props) {
  const { state, dispatch } = useDashboard();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [questionPool, setQuestionPool] = useState<QuizQuestion[]>(questions);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  const question = questionPool[currentIndex];

  const refreshQuestions = useCallback(() => {
    const unseen = questions.filter(q => !state.seenQuestions.has(q.question));
    const shuffled = [...(unseen.length > 0 ? unseen : questions)].sort(() => Math.random() - 0.5);
    const freshPool = shuffled.slice(0, Math.max(5, Math.min(questions.length, 10)));

    const deduped = freshPool.filter(q => !usedIndices.has(questions.indexOf(q)));
    const finalPool = deduped.length >= 3 ? deduped : freshPool;

    setQuestionPool(finalPool);
    setCurrentIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setShowResults(false);
    setUsedIndices(new Set());
  }, [questions, state.seenQuestions, usedIndices]);

  const handleAnswer = useCallback((index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);

    if (index === question.correctIndex) {
      setScore((prev) => prev + 1);
      const currentModule = state.modules[state.modules.length - 1];
      if (currentModule) {
        dispatch({ type: 'ADD_TOPIC_XP', payload: { moduleId: currentModule.id, amount: 1 } });
      }
    }

    dispatch({ type: 'ADD_SEEN_QUESTION', payload: question.question });
  }, [answered, question, dispatch, state.modules]);

  const nextQuestion = () => {
    if (currentIndex < questionPool.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const restart = () => {
    setQuestionPool(questions);
    setCurrentIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    const percentage = Math.round((score / questionPool.length) * 100);
    return (
      <div className="dark-glass rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Brain size={20} className="text-primary" />
            <h2 className="font-heading text-base tracking-wider text-text-primary">Diagnostic Quest — Results</h2>
          </div>
        </div>
        <div className="text-center py-6">
          <div className="text-5xl mb-4">{percentage >= 80 ? '🌟' : percentage >= 50 ? '📖' : '💪'}</div>
          <p className="text-3xl font-bold text-text-primary mb-2">{score}/{questionPool.length}</p>
          <p className="text-text-secondary text-sm mb-1">{percentage}% Correct</p>
          <div className="w-full h-2 bg-bg-elevated rounded-full mt-4 mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            <button onClick={restart} className="glass-button px-6 py-2.5 text-sm flex items-center gap-2">
              <RotateCw size={16} /> Retry
            </button>
            <button onClick={refreshQuestions} className="glass-button-ghost px-4 py-2.5 text-sm flex items-center gap-2">
              <RefreshCw size={16} /> New Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="dark-glass rounded-xl p-5 text-center">
        <Brain size={20} className="text-primary mx-auto mb-3" />
        <p className="text-text-secondary text-sm mb-4">No questions available</p>
        <button onClick={refreshQuestions} className="glass-button-ghost px-4 py-2 text-sm flex items-center gap-2 mx-auto">
          <RefreshCw size={16} /> Load Questions
        </button>
      </div>
    );
  }

  const isCorrect = selected === question.correctIndex;

  return (
    <div className="dark-glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Brain size={20} className="text-primary" />
          <h2 className="font-heading text-base tracking-wider text-text-primary">Diagnostic Quest</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshQuestions}
            className="glass-button-ghost p-1.5 rounded-lg"
            title="Refresh questions"
          >
            <RefreshCw size={14} className="text-text-muted" />
          </button>
          <span className="text-text-muted text-xs">{currentIndex + 1}/{questionPool.length}</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-bg-elevated rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questionPool.length) * 100}%` }}
        />
      </div>

      <p className="text-text-primary text-sm font-medium mb-4">{question.question}</p>

      <div className="space-y-2 mb-4">
        {question.options.map((opt, i) => {
          let borderClass = 'border-border-glass';
          if (answered) {
            if (i === question.correctIndex) borderClass = 'border-success bg-success/10';
            else if (i === selected && !isCorrect) borderClass = 'border-danger bg-danger/10';
            else borderClass = 'border-border-glass/30';
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={`w-full text-left p-3 rounded-lg text-sm border transition-all ${borderClass}
                ${!answered ? 'hover:border-primary/50 hover:bg-bg-card-hover' : ''}
              `}
            >
              <span className="text-text-muted mr-2">{String.fromCharCode(65 + i)}.</span>
              <span className="text-text-primary">{opt}</span>
              {answered && i === question.correctIndex && <CheckCircle size={16} className="inline ml-2 text-success" />}
              {answered && i === selected && !isCorrect && <XCircle size={16} className="inline ml-2 text-danger" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mb-4 p-3 rounded-lg bg-bg-elevated text-text-secondary text-xs leading-relaxed animate-fade-in">
          {question.explanation}
        </div>
      )}

      <button
        onClick={nextQuestion}
        disabled={!answered}
        className="glass-button w-full py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {currentIndex < questionPool.length - 1 ? <>Next <ArrowRight size={16} /></> : 'See Results'}
      </button>
    </div>
  );
}
