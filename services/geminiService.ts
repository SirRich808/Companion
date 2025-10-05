import { Project, StructuredState, ProjectBriefState, RiskAlert, PortfolioBriefState, TaskItem } from '../types';
import { getSupabaseClient } from './supabaseClient';

const invokeEdgeFunction = async <TPayload, TResult>(name: string, payload: TPayload): Promise<TResult> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke<TResult>(name, {
    body: payload,
  });

  if (error) {
    throw new Error(error.message ?? `Edge function ${name} failed`);
  }

  if (!data) {
    throw new Error(`Edge function ${name} returned no data`);
  }

  return data;
};

export const processUpdate = async (updateText: string, project: Project): Promise<StructuredState> => {
  const result = await invokeEdgeFunction('process-update', { updateText, project });
  const { structuredState } = result as { structuredState?: StructuredState };
  if (!structuredState) {
    throw new Error('process-update response missing structuredState');
  }
  return structuredState;
};

export const generateTags = async (updateText: string): Promise<string[]> => {
  try {
    const result = await invokeEdgeFunction('generate-tags', { updateText });
    return Array.isArray((result as { tags?: string[] }).tags)
      ? (result as { tags: string[] }).tags
      : [];
  } catch (error) {
    console.warn('Failed to generate tags', error);
    return [];
  }
};

export const generateProjectBrief = async (project: Project): Promise<ProjectBriefState> => {
  const result = await invokeEdgeFunction('generate-brief', { project });
  const { brief } = result as { brief?: ProjectBriefState };
  if (!brief) {
    throw new Error('generate-brief response missing brief');
  }
  return brief;
};

export const generatePortfolioBrief = async (projects: Project[]): Promise<PortfolioBriefState> => {
  const result = await invokeEdgeFunction('portfolio-brief', { projects });
  const { brief } = result as { brief?: PortfolioBriefState };
  if (!brief) {
    throw new Error('portfolio-brief response missing brief');
  }
  return brief;
};

export const detectRiskAlerts = (
  previousState: StructuredState | null | undefined,
  currentState: StructuredState
): RiskAlert[] => {
  if (!previousState) {
    return [];
  }

  const alerts: RiskAlert[] = [];
  const now = Date.now();

  const previousBlockers = previousState.blockers?.length ?? 0;
  const currentBlockers = currentState.blockers?.length ?? 0;
  if (currentBlockers > previousBlockers && currentBlockers >= 3) {
    alerts.push({
      type: 'blocker_surge',
      severity: currentBlockers >= 5 ? 'high' : 'medium',
      message: `Blockers increased from ${previousBlockers} to ${currentBlockers}. Prioritise unblocking efforts.`,
      timestamp: now,
    });
  }

  const regressionKeywords = ['struggling', 'stuck', 'frustrated', 'behind', 'delayed', 'problem', 'issue', 'concern'];
  const statusSummary = currentState.statusSummary?.toLowerCase() ?? '';
  if (regressionKeywords.some((keyword) => statusSummary.includes(keyword))) {
    alerts.push({
      type: 'status_regression',
      severity: 'medium',
      message: 'Status summary indicates emerging risks or blockers. Consider pairing or support.',
      timestamp: now,
    });
  }

  const previousInProgress = previousState.inProgress?.length ?? 0;
  const currentInProgress = currentState.inProgress?.length ?? 0;
  const previousCompleted = previousState.completed?.length ?? 0;
  const currentCompleted = currentState.completed?.length ?? 0;

  const progressStalled =
    previousInProgress > 0 &&
    previousInProgress === currentInProgress &&
    previousCompleted === currentCompleted;

  if (progressStalled) {
    alerts.push({
      type: 'stalled_progress',
      severity: 'low',
      message: 'Momentum appears flat. Consider recalibrating scope or unblocking work in progress.',
      timestamp: now,
    });
  }

  return alerts;
};

export const enrichNextActions = async (
  nextActions: string[],
  blockers: string[],
  inProgress: string[]
): Promise<TaskItem[]> => {
  if (nextActions.length === 0) {
    return [];
  }

  // Placeholder enrichment until a dedicated backend endpoint exists.
  void blockers;
  void inProgress;
  return nextActions.map((task) => ({ task, effort: 'medium' as const, dependencies: [] }));
};
