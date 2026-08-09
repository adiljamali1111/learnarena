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
import NeonLogo from './components/NeonLogo';
import {
  LayoutDashboard,
  Library,
  Swords,
  Sparkles,
  Zap,
  Settings,
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
    <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between backdrop-blur-xl bg-dark-base/60 border-b border-glass-border relative">
      {/* Neon accent line at bottom of header */}
      <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      {/* Left — brand (clicking navigates to dashboard) */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className="flex items-center gap-3 group cursor-pointer transition-all"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dark-card to-dark-elevated border border-primary/40 flex items-center justify-center shadow-glow-purple-sm group-hover:shadow-glow-purple transition-all group-hover:border-accent/40">
          <NeonLogo size={22} />
        </div>
        <div className="hidden sm:block text-left">
          <h1 className="font-heading font-bold text-sm leading-tight">
            <span className="text-primary-light text-glow-purple">Learn</span>
            <span className="text-accent text-glow-cyan">Arena</span>
          </h1>
          {activeModule && (
            <p className="text-[10px] text-muted-lighter truncate max-w-[160px]">
              {activeModule.title}
            </p>
          )}
        </div>
      </button>

      {/* Center — tabs */}
      <nav className="flex gap-0.5 sm:gap-1 bg-white/5 rounded-2xl p-1" role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = state.activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`pill-tab flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary/20 text-primary shadow-glow-purple-sm border border-primary/30'
                  : 'text-muted hover:text-foreground border border-transparent'
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
          onClick={() => setModal('apiKey')}
          className="btn-base w-9 h-9 rounded-xl bg-white/5 border border-glass-border flex items-center justify-center text-muted hover:text-foreground hover:border-accent/40 hover:shadow-glow-purple-sm transition-all cursor-pointer"
          aria-label="OpenRouter API Key"
          title="OpenRouter API Key"
        >
          <Settings size={16} />
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
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1 py-1.5 bg-dark-elevated/90 backdrop-blur-xl border-t border-glass-border sm:hidden"
      role="tablist"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = state.activeTab === tab.key;
        const shortLabel = tab.key === 'duel' ? 'Duel' : tab.key === 'den' ? 'Den' : tab.label;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveTab(tab.key)}
            className={`pill-tab flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl transition-all ${
              isActive ? 'text-primary' : 'text-muted-lighter'
            }`}
          >
            <Icon size={18} />
            <span className="text-[9px] font-medium whitespace-nowrap">{shortLabel}</span>
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