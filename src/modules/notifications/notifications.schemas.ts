import { z } from 'zod';

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(20),
  unread: z.coerce.boolean().optional(),
});

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
