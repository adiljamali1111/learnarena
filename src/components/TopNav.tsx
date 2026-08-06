/* ──────────────────────────────────────────
   LearnArena — Top Navigation Bar
   ────────────────────────────────────────── */

import { LayoutDashboard, Swords, Library, Compass } from 'lucide-react';
import { TabKey } from '../types';

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const NAV_ITEMS = [
  { id: TabKey.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { id: TabKey.MyUniverse, label: 'My Universe', icon: Compass },
  { id: TabKey.PracticeDuel, label: 'Practice Duel', icon: Swords },
  { id: TabKey.LearnersDen, label: "Learner's Den", icon: Library },
];

export default function TopNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="px-4 md:px-6 py-2 border-b border-border-glass/50">
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading tracking-wider transition-all duration-200 shrink-0
                ${isActive
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-transparent'
                }`}
            >
              <Icon size={16} />
              <span className="hidden xs:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
