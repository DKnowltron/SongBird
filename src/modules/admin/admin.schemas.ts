import { z } from 'zod';

export const listModerationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
});

export const rejectModerationSchema = z.object({
  reason: z.string().min(1).max(2000),
});

export const createPartnerSchema = z.object({
  name: z.string().min(1).max(255),
  webhook_url: z.string().url().optional(),
});

export type ListModerationInput = z.infer<typeof listModerationSchema>;
export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
