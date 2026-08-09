import { useState, useMemo } from 'react';
import { Map } from 'lucide-react';
import type { ContextMap } from '../../types/dashboard';

interface Props {
  data: ContextMap;
}

const NODE_COLORS: Record<string, string> = {
  root: '#a855f7',
  concept: '#00f0ff',
  subtopic: '#c084fc',
  example: '#22c55e',
  related: '#f59e0b',
};

const NODE_RADIUS = 6;

export default function ContextMapCard({ data }: Props) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Compute a simple force-directed-ish layout
  const { nodes, edges } = useMemo(() => {
    const centerX = 200;
    const centerY = 120;
    const radiusBase = 80;
    const angleStep = (2 * Math.PI) / data.nodes.length;

    const layouted = data.nodes.map((node, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const dist = node.category === 'root' ? 0 : radiusBase + node.importance * 12;
      return {
        ...node,
        x: centerX + dist * Math.cos(angle),
        y: centerY + dist * Math.sin(angle),
      };
    });

    return { nodes: layouted, edges: data.edges };
  }, [data]);

  const highlightedNode = selectedNode || hoveredNode;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <Map size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg">Context Map</h3>
          <p className="text-xs text-muted-lighter">{data.topic}</p>
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative bg-grid-pattern rounded-xl overflow-hidden">
        <svg
          viewBox="0 0 400 250"
          className="w-full h-auto"
          style={{ minHeight: 200 }}
        >
          {/* Edges */}
          {edges.map((edge, i) => {
            const source = nodes.find((n) => n.id === edge.source);
            const target = nodes.find((n) => n.id === edge.target);
            if (!source || !target) return null;

            const isHighlighted =
              highlightedNode === source.id || highlightedNode === target.id;

            return (
              <g key={`edge-${i}`}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isHighlighted ? '#00f0ff' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={isHighlighted ? 2 : 1}
                  className="transition-all duration-300"
                />
                <text
                  x={(source.x + target.x) / 2}
                  y={(source.y + target.y) / 2 - 6}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="8"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;
            const isHighlighted = isSelected || isHovered;
            const isConnected =
              highlightedNode &&
              (edges.some(
                (e) =>
                  e.source === highlightedNode && e.target === node.id,
              ) ||
                edges.some(
                  (e) =>
                    e.target === highlightedNode && e.source === node.id,
                ) ||
                node.id === highlightedNode);

            return (
              <g
                key={node.id}
                onClick={() =>
                  setSelectedNode(isSelected ? null : node.id)
                }
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                {/* Glow ring */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS + 4}
                    fill="none"
                    stroke={NODE_COLORS[node.category] || '#a855f7'}
                    strokeWidth={2}
                    opacity={0.5}
                    className="animate-pulse-glow"
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={
                    isConnected
                      ? NODE_COLORS[node.category] || '#a855f7'
                      : isHighlighted
                        ? '#ffffff'
                        : 'rgba(255,255,255,0.3)'
                  }
                  stroke={
                    isHighlighted
                      ? NODE_COLORS[node.category] || '#a855f7'
                      : 'rgba(255,255,255,0.15)'
                  }
                  strokeWidth={isHighlighted ? 2 : 1}
                  className="transition-all duration-200"
                />

                {/* Label — truncate if too long */}
                <text
                  x={node.x}
                  y={node.y + NODE_RADIUS + 12}
                  textAnchor="middle"
                  fill={
                    isConnected
                      ? '#ffffff'
                      : isHighlighted
                        ? '#ffffff'
                        : 'rgba(255,255,255,0.6)'
                  }
                  fontSize="9"
                  fontWeight={isConnected ? 'bold' : 'normal'}
                  textLength={48}
                  lengthAdjust="spacing"
                  className="transition-all duration-200"
                >
                  {node.label.length > 14 ? node.label.slice(0, 14) + '…' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Info panel */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 glass-card p-3 animate-fade-in-up">
            {(() => {
              const node = nodes.find((n) => n.id === selectedNode);
              if (!node) return null;
              return (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          NODE_COLORS[node.category] || '#a855f7',
                      }}
                    />
                    <span className="text-xs font-semibold text-foreground">
                      {node.label}
                    </span>
                    <span className="text-[10px] text-muted-lighter capitalize">
                      ({node.category})
                    </span>
                  </div>
                  <p className="text-xs text-muted">{node.description}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-[10px] ${
                          i < node.importance
                            ? 'text-gold'
                            : 'text-muted-lighter'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-muted">
        {Object.entries(NODE_COLORS).map(([category, color]) => (
          <span key={category} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: color }}
            />
            {category}
          </span>
        ))}
      </div>
    </div>
  );
}