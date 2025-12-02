import { motion } from 'framer-motion';
import type { AgentStatus } from '@/types/api';
import AgentRow from './AgentRow';
import { Bot, Wifi, WifiOff } from 'lucide-react';

interface AgentListProps {
  agents: AgentStatus[];
  isConnected: boolean;
  onRunAgent?: (agentId: string) => void;
  onCancelAgent?: (agentId: string) => void;
}

export default function AgentList({
  agents,
  isConnected,
  onRunAgent,
  onCancelAgent,
}: AgentListProps) {
  const runningCount = agents.filter((a) => a.status === 'running').length;
  const completedCount = agents.filter((a) => a.status === 'success').length;
  const failedCount = agents.filter((a) => a.status === 'failed').length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Migration Agents</h3>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1.5 text-xs text-success">
              <Wifi className="w-3.5 h-3.5" />
              <span>Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Disconnected</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 py-3 bg-secondary/30 text-xs">
        <span className="text-muted-foreground">
          <span className="text-primary font-medium">{runningCount}</span> running
        </span>
        <span className="text-muted-foreground">
          <span className="text-success font-medium">{completedCount}</span> completed
        </span>
        {failedCount > 0 && (
          <span className="text-muted-foreground">
            <span className="text-destructive font-medium">{failedCount}</span> failed
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {agents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-muted-foreground"
          >
            <Bot className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Waiting for agents...</p>
          </motion.div>
        ) : (
          agents.map((agent, index) => (
            <motion.div
              key={agent.agentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AgentRow
                agent={agent}
                onRun={onRunAgent ? () => onRunAgent(agent.agentId) : undefined}
                onCancel={onCancelAgent ? () => onCancelAgent(agent.agentId) : undefined}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
