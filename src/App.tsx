import { DashboardProvider, useDashboard } from './context/DashboardContext';
import IntroPage from './components/IntroPage';
import ApiKeyModal from './components/ApiKeyModal';
import NotesInputModal from './components/NotesInputModal';
import NotificationPanel from './components/NotificationPanel';
import LoadingSkeleton from './components/LoadingSkeleton';
import DashboardView from './components/views/DashboardView';
import MyUniverseView from './components/views/MyUniverseView';
import PracticeDuelView from './components/views/PracticeDuelView';
import LearnersDenView from './components/views/LearnersDenView';
import DenToolView from './components/views/DenToolView';
import {
  LayoutDashboard,
  Library,
  Swords,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { TabKey } from './types/dashboard';

const TABS: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'universe', label: 'My Universe', icon: Library },
  { key: 'duel', label: 'Practice Duel', icon: Swords },
  { key: 'den', label: "Learner's Den", icon: Sparkles },
];

/* ===========================
   Header
   =========================== */
function Header() {
  const { state, setActiveTab, setModal } = useDashboard();
  const activeModule = state.modules.find((m) => m.id === state.activeModuleId);

  return (
    <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between backdrop-blur-xl bg-dark-base/60 border-b border-glass-border">
      {/* Left — brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-purple-sm">
          <span className="text-sm">🧠</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="font-heading font-bold text-sm text-glow-cyan">LearnArena</h1>
          {activeModule && (
            <p className="text-[10px] text-muted-lighter truncate max-w-[160px]">
              {activeModule.title}
            </p>
          )}
        </div>
      </div>

      {/* Center — tabs */}
      <nav className="flex gap-1 bg-white/5 rounded-2xl p-1" role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = state.activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`pill-tab flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary/20 text-primary shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right — notifications + XP */}
      <div className="flex items-center gap-2">
        {activeModule && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-gold mr-2">
            <Zap size={12} />
            <span>{activeModule.xp.toLocaleString()}</span>
          </div>
        )}

        <NotificationPanel />

        <button
          onClick={() => setModal('notesInput')}
          className="btn-base px-3 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-semibold hover:shadow-glow-purple transition-all"
        >
          + New
        </button>
      </div>
    </header>
  );
}

/* ===========================
   Mobile tab bar
   =========================== */
function MobileTabBar() {
  const { state, setActiveTab } = useDashboard();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 bg-dark-elevated/90 backdrop-blur-xl border-t border-glass-border sm:hidden"
      role="tablist"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = state.activeTab === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(tab.key)}
            className={`pill-tab flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-primary' : 'text-muted-lighter'
            }`}
          >
            <Icon size={18} />
            <span className="text-[9px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ===========================
   Main content area
   =========================== */
function MainContent() {
  const { state } = useDashboard();

  if (state.isLoading) {
    return <LoadingSkeleton />;
  }

  if (state.error && !state.activeModuleId) {
    return (
      <div className="p-4 max-w-2xl mx-auto mt-8">
        <div className="glass-card p-6 text-center">
          <p className="text-destructive text-sm mb-3">{state.error}</p>
          <p className="text-xs text-muted">Try pasting different notes or check your API key.</p>
        </div>
      </div>
    );
  }

  switch (state.activeTab) {
    case 'dashboard':
      return <DashboardView />;
    case 'universe':
      return <MyUniverseView />;
    case 'duel':
      return <PracticeDuelView />;
    case 'den':
      return state.activeDenTool ? <DenToolView /> : <LearnersDenView />;
    default:
      return <DashboardView />;
  }
}

/* ===========================
   Root App
   =========================== */
export default function App() {
  return (
    <DashboardProvider>
      <AppShell />
    </DashboardProvider>
  );
}

function AppShell() {
  const { state } = useDashboard();

  return (
    <>
      {!state.hasEntered ? <IntroPage /> : (
        <div className="min-h-screen bg-dark-base">
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col min-h-screen pb-16 sm:pb-0">
            <Header />
            <main className="flex-1">
              <MainContent />
            </main>
            <MobileTabBar />
          </div>
        </div>
      )}

      {/* Modals — rendered outside the main branch so they work on the intro page too */}
      {state.modal === 'apiKey' && <ApiKeyModal />}
      {state.modal === 'notesInput' && <NotesInputModal />}
    </>
  );
}