import { Share2 } from "lucide-react";
import type { ContextMapNode } from "../../types/dashboard";

interface Props {
  data: ContextMapNode[];
}

export default function ContextMapCard({ data }: Props) {
  if (!data?.length) {
    return (
      <div className="glass-card p-4">
        <p className="text-muted-lighter text-sm">No context map available.</p>
      </div>
    );
  }

  // Find bounds for responsive scaling
  const margin = 40;
  const minX = Math.min(...data.map((n) => n.x)) - margin;
  const maxX = Math.max(...data.map((n) => n.x)) + margin;
  const minY = Math.min(...data.map((n) => n.y)) - margin;
  const maxY = Math.max(...data.map((n) => n.y)) + margin;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  // Scale to fit in a viewBox
  const viewW = 500;
  const viewH = 350;
  const scaleX = viewW / rangeX;
  const scaleY = viewH / rangeY;

  const scale = (val: number, min: number, range: number, size: number) =>
    ((val - min) / range) * size;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Share2 className="w-4 h-4 text-primary-light" />
        </div>
        <h3 className="font-heading text-sm font-bold text-foreground tracking-wide">
          Context Map
        </h3>
      </div>
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full h-auto"
        style={{ minHeight: 200 }}
      >
        {/* Connector lines */}
        {data.map((node) =>
          node.connections.map((targetId) => {
            const target = data.find((n) => n.id === targetId);
            if (!target) return null;
            return (
              <line
                key={`${node.id}-${targetId}`}
                x1={scale(node.x, minX, rangeX, viewW)}
                y1={scale(node.y, minY, rangeY, viewH)}
                x2={scale(target.x, minX, rangeX, viewW)}
                y2={scale(target.y, minY, rangeY, viewH)}
                stroke="rgba(0, 240, 255, 0.25)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            );
          })
        )}

        {/* Nodes */}
        {data.map((node) => {
          const cx = scale(node.x, minX, rangeX, viewW);
          const cy = scale(node.y, minY, rangeY, viewH);
          return (
            <g key={node.id}>
              {/* Glow halo */}
              <circle
                cx={cx}
                cy={cy}
                r={22}
                fill="rgba(168, 85, 247, 0.15)"
                className="animate-pulse-glow"
              />
              {/* Main circle */}
              <circle
                cx={cx}
                cy={cy}
                r={18}
                fill="url(#nodeGrad)"
                stroke="rgba(168, 85, 247, 0.5)"
                strokeWidth={1.5}
              />
              {/* Label */}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={8}
                fontWeight={600}
                fontFamily="JetBrains Mono, monospace"
              >
                {node.label.length > 14
                  ? node.label.slice(0, 12) + ".."
                  : node.label}
              </text>
            </g>
          );
        })}

        <defs>
          <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}