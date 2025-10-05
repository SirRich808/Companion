import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `You are the AI engine for 'Project Companion', a tool that helps users process their thoughts and manage projects. Your role is to act as a brilliant, empathetic project manager.
When you receive a user's text update, your task is to analyze it and return a structured JSON object. DO NOT add any markdown or other text outside the JSON object.
The user's update is a stream of consciousness. You must intelligently parse it and categorize the information into the predefined JSON schema.
Pay close attention to the user's tone and emotional state (frustration, excitement, confusion) and reflect that in the 'emotionalFeedback' field.
Your goal is to transform raw, unstructured thought into a clean, actionable project status.`;

export async function processUpdate(updateText, project) {
  const prompt = `Project Name: ${project.name}
Project Goal: ${project.goal}

Previous State:
${JSON.stringify(project.currentState || {}, null, 2)}

New Update from User:
${updateText}

Analyze this update and return structured JSON with: statusSummary, completed, inProgress, blockers, ideasCaptured, decisionsMade, nextActions, clarifyingQuestion, emotionalFeedback.`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(result.text);
}

export async function generateProjectBrief(project) {
  const prompt = `Generate a comprehensive project brief for:
  
Project: ${project.name}
Goal: ${project.goal}

Current State:
${JSON.stringify(project.currentState || {}, null, 2)}

Updates History:
${project.updates.map(u => `- ${new Date(u.timestamp).toLocaleDateString()}: ${u.text}`).join('\n')}

Provide JSON with: executiveSummary, currentPhase, keyAccomplishments, upcomingMilestones, risks, and recommendations.`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(result.text);
}

export async function generateTags(updateText) {
  const prompt = `Extract 3-5 relevant tags/keywords from this project update:

"${updateText}"

Return JSON with a "tags" array of lowercase, single words or short phrases (max 2 words).`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  const parsed = JSON.parse(result.text);
  return parsed.tags || [];
}

export async function generatePortfolioBrief(projects) {
  const projectSummaries = projects.map(p => ({
    name: p.name,
    goal: p.goal,
    status: p.currentState?.statusSummary || 'No updates yet',
    blockers: p.currentState?.blockers?.length || 0,
    completed: p.currentState?.completed?.length || 0
  }));

  const prompt = `Analyze this portfolio of ${projects.length} projects and provide strategic insights:

${JSON.stringify(projectSummaries, null, 2)}

Return JSON with: overallHealth, totalProjects, projectsOnTrack, projectsAtRisk, keyInsights, crossProjectSynergies, resourceAllocationSuggestions, and portfolioTrends.`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(result.text);
}
