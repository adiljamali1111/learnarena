import { BarChart3, Zap, Flame, Award, TrendingUp } from 'lucide-react';
import type { MasteryProgress } from '../../types/dashboard';

interface Props {
  data: MasteryProgress;
}

export default function MasteryProgressCard({ data }: Props) {
  const maxXp = data.totalXp > 0 ? data.totalXp : 100;
  const progressPercent = Math.min((data.totalXp / maxXp) * 100, 100);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center">
          <BarChart3 size={18} className="text-gold" />
        </div>
        <h3 className="font-heading font-semibold text-lg">Mastery Progress</h3>
      </div>

      {/* XP Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-gold" />
            <span className="text-sm font-semibold text-glow-gold">
              {data.totalXp} XP
            </span>
          </div>
          <span className="text-xs text-muted">Level {data.level}</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-3 text-center">
          <Flame size={16} className="text-warning mx-auto mb-1" />
          <p className="text-lg font-bold text-warning">{data.streak}</p>
          <p className="text-[10px] text-muted-lighter">Day Streak</p>
        </div>

        <div className="glass-card p-3 text-center">
          <Award size={16} className="text-accent mx-auto mb-1" />
          <p className="text-lg font-bold text-accent">{data.conceptsMastered}</p>
          <p className="text-[10px] text-muted-lighter">Concepts</p>
        </div>

        <div className="glass-card p-3 text-center">
          <TrendingUp size={16} className="text-success mx-auto mb-1" />
          <p className="text-lg font-bold text-success">{data.quizzesPassed}</p>
          <p className="text-[10px] text-muted-lighter">Quizzes</p>
        </div>

        <div className="glass-card p-3 text-center">
          <Zap size={16} className="text-gold mx-auto mb-1" />
          <p className="text-lg font-bold text-gold">{data.level}</p>
          <p className="text-[10px] text-muted-lighter">Level</p>
        </div>
      </div>
    </div>
  );
}