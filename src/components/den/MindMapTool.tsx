import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useDenTool } from './useDenTool';
import DenToolShell from './DenToolShell';
import type { MindMapData } from '../../types/dashboard';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

/* ===========================
   Layout Constants — Horizontal Tree
   =========================== */

const NODE_HEIGHT = 50;
const VERTICAL_GAP = 20;
const LEVEL_X: Record<0 | 1 | 2, number> = { 0: 80, 1: 320, 2: 600 };
const NODE_WIDTH = 180;
const SVG_PADDING = 60;

const COLORS = [
  '#a855f7', // purple
  '#00f0ff', // cyan
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#ec4899', // pink
];

/* ===========================
   Layout Engine
   =========================== */

interface LayoutNode {
  id: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  color: string;
  level: 0 | 1 | 2;
  parentId?: string;
  childIds: string[];
}

function buildLayout(data: MindMapData): { nodes: LayoutNode[]; canvasH: number } {
  const nodes: LayoutNode[] = [];
  const totalBranches = data.branches.length;

  // ── Level 0: Root node ──
  const root: LayoutNode = {
    id: 'center',
    label: data.centralTopic,
    x: LEVEL_X[0],
    y: 0, // will offset later
    color: '#a855f7',
    level: 0,
    childIds: data.branches.map((_, i) => `branch-${i}`),
  };
  nodes.push(root);

  // ── Level 1: Branch nodes ──
  // First pass: compute Y positions of each branch
  const branchYPositions: number[] = [];
  let currentY = SVG_PADDING + NODE_HEIGHT / 2;

  // Root node Y at center of all branches
  data.branches.forEach((b, bIdx) => {
    const children = b.children;
    const l2Count = children.length;
    // Height of this branch cluster (branch node + its children)
    const clusterH = Math.max(
      NODE_HEIGHT,
      l2Count * NODE_HEIGHT + (l2Count - 1) * VERTICAL_GAP
    );
    const clusterCenterY = currentY + (l2Count > 0 ? clusterH / 2 : NODE_HEIGHT / 2);
    branchYPositions.push(clusterCenterY);
    currentY += clusterH + VERTICAL_GAP;
  });

  // Total height
  const canvasH = Math.max(currentY + SVG_PADDING, 400);

  // Center the root node vertically
  root.y = canvasH / 2;

  // Now place branch + children
  data.branches.forEach((branch, bIdx) => {
    const by = branchYPositions[bIdx];
    const branchNode: LayoutNode = {
      id: `branch-${bIdx}`,
      label: branch.label,
      x: LEVEL_X[1],
      y: by,
      color: COLORS[bIdx % COLORS.length],
      level: 1,
      parentId: 'center',
      childIds: branch.children.map((_, cIdx) => `child-${bIdx}-${cIdx}`),
    };
    nodes.push(branchNode);

    // ── Level 2: Child nodes ──
    const children = branch.children;
    const l2Count = children.length;
    const l2TotalHeight = l2Count * NODE_HEIGHT + (l2Count - 1) * VERTICAL_GAP;
    const l2StartY = by - l2TotalHeight / 2 + NODE_HEIGHT / 2;

    children.forEach((child, cIdx) => {
      nodes.push({
        id: `child-${bIdx}-${cIdx}`,
        label: child,
        x: LEVEL_X[2],
        y: l2StartY + cIdx * (NODE_HEIGHT + VERTICAL_GAP),
        color: COLORS[bIdx % COLORS.length],
        level: 2,
        parentId: `branch-${bIdx}`,
        childIds: [],
      });
    });
  });

  return { nodes, canvasH };
}

/* ===========================
   Edge Component — Smooth Cubic Bezier
   =========================== */

function MindMapEdge({
  sx, sy, tx, ty, color, isHighlighted, isConnected, dashArray,
}: {
  sx: number; sy: number; tx: number; ty: number;
  color: string;
  isHighlighted: boolean;
  isConnected: boolean;
  dashArray?: string;
}) {
  const cx1 = sx + (tx - sx) * 0.4;
  const cx2 = tx - (tx - sx) * 0.4;
  const path = `M ${sx} ${sy} C ${cx1} ${sy}, ${cx2} ${ty}, ${tx} ${ty}`;
  const alpha = isHighlighted ? 0.8 : isConnected ? 0.4 : 0.12;
  const strokeW = isHighlighted ? 2.5 : 1.5;

  return (
    <path
      d={path}
      fill="none"
      stroke={isHighlighted ? color : 'rgba(255,255,255,0.2)'}
      strokeWidth={strokeW}
      opacity={alpha}
      strokeDasharray={dashArray || 'none'}
      className="transition-all duration-300"
    />
  );
}

/* ===========================
   Detail Panel (Bottom Sheet)
   =========================== */

