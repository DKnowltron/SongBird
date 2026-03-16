import { z } from 'zod';

export const listPartnerStoriesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(100),
  updated_since: z.string().datetime().optional(),
  isrc: z.string().optional(),
});

export type ListPartnerStoriesInput = z.infer<typeof listPartnerStoriesSchema>;
