import { useState, useCallback, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard,
  Globe,
  Swords,
  PawPrint,
  Download,
  Bell,
  Plus,
  Sparkles,
} from 'lucide-react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import IntroPage from './components/IntroPage';
import NotesInputModal from './components/NotesInputModal';
import LoadingSkeleton from './components/LoadingSkeleton';
import NotificationPanel from './components/NotificationPanel';
import { DenErrorBoundary } from './components/DenErrorBoundary';
import ModuleSynthesisCard from './components/cards/ModuleSynthesisCard';
import CoreConceptDeckCard from './components/cards/CoreConceptDeckCard';
import ContextMapCard from './components/cards/ContextMapCard';
import ScenarioSandboxCard from './components/cards/ScenarioSandboxCard';
import DiagnosticQuestCard from './components/cards/DiagnosticQuestCard';
import MasteryProgressCard from './components/cards/MasteryProgressCard';
import CoWorkingArenaCard from './components/cards/CoWorkingArenaCard';
import type { TabKey, DenToolKey } from './types/dashboard';

// ── Lazy-load views ──
const LearnersDenView = lazy(() => import('./components/den/LearnersDenView').then(m => ({ default: m.default })));
const AudioOverviewTool = lazy(() => import('./components/den/AudioOverviewTool').then(m => ({ default: m.default })));
const MindMapTool = lazy(() => import('./components/den/MindMapTool').then(m => ({ default: m.default })));
const PresentationTool = lazy(() => import('./components/den/PresentationTool').then(m => ({ default: m.default })));
const RecallCardsTool = lazy(() => import('./components/den/RecallCardsTool').then(m => ({ default: m.default })));
const VisualBreakdownTool = lazy(() => import('./components/den/VisualBreakdownTool').then(m => ({ default: m.default })));
const StudyReportTool = lazy(() => import('./components/den/StudyReportTool').then(m => ({ default: m.default })));
const PracticeDuelView = lazy(() => import('./components/views/PracticeDuelView').then(m => ({ default: m.default })));
const MyUniverseViewLazy = lazy(() => import('./components/views/MyUniverseView').then(m => ({ default: m.default })));

// ── Tab config ──
const tabs: { key: TabKey; icon: typeof LayoutDashboard; label: string }[] = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'universe', icon: Globe, label: 'My Universe' },
  { key: 'duel', icon: Swords, label: 'Practice Duel' },
  { key: 'den', icon: PawPrint, label: "Learner's Den" },
];

