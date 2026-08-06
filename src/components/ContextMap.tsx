import React, { useMemo } from 'react';
import { Share2 } from 'lucide-react';
import { ContextNode } from '../types';

interface Props {
  nodes: ContextNode[];
}

const GROUP_COLORS = [
  '#a78bfa', // primary purple
  '#60a5fa', // accent blue
  '#34d399', // success green
  '#fbbf24', // warning yellow
  '#f472b6', // pink
  '#fb923c', // orange
];

export default function ContextMap({ nodes }: Props) {
  const [selected, setSelected] = React.useState<string | null>(null);

  // Calculate positions in a circular layout
  const positions = useMemo(() => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    return nodes.map((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        ...node,
      };
    });
  }, [nodes]);

  const connections = useMemo(() => {
    const conns: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (const node of positions) {
      for (const targetId of node.connections) {
        const target = positions.find((p) => p.id === targetId);
        if (target) {
          conns.push({ x1: node.x, y1: node.y, x2: target.x, y2: target.y });
        }
      }
    }
    return conns;
  }, [positions]);

  const selectedNode = selected ? positions.find((p) => p.id === selected) : null;

  if (nodes.length === 0) return null;

  return (
    <div className="dark-glass rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <Share2 size={20} className="text-warning" />
        <h2 className="font-heading text-base tracking-wider text-text-primary">Context Map</h2>
      </div>

      <div className="relative flex flex-col items-center">
        {/* SVG Graph */}
        <svg viewBox="0 0 300 300" className="w-full max-w-[300px] h-auto">
          {/* Connections */}
          {connections.map((c, i) => (
            <line
              key={i}
              x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
              stroke={selectedNode ? 'rgba(167,139,250,0.15)' : 'rgba(167,139,250,0.2)'}
              strokeWidth="1.5"
              className="transition-all"
            />
          ))}

          {/* Nodes */}
          {positions.map((node) => {
            const isSelected = selected === node.id;
            const color = GROUP_COLORS[node.group % GROUP_COLORS.length];
            return (
              <g
                key={node.id}
                onClick={() => setSelected(isSelected ? null : node.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={node.x} cy={node.y} r={isSelected ? 22 : 16}
                  fill={isSelected ? color : `${color}40`}
                  stroke={color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="transition-all duration-200"
                />
                <text
                  x={node.x} y={node.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="10"
                  className="pointer-events-none select-none"
                >
                  {node.label.slice(0, 2)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selection info */}
        {selectedNode && (
          <div className="mt-3 p-3 rounded-lg bg-bg-elevated w-full text-center animate-fade-in">
            <p className="text-text-primary text-sm font-bold mb-1">{selectedNode.label}</p>
            <p className="text-text-muted text-xs">{selectedNode.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}