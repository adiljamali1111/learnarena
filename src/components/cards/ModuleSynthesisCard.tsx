import { CheckCircle2, Lightbulb } from 'lucide-react';

interface Props {
  keyTakeaways: string[];
}

export default function ModuleSynthesisCard({ keyTakeaways }: Props) {
  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-gold" />
        <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Key Takeaways</h3>
      </div>
      <ul className="space-y-2.5">
        {keyTakeaways.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}