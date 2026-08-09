import { useState, useRef, useCallback, useEffect } from 'react';
import { useDenTool } from './useDenTool';
import DenToolShell from './DenToolShell';
import type { MindMapData } from '../../types/dashboard';
import { ZoomIn, ZoomOut, RotateCcw, Info, ChevronDown, ChevronRight } from 'lucide-react';

/* ===========================
   Constants
   =========================== */

const COLORS = [
  '#a855f7', // purple
  '#00f0ff', // cyan
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#ec4899', // pink
];

const CENTER_X = 500;
const CENTER_Y = 350;
const BRANCH_RADIUS = 130;
const CHILD_RADIUS = 100;
const NODE_WIDTH = 160;
const NODE_HEIGHT = 42;
const CENTER_NODE_SIZE = 80;

/* ===========================
   Layout helpers
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
  importance?: number;
}

function buildLayout(data: MindMapData): {
  nodes: LayoutNode[];
  centerNode: LayoutNode;
} {
  const nodes: LayoutNode[] = [];

  // Center node
  const centerNode: LayoutNode = {
    id: 'center',
    label: data.centralTopic,
    x: CENTER_X,
    y: CENTER_Y,
    color: '#a855f7',
    level: 0,
    childIds: data.branches.map((_, i) => `branch-${i}`),
  };
  nodes.push(centerNode);

  // Branch nodes (L1)
  data.branches.forEach((branch, bIdx) => {
    const angle = (2 * Math.PI / data.branches.length) * bIdx - Math.PI / 2;
    const bx = CENTER_X + BRANCH_RADIUS * Math.cos(angle);
    const by = CENTER_Y + BRANCH_RADIUS * Math.sin(angle);

    const branchNode: LayoutNode = {
      id: `branch-${bIdx}`,
      label: branch.label,
      x: bx,
      y: by,
      color: COLORS[bIdx % COLORS.length],
      level: 1,
      parentId: 'center',
      childIds: branch.children.map((_, cIdx) => `child-${bIdx}-${cIdx}`),
    };
    nodes.push(branchNode);

    // Child nodes (L2)
    branch.children.forEach((child, cIdx) => {
      const childAngle = angle + (cIdx - (branch.children.length - 1) / 2) * 0.35;
      const cx = bx + CHILD_RADIUS * Math.cos(childAngle);
      const cy = by + CHILD_RADIUS * Math.sin(childAngle);

      nodes.push({
        id: `child-${bIdx}-${cIdx}`,
        label: child,
        x: cx,
        y: cy,
        color: COLORS[bIdx % COLORS.length],
        level: 2,
        parentId: `branch-${bIdx}`,
        childIds: [],
      });
    });
  });

  return { nodes, centerNode };
}

/* ===========================
   Node Component
   =========================== */

