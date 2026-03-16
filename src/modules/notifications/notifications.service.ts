import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/connection.js';
import { NotFoundError } from '../../utils/errors.js';
import type { ListNotificationsInput } from './notifications.schemas.js';

export async function listNotifications(artistId: string, input: ListNotificationsInput) {
  const offset = (input.page - 1) * input.per_page;
  const params: unknown[] = [artistId];
  let whereClause = 'WHERE artist_id = $1';

  if (input.unread) {
    whereClause += ' AND read = FALSE';
  }

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM notifications ${whereClause}`,
    params,
  );

  const unreadResult = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM notifications WHERE artist_id = $1 AND read = FALSE',
    [artistId],
  );

  params.push(input.per_page, offset);
  const result = await query(
    `SELECT id, type, message, read, created_at
     FROM notifications
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return {
    data: result.rows,
    unread_count: parseInt(unreadResult.rows[0].count, 10),
  };
}

export async function markAsRead(artistId: string, notificationId: string) {
  const result = await query(
    'UPDATE notifications SET read = TRUE WHERE id = $1 AND artist_id = $2 RETURNING id',
    [notificationId, artistId],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Notification', notificationId);
  }
}

export async function createNotification(artistId: string, type: string, message: string) {
  await query(
    'INSERT INTO notifications (id, artist_id, type, message) VALUES ($1, $2, $3, $4)',
    [uuidv4(), artistId, type, message],
  );
}
