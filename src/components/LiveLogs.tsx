import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Trash2, ChevronDown, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { LogEntry, LogLevel } from '@/types/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface LiveLogsProps {
  logs: LogEntry[];
  filter: LogLevel | 'all';
  onFilterChange: (filter: LogLevel | 'all') => void;
  autoScroll: boolean;
  onAutoScrollChange: (value: boolean) => void;
  onClear: () => void;
}

const levelConfig: Record<LogLevel, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-info', bg: 'bg-info/10' },
  warn: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
  error: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

const filterOptions: { value: LogLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warn' },
  { value: 'error', label: 'Error' },
];

export default function LiveLogs({
  logs,
  filter,
  onFilterChange,
  autoScroll,
  onAutoScrollChange,
  onClear,
}: LiveLogsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Live Logs</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {logs.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Auto-scroll</span>
            <Switch
              checked={autoScroll}
              onCheckedChange={onAutoScrollChange}
              className="scale-75"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 px-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 px-4 py-2 bg-secondary/30">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterChange(opt.value)}
            className={cn(
              'px-3 py-1 text-xs rounded-full transition-colors',
              filter === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Logs */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin font-mono text-xs"
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ScrollText className="w-10 h-10 mb-2 opacity-30" />
            <p>No logs yet</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log) => {
              const config = levelConfig[log.level];
              const Icon = config.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    'flex items-start gap-2 px-4 py-2 border-b border-border/50',
                    config.bg
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5 mt-0.5 flex-shrink-0', config.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      {log.agentId && (
                        <span className="text-primary/70">[{log.agentId}]</span>
                      )}
                    </div>
                    <p className="text-foreground break-all">{log.message}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Scroll to bottom indicator */}
      {!autoScroll && logs.length > 0 && (
        <button
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }}
          className="absolute bottom-4 right-4 p-2 glass-panel hover:bg-secondary transition-colors"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
