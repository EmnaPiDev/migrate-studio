import type {
  AgentStatus,
  KnowledgeGraph,
  WebSocketEvent,
  AgentState,
  GraphNodeType,
  LogLevel,
} from '@/types/api';

type EventCallback = (event: WebSocketEvent) => void;

const AGENT_NAMES = [
  'File Scanner',
  'Dependency Analyzer',
  'Controller Migrator',
  'Service Transformer',
  'Template Converter',
  'Route Mapper',
  'Test Generator',
];

const NODE_TYPES: GraphNodeType[] = ['file', 'module', 'component', 'service', 'function', 'class'];

class MockWebSocketService {
  private callbacks: Map<string, EventCallback[]> = new Map();
  private intervals: Map<string, NodeJS.Timeout[]> = new Map();

  subscribe(projectId: string, callback: EventCallback): () => void {
    const key = projectId;
    const existing = this.callbacks.get(key) || [];
    this.callbacks.set(key, [...existing, callback]);

    // Start simulation if not already running
    if (!this.intervals.has(key)) {
      this.startSimulation(projectId);
    }

    return () => {
      const cbs = this.callbacks.get(key) || [];
      this.callbacks.set(key, cbs.filter((cb) => cb !== callback));
      
      if (this.callbacks.get(key)?.length === 0) {
        this.stopSimulation(projectId);
      }
    };
  }

  private emit(projectId: string, event: WebSocketEvent) {
    const callbacks = this.callbacks.get(projectId) || [];
    callbacks.forEach((cb) => cb(event));
  }

  private startSimulation(projectId: string) {
    const agentStates: Map<string, { status: AgentState; percent: number }> = new Map();
    let graphNodes: KnowledgeGraph['nodes'] = [];
    let graphEdges: KnowledgeGraph['edges'] = [];
    let nodeCounter = 0;

    // Initialize agents
    AGENT_NAMES.forEach((name, idx) => {
      agentStates.set(`agent-${idx}`, { status: 'queued', percent: 0 });
    });

    const intervals: NodeJS.Timeout[] = [];

    // Agent progress simulation
    const agentInterval = setInterval(() => {
      AGENT_NAMES.forEach((name, idx) => {
        const agentId = `agent-${idx}`;
        const state = agentStates.get(agentId)!;

        if (state.status === 'queued' && Math.random() > 0.7) {
          state.status = 'running';
          state.percent = 0;
        } else if (state.status === 'running') {
          state.percent = Math.min(100, state.percent + Math.random() * 15);
          
          if (state.percent >= 100) {
            state.status = Math.random() > 0.1 ? 'success' : 'failed';
          }
        }

        this.emit(projectId, {
          type: 'agent:update',
          projectId,
          agentId,
          name,
          status: state.status,
          percent: Math.round(state.percent),
          message: this.getAgentMessage(state.status, state.percent),
          timestamp: new Date().toISOString(),
        });
      });
    }, 800);
    intervals.push(agentInterval);

    // Log simulation
    const logInterval = setInterval(() => {
      const agentIdx = Math.floor(Math.random() * AGENT_NAMES.length);
      const levels: LogLevel[] = ['info', 'info', 'info', 'warn', 'error'];
      const level = levels[Math.floor(Math.random() * levels.length)];

      this.emit(projectId, {
        type: 'agent:log',
        projectId,
        agentId: `agent-${agentIdx}`,
        message: this.getRandomLogMessage(level),
        level,
        timestamp: new Date().toISOString(),
      });
    }, 1500);
    intervals.push(logInterval);

    // Graph update simulation
    const graphInterval = setInterval(() => {
      // Add new nodes
      const newNodeCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < newNodeCount; i++) {
        const nodeType = NODE_TYPES[Math.floor(Math.random() * NODE_TYPES.length)];
        const newNode = {
          id: `node-${nodeCounter++}`,
          label: this.getNodeLabel(nodeType, nodeCounter),
          type: nodeType,
          meta: { lines: Math.floor(Math.random() * 500) + 10 },
        };
        graphNodes.push(newNode);

        // Add edges to existing nodes
        if (graphNodes.length > 1 && Math.random() > 0.3) {
          const targetIdx = Math.floor(Math.random() * (graphNodes.length - 1));
          graphEdges.push({
            from: newNode.id,
            to: graphNodes[targetIdx].id,
            label: Math.random() > 0.5 ? 'imports' : 'uses',
          });
        }
      }

      this.emit(projectId, {
        type: 'graph:update',
        projectId,
        graph: { nodes: [...graphNodes], edges: [...graphEdges] },
      });
    }, 2000);
    intervals.push(graphInterval);

    this.intervals.set(projectId, intervals);
  }

  private stopSimulation(projectId: string) {
    const intervals = this.intervals.get(projectId) || [];
    intervals.forEach(clearInterval);
    this.intervals.delete(projectId);
    this.callbacks.delete(projectId);
  }

  private getAgentMessage(status: AgentState, percent: number): string {
    switch (status) {
      case 'queued':
        return 'Waiting in queue...';
      case 'running':
        if (percent < 30) return 'Analyzing source files...';
        if (percent < 60) return 'Processing dependencies...';
        if (percent < 90) return 'Generating transformations...';
        return 'Finalizing...';
      case 'success':
        return 'Completed successfully';
      case 'failed':
        return 'Failed with errors';
      case 'cancelled':
        return 'Cancelled by user';
      default:
        return '';
    }
  }

  private getRandomLogMessage(level: LogLevel): string {
    const messages = {
      info: [
        'Processing file: src/app/controllers/mainCtrl.js',
        'Found 12 Angular directives',
        'Analyzing service dependencies',
        'Mapping route configurations',
        'Extracting template bindings',
        'Converting $scope references',
      ],
      warn: [
        'Deprecated API usage detected: $http.success()',
        'Complex template expression found, manual review recommended',
        'Circular dependency detected between services',
      ],
      error: [
        'Failed to parse file: syntax error at line 42',
        'Unsupported directive: ng-transclude',
        'Missing module dependency: angular-ui-router',
      ],
    };
    const pool = messages[level];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private getNodeLabel(type: GraphNodeType, counter: number): string {
    const prefixes = {
      file: ['app.js', 'main.ts', 'index.js', 'config.ts'],
      module: ['AppModule', 'SharedModule', 'CoreModule', 'FeatureModule'],
      component: ['HeaderComponent', 'FooterComponent', 'NavComponent', 'CardComponent'],
      service: ['AuthService', 'ApiService', 'DataService', 'UserService'],
      function: ['handleClick', 'fetchData', 'processInput', 'validateForm'],
      class: ['UserController', 'ProductService', 'OrderModel', 'CartManager'],
    };
    const pool = prefixes[type];
    return pool[counter % pool.length];
  }

  cleanup() {
    this.intervals.forEach((intervals) => intervals.forEach(clearInterval));
    this.intervals.clear();
    this.callbacks.clear();
  }
}

export const mockWebSocket = new MockWebSocketService();
