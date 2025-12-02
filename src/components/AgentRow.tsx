import { motion } from 'framer-motion';
import { Play, XCircle, RotateCcw, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import type { AgentStatus, AgentState } from '@/types/api';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface AgentRowProps {
  agent: AgentStatus;
  onRun?: () => void;
  onCancel?: () => void;
}

const statusConfig: Record<AgentState, { icon: typeof CheckCircle2; color: string; label: string }> = {
  queued: { icon: Clock, color: 'text-agent-queued', label: 'Queued' },
  running: { icon: Loader2, color: 'text-agent-running', label: 'Running' },
  success: { icon: CheckCircle2, color: 'text-agent-success', label: 'Complete' },
  failed: { icon: AlertCircle, color: 'text-agent-failed', label: 'Failed' },
  cancelled: { icon: XCircle, color: 'text-agent-cancelled', label: 'Cancelled' },
};

export default function AgentRow({ agent, onRun, onCancel }: AgentRowProps) {
  const config = statusConfig[agent.status];
  const Icon = config.icon;
  const isRunning = agent.status === 'running';
  const canRerun = agent.status === 'failed' || agent.status === 'cancelled';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'glass-panel p-4 space-y-3',
        isRunning && 'glow-primary'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isRunning ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: isRunning ? Infinity : 0, ease: 'linear' }}
          >
            <Icon className={cn('w-5 h-5', config.color)} />
          </motion.div>
          <div>
            <h4 className="font-medium text-foreground">{agent.name}</h4>
            <p className="text-xs text-muted-foreground">{config.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          )}
          {canRerun && onRun && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRun}
              className="h-8 px-2 text-muted-foreground hover:text-primary"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          {agent.status === 'queued' && onRun && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRun}
              className="h-8 px-2 text-muted-foreground hover:text-primary"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {(isRunning || agent.status === 'success') && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{agent.lastMessage}</span>
            <span className={config.color}>{agent.percent}%</span>
          </div>
          <Progress
            value={agent.percent}
            className={cn(
              'h-1.5',
              agent.status === 'success' && '[&>div]:bg-success',
              agent.status === 'running' && '[&>div]:bg-primary'
            )}
          />
        </div>
      )}

      {agent.status === 'failed' && agent.lastMessage && (
        <p className="text-xs text-destructive">{agent.lastMessage}</p>
      )}
    </motion.div>
  );
}
