import { Trophy, Zap, TrendingUp } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { getCumulativeLevel } from '../constants';

export default function MasteryProgress() {
  const { state } = useDashboard();
  const cumulativeLevel = getCumulativeLevel(state.cumulativeXp);
  const progressPercent = cumulativeLevel.totalForNextLevel > 0
    ? Math.min((cumulativeLevel.current / cumulativeLevel.totalForNextLevel) * 100, 100)
    : 0;

  const levels = [
    { min: 1, title: 'Novice Scholar', icon: '🌱' },
    { min: 3, title: 'Curious Mind', icon: '📖' },
    { min: 5, title: 'Dedicated Learner', icon: '🔥' },
    { min: 8, title: 'Study Sage', icon: '🧠' },
    { min: 12, title: 'Knowledge Knight', icon: '⚔️' },
    { min: 16, title: 'Master Arcanist', icon: '🔮' },
    { min: 20, title: 'Grand Luminary', icon: '⭐' },
  ];

  const currentTitle = [...levels].reverse().find((l) => cumulativeLevel.level >= l.min) || levels[0];

  return (
    <div className="dark-glass rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <Trophy size={20} className="text-warning" />
        <h2 className="font-heading text-base tracking-wider text-text-primary">Mastery Progress</h2>
      </div>

      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{currentTitle.icon}</div>
        <p className="font-heading text-sm text-text-primary tracking-wider">{currentTitle.title}</p>
        <p className="text-text-muted text-xs mt-1">Level {cumulativeLevel.level}</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>Lv.{cumulativeLevel.level}</span>
          <span>{cumulativeLevel.current} / {cumulativeLevel.totalForNextLevel} XP</span>
        </div>
        <div className="w-full h-3 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-warning to-warning transition-all duration-700"
            style={{
              width: `${progressPercent}%`,
              boxShadow: '0 0 8px var(--color-warning-glow)',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-bg-elevated rounded-lg p-2">
          <Zap size={16} className="mx-auto mb-1 text-warning" />
          <p className="text-text-primary text-sm font-bold">{state.cumulativeXp}</p>
          <p className="text-text-muted text-[10px]">Total XP</p>
        </div>
        <div className="bg-bg-elevated rounded-lg p-2">
          <Trophy size={16} className="mx-auto mb-1 text-primary" />
          <p className="text-text-primary text-sm font-bold">{cumulativeLevel.level}</p>
          <p className="text-text-muted text-[10px]">Level</p>
        </div>
        <div className="bg-bg-elevated rounded-lg p-2">
          <TrendingUp size={16} className="mx-auto mb-1 text-success" />
          <p className="text-text-primary text-sm font-bold">{state.modules.length}</p>
          <p className="text-text-muted text-[10px]">Modules</p>
        </div>
      </div>
    </div>
  );
}
