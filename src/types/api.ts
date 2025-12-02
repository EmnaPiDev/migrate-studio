export type AgentState = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';

export interface AgentStatus {
  agentId: string;
  name: string;
  status: AgentState;
  percent: number;
  lastMessage?: string;
  lastUpdated?: string;
}

export type ProjectStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface Project {
  id: string;
  name: string;
  uploadedAt: string;
  status: ProjectStatus;
  agents: AgentStatus[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  uploadedAt: string;
  status: ProjectStatus;
  agentCount: number;
  completedAgents: number;
}

export type GraphNodeType = 'file' | 'module' | 'component' | 'service' | 'function' | 'class';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  meta?: Record<string, unknown>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  projectId: string;
  agentId?: string;
  message: string;
  level: LogLevel;
  timestamp: string;
}

export interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  diff?: string;
}

export interface Patch {
  filePath: string;
  content: string;
  description?: string;
}

export interface UploadResponse {
  projectId: string;
  taskId: string;
  uploadedAt: string;
}

export interface ApplyPatchRequest {
  filePath: string;
  patch: string;
  author?: string;
}

export interface ApplyPatchResponse {
  success: boolean;
  backupPath?: string;
}

// WebSocket event types
export interface AgentUpdateEvent {
  type: 'agent:update';
  projectId: string;
  agentId: string;
  name: string;
  status: AgentState;
  percent: number;
  message?: string;
  timestamp: string;
}

export interface AgentLogEvent {
  type: 'agent:log';
  projectId: string;
  agentId: string;
  message: string;
  level: LogLevel;
  timestamp: string;
}

export interface GraphUpdateEvent {
  type: 'graph:update';
  projectId: string;
  graph: KnowledgeGraph;
}

export type WebSocketEvent = AgentUpdateEvent | AgentLogEvent | GraphUpdateEvent;
