import { z } from 'zod';

export const contentSourceEnum = z.enum(['youtube', 'podcast', 'article', 'social', 'other']);

export const createContentLinkSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  title: z.string().min(1).max(500),
  source: contentSourceEnum.default('other'),
  description: z.string().max(2000).optional(),
  duration: z.string().max(50).optional(),
  thumbnail_url: z.string().url().optional(),
});

export const updateContentLinkSchema = z.object({
  url: z.string().url().optional(),
  title: z.string().min(1).max(500).optional(),
  source: contentSourceEnum.optional(),
  description: z.string().max(2000).optional(),
  duration: z.string().max(50).optional(),
  thumbnail_url: z.string().url().optional(),
});

export const listContentLinksSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(20),
  source: contentSourceEnum.optional(),
});

export type CreateContentLinkInput = z.infer<typeof createContentLinkSchema>;
export type UpdateContentLinkInput = z.infer<typeof updateContentLinkSchema>;
export type ListContentLinksInput = z.infer<typeof listContentLinksSchema>;
