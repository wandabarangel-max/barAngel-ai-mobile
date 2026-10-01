export type TaskType = 'general' | 'coding' | 'research' | 'media' | 'marketing' | 'social' | 'finance';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'queued' | 'assigned' | 'executing' | 'completed' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'operator';
  credits: number;
  scopes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  ownerId: string;
  model: string;
  status: 'online' | 'offline' | 'busy';
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  userId: string;
  status: TaskStatus;
  type: TaskType;
  priority: TaskPriority;
  assignedAgentId?: string;
  retries: number;
  inputs: Record<string, unknown>;
  output: Record<string, unknown> | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'computer' | 'phone' | 'wallet' | 'game' | 'library' | 'home' | 'city' | 'other';
  ownerId: string;
  status: 'online' | 'offline' | 'busy';
  permissions: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Integration {
  id: string;
  platform: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  scopes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventLog {
  id: string;
  entityType: string;
  entityId: string;
  eventType: string;
  message: string;
  createdAt: string;
}
