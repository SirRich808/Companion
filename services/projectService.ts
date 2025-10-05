import { apiClient } from './apiClient';
import { Project, ProjectCreationInput, StructuredState, Update } from '../types';

interface ListProjectsResponse {
  projects: ProjectResponse[];
}

interface ProjectResponse extends Omit<Project, 'updates' | 'currentState'> {
  currentState: StructuredState | null;
  updates?: UpdateResponse[];
}

interface UpdateResponse extends Update {
  timestamp: number;
}

const normalizeUpdate = (update: UpdateResponse): Update => ({
  id: update.id,
  projectId: update.projectId,
  text: update.text,
  structuredState: update.structuredState ?? null,
  timestamp: update.timestamp,
  tags: update.tags,
  comments: update.comments,
});

const normalizeProject = (project: ProjectResponse): Project => ({
  id: project.id,
  name: project.name,
  goal: project.goal,
  status: project.status,
  updates: Array.isArray(project.updates)
    ? project.updates.map(normalizeUpdate)
    : [],
  currentState: project.currentState ?? null,
  previousState: project.previousState ?? null,
  riskAlerts: project.riskAlerts ?? [],
  initialContext: project.initialContext ?? null,
  shareId: project.shareId,
  isShared: project.isShared,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

export const projectService = {
  async listProjects(): Promise<Project[]> {
    const { projects } = await apiClient.get<ListProjectsResponse>('/api/projects');
    return projects.map(normalizeProject);
  },

  async getProject(projectId: string): Promise<Project> {
    const { project } = await apiClient.get<{ project: ProjectResponse }>(`/api/projects/${projectId}`);
    return normalizeProject(project);
  },

  async createProject(input: ProjectCreationInput): Promise<Project> {
    const payload = {
      name: input.name,
      goal: input.goal,
      status: input.status ?? 'active',
      initialContext: input.documentContent ?? null,
    };
    const { project } = await apiClient.post<{ project: ProjectResponse }>('/api/projects', payload);
    return normalizeProject(project);
  },

  async addUpdate(projectId: string, text: string, structuredState: StructuredState | null): Promise<Update> {
    const { update } = await apiClient.post<{ update: UpdateResponse }>(
      `/api/projects/${projectId}/updates`,
      {
        text,
        structuredState,
      }
    );
    return normalizeUpdate(update);
  },

  async updateProject(projectId: string, changes: Partial<Project>): Promise<Project> {
    const allowedKeys: Array<keyof Project> = ['name', 'goal', 'status', 'currentState', 'initialContext'];
    const payload: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in changes) {
        payload[key] = changes[key];
      }
    }
    const { project } = await apiClient.patch<{ project: ProjectResponse }>(`/api/projects/${projectId}`, payload);
    return normalizeProject(project);
  },

  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`/api/projects/${projectId}`);
  },

  async deleteUpdate(projectId: string, updateId: string): Promise<void> {
    await apiClient.delete(`/api/projects/${projectId}/updates/${updateId}`);
  },
};