interface MindMapNodeProps {
  node: LayoutNode;
  isCenter: boolean;
  isCollapsed: boolean;
  isExpanded: boolean;
  collapsedChildCount: number;
  isHighlighted: boolean;
  isConnected: boolean;
  isSelected: boolean;
  animated: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

function MindMapNode({
  node,
  isCenter,
  isCollapsed,
  isExpanded,
  collapsedChildCount,
  isHighlighted,
  isConnected,
  isSelected,
  animated,
  onToggle,
  onSelect,
  onHover,
}: MindMapNodeProps) {
  const hasChildren = node.childIds.length > 0;
  const isCollapsible = hasChildren && !isCenter;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCollapsible) {
      onToggle(node.id);
    } else {
      onSelect(node.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isCollapsible) {
        onToggle(node.id);
      } else {
        onSelect(node.id);
      }
    }
  };

  if (isCenter) {
    return (
      <g
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Central concept: ${node.label}`}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        className="cursor-pointer"
      >
        {/* Glow ring */}
        {isSelected && (
          <circle
            cx={node.x}
            cy={node.y}
            r={CENTER_NODE_SIZE / 2 + 6}
            fill="none"
            stroke={node.color}
            strokeWidth={2}
            opacity={0.5}
            className="animate-pulse-glow"
          />
        )}
        {/* Center circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r={CENTER_NODE_SIZE / 2}
          fill={node.color}
          opacity={isConnected ? 0.9 : 0.6}
          className="transition-all duration-300"
        />
        <circle
          cx={node.x}
          cy={node.y}
          r={CENTER_NODE_SIZE / 2 - 6}
          fill="none"
          stroke={node.color}
          strokeWidth={1.5}
          opacity={0.4}
        />
        <text
          x={node.x}
          y={node.y + 4}
          textAnchor="middle"
          fill="white"
          fontSize="13"
          fontWeight="bold"
          className="pointer-events-none select-none"
        >
          {node.label.length > 20 ? node.label.slice(0, 20) + '…' : node.label}
        </text>
      </g>
    );
  }

  // Glass pill container dimensions
  const pillW = NODE_WIDTH;
  const pillH = NODE_HEIGHT;
  const rx = 12;

  const alpha = isHighlighted ? 1 : isConnected ? 0.85 : isCollapsed ? 0.4 : 0.5;

  return (
    <g
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${node.level === 1 ? 'Category' : 'Topic'}: ${node.label}${isCollapsed ? ', collapsed' : ''}`}
      aria-expanded={isCollapsible ? !isCollapsed : undefined}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer"
      style={{ transitionDelay: animated ? `${Math.random() * 100}ms` : '0ms' }}
    >
      {/* Pill background */}
      <rect
        x={node.x - pillW / 2}
        y={node.y - pillH / 2}
        width={pillW}
        height={pillH}
        rx={rx}
        fill={`rgba(255,255,255,${alpha * 0.08})`}
        stroke={isHighlighted || isSelected ? node.color : 'rgba(255,255,255,0.1)'}
        strokeWidth={isSelected ? 2 : isHighlighted ? 1.5 : 0.5}
        className={`transition-all duration-200 ${isHighlighted ? 'drop-shadow-glow' : ''}`}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Label */}
      <text
        x={node.x}
        y={node.y + 4}
        textAnchor="middle"
        fill={isHighlighted || isSelected ? '#ffffff' : 'rgba(255,255,255,0.85)'}
        fontSize={node.level === 1 ? 11 : 10}
        fontWeight={isHighlighted || isSelected ? 'bold' : 'normal'}
        className="pointer-events-none select-none transition-all duration-200"
      >
        {node.label.length > 22 ? node.label.slice(0, 22) + '…' : node.label}
      </text>

      {/* Collapse/Expand indicator */}
      {isCollapsible && (
        <g transform={`translate(${node.x + pillW / 2 - 16}, ${node.y})`}>
          <circle cx={0} cy={0} r={8} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
          {isCollapsed ? (
            <ChevronRight size={10} className="text-muted" style={{ transform: 'translate(-5px, -5px)' }} />
          ) : (
            <ChevronDown size={10} className="text-muted" style={{ transform: 'translate(-5px, -5px)' }} />
          )}
        </g>
      )}

      {/* Child count badge */}
      {isCollapsed && collapsedChildCount > 0 && (
        <g transform={`translate(${node.x + pillW / 2 - 16}, ${node.y - pillH / 2 - 10})`}>
          <rect
            x={-12}
            y={-8}
            width={24}
            height={16}
            rx={8}
            fill={node.color}
            opacity={0.9}
          />
          <text
            x={0}
            y={3}
            textAnchor="middle"
            fill="white"
            fontSize="9"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            +{collapsedChildCount}
          </text>
        </g>
      )}
    </g>
  );
}

/* ===========================
   Edge Component
   =========================== */

interface MindMapEdgeProps {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  color: string;
  isHighlighted: boolean;
  isConnected: boolean;
  dashArray?: string;
}

function MindMapEdge({ sx, sy, tx, ty, color, isHighlighted, isConnected, dashArray }: MindMapEdgeProps) {
  const alpha = isHighlighted ? 0.8 : isConnected ? 0.4 : 0.15;
  const strokeW = isHighlighted ? 2.5 : 1;

  return (
    <line
      x1={sx}
      y1={sy}
      x2={tx}
      y2={ty}
      stroke={isHighlighted ? color : 'rgba(255,255,255,0.2)'}
      strokeWidth={strokeW}
      opacity={alpha}
      strokeDasharray={dashArray || 'none'}
      className="transition-all duration-300"
    />
  );
}

/* ===========================
   Detail Panel
   =========================== */

