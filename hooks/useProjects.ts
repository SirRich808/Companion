import { useCallback, useEffect, useMemo, useState } from 'react';
import { Project, ProjectCreationInput, StructuredState, Update } from '../types';
import { projectService } from '../services/projectService';

const upsertProject = (projects: Project[], incoming: Project): Project[] => {
  const index = projects.findIndex(project => project.id === incoming.id);
  if (index === -1) {
    return [...projects, incoming];
  }

  const current = projects[index];
  const merged: Project = {
    ...current,
    ...incoming,
    updates:
      incoming.updates && incoming.updates.length > 0
        ? incoming.updates
        : current.updates,
    currentState: incoming.currentState ?? current.currentState,
    previousState: incoming.previousState ?? current.previousState,
    riskAlerts: incoming.riskAlerts ?? current.riskAlerts,
    initialContext:
      incoming.initialContext !== undefined ? incoming.initialContext : current.initialContext,
    createdAt: incoming.createdAt ?? current.createdAt,
    updatedAt: incoming.updatedAt ?? current.updatedAt,
  };

  const next = [...projects];
  next[index] = merged;
  return next;
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const list = await projectService.listProjects();
      setProjects(list);
    } catch (err) {
      console.error('Failed to load projects', err);
      setError('Could not load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const ensureProjectLoaded = useCallback((projectId: string) => {
    projectService
      .getProject(projectId)
      .then(project => {
        setProjects(prev => upsertProject(prev, project));
      })
      .catch(err => {
        console.error('Failed to load project details', err);
        setError('Could not load project details.');
      });
  }, []);

  const setActiveProjectId = useCallback(
    (projectId: string | null) => {
      setActiveProjectIdState(projectId);
      if (projectId) {
        ensureProjectLoaded(projectId);
      }
    },
    [ensureProjectLoaded]
  );

  const createProject = useCallback(
    async (input: ProjectCreationInput): Promise<Project> => {
      const project = await projectService.createProject(input);
      setProjects(prev => upsertProject(prev, project));
      return project;
    },
    []
  );

  const addProjectUpdate = useCallback(
    async (
      projectId: string,
      {
        text,
        structuredState,
        tags,
      }: { text: string; structuredState: StructuredState | null; tags?: string[] }
    ): Promise<Update> => {
      const update = await projectService.addUpdate(projectId, text, structuredState);
      const enrichedUpdate: Update = {
        ...update,
        tags: tags ?? update.tags,
      };
      setProjects(prev =>
        prev.map(project => {
          if (project.id !== projectId) {
            return project;
          }
          const updates = [...(project.updates ?? []), enrichedUpdate];
          return {
            ...project,
            updates,
            currentState: structuredState ?? project.currentState,
            updatedAt: update.timestamp,
          };
        })
      );
      return enrichedUpdate;
    },
    []
  );

  const updateProjectMeta = useCallback(
    async (projectId: string, changes: Partial<Project>) => {
      const project = await projectService.updateProject(projectId, changes);
      setProjects(prev => upsertProject(prev, project));
      return project;
    },
    []
  );

  const refreshProject = useCallback(
    async (projectId: string) => {
      const project = await projectService.getProject(projectId);
      setProjects(prev => upsertProject(prev, project));
      return project;
    },
    []
  );

  const mutateProject = useCallback(
    (projectId: string, updater: (project: Project) => Project) => {
      setProjects(prev => prev.map(project => (project.id === projectId ? updater(project) : project)));
    },
    []
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
      setActiveProjectIdState(prev => (prev === projectId ? null : prev));
    },
    []
  );

  const deleteProjectUpdate = useCallback(
    async (projectId: string, updateId: string) => {
      await projectService.deleteUpdate(projectId, updateId);
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId
            ? {
                ...project,
                updates: project.updates.filter(update => update.id !== updateId),
              }
            : project
        )
      );
    },
    []
  );

  const activeProject = useMemo(
    () => projects.find(project => project.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  return {
    projects,
    activeProject,
    activeProjectId,
    isLoading,
    error,
    setActiveProjectId,
    createProject,
    addProjectUpdate,
    updateProjectMeta,
    refreshProject,
    mutateProject,
    deleteProject,
    deleteProjectUpdate,
    reloadProjects: fetchProjects,
  } as const;
};
