import { Trophy, Flame } from "lucide-react";
import type { MasteryProgress } from "../../types/dashboard";

interface Props {
  data: MasteryProgress;
}

export default function MasteryProgressCard({ data }: Props) {
  if (!data) {
    return (
      <div className="glass-card p-4">
        <p className="text-muted-lighter text-sm">No progress data available.</p>
      </div>
    );
  }

  const progressPct = Math.min(
    Math.round((data.currentXp / data.maxXp) * 100),
    100
  );

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-primary-light" />
        </div>
        <h3 className="font-heading text-sm font-bold text-foreground tracking-wide">
          Mastery Progress
        </h3>
      </div>

      {/* XP Bar */}
      <div className="mb-3">
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-muted mt-1.5">
          {data.currentXp} / {data.maxXp} XP
        </p>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange" />
        <span className="text-sm font-semibold text-orange">
          {data.streak} day streak
        </span>
      </div>
    </div>
  );
}