function DetailPanel({
  node,
  onClose,
}: {
  node: LayoutNode | null;
  onClose: () => void;
}) {
  if (!node || node.id === 'center') return null;

  const label = node.label;
  const levelName = node.level === 1 ? 'Category' : 'Subtopic';

  return (
    <div
      className="glass-card p-4 animate-fade-in-up"
      role="dialog"
      aria-label={`Details for ${label}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: node.color }}
          />
          <h4 className="text-sm font-semibold text-foreground">{label}</h4>
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
      <p className="text-xs text-muted mb-2">
        <span className="text-muted-lighter uppercase tracking-wider text-[10px]">{levelName}</span>
      </p>
      {node.importance && (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-xs ${i < node.importance! ? 'text-gold' : 'text-muted-lighter'}`}
            >
              ★
            </span>
          ))}
        </div>
      )}
      {node.parentId && (
        <p className="text-[10px] text-muted-lighter mt-2">
          Parent: {node.parentId === 'center' ? node.label : node.parentId}
        </p>
      )}
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

  // Pan & zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Trigger entrance animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Reset view when data changes
  useEffect(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
    setCollapsed(new Set());
    setSelectedNodeId(null);
    setHoveredNodeId(null);
  }, [data]);

  const { nodes, centerNode } = data ? buildLayout(data) : { nodes: [] as LayoutNode[], centerNode: null as LayoutNode | null };

  // Resolve which children are visible
  const visibleNodeIds = new Set<string>();
  if (centerNode) {
    visibleNodeIds.add(centerNode.id);
    centerNode.childIds.forEach((cid) => {
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
      const parent = nodes.find((n) => n.id === highlightedNode.parentId);
      if (parent) {
        parent.childIds.forEach((cid) => connectedIds.add(cid));
      }
    }
  }

  // Edges to render
  const edges: { source: LayoutNode; target: LayoutNode; color: string }[] = [];
  visibleNodes.forEach((node) => {
    if (node.level === 1 && centerNode) {
      edges.push({ source: centerNode, target: node, color: node.color });
    }
    if (node.level === 2) {
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

  const handleResetView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.3, 3) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale / 1.3, 0.3) }));
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.3, Math.min(prev.scale * delta, 3)),
    }));
  }, []);

  // Drag to pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element)?.closest('svg') === svgRef.current) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    }
  }, [transform.x, transform.y]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setTransform((prev) => ({
          ...prev,
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        }));
      }
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

  return (
    <DenToolShell toolKey="mindmap" isLoading={isLoading} error={error} onRegenerate={regenerate}>
      {data && (
        <div className="flex flex-col gap-3">
          {/* Canvas controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Zoom in"
                title="Zoom in"
              >
                <ZoomIn size={16} className="text-muted" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Zoom out"
                title="Zoom out"
              >
                <ZoomOut size={16} className="text-muted" />
              </button>
              <button
                onClick={handleResetView}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Reset view"
                title="Reset view"
              >
                <RotateCcw size={16} className="text-muted" />
              </button>
              <span className="text-[10px] text-muted-lighter ml-1">
                {Math.round(transform.scale * 100)}% · Drag to pan · Scroll to zoom
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-lighter">
              <Info size={12} />
              <span>Click category to collapse/expand · Click any node for details</span>
            </div>
          </div>

          {/* SVG Canvas */}
          <div
            className="glass-card p-0 overflow-hidden relative"
            style={{ minHeight: 500, cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 1000 700"
              className="w-full h-auto"
              style={{ minHeight: 500 }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <g
                transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
                style={{ transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
              >
                {/* Background grid */}
                <defs>
                  <pattern id="mindmap-grid" width={40} height={40} patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
                  </pattern>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <rect width="1000" height="700" fill="url(#mindmap-grid)" />

                {/* Edges */}
                {edges.map((edge, i) => {
                  const isHighlighted = highlightedId && (edge.source.id === highlightedId || edge.target.id === highlightedId);
                  const isConnected = connectedIds.has(edge.source.id) && connectedIds.has(edge.target.id);
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
                      dashArray={edge.target.level === 2 ? '4,3' : undefined}
                    />
                  );
                })}

                {/* Nodes */}
                {visibleNodes.map((node) => {
                  const isCenter = node.id === 'center';
                  const isCollapsed = collapsed.has(node.id);
                  const isExpanded = !isCollapsed;
                  const childCount = node.childIds.length;

                  const visibleChildren = node.childIds.filter((cid) => visibleNodeIds.has(cid) && !collapsed.has(cid));

                  return (
                    <MindMapNode
                      key={node.id}
                      node={node}
                      isCenter={isCenter}
                      isCollapsed={isCollapsed}
                      isExpanded={isExpanded}
                      collapsedChildCount={node.childIds.length - visibleChildren.length}
                      isHighlighted={node.id === highlightedId}
                      isConnected={connectedIds.has(node.id)}
                      isSelected={selectedNodeId === node.id}
                      animated={animated}
                      onToggle={handleToggle}
                      onSelect={handleSelect}
                      onHover={handleHover}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Detail panel overlaid */}
            {selectedNode && selectedNode.id !== 'center' && (
              <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72">
                <DetailPanel node={selectedNode} onClose={() => setSelectedNodeId(null)} />
              </div>
            )}
          </div>
        </div>
      )}
    </DenToolShell>
  );
}