function DetailPanel({
  node,
  parentLabel,
  onClose,
}: {
  node: LayoutNode | null;
  parentLabel?: string;
  onClose: () => void;
}) {
  if (!node) return null;

  const levelName = node.level === 1 ? 'Category' : node.level === 2 ? 'Subtopic' : 'Root';

  return (
    <div className="glass-card p-5 animate-fade-in-up border-indigo-500/20" role="dialog" aria-label={`Details for ${node.label}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: node.color }} />
          <h4 className="text-sm font-semibold text-white truncate">{node.label}</h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          aria-label="Close details"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-[10px] uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
          {levelName}
        </span>
        {parentLabel && (
          <span className="text-[10px] text-muted-lighter bg-white/5 px-2 py-0.5 rounded-full truncate max-w-[160px]">
            Under: {parentLabel}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-300 leading-relaxed">
        {node.description || `Explore this ${levelName.toLowerCase()} to deepen your understanding of "${node.label}".`}
      </p>
    </div>
  );
}

/* ===========================
   Main Component
   =========================== */

export default function MindMapTool() {
  const { data, isLoading, error, regenerate } = useDenTool<MindMapData>('mindmap');

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger entrance animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Reset view when data changes
  useEffect(() => {
    setSelectedNodeId(null);
    setHoveredNodeId(null);
    setScale(1);
  }, [data]);

  const layout = useMemo(() => (data ? buildLayout(data) : null), [data]);
  const nodes = layout?.nodes ?? [];
  const canvasH = layout?.canvasH ?? 600;
  const rootNode = nodes.find((n) => n.level === 0);

  // Highlight logic
  const highlightedId = selectedNodeId || hoveredNodeId;
  const highlightedNode = nodes.find((n) => n.id === highlightedId);
  const connectedIds = new Set<string>();
  if (highlightedNode) {
    connectedIds.add(highlightedNode.id);
    highlightedNode.childIds.forEach((cid) => connectedIds.add(cid));
    if (highlightedNode.parentId) {
      connectedIds.add(highlightedNode.parentId);
    }
    if (highlightedNode.parentId) {
      const parent = nodes.find((n) => n.id === highlightedNode.parentId);
      if (parent) {
        parent.childIds.forEach((cid) => connectedIds.add(cid));
      }
    }
  }

  // Edges to render
  const edges: { source: LayoutNode; target: LayoutNode; color: string }[] = [];
  nodes.forEach((node) => {
    if (node.parentId) {
      const parent = nodes.find((n) => n.id === node.parentId);
      if (parent) {
        edges.push({ source: parent, target: node, color: node.color });
      }
    }
  });

  /* ---- Interaction handlers ---- */

  const handleSelect = useCallback((id: string) => {
    setSelectedNodeId((prev) => (prev === id ? null : id));
  }, []);

  const handleHover = useCallback((id: string | null) => {
    setHoveredNodeId(id);
  }, []);

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.15, 2)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s - 0.15, 0.5)), []);
  const resetView = useCallback(() => {
    setScale(1);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  /* ---- Render ---- */

  // Sort nodes so edges are drawn behind nodes
  const sortedNodes = [...nodes].sort((a, b) => b.level - a.level);

  return (
    <DenToolShell toolKey="mindmap" isLoading={isLoading} error={error} onRegenerate={regenerate}>
      {data && (
        <div className="flex flex-col gap-3">
          {/* SVG Canvas with scrollbar */}
          <div
            ref={containerRef}
            className="glass-card p-0 overflow-y-auto overflow-x-hidden rounded-xl"
            style={{ maxHeight: 520 }}
          >
            <svg
              viewBox={`0 0 800 ${canvasH}`}
              className="w-full"
              style={{ minWidth: 700, transform: `scale(${scale})`, transformOrigin: 'top center' }}
            >
              <defs>
                <filter id="glow-mindmap">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g>
                {/* Subtle grid */}
                <rect width={800} height={canvasH} fill="transparent" />

                {/* Edges */}
                {edges.map((edge, i) => {
                  const isHL =
                    highlightedId &&
                    (edge.source.id === highlightedId || edge.target.id === highlightedId);
                  const isConn =
                    connectedIds.has(edge.source.id) && connectedIds.has(edge.target.id);
                  return (
                    <MindMapEdge
                      key={`edge-${i}`}
                      sx={edge.source.x}
                      sy={edge.source.y}
                      tx={edge.target.x}
                      ty={edge.target.y}
                      color={edge.color}
                      isHighlighted={!!isHL}
                      isConnected={isConn}
                      dashArray={edge.target.level === 2 ? '5,3' : undefined}
                    />
                  );
                })}

                {/* Nodes */}
                {sortedNodes.map((node) => {
                  const isCenter = node.level === 0;
                  const isBranch = node.level === 1;
                  const hasChildren = node.childIds.length > 0;
                  const isHL = node.id === highlightedId;
                  const isConn = connectedIds.has(node.id);
                  const isSel = selectedNodeId === node.id;

                  const pillW = isCenter ? 200 : NODE_WIDTH;
                  const pillH = NODE_HEIGHT;
                  const rx = 14;
                  const alpha = isHL ? 1 : isConn ? 0.85 : 0.6;

                  // Available width for text inside the pill
                  const textMaxW = pillW - 24; // 12px padding on each side

                  return (
                    <g
                      key={node.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(node.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelect(node.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${isCenter ? 'Root' : isBranch ? 'Category' : 'Topic'}: ${node.label}`}
                      onMouseEnter={() => handleHover(node.id)}
                      onMouseLeave={() => handleHover(null)}
                      className="cursor-pointer"
                    >
                      {/* Center node — larger rounded rect */}
                      {isCenter ? (
                        <>
                          {isSel && (
                            <rect
                              x={node.x - pillW / 2 - 5}
                              y={node.y - pillH / 2 - 5}
                              width={pillW + 10}
                              height={pillH + 10}
                              rx={rx + 2}
                              fill="none"
                              stroke={node.color}
                              strokeWidth={2}
                              opacity={0.5}
                              filter="url(#glow-mindmap)"
                            />
                          )}
                          <rect
                            x={node.x - pillW / 2}
                            y={node.y - pillH / 2}
                            width={pillW}
                            height={pillH}
                            rx={rx}
                            fill={node.color}
                            opacity={0.25}
                            stroke={node.color}
                            strokeWidth={1.5}
                          />
                          <text
                            x={node.x}
                            y={node.y + 5}
                            textAnchor="middle"
                            fill="white"
                            fontSize="14"
                            fontWeight="bold"
                            textLength={textMaxW}
                            lengthAdjust="spacing"
                            className="pointer-events-none select-none"
                          >
                            {node.label.length > 28 ? node.label.slice(0, 28) + '…' : node.label}
                          </text>
                        </>
                      ) : (
                        <>
                          {/* NotebookLM-style pill */}
                          <rect
                            x={node.x - pillW / 2}
                            y={node.y - pillH / 2}
                            width={pillW}
                            height={pillH}
                            rx={rx}
                            fill={isSel ? '#1e1b4b' : '#1e1b4b'}
                            fillOpacity={isSel ? 0.9 : 0.7}
                            stroke={
                              isSel
                                ? node.color
                                : isHL
                                  ? node.color
                                  : 'rgba(99, 102, 241, 0.25)'
                            }
                            strokeWidth={isSel ? 2 : isHL ? 1.5 : 1}
                            className="transition-all duration-200"
                            style={{
                              backdropFilter: 'blur(12px)',
                              WebkitBackdropFilter: 'blur(12px)',
                            }}
                          />

                          {/* Label — center-aligned inside pill */}
                          <text
                            x={node.x}
                            y={node.y + 4}
                            textAnchor="middle"
                            fill="white"
                            fontSize={isBranch ? 12 : 11}
                            fontWeight={isHL || isSel ? 'bold' : 'normal'}
                            textLength={textMaxW}
                            lengthAdjust="spacing"
                            className="pointer-events-none select-none transition-all duration-200"
                          >
                            {node.label.length > 22 ? node.label.slice(0, 22) + '…' : node.label}
                          </text>

                          {/* Child count badge */}
                          {hasChildren && (
                            <g transform={`translate(${node.x + pillW / 2 - 16}, ${node.y - pillH / 2 - 10})`}>
                              <rect x={-14} y={-8} width={28} height={16} rx={8} fill={node.color} opacity={0.9} />
                              <text x={0} y={4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" className="pointer-events-none select-none">
                                +{node.childIds.length}
                              </text>
                            </g>
                          )}
                        </>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Controls bar — below the canvas */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0f0a2e]/90 backdrop-blur-md border border-indigo-500/20 rounded-xl p-1 shadow-lg">
              <button onClick={zoomOut} className="p-1.5 rounded-lg hover:bg-indigo-500/20 transition-colors cursor-pointer" aria-label="Zoom out" title="Zoom out">
                <ZoomOut size={14} className="text-indigo-300" />
              </button>
              <span className="text-[10px] text-indigo-400 w-8 text-center font-mono">{Math.round(scale * 100)}%</span>
              <button onClick={zoomIn} className="p-1.5 rounded-lg hover:bg-indigo-500/20 transition-colors cursor-pointer" aria-label="Zoom in" title="Zoom in">
                <ZoomIn size={14} className="text-indigo-300" />
              </button>
              <div className="w-px h-4 bg-indigo-500/20 mx-1" />
              <button onClick={resetView} className="p-1.5 rounded-lg hover:bg-indigo-500/20 transition-colors cursor-pointer" aria-label="Reset view" title="Reset view">
                <RotateCcw size={14} className="text-indigo-300" />
              </button>
            </div>
            <span className="text-[10px] text-muted-lighter ml-auto">
              {nodes.length} nodes • Scroll vertically to explore
            </span>
          </div>

          {/* Detail panel */}
          {selectedNode && selectedNode.id !== 'center' && (
            <div className="md:w-72">
              <DetailPanel
                node={selectedNode}
                parentLabel={
                  selectedNode.parentId
                    ? nodes.find((n) => n.id === selectedNode.parentId)?.label
                    : undefined
                }
                onClose={() => setSelectedNodeId(null)}
              />
            </div>
          )}
        </div>
      )}
    </DenToolShell>
  );
}