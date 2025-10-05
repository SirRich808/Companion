// Frontend AI Service - All AI processing is done on the backend for security
// This service makes API calls to the backend which handles Gemini API
import { Project, StructuredState, ProjectBriefState, RiskAlert, PortfolioBriefState, TaskItem } from '../types';
import { apiClient } from './apiClient';

// Process update via backend API
export const processUpdate = async (updateText: string, project: Project): Promise<StructuredState> => {
    console.log("Processing update for project:", project.name);
    
    try {
        const response = await apiClient.post<{ structuredState: StructuredState }>(
            '/api/ai/process-update',
            { updateText, project }
        );
        return response.structuredState;
    } catch (error) {
        console.error("Error processing update:", error);
        throw new Error("Failed to process update. Please try again.");
    }
};

// Generate tags via backend API
export const generateTags = async (updateText: string): Promise<string[]> => {
    try {
        const response = await apiClient.post<{ tags: string[] }>(
            '/api/ai/generate-tags',
            { updateText }
        );
        return response.tags;
    } catch (error) {
        console.error("Failed to generate tags:", error);
        return [];
    }
};

export const detectRiskAlerts = (previousState: StructuredState | null | undefined, currentState: StructuredState): RiskAlert[] => {
    const alerts: RiskAlert[] = [];
    const now = Date.now();

    if (!previousState) {
        return alerts;
    }

    // Check for blocker surge
    const prevBlockerCount = previousState.blockers?.length || 0;
    const currBlockerCount = currentState.blockers?.length || 0;
    
    if (currBlockerCount > prevBlockerCount && currBlockerCount >= 3) {
        alerts.push({
            type: 'blocker_surge',
            severity: currBlockerCount >= 5 ? 'high' : 'medium',
            message: `Blockers increased from ${prevBlockerCount} to ${currBlockerCount}. Consider prioritizing unblocking efforts.`,
            timestamp: now
        });
    }

    // Check for status regression (negative sentiment in status summary)
    const regressionKeywords = ['struggling', 'stuck', 'frustrated', 'behind', 'delayed', 'problem', 'issue', 'concern'];
    const hasRegression = regressionKeywords.some(keyword => 
        currentState.statusSummary?.toLowerCase().includes(keyword)
    );
    
    if (hasRegression) {
        alerts.push({
            type: 'status_regression',
            severity: 'medium',
            message: 'Status summary indicates challenges or setbacks. Team support may be needed.',
            timestamp: now
        });
    }

    // Check for stalled progress
    const prevInProgressCount = previousState.inProgress?.length || 0;
    const currInProgressCount = currentState.inProgress?.length || 0;
    const prevCompletedCount = previousState.completed?.length || 0;
    const currCompletedCount = currentState.completed?.length || 0;
    
    if (currInProgressCount === prevInProgressCount && 
        currCompletedCount === prevCompletedCount && 
        prevInProgressCount > 0) {
        alerts.push({
            type: 'stalled_progress',
            severity: 'low',
            message: 'No change in completed or in-progress items. Project may need momentum boost.',
            timestamp: now
        });
    }

    return alerts;
};

// Generate project brief via backend API
export const generateProjectBrief = async (project: Project): Promise<ProjectBriefState> => {
    console.log("Generating project brief for:", project.name);
    
    try {
        const response = await apiClient.post<{ brief: ProjectBriefState }>(
            '/api/ai/generate-brief',
            { project }
        );
        return response.brief;
    } catch (error) {
        console.error("Error generating project brief:", error);
        throw new Error("Failed to generate project brief.");
    }
};

// Generate portfolio brief via backend API
export const generatePortfolioBrief = async (projects: Project[]): Promise<PortfolioBriefState> => {
    console.log("Generating portfolio brief for", projects.length, "projects");
    
    try {
        const response = await apiClient.post<{ brief: PortfolioBriefState }>(
            '/api/ai/portfolio-brief',
            { projects }
        );
        return response.brief;
    } catch (error) {
        console.error("Error generating portfolio brief:", error);
        throw new Error("Failed to generate portfolio brief.");
    }
};

// Enrich next actions - returns fallback for now (can be added to backend if needed)
export const enrichNextActions = async (
    nextActions: string[],
    blockers: string[],
    inProgress: string[]
): Promise<TaskItem[]> => {
    if (nextActions.length === 0) return [];
    
    // For now, return fallback - can be added to backend API if needed
    return nextActions.map(task => ({ task, effort: 'medium' as const, dependencies: [] }));
};
