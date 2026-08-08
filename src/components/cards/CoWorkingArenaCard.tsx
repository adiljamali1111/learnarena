import { Trophy, Medal, Zap } from 'lucide-react';
import type { LeaderboardEntry } from '../../types/dashboard';

interface Props {
  data: LeaderboardEntry[];
}

const RANK_COLORS: Record<number, string> = {
  1: 'text-gold',
  2: 'text-silver',
  3: 'text-bronze',
};

const RANK_BG: Record<number, string> = {
  1: 'bg-gold/10 border-gold/30',
  2: 'bg-silver/10 border-silver/30',
  3: 'bg-bronze/10 border-bronze/30',
};

export default function CoWorkingArenaCard({ data }: Props) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-warning/20 flex items-center justify-center">
          <Trophy size={18} className="text-warning" />
        </div>
        <h3 className="font-heading font-semibold text-lg">Co-Working Arena</h3>
      </div>

      <div className="space-y-1.5">
        {data.map((entry) => {
          const medalColor = RANK_COLORS[entry.rank];
          const rowBg = RANK_BG[entry.rank];

          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                entry.isUser ? 'border-accent/40 bg-accent/5' : rowBg || 'border-glass-border'
              }`}
            >
              {/* Rank */}
              <div className="w-7 text-center shrink-0">
                {entry.rank <= 3 ? (
                  <Medal
                    size={18}
                    className={`${medalColor} mx-auto`}
                  />
                ) : (
                  <span className="text-xs text-muted-lighter font-mono">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <span className="text-lg shrink-0">{entry.avatar}</span>

              {/* Name */}
              <span
                className={`text-sm flex-1 truncate ${
                  entry.isUser ? 'text-accent font-semibold' : 'text-foreground/80'
                }`}
              >
                {entry.name}
                {entry.isUser && (
                  <span className="text-[10px] text-muted-lighter ml-1">(you)</span>
                )}
              </span>

              {/* XP */}
              <div className="flex items-center gap-1 text-xs text-gold shrink-0">
                <Zap size={12} />
                <span className="font-semibold">{entry.xp.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}