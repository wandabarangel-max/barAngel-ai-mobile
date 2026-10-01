import type { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { store, addEvent } from '../store.js';
import type { Course, CourseModule, CourseLesson } from '../types.js';

export function createCourse(req: Request, res: Response) {
  const { title, topic, level = 'beginner', userId } = req.body as {
    title?: string;
    topic?: string;
    level?: string;
    userId?: string;
  };

  if (!title || !topic || !userId) {
    return res.status(400).json({ error: 'title, topic, and userId are required' });
  }

  const course: Course = {
    id: uuid(),
    title,
    topic,
    level,
    userId,
    modules: [],
    generatedContent: false,
    metadata: {
      studentsEnrolled: 0,
      rating: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.courses.push(course);
  addEvent('course', course.id, 'created', `Course created: ${title}`);

  return res.status(201).json({ course });
}

export function addModuleToCourse(req: Request, res: Response) {
  const { courseId } = req.params;
  const { title, description, duration = 60 } = req.body as {
    title?: string;
    description?: string;
    duration?: number;
  };

  const course = store.courses.find((c) => c.id === courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }

  const module: CourseModule = {
    id: uuid(),
    title,
    description,
    duration,
    lessons: []
  };

  course.modules.push(module);
  course.updatedAt = new Date().toISOString();
  addEvent('course', courseId, 'module-added', `Module "${title}" added to course`);

  return res.status(201).json({ module });
}

export function addLessonToModule(req: Request, res: Response) {
  const { courseId, moduleId } = req.params;
  const { title, content } = req.body as {
    title?: string;
    content?: string;
  };

  const course = store.courses.find((c) => c.id === courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const module = course.modules.find((m) => m.id === moduleId);
  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const lesson: CourseLesson = {
    id: uuid(),
    title,
    content,
    resources: []
  };

  module.lessons.push(lesson);
  course.updatedAt = new Date().toISOString();
  addEvent('course', courseId, 'lesson-added', `Lesson "${title}" added to module`);

  return res.status(201).json({ lesson });
}

export function generateCourseVideo(req: Request, res: Response) {
  const { courseId, moduleId, lessonId } = req.params;
  const { agentId } = req.body as { agentId?: string };

  const course = store.courses.find((c) => c.id === courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const module = course.modules.find((m) => m.id === moduleId);
  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }

  const lesson = module.lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  const agent = agentId ? store.agents.find((a) => a.id === agentId) : store.agents[0];
  if (!agent) {
    return res.status(400).json({ error: 'No agent available for video generation' });
  }

  // Check if agent has video generation capability
  if (!agent.capabilities.includes('video-generation')) {
    return res.status(400).json({
      error: 'Agent lacks video generation capability',
      reason: 'Selected agent cannot generate video content',
      suggestion: 'Assign an agent with video-generation capability'
    });
  }

  // Simulate video generation
  setTimeout(() => {
    lesson.videoUrl = `https://media.barangel.ai/courses/${courseId}/${moduleId}/${lessonId}.mp4`;
    module.videoGenerated = true;
    course.updatedAt = new Date().toISOString();
    addEvent('course', courseId, 'lesson-video-generated', `Video generated for lesson "${lesson.title}"`);
  }, 4000);

  return res.json({
    lesson,
    message: 'Video generation started',
    estimatedTime: '4 seconds'
  });
}

export function getCourses(req: Request, res: Response) {
  const { userId } = req.query as { userId?: string };
  const courses = userId ? store.courses.filter((c) => c.userId === userId) : store.courses;
  return res.json({ courses });
}

export function getCourse(req: Request, res: Response) {
  const { courseId } = req.params;
  const course = store.courses.find((c) => c.id === courseId);

  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  return res.json({ course });
}
