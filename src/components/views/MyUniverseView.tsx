import { Library, Search, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import MasteryProgressCard from '../cards/MasteryProgressCard';

export default function MyUniverseView() {
  const { state, loadModule, deleteModule, setModal } = useDashboard();
  const [search, setSearch] = useState('');

  const activeModule = state.modules.find((m) => m.id === state.activeModuleId);

  const filteredModules = useMemo(() => {
    if (!search.trim()) return state.modules;
    const q = search.toLowerCase();
    return state.modules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.notes.toLowerCase().includes(q),
    );
  }, [state.modules, search]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Top row: header/search on left, Mastery Progress pinned right */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start">
        {/* Left column — header + search */}
        <div className="flex-1 min-w-0 w-full lg:w-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shadow-glow-cyan-sm">
                <Library size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-xl">My Universe</h2>
                <p className="text-xs text-muted">
                  {state.modules.length} module{state.modules.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => setModal('notesInput')}
              className="btn-base px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-sm font-semibold text-white hover:shadow-glow-purple transition-all"
            >
              + New Module
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-lighter"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-glass-border text-foreground placeholder-muted-lighter text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Right column — Mastery Progress pinned top-right */}
        {activeModule?.dashboard && (
          <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-4">
            <MasteryProgressCard data={activeModule.dashboard.masteryProgress} />
          </div>
        )}
      </div>

      {/* Empty state */}
      {filteredModules.length === 0 && (
        <div className="glass-card p-12 text-center">
          <BookOpen size={40} className="text-muted-lighter mx-auto mb-3" />
          <p className="text-muted mb-2">
            {state.modules.length === 0
              ? 'No modules yet. Create your first study module!'
              : 'No modules match your search.'}
          </p>
          {state.modules.length === 0 && (
            <button
              onClick={() => setModal('notesInput')}
              className="btn-base mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-sm text-white hover:shadow-glow-purple transition-all"
            >
              Create Module
            </button>
          )}
        </div>
      )}

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredModules.map((mod) => (
          <div
            key={mod.id}
            className={`glass-card p-4 group hover:border-accent/40 transition-all ${
              mod.id === state.activeModuleId
                ? 'border-accent/50 bg-accent/5 shadow-glow-cyan-sm'
                : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {mod.title}
                </h3>
                <p className="text-[10px] text-muted-lighter mt-0.5">
                  {new Date(mod.createdAt).toLocaleDateString()} •{' '}
                  {mod.notes.length.toLocaleString()} chars • {mod.xp} XP
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteModule(mod.id);
                }}
                className="p-1.5 rounded-lg text-muted-lighter hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                title="Delete module"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Notes preview */}
            <p className="text-xs text-muted line-clamp-2 mb-3 leading-relaxed">
              {mod.notes.slice(0, 200)}
            </p>

            {/* Load button */}
            <button
              onClick={() => loadModule(mod.id)}
              className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors cursor-pointer"
            >
              Load <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}