import { Lightbulb } from "lucide-react";
import type { ModuleSynthesis } from "../../types/dashboard";

interface Props {
  data: ModuleSynthesis;
}

export default function ModuleSynthesisCard({ data }: Props) {
  if (!data?.keyTakeaways?.length) {
    return (
      <div className="glass-card p-4">
        <p className="text-muted-lighter text-sm">No takeaways available.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-primary-light" />
        </div>
        <h3 className="font-heading text-sm font-bold text-foreground tracking-wide">
          Module Synthesis
        </h3>
      </div>
      <ul className="space-y-2.5">
        {data.keyTakeaways.map((takeaway, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90 leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            {takeaway}
          </li>
        ))}
      </ul>
    </div>
  );
}