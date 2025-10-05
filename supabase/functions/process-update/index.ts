import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { updateText, project } = await req.json();

    if (!updateText || !project) {
      return new Response(
        JSON.stringify({ error: 'updateText and project are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an AI project manager. Analyze this update and return ONLY valid JSON.

Project: ${project.name}
Goal: ${project.goal}
Previous State: ${JSON.stringify(project.currentState || {})}

User Update: "${updateText}"

Return JSON with these exact fields:
- statusSummary: string (2-3 sentences)
- completed: string[] (finished tasks)
- inProgress: string[] (current tasks)
- blockers: string[] (impediments)
- ideasCaptured: string[] (new ideas)
- decisionsMade: string[] (decisions)
- nextActions: string[] (prioritized next steps)
- clarifyingQuestion: string (one insightful question)
- emotionalFeedback: string (empathetic comment on user's tone)`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean markdown formatting if present
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const structuredState = JSON.parse(jsonText);

    return new Response(
      JSON.stringify({ structuredState }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing update:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
