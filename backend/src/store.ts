import type { Agent, Device, EventLog, Task, User } from './types.js';

export const store = {
  users: [] as User[],
  agents: [] as Agent[],
  tasks: [] as Task[],
  devices: [] as Device[],
  integrations: [] as any[],
  events: [] as EventLog[]
};

export function addEvent(entityType: string, entityId: string, eventType: string, message: string) {
  store.events.push({
    id: crypto.randomUUID(),
    entityType,
    entityId,
    eventType,
    message,
    createdAt: new Date().toISOString()
  });
}
