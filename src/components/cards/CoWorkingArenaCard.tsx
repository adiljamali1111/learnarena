import { Users, Medal, Crown } from "lucide-react";
import type { CoWorkingArenaLeaderboard } from "../../types/dashboard";

interface Props {
  data: CoWorkingArenaLeaderboard;
}

export default function CoWorkingArenaCard({ data }: Props) {
  if (!data?.entries?.length) {
    return (
      <div className="glass-card p-4">
        <p className="text-muted-lighter text-sm">No leaderboard data available.</p>
      </div>
    );
  }

  const topEntries = data.entries.slice(0, 3);
  const restEntries = data.entries.slice(3);
  const totalOnline = data.entries.length;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Users className="w-4 h-4 text-primary-light" />
        </div>
        <h3 className="font-heading text-sm font-bold text-foreground tracking-wide">
          Co-Working Arena
        </h3>
      </div>

      {/* Avatar stack */}
      <div className="flex items-center gap-1.5 mb-4">
        <div className="flex -space-x-2">
          {topEntries.slice(0, 3).map((entry, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent/60 flex items-center justify-center text-[10px] font-bold text-white border-2 border-dark-surface"
              title={entry.name}
            >
              {entry.avatar}
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-lighter">
          +{Math.max(0, totalOnline - 3)} studying now
        </span>
      </div>

      {/* Leaderboard */}
      <div className="space-y-1">
        {data.entries.map((entry, i) => {
          const isTop3 = entry.rank <= 3;
          const rankColors = ["text-gold", "text-silver", "text-bronze"];

          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                entry.isCurrentUser
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-white/5"
              }`}
            >
              {/* Rank */}
              <div className="w-6 text-center shrink-0">
                {isTop3 ? (
                  <Medal
                    className={`w-4 h-4 mx-auto ${
                      rankColors[entry.rank - 1]
                    }`}
                  />
                ) : (
                  <span className="text-xs text-muted-lighter font-mono">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                {entry.avatar}
              </div>

              {/* Name */}
              <span className="text-xs font-medium text-foreground flex-1 truncate">
                {entry.name}
                {entry.isCurrentUser && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-[9px] font-semibold">
                    You
                  </span>
                )}
              </span>

              {/* XP */}
              <span className="text-xs text-muted font-mono">
                {entry.xp.toLocaleString()} XP
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}