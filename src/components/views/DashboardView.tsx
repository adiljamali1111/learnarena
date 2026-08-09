import { useDashboard } from '../../context/DashboardContext';
import ModuleSynthesisCard from '../cards/ModuleSynthesisCard';
import CoreConceptDeckCard from '../cards/CoreConceptDeckCard';

import ScenarioSandboxCard from '../cards/ScenarioSandboxCard';
import DiagnosticQuestCard from '../cards/DiagnosticQuestCard';
import MasteryProgressCard from '../cards/MasteryProgressCard';
import { Plus } from 'lucide-react';

export default function DashboardView() {
  const { state, setModal, loadModule, refreshDiagnosticQuestions, refreshScenario } = useDashboard();
  const activeModule = state.modules.find((m) => m.id === state.activeModuleId);

  if (!activeModule && state.modules.length === 0) {
    return (
      <div className="p-4 max-w-2xl mx-auto mt-12 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="glass-card p-8 text-center max-w-md animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h2 className="font-heading font-bold text-xl mb-2">No Modules Yet</h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Create your first study module by pasting your notes or uploading course
            materials. LearnArena will turn them into an interactive dashboard.
          </p>
          <button
            onClick={() => setModal('notesInput')}
            className="btn-base px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold hover:shadow-glow-purple transition-all"
          >
            <Plus size={16} className="inline mr-1" />
            Create Module
          </button>
        </div>
      </div>
    );
  }

  if (!activeModule && state.modules.length > 0) {
    return (
      <div className="p-4 max-w-2xl mx-auto mt-8">
        <div className="glass-card p-6 text-center">
          <h2 className="font-heading font-semibold text-lg mb-3">Select a Module</h2>
          <p className="text-sm text-muted mb-4">
            You have {state.modules.length} module{state.modules.length > 1 ? 's' : ''} saved.
            Choose one from{' '}
            <button
              onClick={() => loadModule(state.modules[state.modules.length - 1].id)}
              className="text-accent hover:underline"
            >
              My Universe
            </button>{' '}
            or create a new one.
          </p>
          <button
            onClick={() => setModal('notesInput')}
            className="btn-base px-4 py-2 rounded-xl bg-primary text-white text-sm hover:shadow-glow-purple transition-all"
          >
            + New Module
          </button>
        </div>
      </div>
    );
  }

  if (!activeModule?.dashboard) {
    return (
      <div className="p-4 max-w-2xl mx-auto mt-8">
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-muted">No dashboard data for this module.</p>
        </div>
      </div>
    );
  }

  const { dashboard } = activeModule;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Module header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div className="min-w-0">
          <h2 className="font-heading font-bold text-2xl truncate">{dashboard.moduleTitle}</h2>
          <p className="text-xs text-muted-lighter mt-1">
            {activeModule.notes.length.toLocaleString()} chars •{' '}
            {dashboard.coreConcepts.length} concepts •{' '}
            {dashboard.diagnosticQuestions.length} questions
          </p>
        </div>
        <button
          onClick={() => setModal('notesInput')}
          className="btn-base px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold hover:shadow-glow-purple transition-all"
        >
          + New Module
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Module Synthesis — full width */}
        <div className="lg:col-span-3">
          <ModuleSynthesisCard data={dashboard.moduleSynthesis} />
        </div>

        {/* Core Concepts */}
        <div className="lg:col-span-1">
          <CoreConceptDeckCard data={dashboard.coreConcepts} />
        </div>

        {/* Scenario Sandbox — narrower for quick interaction */}
        <div className="lg:col-span-1">
          <ScenarioSandboxCard data={dashboard.scenario} onRefresh={refreshScenario} />
        </div>

        {/* Diagnostic Quest — wider so it reads like a real quiz card */}
        <div className="lg:col-span-2">
          <DiagnosticQuestCard
            data={dashboard.diagnosticQuestions}
            moduleId={activeModule.id}
            onRefresh={refreshDiagnosticQuestions}
          />
        </div>

        {/* Mastery Progress — full width on its row */}
        <div className="lg:col-span-3">
          <MasteryProgressCard data={dashboard.masteryProgress} />
        </div>
      </div>
    </div>
  );
}