import { useState } from 'react';
import { Search, Trash2, FolderOpen, Clock, BarChart3, Zap, Trophy, TrendingUp, Star, Target } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { TabKey, DashboardData } from '../types';
import { STORAGE_KEYS, TOPIC_MAX_XP, getCumulativeLevel } from '../constants';

interface Props {
  onLoad: (data: DashboardData) => void;
}

export default function MyUniverse({ onLoad }: Props) {
  const { state, dispatch } = useDashboard();
  const [search, setSearch] = useState('');

  const filteredModules = state.modules.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    dispatch({ type: 'REMOVE_MODULE', payload: id });
  };

  const handleLoad = (_moduleId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.dashboard);
      if (stored) {
        const data = JSON.parse(stored) as DashboardData;
        onLoad(data);
      }
    } catch {
      // silent fail
    }
  };

  // Cumulative XP data
  const cumulativeLevel = getCumulativeLevel(state.cumulativeXp);
  const cumProgressPercent = cumulativeLevel.totalForNextLevel > 0
    ? Math.min((cumulativeLevel.current / cumulativeLevel.totalForNextLevel) * 100, 100)
    : 0;

  if (state.modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="text-6xl mb-6">📭</div>
        <h2 className="font-heading text-xl text-text-primary mb-2">Your Universe is Empty</h2>
        <p className="text-text-secondary text-sm mb-6 text-center max-w-md">
          Generate your first study module from the Dashboard tab.
          Every module you create will appear here for quick access.
        </p>
        <button
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: TabKey.Dashboard })}
          className="glass-button px-6 py-3 text-sm font-heading"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Mastery XP Box */}
      <div className="dark-glass rounded-xl p-5 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={20} className="text-warning" />
          <h2 className="font-heading text-base tracking-wider text-text-primary">Mastery Progression</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Cumulative Level */}
          <div className="bg-bg-elevated rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={16} className="text-warning" />
              <span className="font-heading text-xs text-text-primary tracking-wider">Cumulative Level</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">Lv.{cumulativeLevel.level}</p>
            <p className="text-text-muted text-xs mt-1">{cumulativeLevel.current} / {cumulativeLevel.totalForNextLevel} XP</p>
            <div className="w-full h-2 bg-bg-card rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-warning to-warning transition-all duration-700"
                style={{
                  width: `${cumProgressPercent}%`,
                  boxShadow: '0 0 8px var(--color-warning-glow)',
                }}
              />
            </div>
          </div>

          {/* Total XP */}
          <div className="bg-bg-elevated rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-primary" />
              <span className="font-heading text-xs text-text-primary tracking-wider">Total XP Earned</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{state.cumulativeXp}</p>
            <p className="text-text-muted text-xs mt-1">Across all topics</p>
          </div>

          {/* Next Level Goal */}
          <div className="bg-bg-elevated rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-accent" />
              <span className="font-heading text-xs text-text-primary tracking-wider">Next Level</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">Lv.{cumulativeLevel.level + 1}</p>
            <p className="text-text-muted text-xs mt-1">Need {cumulativeLevel.totalForNextLevel - cumulativeLevel.current} more XP</p>
          </div>
        </div>

        {/* Level indicator */}
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: Math.min(cumulativeLevel.level, 10) }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i < cumulativeLevel.level % 10 || i < cumulativeLevel.level % 10 ? 'bg-warning' : 'bg-bg-card'}`}
            />
          ))}
          {cumulativeLevel.level > 10 && (
            <span className="text-text-muted text-xs ml-1">+{cumulativeLevel.level - 10} more</span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search modules..."
          className="glass-input w-full pl-10 pr-4 py-3 text-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredModules.map((mod) => {
          const topicProgress = Math.min((mod.xp / TOPIC_MAX_XP) * 100, 100);
          return (
            <div key={mod.id} className="dark-glass dark-glass-hover rounded-xl p-4 group">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{mod.emoji}</div>
                <button
                  onClick={() => handleDelete(mod.id)}
                  className="opacity-0 group-hover:opacity-100 glass-button-ghost p-1.5 rounded transition-all"
                >
                  <Trash2 size={14} className="text-danger" />
                </button>
              </div>

              <h3 className="font-heading text-sm text-text-primary mb-1 tracking-wider truncate">{mod.title}</h3>

              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-heading mb-3
                ${mod.difficulty === 'beginner' ? 'bg-success/20 text-success' :
                  mod.difficulty === 'intermediate' ? 'bg-warning/20 text-warning' :
                  mod.difficulty === 'advanced' ? 'bg-danger/20 text-danger' :
                  'bg-primary/20 text-primary'}`}
              >
                {mod.difficulty.toUpperCase()}
              </span>

              {/* Topic XP Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-text-muted mb-1">
                  <span className="flex items-center gap-1"><Target size={10} /> Topic XP</span>
                  <span>{mod.xp} / {TOPIC_MAX_XP}</span>
                </div>
                <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-500"
                    style={{ width: `${topicProgress}%` }}
                  />
                </div>
              </div>

              {/* Progress ring */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-bg-elevated)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15"
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="3"
                      strokeDasharray={`${(mod.progress / 100) * 94.2} 94.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-text-primary font-bold">
                    {mod.progress}%
                  </span>
                </div>
                <div className="text-text-muted text-[10px] space-y-0.5">
                  <p className="flex items-center gap-1"><Clock size={10} /> {new Date(mod.createdAt).toLocaleDateString()}</p>
                  <p className="flex items-center gap-1"><BarChart3 size={10} /> {mod.questionCount} questions</p>
                </div>
              </div>

              {/* Mastery badge */}
              {mod.xp >= TOPIC_MAX_XP && (
                <div className="mb-2 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] text-success font-bold bg-success/10 px-2 py-0.5 rounded-full">
                    <Star size={10} /> Mastered
                  </span>
                </div>
              )}

              <button
                onClick={() => handleLoad(mod.id)}
                className="glass-button w-full py-2 text-xs flex items-center justify-center gap-2"
              >
                <FolderOpen size={14} /> Open
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}