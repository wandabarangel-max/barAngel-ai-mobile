import type { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { store, addEvent } from '../store.js';
import type { FilmProject, FilmScene, AIActor } from '../types.js';

export function createFilmProject(req: Request, res: Response) {
  const { title, synopsis, directorStyle = 'cinematic', userId } = req.body as {
    title?: string;
    synopsis?: string;
    directorStyle?: string;
    userId?: string;
  };

  if (!title || !synopsis || !userId) {
    return res.status(400).json({ error: 'title, synopsis, and userId are required' });
  }

  const filmProject: FilmProject = {
    id: uuid(),
    title,
    synopsis,
    directorStyle,
    userId,
    scenes: [],
    actors: [],
    status: 'draft',
    metadata: {
      aiModels: ['scene-generator', 'actor-generator', 'dialogue-generator']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.filmProjects.push(filmProject);
  addEvent('film', filmProject.id, 'project-created', `Film project created: ${title}`);

  return res.status(201).json({ filmProject });
}

export function addSceneToFilm(req: Request, res: Response) {
  const { filmId } = req.params;
  const { title, description, sceneNumber = 1, duration = 60 } = req.body as {
    title?: string;
    description?: string;
    sceneNumber?: number;
    duration?: number;
  };

  const film = store.filmProjects.find((f) => f.id === filmId);
  if (!film) {
    return res.status(404).json({ error: 'Film project not found' });
  }

  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }

  const scene: FilmScene = {
    id: uuid(),
    title,
    description,
    sceneNumber,
    duration,
    status: 'draft',
    cameraDirection: `Default direction for ${title}`
  };

  film.scenes.push(scene);
  film.updatedAt = new Date().toISOString();
  addEvent('film', filmId, 'scene-added', `Scene "${title}" added to film`);

  return res.status(201).json({ scene });
}

export function castAIActor(req: Request, res: Response) {
  const { filmId } = req.params;
  const { name, personality, appearance = 'default', voice = 'neutral' } = req.body as {
    name?: string;
    personality?: string;
    appearance?: string;
    voice?: string;
  };

  const film = store.filmProjects.find((f) => f.id === filmId);
  if (!film) {
    return res.status(404).json({ error: 'Film project not found' });
  }

  if (!name || !personality) {
    return res.status(400).json({ error: 'name and personality are required' });
  }

  const actor: AIActor = {
    id: uuid(),
    name,
    personality,
    appearance,
    voice,
    scenes: []
  };

  film.actors.push(actor);
  film.updatedAt = new Date().toISOString();
  addEvent('film', filmId, 'actor-cast', `AI actor "${name}" cast in film`);

  return res.status(201).json({ actor });
}

export function generateSceneVideo(req: Request, res: Response) {
  const { filmId, sceneId } = req.params;
  const { agentId } = req.body as { agentId?: string };

  const film = store.filmProjects.find((f) => f.id === filmId);
  if (!film) {
    return res.status(404).json({ error: 'Film project not found' });
  }

  const scene = film.scenes.find((s) => s.id === sceneId);
  if (!scene) {
    return res.status(404).json({ error: 'Scene not found' });
  }

  const agent = agentId ? store.agents.find((a) => a.id === agentId) : store.agents[0];
  if (!agent) {
    return res.status(400).json({ error: 'No agent available for video generation' });
  }

  scene.status = 'generating';
  film.updatedAt = new Date().toISOString();

  // Simulate video generation
  setTimeout(() => {
    scene.status = 'generated';
    scene.generatedVideo = `https://media.barangel.ai/films/${filmId}/scenes/${sceneId}.mp4`;
    film.updatedAt = new Date().toISOString();
    addEvent('film', filmId, 'scene-generated', `Scene video generated for "${scene.title}"`);
  }, 5000);

  return res.json({ scene });
}

export function getFilmProjects(req: Request, res: Response) {
  const { userId } = req.query as { userId?: string };
  const projects = userId ? store.filmProjects.filter((p) => p.userId === userId) : store.filmProjects;
  return res.json({ filmProjects: projects });
}

export function getFilmProject(req: Request, res: Response) {
  const { filmId } = req.params;
  const film = store.filmProjects.find((f) => f.id === filmId);

  if (!film) {
    return res.status(404).json({ error: 'Film project not found' });
  }

  return res.json({ filmProject: film });
}
