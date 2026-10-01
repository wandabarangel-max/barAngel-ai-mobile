import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import { v4 as uuid } from 'uuid';
import { evaluateTaskRequest } from './policy.js';
import { store, addEvent } from './store.js';
import type { Agent, Device, Task, User } from './types.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'barAngel AI platform backend', timestamp: new Date().toISOString() });
});

app.get('/users', (_req: Request, res: Response) => {
  res.json({ users: store.users });
});

app.post('/users', (req: Request, res: Response) => {
  const { name, email, role = 'user' } = req.body as Partial<User>;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const user: User = {
    id: uuid(),
    name,
    email,
    role,
    credits: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scopes: ['mobile', 'web', 'task-queue']
  };

  store.users.push(user);
  addEvent('user', user.id, 'created', `User ${user.name} was created`);

  return res.status(201).json({ user });
});

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

app.get('/events', (_req: Request, res: Response) => {
  res.json({ events: store.events });
});

app.listen(PORT, () => {
  console.log(`barAngel platform backend running on http://localhost:${PORT}`);
});
