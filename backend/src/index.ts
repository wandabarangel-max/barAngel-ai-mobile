import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import { v4 as uuid } from 'uuid';
import { evaluateTaskRequest } from './policy.js';
import { store, addEvent } from './store.js';
import { generateVideo, generateCourse, getMediaTasks, getMediaTaskById, executeMediaTask } from './routes/mediaRoutes.js';
import { createFilmProject, addSceneToFilm, castAIActor, generateSceneVideo, getFilmProjects, getFilmProject } from './routes/filmRoutes.js';
import { createCourse, addModuleToCourse, addLessonToModule, generateCourseVideo, getCourses, getCourse } from './routes/courseRoutes.js';
import { searchWebContent, indexLibraryContent, getLibraryItems, searchLibrary } from './routes/libraryRoutes.js';
import { createUserProfile, getUserProfile, updateUserProfile, generateBrandingAssets, getAllUsers } from './routes/userRoutes.js';
import type { Agent, Device, Task, User } from './types.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'barAngel AI platform backend', timestamp: new Date().toISOString() });
});

// ============ USER & PROFILE ENDPOINTS ============
app.get('/users', getAllUsers);
app.post('/users', createUserProfile);
app.get('/users/:userId', getUserProfile);
app.put('/users/:userId', updateUserProfile);
app.post('/users/:userId/branding', generateBrandingAssets);

// ============ AGENT ENDPOINTS ============
app.get('/agents', (_req: Request, res: Response) => {
  res.json({ agents: store.agents });
});

app.post('/agents', (req: Request, res: Response) => {
  const { name, type, capabilities = [], ownerId, model = 'general' } = req.body as Partial<Agent>;

  if (!name || !type || !ownerId) {
    return res.status(400).json({ error: 'name, type, and ownerId are required' });
  }

  const agent: Agent = {
    id: uuid(),
    name,
    type,
    capabilities,
    ownerId,
    model,
    status: 'online',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    permissions: ['read:tasks', 'write:log']
  };

  store.agents.push(agent);
  addEvent('agent', agent.id, 'created', `Agent ${agent.name} registered`);

  return res.status(201).json({ agent });
});

// ============ TASK ENDPOINTS ============
app.get('/tasks', (_req: Request, res: Response) => {
  res.json({ tasks: store.tasks });
});

app.post('/tasks', (req: Request, res: Response) => {
  const { title, description, userId, type = 'general', priority = 'normal' } = req.body as Partial<Task>;

  if (!title || !description || !userId) {
    return res.status(400).json({ error: 'title, description, and userId are required' });
  }

  const task: Task = {
    id: uuid(),
    title,
    description,
    userId,
    status: 'queued',
    type,
    priority,
    retries: 0,
    inputs: req.body.inputs || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    failureReason: null,
    output: null
  };

  store.tasks.push(task);
  addEvent('task', task.id, 'queued', `Task ${task.title} queued for processing`);

  return res.status(201).json({ task });
});

app.post('/tasks/:taskId/execute', (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { agentId } = req.body as { agentId?: string };

  const task = store.tasks.find((entry) => entry.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'task not found' });
  }

  const agent = agentId ? store.agents.find((entry) => entry.id === agentId) : store.agents[0];

  if (!agent) {
    return res.status(400).json({ error: 'no agent available for this task' });
  }

  const decision = evaluateTaskRequest(task, agent);

  task.assignedAgentId = agent.id;
  task.updatedAt = new Date().toISOString();

  if (!decision.allowed) {
    task.status = 'failed';
    task.failureReason = decision.reason;
    task.output = {
      allowed: false,
      suggestion: decision.suggestion,
      agent: agent.name
    };

    addEvent('task', task.id, 'failed', decision.reason);
    return res.status(400).json({ task, decision });
  }

  task.status = 'completed';
  task.output = {
    allowed: true,
    summary: `Task "${task.title}" was attempted by ${agent.name}.`,
    agent: agent.name,
    nextAction: decision.suggestion || 'Task completed successfully.'
  };

  addEvent('task', task.id, 'completed', `Task ${task.title} completed by ${agent.name}`);

  return res.json({ task, decision });
});

