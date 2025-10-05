import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import {
  ensureHealthyConnection,
} from './db.js';
import {
  listProjects,
  createProject,
  getProjectById,
  addProjectUpdate,
  updateProjectMeta,
  deleteProject,
} from './projectRepository.js';
import * as geminiService from './geminiService.js';

dotenv.config({ path: '.env.local' });
if (!process.env.SUPABASE_DB_URL) {
  throw new Error('SUPABASE_DB_URL is not defined. Update .env.local before starting the server.');
}

// Initialize Supabase client for auth verification
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Middleware to verify JWT and extract user
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      req.user = null;
    } else {
      req.user = user;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.user = null;
  }
  
  next();
};

const app = express();
const port = Number(process.env.SERVER_PORT ?? 4000);

const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(authMiddleware);

app.get('/api/health', async (_req, res) => {
  try {
    await ensureHealthyConnection();
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Health check failed', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const projects = await listProjects(userId);
    res.json({ projects });
  } catch (error) {
    console.error('Failed to list projects', error);
    res.status(500).json({ message: 'Unable to fetch projects' });
  }
});

app.post('/api/projects', async (req, res) => {
  const { name, goal, status, initialContext, currentState } = req.body ?? {};

  if (!name || !goal) {
    return res.status(400).json({ message: 'Name and goal are required.' });
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const project = await createProject({ name, goal, status, initialContext, currentState, userId: req.user.id });
    res.status(201).json({ project });
  } catch (error) {
    console.error('Failed to create project', error);
    res.status(500).json({ message: 'Unable to create project' });
  }
});

app.get('/api/projects/:projectId', async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const project = await getProjectById(req.params.projectId, userId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ project });
  } catch (error) {
    console.error('Failed to fetch project', error);
    res.status(500).json({ message: 'Unable to fetch project' });
  }
});

app.post('/api/projects/:projectId/updates', async (req, res) => {
  const { text, structuredState } = req.body ?? {};
  if (!text) {
    return res.status(400).json({ message: 'Update text is required.' });
  }
  try {
    const update = await addProjectUpdate(req.params.projectId, { text, structuredState });
    res.status(201).json({ update });
  } catch (error) {
    console.error('Failed to add project update', error);
    res.status(500).json({ message: 'Unable to add update' });
  }
});

app.patch('/api/projects/:projectId', async (req, res) => {
  try {
    const project = await updateProjectMeta(req.params.projectId, req.body ?? {});
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ project });
  } catch (error) {
    console.error('Failed to update project', error);
    res.status(500).json({ message: 'Unable to update project' });
  }
});

app.delete('/api/projects/:projectId', async (req, res) => {
  try {
    await deleteProject(req.params.projectId);
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete project', error);
    res.status(500).json({ message: 'Unable to delete project' });
  }
});

// AI Processing Endpoints
app.post('/api/ai/process-update', async (req, res) => {
  const { updateText, project } = req.body;
  
  if (!updateText || !project) {
    return res.status(400).json({ message: 'updateText and project are required' });
  }

  try {
    const structuredState = await geminiService.processUpdate(updateText, project);
    res.json({ structuredState });
  } catch (error) {
    console.error('AI processing failed:', error);
    res.status(500).json({ message: 'Failed to process update with AI' });
  }
});

app.post('/api/ai/generate-brief', async (req, res) => {
  const { project } = req.body;
  
  if (!project) {
    return res.status(400).json({ message: 'project is required' });
  }

  try {
    const brief = await geminiService.generateProjectBrief(project);
    res.json({ brief });
  } catch (error) {
    console.error('Brief generation failed:', error);
    res.status(500).json({ message: 'Failed to generate project brief' });
  }
});

app.post('/api/ai/generate-tags', async (req, res) => {
  const { updateText } = req.body;
  
  if (!updateText) {
    return res.status(400).json({ message: 'updateText is required' });
  }

  try {
    const tags = await geminiService.generateTags(updateText);
    res.json({ tags });
  } catch (error) {
    console.error('Tag generation failed:', error);
    res.status(500).json({ message: 'Failed to generate tags' });
  }
});

app.post('/api/ai/portfolio-brief', async (req, res) => {
  const { projects } = req.body;
  
  if (!projects || !Array.isArray(projects)) {
    return res.status(400).json({ message: 'projects array is required' });
  }

  try {
    const brief = await geminiService.generatePortfolioBrief(projects);
    res.json({ brief });
  } catch (error) {
    console.error('Portfolio brief generation failed:', error);
    res.status(500).json({ message: 'Failed to generate portfolio brief' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(port, () => {
  console.log(`Project Companion API listening on http://localhost:${port}`);
});
