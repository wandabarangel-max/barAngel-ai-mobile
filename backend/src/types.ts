export type TaskType = 'general' | 'coding' | 'research' | 'media' | 'marketing' | 'social' | 'finance';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'queued' | 'assigned' | 'executing' | 'completed' | 'failed';
export type MediaType = 'video' | 'image' | 'audio' | 'course' | 'film';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'operator';
  credits: number;
  scopes: string[];
  profileImage?: string;
  signature?: string;
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

export interface MediaTask extends Task {
  type: 'media';
  mediaType: MediaType;
  mediaParams: Record<string, unknown>;
  outputUrl?: string;
  duration?: number;
}

export interface VideoGenerationTask extends MediaTask {
  mediaType: 'video';
  mediaParams: {
    prompt: string;
    duration: number;
    style: string;
    model: string;
    aspectRatio?: string;
    fps?: number;
  };
}

export interface CourseGenerationTask extends MediaTask {
  mediaType: 'course';
  mediaParams: {
    topic: string;
    level: string;
    videoFormat: boolean;
    generateWorksheets: boolean;
    generateQuizzes: boolean;
    modules?: number;
  };
}

export interface FilmProject {
  id: string;
  title: string;
  synopsis: string;
  directorStyle: string;
  userId: string;
  scenes: FilmScene[];
  actors: AIActor[];
  status: 'draft' | 'in-production' | 'completed';
  metadata: {
    budget?: number;
    runtime?: number;
    targetAudience?: string;
    aiModels?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface FilmScene {
  id: string;
  title: string;
  description: string;
  sceneNumber: number;
  duration: number;
  status: 'draft' | 'generating' | 'generated' | 'reviewed' | 'finalized';
  generatedVideo?: string;
  script?: string;
  cameraDirection?: string;
}

export interface AIActor {
  id: string;
  name: string;
  personality: string;
  appearance: string;
  voice: string;
  scenes: string[];
}

export interface Course {
  id: string;
  title: string;
  topic: string;
  level: string;
  userId: string;
  modules: CourseModule[];
  generatedContent: boolean;
  metadata: {
    duration?: number;
    studentsEnrolled?: number;
    rating?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  lessons: CourseLesson[];
  videoGenerated?: boolean;
}

export interface CourseLesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  worksheet?: string;
  quiz?: CourseQuiz;
  resources?: string[];
}

export interface CourseQuiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
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

export interface LibraryItem {
  id: string;
  title: string;
  type: 'book' | 'course' | 'video' | 'article' | 'research';
  author?: string;
  content: string;
  tags: string[];
  indexed: boolean;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance: number;
}
