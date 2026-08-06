import { useState } from 'react';
import { Volume2, Play, Pause } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export default function AudioOverview() {
  const { state } = useDashboard();
  const tabs = state.dashboard?.synthesis.audioTabs || [];
  const [activeTab, setActiveTab] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTab = tabs[activeTab];

  const handlePlayPause = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(currentTab.content);
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="dark-glass rounded-xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Volume2 size={24} className="text-primary" />
        <h2 className="font-heading text-xl text-text-primary">Audio Overview</h2>
      </div>

      {/* Tab selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab.title}
            onClick={() => {
              window.speechSynthesis.cancel();
              setIsPlaying(false);
              setActiveTab(i);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading tracking-wider transition-all
              ${activeTab === i ? 'bg-primary text-text-inverse' : 'text-text-secondary bg-bg-card-hover'}`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="text-text-secondary text-sm leading-relaxed max-h-60 overflow-y-auto mb-6">
        {currentTab?.content}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={handlePlayPause} className="glass-button w-16 h-16 rounded-full flex items-center justify-center">
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
      </div>
      {isPlaying && (
        <div className="flex justify-center gap-1 mt-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}