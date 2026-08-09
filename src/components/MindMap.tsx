import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Map as MapIcon } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

let renderCounter = 0;

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    fontFamily: 'JetBrains Mono, monospace',
    primaryColor: '#7c3aed',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: '#7c3aed',
    lineColor: '#475569',
    secondaryColor: '#1e293b',
    tertiaryColor: '#0f172a',
    clusterBkg: '#1e293b',
    clusterBorder: '#334155',
    nodeBorder: '#475569',
    mainBkg: '#1e293b',
    edgeLabelBackground: '#1e293b',
    nodeTextColor: '#e2e8f0',
  },
  securityLevel: 'loose',
});

export default function MindMap() {
  const { state } = useDashboard();
  const nodes = state.dashboard?.contextGraph || [];
  const moduleTitle = state.dashboard?.moduleTitle || 'Topic';
  const mermaidRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(`mindmap-${++renderCounter}`);

  useEffect(() => {
    if (nodes.length === 0 || !mermaidRef.current) return;

    let cancelled = false;

    const renderDiagram = async () => {
      if (!mermaidRef.current) return;

      if (nodes.length < 2) {
        mermaidRef.current.innerHTML = '<p class="text-text-muted text-sm text-center py-8">Not enough data to generate a mind map</p>';
        return;
      }

      // Find root (node with most connections)
      const rootNode = nodes.reduce((prev, curr) =>
        (curr.connections?.length || 0) > (prev.connections?.length || 0) ? curr : prev
      , nodes[0]);

      const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9\s-]/g, '').trim().slice(0, 22);
      const rootLabel = sanitize(moduleTitle) || 'Root';

      // Build a graph LR tree with deterministic node IDs
      let def = 'graph LR\n';

      // Root node definition
      def += `  root["🏠 ${rootLabel}"]\n`;
      def += `  style root fill:#7c3aed,stroke:#7c3aed,color:#e2e8f0,font-weight:bold,rx:8\n`;

      // Primary categories (top 5 nodes by connection count)
      const primaryNodes = nodes
        .filter(n => n.id !== rootNode.id)
        .sort((a, b) => (b.connections?.length || 0) - (a.connections?.length || 0))
        .slice(0, 5);

      // Assign deterministic node IDs
      const nodeIdMap = new Map<string, string>();
      nodeIdMap.set(rootNode.id, 'root');

      const getNodeId = (n: typeof nodes[0]) => {
        if (nodeIdMap.has(n.id)) return nodeIdMap.get(n.id)!;
        const safeId = `n${n.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        nodeIdMap.set(n.id, safeId);
        return safeId;
      };

      const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      const branchColors = ['#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed'];

      primaryNodes.forEach((primary, pi) => {
        const pId = getNodeId(primary);
        const pLabel = sanitize(primary.label);
        if (!pLabel) return;
        const color = colors[pi % colors.length];
        const branchColor = branchColors[pi % branchColors.length];

        def += `  ${pId}["📘 ${pLabel}"]\n`;
        def += `  style ${pId} fill:#1e293b,stroke:${color},color:#e2e8f0,rx:6\n`;
        def += `  root --> ${pId}\n`;

        // Sub-topics
        const subs = (primary.connections || [])
          .map(id => nodes.find(n => n.id === id))
          .filter((n): n is typeof nodes[0] => !!n && n.id !== rootNode.id && n.id !== primary.id);

        subs.slice(0, 4).forEach((sub) => {
          const sId = getNodeId(sub);
          const sLabel = sanitize(sub.label);
          if (!sLabel) return;
          def += `  ${sId}["🔹 ${sLabel}"]\n`;
          def += `  style ${sId} fill:#0f172a,stroke:${branchColor},color:#94a3b8,rx:4\n`;
          def += `  ${pId} -.-> ${sId}\n`;
        });
      });

      try {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = '';
        }
        const renderId = renderIdRef.current;
        const { svg } = await mermaid.render(renderId, def);
        if (!cancelled && mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.warn('Mermaid render error:', err);
        if (!cancelled && mermaidRef.current) {
          mermaidRef.current.innerHTML = '<p class="text-text-muted text-sm text-center py-8">Could not render mind map. Try refreshing.</p>';
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [nodes, moduleTitle]);

  if (nodes.length === 0) {
    return (
      <div className="dark-glass rounded-xl p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <MapIcon size={24} className="text-warning" />
          <h2 className="font-heading text-xl text-text-primary">Mind Map</h2>
        </div>
        <p className="text-text-muted text-sm text-center py-8">No concepts available to map. Generate a module first.</p>
      </div>
    );
  }

  return (
    <div className="dark-glass rounded-xl p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <MapIcon size={24} className="text-warning" />
        <h2 className="font-heading text-xl text-text-primary">Mind Map</h2>
      </div>

      {/* Mermaid container */}
      <div
        ref={mermaidRef}
        className="w-full overflow-auto rounded-xl bg-slate-900/50 p-4 min-h-[300px] flex items-center justify-center"
        style={{ maxHeight: '500px' }}
      />

      <p className="text-text-muted text-[10px] text-center mt-3">
        {nodes.length} concepts · Left-to-right tree layout
      </p>
    </div>
  );
}