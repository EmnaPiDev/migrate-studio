import { useState, useEffect, useCallback } from 'react';
import type { LogEntry, WebSocketEvent, LogLevel } from '@/types/api';
import { mockWebSocket } from '@/services/mockWebSocket';

interface UseLiveLogsReturn {
  logs: LogEntry[];
  filter: LogLevel | 'all';
  setFilter: (filter: LogLevel | 'all') => void;
  clearLogs: () => void;
  autoScroll: boolean;
  setAutoScroll: (value: boolean) => void;
}

export function useLiveLogs(projectId: string | null): UseLiveLogsReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setLogs([]);
      return;
    }

    const unsubscribe = mockWebSocket.subscribe(projectId, (event: WebSocketEvent) => {
      if (event.type === 'agent:log') {
        setLogs((prev) => [
          ...prev.slice(-500), // Keep last 500 logs
          {
            id: `log-${Date.now()}-${Math.random()}`,
            projectId: event.projectId,
            agentId: event.agentId,
            message: event.message,
            level: event.level,
            timestamp: event.timestamp,
          },
        ]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [projectId]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const filteredLogs = filter === 'all' ? logs : logs.filter((log) => log.level === filter);

  return {
    logs: filteredLogs,
    filter,
    setFilter,
    clearLogs,
    autoScroll,
    setAutoScroll,
  };
}
