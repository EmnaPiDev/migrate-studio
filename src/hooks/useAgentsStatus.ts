import { useState, useEffect, useCallback } from 'react';
import type { AgentStatus, WebSocketEvent } from '@/types/api';
import { mockWebSocket } from '@/services/mockWebSocket';

interface UseAgentsStatusReturn {
  agents: AgentStatus[];
  isConnected: boolean;
  runAgent: (agentId: string) => void;
  cancelAgent: (agentId: string) => void;
}

export function useAgentsStatus(projectId: string | null): UseAgentsStatusReturn {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setAgents([]);
      setIsConnected(false);
      return;
    }

    setIsConnected(true);

    const unsubscribe = mockWebSocket.subscribe(projectId, (event: WebSocketEvent) => {
      if (event.type === 'agent:update') {
        setAgents((prev) => {
          const existing = prev.find((a) => a.agentId === event.agentId);
          if (existing) {
            return prev.map((a) =>
              a.agentId === event.agentId
                ? {
                    ...a,
                    status: event.status,
                    percent: event.percent,
                    lastMessage: event.message,
                    lastUpdated: event.timestamp,
                  }
                : a
            );
          }
          return [
            ...prev,
            {
              agentId: event.agentId,
              name: event.name,
              status: event.status,
              percent: event.percent,
              lastMessage: event.message,
              lastUpdated: event.timestamp,
            },
          ];
        });
      }
    });

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [projectId]);

  const runAgent = useCallback((agentId: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.agentId === agentId ? { ...a, status: 'running', percent: 0 } : a
      )
    );
  }, []);

  const cancelAgent = useCallback((agentId: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.agentId === agentId ? { ...a, status: 'cancelled' } : a
      )
    );
  }, []);

  return { agents, isConnected, runAgent, cancelAgent };
}
