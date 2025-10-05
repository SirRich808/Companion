import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Project, StructuredState, ProjectBriefState, RiskAlert, PortfolioBriefState, TaskItem } from '../types';

const resolveApiKey = (): string | undefined => {
    const metaEnv =
        typeof import.meta !== 'undefined'
            ? ((import.meta as unknown as { env?: Record<string, string> }).env ?? {})
            : {};

    return (
        metaEnv.VITE_GEMINI_API_KEY ||
        metaEnv.GEMINI_API_KEY ||
        process.env.VITE_GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.API_KEY
    );
};

const apiKey = resolveApiKey();

if (!apiKey) {
    throw new Error(
        "Missing Gemini API key. Please set VITE_GEMINI_API_KEY (recommended) or GEMINI_API_KEY/API_KEY in your environment."
    );
}

const ai = new GoogleGenAI({ apiKey });

const systemInstruction = `You are the AI engine for 'Project Companion', a tool that helps users process their thoughts and manage projects. Your role is to act as a brilliant, empathetic project manager.
        When you receive a user's text update, your task is to analyze it and return a structured JSON object. DO NOT add any markdown or other text outside the JSON object.
        The user's update is a stream of consciousness. You must intelligently parse it and categorize the information into the predefined JSON schema.
        Pay close attention to the user's tone and emotional state (frustration, excitement, confusion) and reflect that in the 'emotionalFeedback' field.
        Your goal is to transform raw, unstructured thought into a clean, actionable project status.
        `;

const structureSchema = {
    type: Type.OBJECT,
    properties: {
        statusSummary: { type: Type.STRING, description: "A concise, 2-3 sentence summary of the project's current state based on this update." },
        completed: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of tasks or items that were just completed." },
        inProgress: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of tasks currently being worked on." },
        blockers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of impediments or things the user is waiting on." },
        ideasCaptured: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of new ideas, possibilities, or future thoughts." },
        decisionsMade: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific decisions that were just made." },
        nextActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A prioritized list of concrete next steps or to-dos." },
        clarifyingQuestion: { type: Type.STRING, description: "One insightful question to prompt the user for clarity. E.g., 'You mentioned needing a designer - should I add ‘find designer’ to blockers?'" },
        emotionalFeedback: { type: Type.STRING, description: "A short, empathetic comment reflecting the user's tone. E.g., 'It sounds like you had a major breakthrough!' or 'This sounds frustrating, but you're making progress.'" }
    },
    required: ["statusSummary", "completed", "inProgress", "blockers", "ideasCaptured", "decisionsMade", "nextActions", "clarifyingQuestion", "emotionalFeedback"]
};

