import { TabKey } from '../types';

interface TopNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: TabKey.Dashboard, label: 'Dashboard' },
  { key: TabKey.MyUniverse, label: 'My Universe' },
  { key: TabKey.PracticeDuel, label: 'Practice Duel' },
  { key: TabKey.LearnersDen, label: "Learner's Den" },
];

export default function TopNav({ activeTab, onTabChange }: TopNavProps) {
  return (
    <>
      {/* Desktop top nav */}
      <nav className="hide-mobile flex items-center justify-center gap-2 p-4 pb-3">
        <div className="dark-glass rounded-xl p-1.5 inline-flex" role="tablist" aria-label="Main navigation">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-heading tracking-wider transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-primary text-text-inverse shadow-lg shadow-primary/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="show-mobile fixed bottom-0 left-0 right-0 z-40 bg-bg-card/95 backdrop-blur-xl border-t border-border-glass" role="tablist" aria-label="Main navigation">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[10px] font-heading tracking-wider transition-all duration-200
                ${activeTab === tab.key
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text-secondary'
                }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mb-0.5 transition-all ${activeTab === tab.key ? 'bg-primary' : 'bg-transparent'}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}