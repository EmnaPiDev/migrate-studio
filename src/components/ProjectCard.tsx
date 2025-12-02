import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { ProjectStatus } from '@/types/api';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  name: string;
  uploadedAt: string;
  status: ProjectStatus;
  agentCount: number;
  completedAgents: number;
}

const statusConfig: Record<ProjectStatus, { icon: typeof Loader2; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-agent-queued', label: 'Pending' },
  processing: { icon: Loader2, color: 'text-primary', label: 'Processing' },
  done: { icon: CheckCircle2, color: 'text-success', label: 'Complete' },
  failed: { icon: AlertCircle, color: 'text-destructive', label: 'Failed' },
};

export default function ProjectCard({
  name,
  uploadedAt,
  status,
  agentCount,
  completedAgents,
}: ProjectCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const progress = agentCount > 0 ? (completedAgents / agentCount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{name}</h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(uploadedAt).toLocaleString()}</span>
          </div>
        </div>
        <div className={cn('flex items-center gap-1.5 text-sm', config.color)}>
          <motion.div
            animate={status === 'processing' ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: status === 'processing' ? Infinity : 0, ease: 'linear' }}
          >
            <Icon className="w-4 h-4" />
          </motion.div>
          <span>{config.label}</span>
        </div>
      </div>

      {status === 'processing' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Migration progress</span>
            <span>{completedAgents}/{agentCount} agents</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
