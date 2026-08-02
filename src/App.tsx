import {
  Bell,
  Brain,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Plus,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { DashboardProvider, useDashboard } from "./context/DashboardContext";
import ApiKeyModal from "./components/ApiKeyModal";
import NotesInputModal from "./components/NotesInputModal";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ModuleSynthesisCard from "./components/cards/ModuleSynthesisCard";
import CoreConceptDeckCard from "./components/cards/CoreConceptDeckCard";
import ContextMapCard from "./components/cards/ContextMapCard";
import ScenarioSandboxCard from "./components/cards/ScenarioSandboxCard";
import DiagnosticQuestCard from "./components/cards/DiagnosticQuestCard";
import MasteryProgressCard from "./components/cards/MasteryProgressCard";
import CoWorkingArenaCard from "./components/cards/CoWorkingArenaCard";

/* ───── Navigation Bar ───── */
function TopNav() {
  const { resetDashboard, exportDashboard, dashboardData } = useDashboard();

  const handleExport = () => {
    exportDashboard();
    toast.success("Dashboard exported as JSON!", {
      style: {
        background: "rgba(21, 4, 51, 0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        backdropFilter: "blur(20px)",
      },
    });
  };

  const handleNewNotes = () => {
    resetDashboard();
    toast("Ready to generate a new study dashboard!", {
      icon: "📝",
      style: {
        background: "rgba(21, 4, 51, 0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        backdropFilter: "blur(20px)",
      },
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-6 flex items-center justify-between border-b border-white/10 bg-dark-base/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Brain className="w-7 h-7 text-accent" />
        <span className="font-heading text-lg font-bold tracking-wider text-foreground">
          Learn<span className="text-accent">Arena</span>
        </span>
      </div>

      {/* Pill Menu */}
      <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
        {["Dashboard", "My Universe", "Practice Duel", "Community"].map(
          (item, i) => (
            <button
              key={item}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                i === 0
                  ? "bg-primary/20 text-primary-light shadow-sm"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {dashboardData && (
          <>
            <button
              onClick={handleNewNotes}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200 cursor-pointer border border-white/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Notes</span>
            </button>
            <button
              onClick={handleExport}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200 cursor-pointer border border-white/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </>
        )}
        <button className="relative p-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200 cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full animate-pulse-glow" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold cursor-pointer">
          Y
        </div>
      </div>
    </nav>
  );
}

/* ───── Sub-Header Bar ───── */
function SubHeader() {
  const { dashboardData } = useDashboard();

  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 mt-16 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary-light" />
        </div>
        <div>
          <h1 className="font-heading text-sm md:text-base font-bold text-foreground tracking-wide">
            {dashboardData?.moduleTitle ||
              "Intro to Neuroscience: The Action Potential"}
          </h1>
          <p className="text-xs text-muted-lighter mt-0.5">
            {dashboardData ? "Generated from your notes" : "Module 3 of 12"}
          </p>
        </div>
        <button className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200 cursor-pointer border border-white/10 ml-2">
          Module <ChevronDown className="w-3 h-3" />
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200 cursor-pointer">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200 cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ───── Dashboard Grid ───── */
function DashboardGrid() {
  const { dashboardData } = useDashboard();

  if (!dashboardData) return null;

  return (
    <div className="flex-1 px-4 md:px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
        {/* Column 1 — ~30% */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <ModuleSynthesisCard data={dashboardData.synthesis} />
          <CoreConceptDeckCard data={dashboardData.concepts} />
          <ContextMapCard data={dashboardData.contextMap} />
        </div>

        {/* Column 2 — ~42% */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <ScenarioSandboxCard data={dashboardData.scenario} />
        </div>

        {/* Column 3 — ~28% */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <DiagnosticQuestCard data={dashboardData.diagnosticQuest} />
          <MasteryProgressCard data={dashboardData.masteryProgress} />
          <CoWorkingArenaCard data={dashboardData.coWorkingArena} />
        </div>
      </div>
    </div>
  );
}

/* ───── App Shell ───── */
function AppShell() {
  const {
    dashboardData,
    isLoading,
    showApiKeyModal,
    showNotesModal,
    generateFromNotes,
    setApiKey,
    dismissNotesModal,
  } = useDashboard();

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <SubHeader />

      {/* Loading skeleton */}
      {isLoading && !dashboardData && <LoadingSkeleton />}

      {/* Dashboard content */}
      {dashboardData && !isLoading && <DashboardGrid />}

      {/* Empty state */}
      {!dashboardData && !isLoading && !showApiKeyModal && !showNotesModal && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Brain className="w-16 h-16 text-primary/40 mx-auto mb-4" />
            <p className="text-muted text-sm mb-2">
              Ready to learn? Paste your course notes to begin.
            </p>
            <p className="text-muted-lighter text-xs">
              Click "New Notes" in the top bar to get started.
            </p>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && <ApiKeyModal onSave={setApiKey} />}

      {/* Notes Input Modal */}
      {showNotesModal && (
        <NotesInputModal
          onSubmit={generateFromNotes}
          onDismiss={dismissNotesModal}
        />
      )}

      {/* Toast container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "rgba(21, 4, 51, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            backdropFilter: "blur(20px)",
            borderRadius: "12px",
            fontSize: "13px",
          },
        }}
      />
    </div>
  );
}

/* ───── Root ───── */
export default function App() {
  return (
    <DashboardProvider>
      <AppShell />
    </DashboardProvider>
  );
}