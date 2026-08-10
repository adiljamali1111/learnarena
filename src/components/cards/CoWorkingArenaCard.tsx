import { Trophy, Zap, Medal, Crown, Flame } from 'lucide-react';
import type { LeaderboardEntry } from '../../constants/demoData';

interface Props {
  data: LeaderboardEntry[];
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={16} className="text-gold" />;
  if (rank === 2) return <Medal size={16} className="text-muted" />;
  if (rank === 3) return <Medal size={16} className="text-warning" />;
  return (
    <span className="w-4 text-center text-xs font-mono text-muted-lighter">
      {rank}
    </span>
  );
}

export default function CoWorkingArenaCard({ data }: Props) {
  const topXp = data.length > 0 ? data[0].xp : 1;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center shadow-glow-purple-sm">
          <Trophy size={18} className="text-gold" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg">CoWorking Arena</h3>
          <p className="text-xs text-muted-lighter">Leaderboard</p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-gold/40 via-accent/20 to-transparent mb-4" />

      <div className="space-y-2">
        {data.map((entry) => {
          const pct = Math.max((entry.xp / topXp) * 100, 5);
          const isYou = entry.name === 'You';
          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isYou
                  ? 'bg-accent/10 border border-accent/30'
                  : 'bg-white/5 border border-transparent hover:border-white/10'
              }`}
            >
              {/* Rank */}
              <div className="w-6 shrink-0 flex justify-center">
                <RankIcon rank={entry.rank} />
              </div>

              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  isYou
                    ? 'bg-accent/30 text-accent'
                    : 'bg-primary/20 text-primary'
                }`}
              >
                {entry.initials}
              </div>

              {/* Name + streak */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-semibold truncate ${
                      isYou ? 'text-accent' : 'text-foreground'
                    }`}
                  >
                    {entry.name}
                  </span>
                  {entry.isOnline && (
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-lighter">
                  <Flame size={10} />
                  <span>{entry.streak} day streak</span>
                </div>
              </div>

              {/* XP bar */}
              <div className="w-24 shrink-0">
                <div className="flex items-center justify-between mb-0.5">
                  <Zap size={10} className="text-gold" />
                  <span className="text-[10px] font-semibold text-gold">
                    {entry.xp.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}