import type { Agent, Device, EventLog, Task, User, MediaTask, CourseGenerationTask, FilmProject, Course } from './types.js';

export const store = {
  users: [] as User[],
  agents: [] as Agent[],
  tasks: [] as Task[],
  mediaTasks: [] as MediaTask[],
  courseGenerationTasks: [] as CourseGenerationTask[],
  filmProjects: [] as FilmProject[],
  courses: [] as Course[],
  devices: [] as Device[],
  integrations: [] as any[],
  libraryItems: [] as any[],
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
