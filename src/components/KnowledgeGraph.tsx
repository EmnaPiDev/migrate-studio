import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force';
import type { KnowledgeGraph as KGType, GraphNode, GraphEdge, GraphNodeType } from '@/types/api';
import { cn } from '@/lib/utils';
import { Network, X, FileCode, Box, Layers, Settings, Braces, Boxes } from 'lucide-react';

interface KnowledgeGraphProps {
  graph: KGType | null;
  selectedNode: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

interface SimNode extends SimulationNodeDatum, GraphNode {}
interface SimLink extends SimulationLinkDatum<SimNode> {
  label?: string;
}

const nodeTypeConfig: Record<GraphNodeType, { color: string; icon: typeof FileCode }> = {
  file: { color: 'var(--graph-node-file)', icon: FileCode },
  module: { color: 'var(--graph-node-module)', icon: Boxes },
  component: { color: 'var(--graph-node-component)', icon: Box },
  service: { color: 'var(--graph-node-service)', icon: Settings },
  function: { color: 'var(--graph-node-function)', icon: Braces },
  class: { color: 'var(--graph-node-class)', icon: Layers },
};

export default function KnowledgeGraph({
  graph,
  selectedNode,
  onSelectNode,
}: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [links, setLinks] = useState<SimLink[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const simulationRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current?.parentElement) {
        const { width, height } = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update simulation when graph changes
  useEffect(() => {
    if (!graph) return;

    const simNodes: SimNode[] = graph.nodes.map((node) => ({
      ...node,
      x: node.x ?? dimensions.width / 2 + (Math.random() - 0.5) * 100,
      y: node.y ?? dimensions.height / 2 + (Math.random() - 0.5) * 100,
    }));

    const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
    const simLinks: SimLink[] = graph.edges
      .filter((edge) => nodeMap.has(edge.from) && nodeMap.has(edge.to))
      .map((edge) => ({
        source: nodeMap.get(edge.from)!,
        target: nodeMap.get(edge.to)!,
        label: edge.label,
      }));

    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const simulation = forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance(80)
      )
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collide', forceCollide(30))
      .on('tick', () => {
        setNodes([...simNodes]);
        setLinks([...simLinks]);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [graph, dimensions]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      onSelectNode(selectedNode === nodeId ? null : nodeId);
    },
    [selectedNode, onSelectNode]
  );

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Network className="w-16 h-16 opacity-20" />
        </motion.div>
        <p className="mt-4 text-sm">Building knowledge graph...</p>
        <p className="text-xs mt-1 opacity-60">Nodes will appear as files are analyzed</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-background/50 rounded-xl">
      {/* Legend */}
      <div className="absolute top-4 left-4 glass-panel p-3 z-10">
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(nodeTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <div key={type} className="flex items-center gap-1.5">
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: `hsl(${config.color})` }}
                />
                <span className="text-muted-foreground capitalize">{type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 glass-panel px-3 py-2 z-10">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">
            <span className="text-primary font-medium">{nodes.length}</span> nodes
          </span>
          <span className="text-muted-foreground">
            <span className="text-primary font-medium">{links.length}</span> edges
          </span>
        </div>
      </div>

      {/* Graph SVG */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="cursor-grab active:cursor-grabbing"
        onClick={() => onSelectNode(null)}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="4"
            refX="6"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="hsl(var(--border))" />
          </marker>
        </defs>

        {/* Links */}
        <g>
          {links.map((link, i) => {
            const source = link.source as SimNode;
            const target = link.target as SimNode;
            return (
              <line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="hsl(var(--border))"
                strokeWidth={1}
                strokeOpacity={0.6}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((node) => {
            const config = nodeTypeConfig[node.type];
            const isSelected = selectedNode === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node.id);
                }}
                className="cursor-pointer"
              >
                {/* Glow effect for selected */}
                {isSelected && (
                  <circle
                    r={24}
                    fill={`hsl(${config.color} / 0.2)`}
                    className="animate-pulse-ring"
                  />
                )}
                {/* Node circle */}
                <circle
                  r={isSelected ? 14 : 10}
                  fill={`hsl(${config.color})`}
                  stroke={isSelected ? 'hsl(var(--foreground))' : 'transparent'}
                  strokeWidth={2}
                  className="transition-all duration-200"
                />
                {/* Label */}
                <text
                  y={22}
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize={9}
                  className="pointer-events-none"
                >
                  {node.label.length > 15 ? node.label.slice(0, 15) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNodeData && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-4 right-4 glass-panel p-4 w-72 z-10"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = nodeTypeConfig[selectedNodeData.type].icon;
                  return (
                    <Icon
                      className="w-5 h-5"
                      style={{ color: `hsl(${nodeTypeConfig[selectedNodeData.type].color})` }}
                    />
                  );
                })()}
                <span className="font-medium text-foreground">{selectedNodeData.label}</span>
              </div>
              <button
                onClick={() => onSelectNode(null)}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground capitalize">{selectedNodeData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="text-foreground font-mono text-xs">{selectedNodeData.id}</span>
              </div>
              {selectedNodeData.meta?.lines && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lines</span>
                  <span className="text-foreground">{selectedNodeData.meta.lines as number}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
