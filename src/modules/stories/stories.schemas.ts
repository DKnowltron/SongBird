import { z } from 'zod';

export const createStorySchema = z.object({
  transcript: z.string().optional(),
});

export const updateStorySchema = z.object({
  transcript: z.string().optional(),
});

export const rejectStorySchema = z.object({
  reason: z.string().min(1).max(2000),
});

export const listStoriesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['draft', 'published', 'verified', 'rejected']).optional(),
});
