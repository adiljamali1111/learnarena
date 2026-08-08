import { useState } from 'react';
import { Search, Trash2, BookOpen, Clock, Database, Upload } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import NotesInputModal from '../NotesInputModal';

export default function MyUniverseView() {
  const { savedModules, loadModule, deleteModule, addXp } = useDashboard();
  const [search, setSearch] = useState('');
  const [notesModalOpen, setNotesModalOpen] = useState(false);

  const filtered = savedModules.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-foreground">My Universe</h2>
          <button
            onClick={() => setNotesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-dark-base text-xs font-heading font-bold hover:bg-primary-light transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> NEW MATERIAL
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-lighter" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved modules..."
            className="w-full bg-dark-elevated border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-lighter focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Module grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Database className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">No saved modules yet</p>
            <p className="text-xs text-muted-lighter mt-1">Generate a dashboard first, then save it here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((mod) => (
              <div
                key={mod.id}
                className="glass-card p-4 hover:border-primary/40 transition-all duration-200 group"
              >
                <button
                  onClick={() => {
                    loadModule(mod.id);
                    addXp(10);
                  }}
                  className="w-full text-left cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-dark-elevated flex items-center justify-center mt-0.5">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {mod.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3 text-muted-lighter" />
                        <span className="text-2xs text-muted-lighter">
                          {new Date(mod.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => deleteModule(mod.id)}
                  className="mt-3 flex items-center gap-1 text-xs text-muted hover:text-destructive transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <NotesInputModal open={notesModalOpen} onClose={() => setNotesModalOpen(false)} />
    </div>
  );
}