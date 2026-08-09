import React, { useState, useRef, useEffect } from 'react';
import { Plus, Zap, Bell, ArrowLeft, GraduationCap, Settings } from 'lucide-react';
import { TabKey, APIProvider } from '../types';
import { useDashboard, useNotification } from '../context/DashboardContext';
import TopNav from './TopNav';
import IntroPage from './IntroPage';
import ApiKeyModal from './ApiKeyModal';
import NotesInputModal from './NotesInputModal';
import LoadingSkeleton from './LoadingSkeleton';
import { generateDashboard } from '../services/aiService';
import { generateSampleDashboard } from '../services/sampleData';

// Lazy imports
const ModuleSynthesis = React.lazy(() => import('./ModuleSynthesis'));
const ContextMap = React.lazy(() => import('./ContextMap'));
const DiagnosticQuest = React.lazy(() => import('./DiagnosticQuest'));
const MyUniverse = React.lazy(() => import('./MyUniverse'));
const PracticeDuel = React.lazy(() => import('./PracticeDuel'));
const AudioOverview = React.lazy(() => import('./AudioOverview'));
const MindMap = React.lazy(() => import('./MindMap'));
const Presentation = React.lazy(() => import('./Presentation'));
const RecallCards = React.lazy(() => import('./RecallCards'));
const VisualBreakdown = React.lazy(() => import('./VisualBreakdown'));
const StudyReport = React.lazy(() => import('./StudyReport'));
const WhatIfLab = React.lazy(() => import('./WhatIfLab'));

type DenToolKey = 'audio-overview' | 'mind-map' | 'presentation' | 'recall-cards' | 'visual-breakdown' | 'study-report' | 'what-if-lab' | null;

const DEN_TOOLS: Array<{ id: DenToolKey; label: string; icon: string; desc: string }> = [
  { id: 'audio-overview', label: 'Audio Overview', icon: '🎧', desc: 'Listen to narrated summaries' },
  { id: 'mind-map', label: 'Mind Map', icon: '🗺️', desc: 'Visualize concept relationships' },
  { id: 'presentation', label: 'Presentation', icon: '📽️', desc: 'Slide-based module review' },
  { id: 'recall-cards', label: 'Recall Cards', icon: '🃏', desc: 'Flip & review key concepts' },
  { id: 'visual-breakdown', label: 'Visual Breakdown', icon: '📊', desc: 'Infographic-style summary grid' },
  { id: 'study-report', label: 'Study Report', icon: '📄', desc: 'Export a polished .docx report' },
  { id: 'what-if-lab', label: "What-If Lab", icon: '🧪', desc: 'Real-world scenario practice' },
];

function DenToolRenderer({ toolKey }: { toolKey: Exclude<DenToolKey, null> }) {
  const renderTool = () => {
    switch (toolKey) {
      case 'audio-overview': return <AudioOverview />;
      case 'mind-map': return <MindMap />;
      case 'presentation': return <Presentation />;
      case 'recall-cards': return <RecallCards />;
      case 'visual-breakdown': return <VisualBreakdown />;
      case 'study-report': return <StudyReport />;
      case 'what-if-lab': return <WhatIfLab />;
      default: return null;
    }
  };
  return <React.Suspense fallback={<LoadingSkeleton />}>{renderTool()}</React.Suspense>;
}

