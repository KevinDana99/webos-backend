import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Platform-specific auth schemas
export const platformLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const platformRefreshSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

// Video conversion schema
export const receiveVideoSchema = z.object({
  url: z.string().url('Must be a valid URL').optional(),
  platform: z.string().default('crunchyroll'),
  quality: z.enum(['low', 'medium', 'high', 'ultra']).default('medium'),
  outputName: z.string().optional(),
  contentId: z.string().optional(),
  streamsLink: z.string().optional(),
  episodeNumber: z.number().int().positive().optional(),
});

export const transcodeSchema = z.object({
  inputUrl: z.string().url('Must be a valid URL'),
  format: z.string().default('mp4'),
  quality: z
    .enum(['low', 'medium', 'high', 'ultra'])
    .default('medium'),
});

export const streamSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  platform: z.string().default('generic'),
});

// Series / Movies schemas
export const seriesListSchema = z.object({
  platform: z.string().default('crunchyroll'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(20),
});

export const movieListSchema = z.object({
  platform: z.string().default('crunchyroll'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(20),
});

export const searchSchema = z.object({
  platform: z.string().default('crunchyroll'),
  q: z.string().min(1, 'Search query required'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(20),
});