// ============ DEVICE ENDPOINTS ============
app.get('/devices', (_req: Request, res: Response) => {
  res.json({ devices: store.devices });
});

app.post('/devices', (req: Request, res: Response) => {
  const { name, type, ownerId, status = 'offline' } = req.body as Partial<Device>;

  if (!name || !type || !ownerId) {
    return res.status(400).json({ error: 'name, type, and ownerId are required' });
  }

  const device: Device = {
    id: uuid(),
    name,
    type,
    ownerId,
    status,
    permissions: ['read:workspace', 'write:logs'],
    metadata: {
      runtime: 'cloud',
      createdBy: 'barAngel platform'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.devices.push(device);
  addEvent('device', device.id, 'created', `Virtual device ${device.name} registered`);

  return res.status(201).json({ device });
});

// ============ MEDIA GENERATION ENDPOINTS ============
app.post('/media/video/generate', generateVideo);
app.get('/media/video', getMediaTasks);
app.get('/media/video/:taskId', getMediaTaskById);
app.post('/media/video/:taskId/execute', executeMediaTask);

// ============ FILM STUDIO ENDPOINTS ============
app.post('/films', createFilmProject);
app.get('/films', getFilmProjects);
app.get('/films/:filmId', getFilmProject);
app.post('/films/:filmId/scenes', addSceneToFilm);
app.post('/films/:filmId/actors', castAIActor);
app.post('/films/:filmId/scenes/:sceneId/generate', generateSceneVideo);

// ============ COURSE ENDPOINTS ============
app.post('/courses', createCourse);
app.get('/courses', getCourses);
app.get('/courses/:courseId', getCourse);
app.post('/courses/:courseId/modules', addModuleToCourse);
app.post('/courses/:courseId/modules/:moduleId/lessons', addLessonToModule);
app.post('/courses/:courseId/modules/:moduleId/lessons/:lessonId/video', generateCourseVideo);
app.post('/media/course/generate', generateCourse);

// ============ LIBRARY ENDPOINTS ============
app.post('/library/search', searchWebContent);
app.post('/library/index', indexLibraryContent);
app.get('/library', getLibraryItems);
app.post('/library/search-local', searchLibrary);

// ============ EVENTS ENDPOINTS ============
app.get('/events', (_req: Request, res: Response) => {
  res.json({ events: store.events });
});

app.listen(PORT, () => {
  console.log(`\n🤖 barAngel AI Platform Backend`);
  console.log(`📋 Running on http://localhost:${PORT}`);
  console.log(`\n✅ Core endpoints ready:`);
  console.log(`   - POST /users (create profile)`);
  console.log(`   - PUT /users/:userId (update profile)`);
  console.log(`   - POST /users/:userId/branding (generate branding)`);
  console.log(`   - POST /agents (register agents)`);
  console.log(`   - POST /tasks (create tasks)`);
  console.log(`   - POST /devices (create virtual devices)`);
  console.log(`   - POST /media/video/generate (video generation)`);
  console.log(`   - POST /films (create film projects)`);
  console.log(`   - POST /films/:filmId/scenes (add scenes)`);
  console.log(`   - POST /films/:filmId/actors (cast AI actors)`);
  console.log(`   - POST /films/:filmId/scenes/:sceneId/generate (generate scene video)`);
  console.log(`   - POST /courses (create courses)`);
  console.log(`   - POST /courses/:courseId/modules (add modules)`);
  console.log(`   - POST /courses/:courseId/modules/:moduleId/lessons (add lessons)`);
  console.log(`   - POST /courses/:courseId/modules/:moduleId/lessons/:lessonId/video (generate lesson video)`);
  console.log(`   - POST /media/course/generate (generate course)`);
  console.log(`   - POST /library/search (web search)`);
  console.log(`   - POST /library/index (index content)`);
  console.log(`   - GET /library (browse library)`);
  console.log(`   - POST /library/search-local (search library)`);
  console.log(`\n`);
});
