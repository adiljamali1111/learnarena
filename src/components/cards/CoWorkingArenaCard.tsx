import { Award, Users } from 'lucide-react';
import type { CoWorkingCard } from '../../types/dashboard';

interface Props {
  data: CoWorkingCard;
}

const rankIcons = ['🥇', '🥈', '🥉'];

export default function CoWorkingArenaCard({ data }: Props) {
  const sorted = [...data.participants].sort((a, b) => b.xp - a.xp);

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-accent" />
        <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Co-Working Arena</h3>
      </div>

      <div className="space-y-2.5">
        {sorted.map((p, i) => (
          <div
            key={p.name}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              i === 0 ? 'bg-gold/10 border border-gold/20' : 'bg-dark-elevated/40'
            }`}
          >
            {/* Rank */}
            <span className="text-lg w-8 text-center">
              {i < 3 ? rankIcons[i] : `#${i + 1}`}
            </span>

            {/* Avatar */}
            <span className="text-xl">{p.avatar}</span>

            {/* Name */}
            <span className="flex-1 text-sm text-foreground font-medium">{p.name}</span>

            {/* XP */}
            <div className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs text-muted">{p.xp} XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}