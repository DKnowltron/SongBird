import { z } from 'zod';

// ISRC: 12 chars, pattern like CC-XXX-YY-NNNNN (but stored without dashes usually)
const isrcPattern = /^[A-Z]{2}[A-Z0-9]{3}\d{2}\d{5}$/;

export const createTrackSchema = z.object({
  isrc: z.string().regex(isrcPattern, 'Invalid ISRC format. Expected 12 characters like USRC12345678'),
  title: z.string().min(1).max(500),
  album: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const listTracksSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export const searchTracksSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['artist', 'title']).default('title'),
});

export type CreateTrackInput = z.infer<typeof createTrackSchema>;
export type ListTracksInput = z.infer<typeof listTracksSchema>;
export type SearchTracksInput = z.infer<typeof searchTracksSchema>;
