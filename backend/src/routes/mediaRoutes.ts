import type { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { store, addEvent } from '../store.js';
import type { VideoGenerationTask, CourseGenerationTask } from '../types.js';

export function generateVideo(req: Request, res: Response) {
  const { title, prompt, duration = 30, style = 'cinematic', userId, aspectRatio = '16:9' } = req.body as {
    title?: string;
    prompt?: string;
    duration?: number;
    style?: string;
    userId?: string;
    aspectRatio?: string;
  };

  if (!title || !prompt || !userId) {
    return res.status(400).json({ error: 'title, prompt, and userId are required' });
  }

  // Validate inputs
  if (duration > 600) {
    return res.status(400).json({
      error: 'Video duration exceeds limit',
      reason: 'Maximum video duration is 600 seconds (10 minutes)',
      suggestion: 'Try breaking the video into smaller segments or reduce the duration'
    });
  }

  const videoTask: VideoGenerationTask = {
    id: uuid(),
    title,
    description: `Generate video: ${prompt}`,
    userId,
    status: 'queued',
    type: 'media',
    mediaType: 'video',
    priority: 'normal',
    mediaParams: {
      prompt,
      duration,
      style,
      model: 'diffusion-xl-video',
      aspectRatio,
      fps: 30
    },
    retries: 0,
    inputs: { prompt, duration, style, aspectRatio },
    output: null,
    failureReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.mediaTasks.push(videoTask);
  addEvent('media', videoTask.id, 'video-queued', `Video generation queued: ${title}`);

  return res.status(201).json({ videoTask });
}

export function generateCourse(req: Request, res: Response) {
  const { title, topic, level = 'intermediate', modules = 5, userId, generateWorksheets = true, generateQuizzes = true } = req.body as {
    title?: string;
    topic?: string;
    level?: string;
    modules?: number;
    userId?: string;
    generateWorksheets?: boolean;
    generateQuizzes?: boolean;
  };

  if (!title || !topic || !userId) {
    return res.status(400).json({ error: 'title, topic, and userId are required' });
  }

  // Validate inputs
  if (modules > 50) {
    return res.status(400).json({
      error: 'Too many modules requested',
      reason: 'Maximum modules per course is 50',
      suggestion: 'Reduce the number of modules or create multiple courses'
    });
  }

  const courseTask: CourseGenerationTask = {
    id: uuid(),
    title,
    description: `Generate ${level} course on ${topic}`,
    userId,
    status: 'queued',
    type: 'media',
    mediaType: 'course',
    priority: 'normal',
    mediaParams: {
      topic,
      level,
      videoFormat: true,
      generateWorksheets,
      generateQuizzes,
      modules
    },
    retries: 0,
    inputs: { topic, level, modules, generateWorksheets, generateQuizzes },
    output: null,
    failureReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.courseGenerationTasks.push(courseTask);
  addEvent('course', courseTask.id, 'course-generation-queued', `Course generation started: ${title}`);

  return res.status(201).json({ courseTask });
}

export function getMediaTasks(req: Request, res: Response) {
  const { userId } = req.query as { userId?: string };
  const tasks = userId ? store.mediaTasks.filter((t) => t.userId === userId) : store.mediaTasks;
  return res.json({ mediaTasks: tasks });
}

export function getMediaTaskById(req: Request, res: Response) {
  const { taskId } = req.params;
  const task = store.mediaTasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Media task not found' });
  }

  return res.json({ mediaTask: task });
}

export function executeMediaTask(req: Request, res: Response) {
  const { taskId } = req.params;
  const { agentId } = req.body as { agentId?: string };

  const task = store.mediaTasks.find((t) => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Media task not found' });
  }

  const agent = agentId
    ? store.agents.find((a) => a.id === agentId)
    : store.agents.find((a) => a.type === 'media' || a.type === 'general');

  if (!agent) {
    return res.status(400).json({
      error: 'No media generation agent available',
      suggestion: 'Create a media/video generation agent first'
    });
  }

  // Check agent capabilities
  if (task.mediaType === 'video' && !agent.capabilities.includes('video-generation')) {
    task.status = 'failed';
    task.failureReason = 'Agent does not support video generation';
    addEvent('media', task.id, 'failed', 'Agent capabilities do not match task requirements');

    return res.status(400).json({
      error: 'Agent does not support this media type',
      reason: 'Selected agent lacks video-generation capability',
      suggestion: 'Assign a video-generation capable agent',
      mediaTask: task
    });
  }

  task.status = 'executing';
  task.assignedAgentId = agent.id;
  task.updatedAt = new Date().toISOString();

  // Simulate media generation
  setTimeout(() => {
    task.status = 'completed';
    task.output = {
      success: true,
      message: `${task.mediaType} generated successfully`,
      agent: agent.name,
      outputUrl: `https://media.barangel.ai/${task.id}.${task.mediaType === 'video' ? 'mp4' : 'pdf'}`,
      metadata: {
        duration: (task as VideoGenerationTask).mediaParams?.duration || 'N/A',
        format: task.mediaType,
        generatedBy: agent.name
      }
    };
    task.updatedAt = new Date().toISOString();
    addEvent('media', task.id, 'completed', `${task.mediaType} generation completed by ${agent.name}`);
  }, 3000);

  return res.json({ mediaTask: task });
}
