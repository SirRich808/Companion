export interface ProjectBriefState {
    projectName: string;
    projectGoal: string;
    executiveSummary: string;
    keyAccomplishments: string[];
    currentFocus: string[];
    identifiedRisksAndBlockers: string[];
    strategicRecommendations: string[];
    openQuestions: string[];
}

export interface PortfolioBriefState {
    portfolioSummary: string;
    overallHealth: 'excellent' | 'good' | 'needs-attention' | 'critical';
    activeProjectCount: number;
    totalUpdatesThisWeek: number;
    projectHighlights: Array<{
        projectName: string;
        status: string;
        keyUpdate: string;
    }>;
    crossProjectRisks: string[];
    strategicPriorities: string[];
    weeklyMetrics: {
        completionRate: number;
        activeBlockers: number;
        momentum: 'accelerating' | 'steady' | 'slowing';
    };
}


export interface TaskItem {
    task: string;
    effort?: 'low' | 'medium' | 'high';
    dependencies?: string[];
}

export interface StructuredState {
    statusSummary: string;
    completed: string[];
    inProgress: string[];
    blockers: string[];
    ideasCaptured: string[];
    decisionsMade: string[];
    nextActions: string[] | TaskItem[];
    clarifyingQuestion: string;
    emotionalFeedback: string;
}

export interface Comment {
    id: string;
    author: string;
    text: string;
    timestamp: number;
}

export interface Update {
    id?: string;
    projectId?: string;
    text: string;
    structuredState?: StructuredState | null;
    timestamp: number;
    tags?: string[];
    comments?: Comment[];
}

export interface ProjectCreationInput {
    name: string;
    goal: string;
    documentContent?: string;
    status?: 'active' | 'paused';
}

export interface RiskAlert {
    type: 'blocker_surge' | 'status_regression' | 'stalled_progress';
    severity: 'high' | 'medium' | 'low';
    message: string;
    timestamp: number;
}

export interface Project {
    id: string;
    name: string;
    goal: string;
    status: 'active' | 'paused';
    updates: Update[];
    currentState: StructuredState | null;
    previousState?: StructuredState | null;
    riskAlerts?: RiskAlert[];
    initialContext?: string | null;
    shareId?: string;
    isShared?: boolean;
    createdAt?: number;
    updatedAt?: number;
}
