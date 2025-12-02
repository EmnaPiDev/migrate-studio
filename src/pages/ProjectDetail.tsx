import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import AgentList from '@/components/AgentList';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import LiveLogs from '@/components/LiveLogs';
import ProjectCard from '@/components/ProjectCard';
import { useAgentsStatus } from '@/hooks/useAgentsStatus';
import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { useLiveLogs } from '@/hooks/useLiveLogs';
import { Button } from '@/components/ui/button';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = id || null;

  const { agents, isConnected, runAgent, cancelAgent } = useAgentsStatus(projectId);
  const { graph, selectedNode, selectNode } = useKnowledgeGraph(projectId);
  const { logs, filter, setFilter, clearLogs, autoScroll, setAutoScroll } = useLiveLogs(projectId);

  const completedAgents = agents.filter((a) => a.status === 'success').length;

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Angular Migration Studio</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Project: <span className="text-primary font-mono">{projectId}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Project Card */}
      <div className="container mx-auto px-6 py-4">
        <ProjectCard
          name={`Project ${projectId.slice(-8)}`}
          uploadedAt={new Date().toISOString()}
          status="processing"
          agentCount={agents.length}
          completedAgents={completedAgents}
        />
      </div>

      {/* Main Dashboard Grid */}
      <main className="flex-1 container mx-auto px-6 pb-6">
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
          {/* Left Panel - Agents */}
          <div className="col-span-3 glass-panel overflow-hidden">
            <AgentList
              agents={agents}
              isConnected={isConnected}
              onRunAgent={runAgent}
              onCancelAgent={cancelAgent}
            />
          </div>

          {/* Center Panel - Knowledge Graph */}
          <div className="col-span-6 glass-panel overflow-hidden">
            <KnowledgeGraph
              graph={graph}
              selectedNode={selectedNode}
              onSelectNode={selectNode}
            />
          </div>

          {/* Right Panel - Logs */}
          <div className="col-span-3 glass-panel overflow-hidden relative">
            <LiveLogs
              logs={logs}
              filter={filter}
              onFilterChange={setFilter}
              autoScroll={autoScroll}
              onAutoScrollChange={setAutoScroll}
              onClear={clearLogs}
            />
          </div>
        </div>
      </main>
    </motion.div>
  );
}
