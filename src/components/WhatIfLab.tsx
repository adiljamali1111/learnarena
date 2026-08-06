/* ──────────────────────────────────────────
   LearnArena — What-If Lab (Scenarios)
   ────────────────────────────────────────── */

import { useState } from 'react';
import { FlaskConical, Shuffle, Lightbulb, XCircle } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const SCENARIO_TEMPLATES = [
  {
    id: 'application',
    label: 'Real-World Application',
    icon: '🌍',
    generate: (concept: string) => `Imagine you're explaining "${concept}" to a colleague in a different field. How would you describe it using an everyday analogy? What real-world example would you use?`,
  },
  {
    id: 'counterfactual',
    label: 'What If...?',
    icon: '🔄',
    generate: (concept: string) => `What if the key principle behind "${concept}" didn't exist or worked differently? How would the world/systems/outcomes change? What alternative would fill the gap?`,
  },
  {
    id: 'teach',
    label: 'Teach It',
    icon: '🎓',
    generate: (concept: string) => `You need to teach "${concept}" to a 10-year-old. Break it down using simple language and a concrete example. What's the core idea they absolutely need to understand?`,
  },
  {
    id: 'problem',
    label: 'Problem Solving',
    icon: '🧩',
    generate: (concept: string) => `You encounter a problem that requires understanding "${concept}" to solve. Describe the scenario and walk through how you'd apply this concept step by step to reach a solution.`,
  },
  {
    id: 'connect',
    label: 'Connect the Dots',
    icon: '🔗',
    generate: (concept: string) => `How does "${concept}" connect to other ideas you've studied? Map out at least 3 connections and explain how understanding one helps with understanding the others.`,
  },
];

export default function WhatIfLab() {
  const { state } = useDashboard();
  const concepts = state.dashboard?.coreConcepts || [];
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');

  const currentConcept = concepts.find((c) => c.id === selectedConcept);
  const currentTemplate = SCENARIO_TEMPLATES.find((t) => t.id === selectedTemplate);

  const handleShuffle = () => {
    if (concepts.length === 0) return;
    const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];
    const randomTemplate = SCENARIO_TEMPLATES[Math.floor(Math.random() * SCENARIO_TEMPLATES.length)];
    setSelectedConcept(randomConcept.id);
    setSelectedTemplate(randomTemplate.id);
    setAnswer('');
  };

  const prompt = currentConcept && currentTemplate
    ? currentTemplate.generate(currentConcept.term)
    : '';

  if (concepts.length === 0) {
    return (
      <div className="dark-glass rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">🧪</div>
        <h3 className="font-heading text-lg text-text-primary mb-2">What-If Lab</h3>
        <p className="text-text-muted text-sm max-w-md mx-auto">
          Generate a study module with concepts to explore real-world scenarios and deepen your understanding.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl text-text-primary flex items-center gap-2">
          <FlaskConical size={22} className="text-accent" /> What-If Lab
        </h2>
        <button onClick={handleShuffle} className="glass-button-ghost px-3 py-2 rounded-lg text-sm flex items-center gap-2">
          <Shuffle size={16} /> Shuffle
        </button>
      </div>

      <p className="text-text-secondary text-sm mb-6">
        Apply your knowledge to real-world scenarios. Pick a concept and a thinking mode below, then write your response.
      </p>

      {/* Concept Selection */}
      <div className="mb-6">
        <h3 className="font-heading text-sm text-text-primary tracking-wider mb-3">1. Choose a Concept</h3>
        <div className="flex flex-wrap gap-2">
          {concepts.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedConcept(c.id); setAnswer(''); }}
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2
                ${selectedConcept === c.id
                  ? 'bg-primary/20 border border-primary/40 text-primary'
                  : 'glass-button-ghost'
                }`}
            >
              <span>{c.emoji}</span> {c.term}
            </button>
          ))}
        </div>
      </div>

      {/* Template Selection */}
      <div className="mb-6">
        <h3 className="font-heading text-sm text-text-primary tracking-wider mb-3">2. Choose a Mode</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SCENARIO_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedTemplate(t.id); setAnswer(''); }}
              className={`p-3 rounded-lg text-left transition-all duration-200
                ${selectedTemplate === t.id
                  ? 'bg-accent/15 border border-accent/40'
                  : 'dark-glass hover:border-primary/20'
                }`}
            >
              <div className="text-xl mb-1">{t.icon}</div>
              <p className="text-text-primary text-xs font-heading">{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt & Answer */}
      {prompt && (
        <div className="space-y-4 animate-fade-in">
          <div className="dark-glass rounded-xl p-4 flex items-start gap-3">
            <Lightbulb size={18} className="text-warning shrink-0 mt-0.5" />
            <p className="text-text-primary text-sm">{prompt}</p>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your thoughts, solution, or explanation here..."
            className="glass-input w-full h-40 resize-none p-4 text-sm"
          />

          {answer && (
            <div className="flex items-center gap-2 text-text-muted text-xs">
              <span>{answer.length} characters</span>
              <button
                onClick={() => setAnswer('')}
                className="glass-button-ghost px-2 py-1 rounded text-xs flex items-center gap-1"
              >
                <XCircle size={12} /> Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
