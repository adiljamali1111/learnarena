import { Lightbulb, ListChecks } from 'lucide-react';
import type { ModuleSynthesis } from '../../types/dashboard';

interface Props {
  data: ModuleSynthesis;
}

export default function ModuleSynthesisCard({ data }: Props) {
  return (
    <div className="glass-card p-6 col-span-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shadow-glow-purple-sm">
          <Lightbulb size={18} className="text-primary" />
        </div>
        <h3 className="font-heading font-semibold text-lg">Module Synthesis</h3>
      </div>

      {/* Neon divider */}
      <div className="h-px bg-gradient-to-r from-primary/40 via-accent/20 to-transparent mb-4" />

      <p className="text-sm text-muted leading-relaxed mb-4 break-words">{data.summary}</p>

      <div className="flex items-start gap-2.5 mb-3">
        <ListChecks size={16} className="text-accent mt-0.5 shrink-0" />
        <h4 className="text-sm font-semibold text-glow-cyan">Key Takeaways</h4>
      </div>

      <ul className="space-y-2">
        {data.keyTakeaways.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0 shadow-glow-cyan-sm" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}