export const processUpdate = async (updateText: string, project: Project): Promise<StructuredState> => {
    console.log("Processing update for project:", project.name);

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Here is the original project goal for context: "${project.goal}".${project.initialContext ? `\n\nHere is some initial documentation for context:\n${project.initialContext}` : ''}\n\nNow, here is my latest project update: "${updateText}"`,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: structureSchema,
                }
            });
            
            const jsonText = response.text;
            return JSON.parse(jsonText) as StructuredState;

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            attempts++;
            if (attempts < maxAttempts) {
                const delay = Math.pow(2, attempts) * 100;
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw new Error("Failed to process update after multiple attempts.");
            }
        }
    }
    throw new Error("Failed to process update."); // Should not be reached
};

// --- New Function for Project Brief ---

const briefSystemInstruction = `You are an expert project analyst. Your task is to synthesize all available information about a project—including its goal, initial documentation, and a complete timeline of updates—into a single, professionally formatted project brief. The brief should be clear, concise, and strategic, providing a high-level overview suitable for stakeholders. Your output must be a JSON object conforming to the specified schema. Do not include any text outside the JSON object.`;

const briefSchema = {
    type: Type.OBJECT,
    properties: {
        projectName: { type: Type.STRING, description: "The official name of the project." },
        projectGoal: { type: Type.STRING, description: "The primary goal or objective of the project." },
        executiveSummary: { type: Type.STRING, description: "A 3-4 sentence high-level overview of the project's current status, key progress, and strategic outlook." },
        keyAccomplishments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A bulleted list of the most significant milestones, completed tasks, and major breakthroughs." },
        currentFocus: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A bulleted list of tasks and initiatives that are currently in progress." },
        identifiedRisksAndBlockers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A bulleted list of current challenges, impediments, and potential risks to the project's success." },
        strategicRecommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A bulleted list of prioritized, actionable next steps and strategic suggestions to move the project forward." },
        openQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A bulleted list of key questions or points that require clarification or decisions." },
    },
    required: ["projectName", "projectGoal", "executiveSummary", "keyAccomplishments", "currentFocus", "identifiedRisksAndBlockers", "strategicRecommendations", "openQuestions"]
};

export const generateTags = async (updateText: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this project update and generate 2-4 concise, relevant tags (single words or short phrases like "hiring", "launch", "design", "technical", "blocked", "milestone", "research", "meeting", etc.) that categorize the main themes or topics. Return ONLY a JSON array of tag strings, nothing else.\n\nUpdate: "${updateText}"`,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        const tags = JSON.parse(response.text);
        return Array.isArray(tags) ? tags.slice(0, 4) : [];
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

export const generateProjectBrief = async (project: Project): Promise<ProjectBriefState> => {
    console.log("Generating project brief for:", project.name);

    const fullHistory = `
        Project Name: ${project.name}
        Primary Goal: ${project.goal}

        ${project.initialContext ? `Initial Documentation:\n---\n${project.initialContext}\n---\n` : ''}

        Timeline of Updates (from oldest to newest):
        ---
        ${project.updates.map(u => `[${new Date(u.timestamp).toLocaleString()}] - ${u.text}`).join('\n\n')}
        ---

        Please generate the comprehensive project brief based on all the information provided above.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullHistory,
            config: {
                systemInstruction: briefSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: briefSchema,
            }
        });

        const jsonText = response.text;
        return JSON.parse(jsonText) as ProjectBriefState;

    } catch (error) {
        console.error("Error calling Gemini API for project brief:", error);
        throw new Error("Failed to generate project brief.");
    }
};

// --- Portfolio Brief Generator ---

const portfolioBriefSchema = {
    type: Type.OBJECT,
    properties: {
        portfolioSummary: { type: Type.STRING, description: "A 3-4 sentence executive summary of all active projects and their collective status." },
        overallHealth: { type: Type.STRING, description: "Overall portfolio health rating", enum: ["excellent", "good", "needs-attention", "critical"] },
        activeProjectCount: { type: Type.NUMBER, description: "Number of active projects" },
        totalUpdatesThisWeek: { type: Type.NUMBER, description: "Total updates across all projects in the last 7 days" },
        projectHighlights: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    projectName: { type: Type.STRING },
                    status: { type: Type.STRING },
                    keyUpdate: { type: Type.STRING }
                }
            },
            description: "Brief highlights for each project"
        },
        crossProjectRisks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Risks or dependencies that span multiple projects" },
        strategicPriorities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3-5 strategic priorities across the portfolio" },
        weeklyMetrics: {
            type: Type.OBJECT,
            properties: {
                completionRate: { type: Type.NUMBER, description: "Percentage of completed vs total items" },
                activeBlockers: { type: Type.NUMBER, description: "Total active blockers across all projects" },
                momentum: { type: Type.STRING, enum: ["accelerating", "steady", "slowing"] }
            }
        }
    },
    required: ["portfolioSummary", "overallHealth", "activeProjectCount", "totalUpdatesThisWeek", "projectHighlights", "crossProjectRisks", "strategicPriorities", "weeklyMetrics"]
};

export const generatePortfolioBrief = async (projects: Project[]): Promise<PortfolioBriefState> => {
    console.log("Generating portfolio brief for", projects.length, "projects");

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const portfolioContext = projects.map(p => {
        const recentUpdates = p.updates.filter(u => u.timestamp > sevenDaysAgo);
        return `
Project: ${p.name}
Goal: ${p.goal}
Status: ${p.status}
Recent Updates (last 7 days): ${recentUpdates.length}
Current State: ${p.currentState?.statusSummary || 'Not yet available'}
Completed Items: ${p.currentState?.completed?.length || 0}
In Progress: ${p.currentState?.inProgress?.length || 0}
Blockers: ${p.currentState?.blockers?.length || 0}
Latest Update: ${p.updates.length > 0 ? p.updates[p.updates.length - 1].text.substring(0, 200) : 'No updates yet'}
---
        `;
    }).join('\n');

    const prompt = `You are a strategic portfolio analyst. Analyze the following portfolio of projects and generate a comprehensive weekly executive digest.

${portfolioContext}

Generate a portfolio brief that provides a high-level strategic view of all projects, highlighting key wins, risks, and priorities for leadership.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert portfolio analyst providing strategic insights to executive leadership.",
                responseMimeType: "application/json",
                responseSchema: portfolioBriefSchema,
            }
        });

        return JSON.parse(response.text) as PortfolioBriefState;
    } catch (error) {
        console.error("Error generating portfolio brief:", error);
        throw new Error("Failed to generate portfolio brief.");
    }
};

// --- Enrich Next Actions with Effort and Dependencies ---

export const enrichNextActions = async (
    nextActions: string[],
    blockers: string[],
    inProgress: string[]
): Promise<TaskItem[]> => {
    if (nextActions.length === 0) return [];

    try {
        const prompt = `Analyze these next actions and provide effort estimates (low/medium/high) and identify dependencies on blockers or in-progress items.

Next Actions:
${nextActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

Current Blockers:
${blockers.map((b, i) => `${i + 1}. ${b}`).join('\n')}

In Progress:
${inProgress.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Return a JSON array where each item has:
- task: the next action text
- effort: "low" (< 2 hours), "medium" (2-8 hours), or "high" (> 8 hours)
- dependencies: array of strings from blockers or in-progress items that must be completed first (can be empty array)

Example:
[
  {
    "task": "Design landing page",
    "effort": "medium",
    "dependencies": []
  },
  {
    "task": "Deploy to production",
    "effort": "low",
    "dependencies": ["Complete testing"]
  }
]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const enriched = JSON.parse(response.text);
        return Array.isArray(enriched) ? enriched : [];
    } catch (error) {
        console.error("Failed to enrich next actions:", error);
        // Return fallback with just tasks
        return nextActions.map(task => ({ task, effort: 'medium' as const, dependencies: [] }));
    }
};