export default function AppShell() {
  const { state, dispatch } = useDashboard();
  const { notify } = useNotification();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [apiError, setApiError] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [activeDenTool, setActiveDenTool] = useState<DenToolKey>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const hasApiKey = !!state.apiKey;
  const hasDashboard = !!state.dashboard;
  const showIntro = !hasDashboard && !state.isGenerating;

  // Close notifications on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showNotifications]);

  // ─── API Key ───
  const handleApiKeySubmit = (key: string, provider: APIProvider) => {
    dispatch({ type: 'SET_API_PROVIDER', payload: provider });
    dispatch({ type: 'SET_API_KEY', payload: key });
    setShowApiKey(false);
    setApiError('');

    // If user already has a dashboard, re-generate with the new API using existing content
    if (hasDashboard && state.activeNote) {
      handleGenerate(state.activeNote, [], state.activeNote, key, provider);
    } else {
      setShowNotes(true);
    }
  };

  // ─── Generate ───
  const handleGenerate = async (text: string, images: string[], noteContent: string, apiKeyOverride?: string, apiProviderOverride?: APIProvider) => {
    const effectiveKey = apiKeyOverride ?? state.apiKey;
    const effectiveProvider = apiProviderOverride ?? state.apiProvider;

    if (!effectiveKey) {
      setShowApiKey(true);
      return;
    }

    dispatch({ type: 'SET_ACTIVE_NOTE', payload: noteContent });
    dispatch({ type: 'SET_GENERATING', payload: true });

    try {
      const data = await generateDashboard(effectiveProvider, effectiveKey, text, images);
      dispatch({ type: 'SET_DASHBOARD', payload: data });

      // Create module summary with initial XP
      dispatch({
        type: 'ADD_MODULE',
        payload: {
          id: `module-${Date.now()}`,
          title: data.moduleTitle,
          emoji: data.moduleEmoji,
          difficulty: data.globalDifficulty,
          createdAt: Date.now(),
          progress: 0,
          questionCount: data.quiz.length,
          xp: 0,
        },
      });

      // Create recall cards from core concepts
      dispatch({
        type: 'SET_RECALL_CARDS',
        payload: data.coreConcepts.map((cc) => ({
          id: `rc-${cc.id}`,
          front: cc.term,
          back: cc.definition,
          emoji: cc.emoji,
          difficulty: cc.difficulty,
          known: null,
        })),
      });

      // Track all quiz question texts
      for (const q of data.quiz) {
        dispatch({ type: 'ADD_SEEN_QUESTION', payload: q.question });
      }

      dispatch({ type: 'SET_GENERATING', payload: false });
      dispatch({ type: 'SET_ACTIVE_TAB', payload: TabKey.Dashboard });
      setShowNotes(false);
      notify(`✨ "${data.moduleTitle}" study universe generated!`, 'success');
    } catch (err: any) {
      dispatch({ type: 'SET_GENERATING', payload: false });
      const msg = err?.message || 'Something went wrong';
      notify(msg, 'error');

      // Reopen the notes modal with the visible error message
      setGenerateError(msg);
      setShowNotes(true);

      if (msg.includes('API key')) {
        setApiError(msg);
        setShowApiKey(true);
      }
    }
  };

  // ─── Demo Mode ───
  const handleTryDemo = () => {
    dispatch({ type: 'SET_GENERATING', payload: true });

    setTimeout(() => {
      const data = generateSampleDashboard();
      dispatch({ type: 'SET_DASHBOARD', payload: data });

      dispatch({
        type: 'ADD_MODULE',
        payload: {
          id: `module-${Date.now()}`,
          title: data.moduleTitle,
          emoji: data.moduleEmoji,
          difficulty: data.globalDifficulty,
          createdAt: Date.now(),
          progress: 0,
          questionCount: data.quiz.length,
          xp: 0,
        },
      });

      dispatch({
        type: 'SET_RECALL_CARDS',
        payload: data.coreConcepts.map((cc) => ({
          id: `rc-${cc.id}`,
          front: cc.term,
          back: cc.definition,
          emoji: cc.emoji,
          difficulty: cc.difficulty,
          known: null,
        })),
      });

      for (const q of data.quiz) {
        dispatch({ type: 'ADD_SEEN_QUESTION', payload: q.question });
      }

      dispatch({ type: 'SET_GENERATING', payload: false });
      dispatch({ type: 'SET_ACTIVE_TAB', payload: TabKey.Dashboard });
      setShowNotes(false);
      setGenerateError('');
      notify('✨ Sample ML module loaded! Explore all features.', 'success');
    }, 800);
  };

  // ─── Start Flow ───
  const handleStart = () => {
    if (hasApiKey) {
      setShowNotes(true);
    } else {
      setShowApiKey(true);
    }
  };

  // ─── Tab ───
  const handleTabChange = (tab: TabKey) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  // ─── Navigate to Dashboard ───
  const handleLogoClick = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: TabKey.Dashboard });
  };

  // ─── Render ───
  if (showIntro) {
    return (
      <>
        <IntroPage onStart={handleStart} />
        <ApiKeyModal isOpen={showApiKey} onSubmit={handleApiKeySubmit} error={apiError} currentProvider={state.apiProvider} />
        <NotesInputModal
          isOpen={showNotes}
          onClose={() => { setShowNotes(false); setGenerateError(''); }}
          onSubmit={handleGenerate}
          onTryDemo={handleTryDemo}
          isGenerating={state.isGenerating}
          error={generateError}
        />
      </>
    );
  }

  // Generating state
  if (state.isGenerating) {
    return <LoadingSkeleton />;
  }

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-nebula">
      {/* Header bar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border-glass/50">
        {/* Left: Logo always visible */}
        <button onClick={handleLogoClick} className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
          <GraduationCap size={28} className="text-primary" />
          <h1 className="font-heading text-lg tracking-wider text-text-primary hidden sm:block">
            LearnArena
          </h1>
        </button>

        {/* Center: Module title (when available) */}
        {state.dashboard && (
          <div className="flex items-center gap-2 mx-2 truncate">
            <span className="text-lg">{state.dashboard?.moduleEmoji}</span>
            <span className="font-heading text-sm tracking-wider text-text-primary truncate max-w-[200px]">
              {state.dashboard?.moduleTitle}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-heading tracking-wider shrink-0
              ${state.dashboard?.globalDifficulty === 'beginner' ? 'bg-success/20 text-success' :
                state.dashboard?.globalDifficulty === 'intermediate' ? 'bg-warning/20 text-warning' :
                state.dashboard?.globalDifficulty === 'advanced' ? 'bg-danger/20 text-danger' :
                'bg-primary/20 text-primary'}`}
            >
              {state.dashboard?.globalDifficulty?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Right: Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* XP display */}
          <div className="dark-glass rounded-lg px-2 md:px-3 py-1.5 flex items-center gap-2 text-sm">
            <Zap size={16} className="text-warning shrink-0" />
            <span className="text-text-primary font-bold text-xs md:text-sm">Lv.{state.xp.level}</span>
            <div className="w-12 md:w-16 h-1.5 bg-bg-elevated rounded-full overflow-hidden hidden xs:block">
              <div
                className="h-full bg-gradient-to-r from-warning to-warning rounded-full transition-all duration-500"
                style={{ width: `${Math.min((state.xp.current / state.xp.totalForNextLevel) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* New notes button */}
          <button
            onClick={handleStart}
            className="glass-button px-3 md:px-4 py-2 text-sm flex items-center gap-2"
          >
            <Plus size={16} />
            <span className="hidden sm:inline font-heading text-xs tracking-wider">NEW</span>
          </button>

          {/* Settings gear */}
          <button
            onClick={() => setShowApiKey(true)}
            className="glass-button-ghost p-2 rounded-lg"
            aria-label="API Settings"
            title="API Settings"
          >
            <Settings size={18} />
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="glass-button-ghost p-2 rounded-lg relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 md:w-96 z-50 animate-slide-up">
                <div className="dark-glass rounded-xl p-4 max-h-[400px] overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-heading text-sm text-text-primary tracking-wider">Notifications</h3>
                    {state.notifications.length > 0 && (
                      <button
                        onClick={() => { dispatch({ type: 'CLEAR_NOTIFICATIONS' }); setShowNotifications(false); }}
                        className="text-xs text-text-muted hover:text-text-primary transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  {state.notifications.length === 0 ? (
                    <p className="text-text-muted text-sm text-center py-6">No notifications yet</p>
                  ) : (
                    <div className="space-y-2">
                      {state.notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id })}
                          className={`p-3 rounded-lg text-sm cursor-pointer transition-all ${
                            n.read ? 'bg-bg-card opacity-60' : 'bg-bg-elevated border-l-2 border-primary'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-base shrink-0">
                              {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-text-primary text-xs">{n.message}</p>
                              <p className="text-text-muted text-[10px] mt-1">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Top nav */}
      <TopNav activeTab={state.activeTab} onTabChange={handleTabChange} />

      {/* Main content */}
      <main className="px-4 md:px-6 pb-24 md:pb-6">
        <React.Suspense fallback={<LoadingSkeleton />}>
          {state.activeTab === TabKey.Dashboard && state.dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
              <ModuleSynthesis data={state.dashboard.synthesis} />
              <ContextMap nodes={state.dashboard.contextGraph} />
              <DiagnosticQuest questions={state.dashboard.quiz} />
            </div>
          )}

          {state.activeTab === TabKey.MyUniverse && (
            <MyUniverse onLoad={(d) => {
              dispatch({ type: 'SET_DASHBOARD', payload: d });
              dispatch({ type: 'SET_ACTIVE_TAB', payload: TabKey.Dashboard });
            }} />
          )}

          {state.activeTab === TabKey.PracticeDuel && (
            <PracticeDuel />
          )}

          {state.activeTab === TabKey.LearnersDen && (
            activeDenTool ? (
              <div className="animate-fade-in">
                <button
                  onClick={() => setActiveDenTool(null)}
                  className="glass-button-ghost px-4 py-2 rounded-lg flex items-center gap-2 text-sm mb-6"
                >
                  <ArrowLeft size={16} /> Back to Tools
                </button>
                <DenToolRenderer toolKey={activeDenTool} />
              </div>
            ) : (
              <div className="animate-fade-in">
                <h2 className="font-heading text-xl text-text-primary mb-6">Learner's Den</h2>
                <p className="text-text-secondary text-sm mb-6 max-w-lg">
                  Explore your study material from different angles. Each tool transforms your module
                  content into a unique learning experience.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DEN_TOOLS.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveDenTool(tool.id)}
                      className="dark-glass dark-glass-hover rounded-xl p-5 text-left group"
                    >
                      <div className="text-3xl mb-3">{tool.icon}</div>
                      <h3 className="font-heading text-sm text-text-primary mb-1 tracking-wider">{tool.label}</h3>
                      <p className="text-text-muted text-xs">{tool.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </React.Suspense>
      </main>

      {/* Modals */}
      <ApiKeyModal isOpen={showApiKey} onSubmit={handleApiKeySubmit} error={apiError} currentProvider={state.apiProvider} />
      <NotesInputModal
        isOpen={showNotes}
        onClose={() => { setShowNotes(false); setGenerateError(''); }}
        onSubmit={handleGenerate}
        onTryDemo={handleTryDemo}
        isGenerating={state.isGenerating}
        error={generateError}
      />
    </div>
  );
}