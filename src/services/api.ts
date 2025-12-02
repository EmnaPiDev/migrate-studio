import type {
  Project,
  ProjectSummary,
  KnowledgeGraph,
  UploadResponse,
  ApplyPatchRequest,
  ApplyPatchResponse,
} from '@/types/api';

const API_BASE = '/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async uploadProject(file: File, name?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }

    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async getProjects(): Promise<ProjectSummary[]> {
    return this.request<ProjectSummary[]>('/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async getKnowledgeGraph(projectId: string): Promise<KnowledgeGraph> {
    return this.request<KnowledgeGraph>(`/projects/${projectId}/knowledge-graph`);
  }

  async getFileContent(projectId: string, path: string): Promise<string> {
    const response = await fetch(
      `${API_BASE}/projects/${projectId}/files?path=${encodeURIComponent(path)}`
    );
    return response.text();
  }

  async runAgent(projectId: string, agentId: string): Promise<void> {
    await this.request(`/projects/${projectId}/agents/${agentId}/run`, {
      method: 'POST',
    });
  }

  async applyPatch(
    projectId: string,
    request: ApplyPatchRequest
  ): Promise<ApplyPatchResponse> {
    return this.request<ApplyPatchResponse>(`/projects/${projectId}/applyPatch`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const api = new ApiService();
