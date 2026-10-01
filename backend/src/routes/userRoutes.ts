import type { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { store, addEvent } from '../store.js';
import type { User } from '../types.js';

export function createUserProfile(req: Request, res: Response) {
  const { name, email, profileImage, signature } = req.body as {
    name?: string;
    email?: string;
    profileImage?: string;
    signature?: string;
  };

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  // Check if user already exists
  const existing = store.users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const user: User = {
    id: uuid(),
    name,
    email,
    role: 'user',
    credits: 1000,
    scopes: ['mobile', 'web', 'task-queue', 'media-generation', 'course-creation'],
    profileImage,
    signature,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.users.push(user);
  addEvent('user', user.id, 'profile-created', `User profile created: ${name}`);

  return res.status(201).json({ user });
}

export function getUserProfile(req: Request, res: Response) {
  const { userId } = req.params;
  const user = store.users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ user });
}

export function updateUserProfile(req: Request, res: Response) {
  const { userId } = req.params;
  const { name, profileImage, signature } = req.body as { name?: string; profileImage?: string; signature?: string };

  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name;
  if (profileImage) user.profileImage = profileImage;
  if (signature) user.signature = signature;
  user.updatedAt = new Date().toISOString();

  addEvent('user', userId, 'profile-updated', `User profile updated: ${user.name}`);

  return res.json({ user });
}

export function generateBrandingAssets(req: Request, res: Response) {
  const { userId } = req.params;
  const { logoStyle = 'modern', colorScheme = 'blue-purple' } = req.body as {
    logoStyle?: string;
    colorScheme?: string;
  };

  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Simulate branding asset generation
  const brandingAssets = {
    userId,
    logoUrl: `https://branding.barangel.ai/${userId}/logo-${logoStyle}.png`,
    faviconUrl: `https://branding.barangel.ai/${userId}/favicon.ico`,
    signatureUrl: user.signature || `https://branding.barangel.ai/${userId}/signature.png`,
    colorPalette: {
      primary: colorScheme === 'blue-purple' ? '#7c3aed' : '#00d4ff',
      secondary: colorScheme === 'blue-purple' ? '#00d4ff' : '#7c3aed',
      accent: '#ffd700'
    },
    createdAt: new Date().toISOString()
  };

  addEvent('branding', userId, 'assets-generated', `Branding assets generated for user ${user.name}`);

  return res.json({ brandingAssets });
}

export function getAllUsers(req: Request, res: Response) {
  return res.json({ users: store.users });
}
