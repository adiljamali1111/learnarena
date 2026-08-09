import { useState, useRef, useCallback, useEffect } from 'react';
import { useDenTool } from './useDenTool';
import DenToolShell from './DenToolShell';
import type { MindMapData } from '../../types/dashboard';
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';

/* ===========================
   Layout Constants — Horizontal Tree
   =========================== */

const NODE_HEIGHT = 50;
const VERTICAL_GAP = 20;
const LEVEL_X: Record<0 | 1 | 2, number> = { 0: 80, 1: 320, 2: 600 };
const NODE_WIDTH = 180;

const COLORS = [
  '#a855f7', // purple
  '#00f0ff', // cyan
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#ec4899', // pink
];

const NODE_PADDING = 36; // extra padding around pill text inside SVG pill
const SVG_PADDING = 60;
const CANVAS_W = 900;
const CANVAS_H = 600;

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
  childrenShown: boolean;
}

function buildLayout(data: MindMapData): { nodes: LayoutNode[] } {
  const nodes: LayoutNode[] = [];
  const totalBranches = data.branches.length;

  // ── Level 0: Root node ──
  const root: LayoutNode = {
    id: 'center',
    label: data.centralTopic,
    x: LEVEL_X[0],
    y: CANVAS_H / 2,
    color: '#a855f7',
    level: 0,
    childIds: data.branches.map((_, i) => `branch-${i}`),
    childrenShown: true,
  };
  nodes.push(root);

  // ── Level 1: Branch nodes ──
  let totalL2 = 0;
  data.branches.forEach((b) => { totalL2 += b.children.length; });

  // Distribute L1 nodes evenly in vert space
  const l1TotalHeight = totalBranches * NODE_HEIGHT + (totalBranches - 1) * VERTICAL_GAP;
  const l1StartY = (CANVAS_H - l1TotalHeight) / 2;

  data.branches.forEach((branch, bIdx) => {
    const by = l1StartY + bIdx * (NODE_HEIGHT + VERTICAL_GAP) + NODE_HEIGHT / 2;

    const branchNode: LayoutNode = {
      id: `branch-${bIdx}`,
      label: branch.label,
      x: LEVEL_X[1],
      y: by,
      color: COLORS[bIdx % COLORS.length],
      level: 1,
      parentId: 'center',
      childIds: branch.children.map((_, cIdx) => `child-${bIdx}-${cIdx}`),
      childrenShown: true,
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
        childrenShown: false,
      });
    });
  });

  return { nodes };
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
   Detail Panel (Bottom Sheet / Side Drawer)
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
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full" style={{ background: node.color }} />
          <h4 className="text-sm font-semibold text-white">{node.label}</h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
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
          <span className="text-[10px] text-muted-lighter bg-white/5 px-2 py-0.5 rounded-full">
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

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Trigger entrance animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Reset view when data changes
  useEffect(() => {
    setScrollY(0);
    setCollapsed(new Set());
    setSelectedNodeId(null);
    setHoveredNodeId(null);
  }, [data]);

  const { nodes } = data ? buildLayout(data) : { nodes: [] as LayoutNode[] };
  const rootNode = nodes.find((n) => n.level === 0);

  // Resolve which nodes are visible based on collapsed state
  const visibleNodeIds = new Set<string>();
  if (rootNode) {
    visibleNodeIds.add(rootNode.id);
    rootNode.childIds.forEach((cid) => {
      visibleNodeIds.add(cid);
      if (!collapsed.has(cid)) {
        const child = nodes.find((n) => n.id === cid);
        if (child) {
          child.childIds.forEach((gcid) => visibleNodeIds.add(gcid));
        }
      }
    });
  }

  const visibleNodes = nodes.filter((n) => visibleNodeIds.has(n.id));

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
    // Also include siblings of the parent
    if (highlightedNode.parentId) {
      const parent = nodes.find((n) => n.id === highlightedNode.parentId);
      if (parent) {
        parent.childIds.forEach((cid) => connectedIds.add(cid));
      }
    }
  }

  // Edges to render
  const edges: { source: LayoutNode; target: LayoutNode; color: string }[] = [];
  visibleNodes.forEach((node) => {
    if (node.parentId) {
      const parent = nodes.find((n) => n.id === node.parentId);
      if (parent && visibleNodeIds.has(parent.id)) {
        edges.push({ source: parent, target: node, color: node.color });
      }
    }
  });

  /* ---- Interaction handlers ---- */

  const handleToggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedNodeId((prev) => (prev === id ? null : id));
  }, []);

  const handleHover = useCallback((id: string | null) => {
    setHoveredNodeId(id);
  }, []);

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

  const handlePanUp = useCallback(() => {
    setScrollY((prev) => Math.min(prev + 60, 200));
  }, []);

  const handlePanDown = useCallback(() => {
    setScrollY((prev) => Math.max(prev - 60, -200));
  }, []);

  /* ---- Render ---- */

  // Sort nodes so edges are drawn behind nodes
  const sortedNodes = [...visibleNodes].sort((a, b) => b.level - a.level);

  return (
    <DenToolShell toolKey="mindmap" isLoading={isLoading} error={error} onRegenerate={regenerate}>
      {data && (
        <div className="flex flex-col gap-3">
          {/* SVG Canvas */}
          <div className="glass-card p-0 overflow-hidden relative rounded-xl" style={{ minHeight: 520 }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
              className="w-full h-auto"
              style={{ minHeight: 500 }}
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

              <g transform={`translate(0, ${scrollY})`}>
                {/* Subtle grid */}
                <rect width={CANVAS_W} height={CANVAS_H} fill="transparent" />

                {/* Edges */}
                {edges.map((edge, i) => {
                  const isHighlighted =
                    highlightedId &&
                    (edge.source.id === highlightedId || edge.target.id === highlightedId);
                  const isConnected =
                    connectedIds.has(edge.source.id) && connectedIds.has(edge.target.id);
                  return (
                    <MindMapEdge
                      key={`edge-${i}`}
                      sx={edge.source.x}
                      sy={edge.source.y}
                      tx={edge.target.x}
                      ty={edge.target.y}
                      color={edge.color}
                      isHighlighted={!!isHighlighted}
                      isConnected={isConnected}
                      dashArray={edge.target.level === 2 ? '5,3' : undefined}
                    />
                  );
                })}

                {/* Nodes */}
                {sortedNodes.map((node) => {
                  const isCenter = node.level === 0;
                  const isBranch = node.level === 1;
                  const isCollapsed = collapsed.has(node.id);
                  const isExpanded = !isCollapsed;
                  const hasChildren = node.childIds.length > 0;
                  const isHighlighted = node.id === highlightedId;
                  const isConnected = connectedIds.has(node.id);
                  const isSelected = selectedNodeId === node.id;

                  const pillW = NODE_WIDTH;
                  const pillH = NODE_HEIGHT;
                  const rx = 14;
                  const alpha = isHighlighted ? 1 : isConnected ? 0.85 : isCollapsed || !hasChildren ? 0.6 : 0.75;
                  const isCollapsible = hasChildren && isBranch;

                  return (
                    <g
                      key={node.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasChildren && !isCenter) {
                          handleToggle(node.id);
                        } else {
                          handleSelect(node.id);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (hasChildren && !isCenter) {
                            handleToggle(node.id);
                          } else {
                            handleSelect(node.id);
                          }
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${isCenter ? 'Root' : isBranch ? 'Category' : 'Topic'}: ${node.label}${isCollapsed ? ', collapsed' : ''}`}
                      aria-expanded={hasChildren ? !isCollapsed : undefined}
                      onMouseEnter={() => handleHover(node.id)}
                      onMouseLeave={() => handleHover(null)}
                      className="cursor-pointer"
                      style={{ transitionDelay: animated ? '50ms' : '0ms' }}
                    >
                      {/* Center node = larger rounded rect */}
                      {isCenter ? (
                        <>
                          {/* Outer glow ring when selected */}
                          {isSelected && (
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
                            className="pointer-events-none select-none"
                          >
                            {node.label.length > 24 ? node.label.slice(0, 24) + '…' : node.label}
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
                            fill={isSelected ? '#1e1b4b' : '#1e1b4b'}
                            fillOpacity={isSelected ? 0.9 : 0.7}
                            stroke={
                              isSelected
                                ? node.color
                                : isHighlighted
                                  ? node.color
                                  : 'rgba(99, 102, 241, 0.25)' // indigo-500/30
                            }
                            strokeWidth={isSelected ? 2 : isHighlighted ? 1.5 : 1}
                            className="transition-all duration-200"
                            style={{
                              backdropFilter: 'blur(12px)',
                              WebkitBackdropFilter: 'blur(12px)',
                            }}
                          />

                          {/* Label */}
                          <text
                            x={isCollapsible ? node.x - 8 : node.x}
                            y={node.y + 4}
                            textAnchor={isCollapsible ? 'end' : 'middle'}
                            fill="white"
                            fontSize={isBranch ? 12 : 11}
                            fontWeight={isHighlighted || isSelected ? 'bold' : 'normal'}
                            className="pointer-events-none select-none transition-all duration-200"
                          >
                            {node.label.length > 20 ? node.label.slice(0, 20) + '…' : node.label}
                          </text>

                          {/* Expand/collapse arrow for collapsible nodes */}
                          {hasChildren && isBranch && (
                            <g transform={`translate(${node.x + pillW / 2 - 16}, ${node.y})`}>
                              <circle cx={0} cy={0} r={10} fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)" strokeWidth={0.5} />
                              {isCollapsed ? (
                                <ChevronRight size={12} className="text-indigo-300" style={{ transform: 'translate(-6px, -6px)' }} />
                              ) : (
                                <ChevronDown size={12} className="text-indigo-300" style={{ transform: 'translate(-6px, -6px)' }} />
                              )}
                            </g>
                          )}

                          {/* Child count badge when collapsed */}
                          {isCollapsed && node.childIds.length > 0 && (
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

            {/* Canvas Controls — Top Left Pill */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 bg-[#0f0a2e]/90 backdrop-blur-md border border-indigo-500/20 rounded-xl p-1.5 shadow-lg">
              <button onClick={handlePanUp} className="p-1.5 rounded-lg hover:bg-indigo-500/20 transition-colors cursor-pointer" aria-label="Pan up" title="Pan up">
                <ArrowUp size={14} className="text-indigo-300" />
              </button>
              <button onClick={handlePanDown} className="p-1.5 rounded-lg hover:bg-indigo-500/20 transition-colors cursor-pointer" aria-label="Pan down" title="Pan down">
                <ArrowDown size={14} className="text-indigo-300" />
              </button>
              <div className="w-full h-px bg-indigo-500/20 my-0.5" />
              <button onClick={() => setScrollY(0)} className="p-1.5 rounded-lg hover:bg-indigo-500/20 transition-colors cursor-pointer" aria-label="Reset view" title="Reset view">
                <RotateCcw size={14} className="text-indigo-300" />
              </button>
            </div>

            {/* Detail panel overlaid at bottom */}
            {selectedNode && selectedNode.id !== 'center' && (
              <div className="absolute bottom-3 left-3 right-3 md:left-auto md:right-3 md:w-72">
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
        </div>
      )}
    </DenToolShell>
  );
}