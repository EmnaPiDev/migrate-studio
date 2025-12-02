import { useState, useEffect } from 'react';
import type { KnowledgeGraph, WebSocketEvent } from '@/types/api';
import { mockWebSocket } from '@/services/mockWebSocket';

interface UseKnowledgeGraphReturn {
  graph: KnowledgeGraph | null;
  isLoading: boolean;
  selectedNode: string | null;
  selectNode: (nodeId: string | null) => void;
}

export function useKnowledgeGraph(projectId: string | null): UseKnowledgeGraphReturn {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setGraph(null);
      setSelectedNode(null);
      return;
    }

    setIsLoading(true);

    // Initial empty graph
    setGraph({ nodes: [], edges: [] });
    setIsLoading(false);

    const unsubscribe = mockWebSocket.subscribe(projectId, (event: WebSocketEvent) => {
      if (event.type === 'graph:update') {
        setGraph(event.graph);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [projectId]);

  return {
    graph,
    isLoading,
    selectedNode,
    selectNode: setSelectedNode,
  };
}
