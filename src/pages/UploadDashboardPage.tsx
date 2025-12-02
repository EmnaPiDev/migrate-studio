import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Code2, GitBranch, Zap } from 'lucide-react';
import DragDropUploader from '@/components/DragDropUploader';
import AgentList from '@/components/AgentList';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import LiveLogs from '@/components/LiveLogs';
import ProjectCard from '@/components/ProjectCard';
import { useProjectUpload } from '@/hooks/useProjectUpload';
import { useAgentsStatus } from '@/hooks/useAgentsStatus';
import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { useLiveLogs } from '@/hooks/useLiveLogs';

export default function UploadDashboardPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [uploadedAt, setUploadedAt] = useState<string>('');

  const { upload, isUploading, progress, error } = useProjectUpload();
  const { agents, isConnected, runAgent, cancelAgent } = useAgentsStatus(projectId);
  const { graph, selectedNode, selectNode } = useKnowledgeGraph(projectId);
  const { logs, filter, setFilter, clearLogs, autoScroll, setAutoScroll } = useLiveLogs(projectId);

  const handleUpload = useCallback(
    async (file: File) => {
      const response = await upload(file);
      if (response) {
        setProjectId(response.projectId);
        setProjectName(file.name.replace('.zip', ''));
        setUploadedAt(response.uploadedAt);
      }
    },
    [upload]
  );

  const completedAgents = agents.filter((a) => a.status === 'success').length;
  const hasProject = !!projectId;

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {!hasProject ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="border-b border-border/50">
              <div className="container mx-auto px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">Angular Migration Studio</h1>
                    <p className="text-sm text-muted-foreground">AngularJS → Angular modernization</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-4xl space-y-12">
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center space-y-4"
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-gradient-primary">
                    Migrate AngularJS to Angular
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Upload your legacy AngularJS project and watch our AI agents analyze, 
                    transform, and modernize your codebase in real-time.
                  </p>
                </motion.div>

                {/* Upload Zone */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <DragDropUploader
                    onUpload={handleUpload}
                    isUploading={isUploading}
                    progress={progress}
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-sm text-destructive mt-4"
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid md:grid-cols-3 gap-4"
                >
                  {[
                    {
                      icon: Code2,
                      title: 'Smart Analysis',
                      desc: 'AI-powered code understanding and dependency mapping',
                    },
                    {
                      icon: GitBranch,
                      title: 'Live Graph',
                      desc: 'Interactive knowledge graph of your project structure',
                    },
                    {
                      icon: Zap,
                      title: 'Real-time Updates',
                      desc: 'Watch migration agents work on your code live',
                    },
                  ].map((feature, i) => (
                    <div
                      key={feature.title}
                      className="glass-panel p-6 text-center hover:glow-primary transition-shadow"
                    >
                      <feature.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header with Project Info */}
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
              <div className="container mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground">Angular Migration Studio</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-medium">{projectName}</span>
                    <ArrowRight className="w-4 h-4" />
                    <span>Migration in progress</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Project Card */}
            <div className="container mx-auto px-6 py-4">
              <ProjectCard
                name={projectName}
                uploadedAt={uploadedAt}
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
        )}
      </AnimatePresence>
    </div>
  );
}
