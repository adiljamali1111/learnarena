import { Trophy, Zap, Flame } from 'lucide-react';
import type { MasteryCard } from '../../types/dashboard';

interface Props {
  data: MasteryCard;
  totalXp: number;
  level: number;
}

export default function MasteryProgressCard({ data, totalXp: _totalXp, level: _level }: Props) {
  const xp = _totalXp || data.totalXp;
  const lvl = _level || data.level;
  const xpForNext = lvl * 500;
  const progress = Math.min(xp / xpForNext, 1);

  const streak = data.streak || 0;

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-gold" />
        <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Mastery Progress</h3>
      </div>

      {/* Level */}
      <div className="text-center mb-4">
        <p className="text-4xl font-heading font-bold text-primary-light">{lvl}</p>
        <p className="text-xs text-muted-lighter mt-0.5">Current Level</p>
      </div>

      {/* XP bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted">XP</span>
          <span className="text-muted">{xp} / {xpForNext}</span>
        </div>
        <div className="h-2 bg-dark-hover rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
        <Flame className={`w-4 h-4 ${streak > 0 ? 'text-gold' : 'text-muted-lighter'}`} />
        <span className={`text-sm font-medium ${streak > 0 ? 'text-gold' : 'text-muted'}`}>
          {streak} day streak
        </span>
        <Zap className="w-3.5 h-3.5 text-gold ml-2" />
        <span className="text-xs text-muted">+{xp} total</span>
      </div>
    </div>
  );
}