// ── AppShell ──
function AppShell() {
  const {
    dashboardData,
    isLoading,
    error,
    exportDashboard,
    unreadCount,
    totalXp,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  // Den tool state
  const [denTool, setDenTool] = useState<DenToolKey | null>(null);
  const [denModuleTitle, setDenModuleTitle] = useState('');
  const [denSourceText, setDenSourceText] = useState('');

  const handleDenSelectTool = useCallback((tool: DenToolKey) => {
    if (dashboardData) {
      setDenModuleTitle(dashboardData.moduleTitle);
      const text = [
        dashboardData.synthesis.keyTakeaways.join('\n'),
        ...dashboardData.concepts.map(c => `${c.term}: ${c.definition}`),
        dashboardData.scenario.scenario,
      ].join('\n\n');
      setDenSourceText(text);
    }
    setDenTool(tool);
  }, [dashboardData]);

  // ── Den tool router ──
  const renderDenTool = () => {
    const props = {
      moduleTitle: denModuleTitle,
      sourceText: denSourceText,
      onBack: () => setDenTool(null),
    };

    switch (denTool) {
      case 'audio-overview': return <AudioOverviewTool {...props} />;
      case 'mindmap': return <MindMapTool {...props} />;
      case 'presentation': return <PresentationTool {...props} />;
      case 'recall-cards': return <RecallCardsTool {...props} />;
      case 'visual-breakdown': return <VisualBreakdownTool {...props} />;
      case 'study-report': return <StudyReportTool {...props} />;
      default: return null;
    }
  };

  return (
    <div className="h-dvh flex flex-col">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-dark-base/80 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="font-heading text-sm font-bold text-foreground tracking-wider">LEARNARENA</h1>
        </div>

        {/* Centre: Pill menu (desktop) */}
        <div className="hidden sm:flex items-center gap-1 bg-dark-elevated rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setDenTool(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading transition-all duration-200 cursor-pointer ${
                  activeTab === tab.key && !denTool
                    ? 'bg-primary text-dark-base font-bold'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* XP display */}
          <span className="hidden sm:flex items-center gap-1 text-xs text-gold">
            <Sparkles className="w-3 h-3" /> {totalXp} XP
          </span>

          {/* New Notes button */}
          <button
            onClick={() => setNotesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-dark-base text-xs font-heading font-bold hover:bg-primary-light transition-all duration-200 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Notes</span>
          </button>

          {/* Export */}
          <button
            onClick={exportDashboard}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-foreground hover:bg-dark-hover transition-all duration-200 cursor-pointer"
            title="Export JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setNotifPanelOpen(true)}
            className="relative flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-foreground hover:bg-dark-hover transition-all duration-200 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-foreground text-2xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Tab Bar — fixed bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-dark-surface border-t border-border px-2 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key && !denTool;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setDenTool(null);
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive ? 'text-primary' : 'text-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-2xs">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error && activeTab === 'dashboard' ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <p className="font-heading text-lg font-bold text-destructive mb-2">Something went wrong</p>
              <p className="text-sm text-muted mb-4">{error}</p>
              <button
                onClick={() => setNotesModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary text-dark-base text-xs font-heading font-bold transition-colors cursor-pointer"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        ) : activeTab === 'dashboard' && denTool ? (
          <Suspense fallback={<LoadingSkeleton />}>
            <DenErrorBoundary onRetry={() => setDenTool(null)}>
              {renderDenTool()}
            </DenErrorBoundary>
          </Suspense>
        ) : activeTab === 'dashboard' && dashboardData ? (
          <div className="flex-1 overflow-y-auto p-4 pb-20 sm:pb-4">
            <div className="max-w-5xl mx-auto space-y-4">
              {/* Module title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-heading text-lg font-bold text-foreground">{dashboardData.moduleTitle}</h2>
                </div>
              </div>

              {/* 3-stat row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-3 text-center">
                  <p className="text-2xl font-heading font-bold text-primary">{dashboardData.concepts.length}</p>
                  <p className="text-2xs text-muted-lighter">Concepts</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-2xl font-heading font-bold text-accent">{dashboardData.diagnostic.questions.length}</p>
                  <p className="text-2xs text-muted-lighter">Questions</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-2xl font-heading font-bold text-success">{dashboardData.mastery.level}</p>
                  <p className="text-2xs text-muted-lighter">Level</p>
                </div>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ModuleSynthesisCard keyTakeaways={dashboardData.synthesis.keyTakeaways} />
                <CoreConceptDeckCard concepts={dashboardData.concepts} />
                <ContextMapCard data={dashboardData.contextMap} />
                <ScenarioSandboxCard data={dashboardData.scenario} />

                {/* Diagnostic Quest — full-width */}
                <div className="md:col-span-2">
                  <DiagnosticQuestCard data={dashboardData.diagnostic} />
                </div>

                <MasteryProgressCard
                  data={dashboardData.mastery}
                  totalXp={totalXp}
                  level={dashboardData.mastery.level}
                />
                <CoWorkingArenaCard data={dashboardData.coworking} />
              </div>
            </div>
          </div>
        ) : activeTab === 'dashboard' ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-glow flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">Welcome to LearnArena</h2>
              <p className="text-sm text-muted mb-6 leading-relaxed">
                Upload your study materials and transform them into an interactive learning universe
                with concept cards, quizzes, scenarios, and more.
              </p>
              <button
                onClick={() => setNotesModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-dark-base font-heading font-bold text-sm hover:bg-primary-light transition-all duration-200 cursor-pointer shadow-lg"
              >
                <Plus className="w-4 h-4" /> GET STARTED
              </button>
            </div>
          </div>
        ) : activeTab === 'universe' ? (
          <Suspense fallback={<LoadingSkeleton />}>
            <MyUniverseViewLazy />
          </Suspense>
        ) : activeTab === 'duel' ? (
          <Suspense fallback={<LoadingSkeleton />}>
            <PracticeDuelView />
          </Suspense>
        ) : activeTab === 'den' ? (
          <Suspense fallback={<LoadingSkeleton />}>
            <DenErrorBoundary>
              <LearnersDenView onSelectTool={handleDenSelectTool} onBack={() => setActiveTab('dashboard')} />
            </DenErrorBoundary>
          </Suspense>
        ) : null}
      </main>

      {/* Notification panel */}
      <NotificationPanel open={notifPanelOpen} onClose={() => setNotifPanelOpen(false)} />

      {/* Notes input modal */}
      <NotesInputModal open={notesModalOpen} onClose={() => setNotesModalOpen(false)} />

      {/* Toaster */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#150433',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#150433' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#150433' } },
        }}
      />
    </div>
  );
}

// ── Root ──
export default function App() {
  return (
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  );
}

function AppContent() {
  const { hasEntered } = useDashboard();

  if (!hasEntered) return <IntroPage />;

  return <AppShell />;
}