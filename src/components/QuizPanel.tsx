import { useState, useCallback } from 'react';
import { FileText, HelpCircle, CheckCircle, XCircle, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { getApiKey, addTutorMessage } from '../store';
import type { Module } from '../types';

interface QuizQuestion {
  id: string;
  type: 'mcq' | 'oeq';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Props {
  module: Module;
  onClose: () => void;
}

function cleanJson(text: string): string {
  return text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
}

export default function QuizPanel({ module, onClose }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizMode, setQuizMode] = useState<'mcq' | 'oeq'>('mcq');
  const [answered, setAnswered] = useState(false);

  const generateQuiz = useCallback(async () => {
    const key = getApiKey();
    if (!key) { setError('Set your OpenRouter API key first'); return; }

    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(false);

    try {
      const prompt = quizMode === 'mcq'
        ? `Generate 5 multiple-choice questions from the following study material. Return JSON with key "questions" containing an array. Each question: { "id": "q1", "type": "mcq", "question": string, "options": [4 strings], "correctIndex": 0-3, "explanation": string }. Make options challenging but fair.`
        : `Generate 5 open-ended questions from the following study material. Return JSON with key "questions" containing an array. Each question: { "id": "q1", "type": "oeq", "question": string, "options": [], "correctIndex": 0, "explanation": string (a model answer) }. Questions should test deep understanding.`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'LearnArena',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Study material:\n\n${module.content.slice(0, 8000)}` },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Invalid API key');
        if (res.status === 402) throw new Error('Insufficient credits');
        throw new Error(`Server error (${res.status})`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response');

      const parsed = JSON.parse(cleanJson(content));
      setQuestions(parsed.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  }, [module.content, quizMode]);

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    if (idx === questions[currentQ]?.correctIndex) {
      setScore((s) => s + 1);
      addTutorMessage(module.id, { role: 'assistant', content: `Quiz: Correct! ${questions[currentQ]?.explanation}` });
    } else {
      addTutorMessage(module.id, { role: 'assistant', content: `Quiz: Incorrect. ${questions[currentQ]?.explanation}` });
    }
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswered(false);
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) {
      setCurrentQ((i) => i - 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswered(false);
    }
  };

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Quiz</h3>
        </div>
        <button onClick={onClose} className="text-muted hover:text-foreground text-xs transition-colors cursor-pointer">
          Back to content
        </button>
      </div>

      {/* Mode toggle */}
      {questions.length === 0 && !loading && !error && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setQuizMode('mcq')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              quizMode === 'mcq' ? 'bg-primary text-dark-base' : 'bg-dark-hover text-muted hover:text-foreground'
            }`}
          >
            Multiple Choice
          </button>
          <button
            onClick={() => setQuizMode('oeq')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              quizMode === 'oeq' ? 'bg-primary text-dark-base' : 'bg-dark-hover text-muted hover:text-foreground'
            }`}
          >
            Open-Ended
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-destructive text-sm mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted">Generating quiz questions...</p>
        </div>
      )}

      {/* Start button */}
      {questions.length === 0 && !loading && !error && (
        <button
          onClick={generateQuiz}
          className="w-full py-3 rounded-xl bg-primary text-dark-base font-heading font-bold text-sm hover:bg-primary-light transition-colors cursor-pointer"
        >
          GENERATE QUIZ
        </button>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div>
          {/* Progress & score */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs text-muted-lighter">
              Question {currentQ + 1} of {questions.length}
            </span>
            <span className="text-xs text-gold">Score: {score}/{questions.length}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-dark-hover rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>

          <p className="text-sm text-foreground font-medium mb-4">{questions[currentQ].question}</p>

          {/* MCQ options */}
          {questions[currentQ].type === 'mcq' && questions[currentQ].options.length > 0 && (
            <div className="space-y-2">
              {questions[currentQ].options.map((opt, idx) => {
                let btnClass = 'bg-dark-elevated/60 border-border hover:border-primary/40';
                if (answered) {
                  if (idx === questions[currentQ].correctIndex) btnClass = 'border-success bg-success/10';
                  else if (idx === selectedAnswer) btnClass = 'border-destructive bg-destructive/10';
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={answered}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm text-foreground transition-all duration-200 cursor-pointer disabled:cursor-default ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* OEQ */}
          {questions[currentQ].type === 'oeq' && (
            <div className="space-y-3">
              <textarea
                className="w-full bg-dark-base border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-lighter focus:outline-none focus:border-accent resize-none"
                rows={4}
                placeholder="Type your answer..."
                disabled={answered}
              />
              {!answered && (
                <button
                  onClick={() => { setAnswered(true); setShowResult(true); }}
                  className="w-full py-2 rounded-xl bg-primary text-dark-base text-xs font-heading font-bold hover:bg-primary-light transition-colors cursor-pointer"
                >
                  CHECK ANSWER
                </button>
              )}
            </div>
          )}

          {/* Explanation */}
          {showResult && (
            <div className={`mt-4 p-4 rounded-xl border ${
              selectedAnswer === questions[currentQ].correctIndex
                ? 'bg-success/10 border-success/30'
                : 'bg-accent/10 border-accent/30'
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                {selectedAnswer === questions[currentQ].correctIndex ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <XCircle className="w-4 h-4 text-accent" />
                )}
                <span className={`text-xs font-bold ${selectedAnswer === questions[currentQ].correctIndex ? 'text-success' : 'text-accent'}`}>
                  {selectedAnswer === questions[currentQ].correctIndex ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{questions[currentQ].explanation}</p>
            </div>
          )}

          {/* Navigation */}
          {answered && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={prevQuestion}
                disabled={currentQ === 0}
                className="flex items-center gap-1 text-xs text-muted hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Previous
              </button>

              {currentQ === questions.length - 1 ? (
                <button
                  onClick={() => { setQuestions([]); setCurrentQ(0); setScore(0); }}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> New Quiz
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors cursor-pointer"
                >
                  Next <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}