import type { ContextMapData } from '../../types/dashboard';

interface Props {
  data: ContextMapData;
}

export default function ContextMapCard({ data }: Props) {
  const padding = 40;
  const width = 600;
  const height = 420;
  const vw = width - padding * 2;
  const vh = height - padding * 2;

  // Compute bounds from actual data points
  const xs = data.nodes.map((n) => n.x);
  const ys = data.nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = Math.max(maxX - minX, 0.3);
  const rangeY = Math.max(maxY - minY, 0.3);

  const toPixel = (x: number, y: number) => ({
    px: padding + ((x - minX) / rangeX) * vw,
    py: padding + ((y - minY) / rangeY) * vh,
  });

  // Truncate label
  const trunc = (s: string) => (s.length > 20 ? s.slice(0, 18) + '…' : s);

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-5 flex items-center justify-center text-xs text-accent">⚡</span>
        <h3 className="font-heading text-xs text-muted-lighter uppercase tracking-widest">Context Map</h3>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Concept relationship map">
        {/* Edges */}
        {data.edges.map((e, i) => {
          const from = data.nodes.find((n) => n.id === e.from);
          const to = data.nodes.find((n) => n.id === e.to);
          if (!from || !to) return null;
          const { px: x1, py: y1 } = toPixel(from.x, from.y);
          const { px: x2, py: y2 } = toPixel(to.x, to.y);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(168, 85, 247, 0.3)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          );
        })}

        {/* Nodes */}
        {data.nodes.map((node, i) => {
          const { px, py } = toPixel(node.x, node.y);
          return (
            <g key={node.id}>
              <circle cx={px} cy={py} r="22" fill="url(#nodeGrad)" stroke="#a855f7" strokeWidth="1.5" />
              <text
                x={px}
                y={py}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
              >
                {trunc(node.label)}
              </text>
            </g>
          );
        })}

        <defs>
          <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1a0547" stopOpacity="0.8" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}