import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/connection.js';
import { NotFoundError } from '../../utils/errors.js';
import { generateApiKey, hashApiKey } from '../../utils/crypto.js';
import { logAuditEvent } from '../webhooks/webhooks.service.js';
import type { ListModerationInput, CreatePartnerInput } from './admin.schemas.js';

export async function listModeration(input: ListModerationInput) {
  const offset = (input.page - 1) * input.per_page;
  const params: unknown[] = [];
  const conditions: string[] = ['s.deleted_at IS NULL'];

  if (input.status) {
    params.push(input.status);
    conditions.push(`s.status = $${params.length}`);
  } else {
    // Default: show published stories pending review
    conditions.push("s.status = 'published'");
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM stories s ${whereClause}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(input.per_page, offset);
  const result = await query(
    `SELECT s.id as story_id, a.name as artist_name, t.title as track_title,
            s.status, s.created_at
     FROM stories s
     JOIN artists a ON a.id = s.artist_id
     JOIN tracks t ON t.id = s.track_id
     ${whereClause}
     ORDER BY s.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return {
    data: result.rows,
    pagination: { page: input.page, per_page: input.per_page, total },
  };
}

export async function approveStory(adminId: string, storyId: string) {
  const existing = await query(
    'SELECT id, status FROM stories WHERE id = $1 AND deleted_at IS NULL',
    [storyId],
  );

  if (existing.rows.length === 0) {
    throw new NotFoundError('Story', storyId);
  }

  await query(
    `UPDATE stories SET status = 'verified', verified_at = NOW(), verified_by = $1, updated_at = NOW()
     WHERE id = $2`,
    [adminId, storyId],
  );

  await logAuditEvent({
    eventType: 'story_verified',
    actorId: adminId,
    actorType: 'system',
    resourceType: 'story',
    resourceId: storyId,
    details: { approved_by_admin: true },
  });

  return { story_id: storyId, status: 'verified' };
}

export async function rejectModeration(adminId: string, storyId: string, reason: string) {
  const existing = await query(
    'SELECT id FROM stories WHERE id = $1 AND deleted_at IS NULL',
    [storyId],
  );

  if (existing.rows.length === 0) {
    throw new NotFoundError('Story', storyId);
  }

  await query(
    `UPDATE stories SET status = 'rejected', rejection_reason = $1, updated_at = NOW()
     WHERE id = $2`,
    [reason, storyId],
  );

  await logAuditEvent({
    eventType: 'story_rejected',
    actorId: adminId,
    actorType: 'system',
    resourceType: 'story',
    resourceId: storyId,
    details: { reason, rejected_by_admin: true },
  });

  return { story_id: storyId, status: 'rejected' };
}

export async function listPartners() {
  const result = await query(
    `SELECT id, name, webhook_url, status, created_at, updated_at
     FROM partners ORDER BY created_at DESC`,
  );
  return { data: result.rows };
}

export async function createPartner(adminId: string, input: CreatePartnerInput) {
  const id = uuidv4();
  const apiKey = generateApiKey();
  const apiKeyHash = await hashApiKey(apiKey);

  await query(
    `INSERT INTO partners (id, name, api_key_hash, webhook_url, status)
     VALUES ($1, $2, $3, $4, 'active')`,
    [id, input.name, apiKeyHash, input.webhook_url || null],
  );

  await logAuditEvent({
    eventType: 'partner_created',
    actorId: adminId,
    actorType: 'system',
    resourceType: 'partner',
    resourceId: id,
    details: { name: input.name },
  });

  // Return the plain API key — this is the only time it's visible
  return {
    id,
    name: input.name,
    api_key: apiKey,
    webhook_url: input.webhook_url || null,
    status: 'active',
  };
}

export async function getStats() {
  const [artists, tracks, stories, distributions] = await Promise.all([
    query<{ count: string }>('SELECT COUNT(*) as count FROM artists'),
    query<{ count: string }>('SELECT COUNT(*) as count FROM tracks'),
    query<{ count: string; status: string }>(
      `SELECT status, COUNT(*) as count FROM stories WHERE deleted_at IS NULL GROUP BY status`,
    ),
    query<{ count: string; status: string }>(
      'SELECT status, COUNT(*) as count FROM distributions GROUP BY status',
    ),
  ]);

  const storyStats: Record<string, number> = {};
  stories.rows.forEach((r) => {
    storyStats[r.status] = parseInt(r.count, 10);
  });

  const distStats: Record<string, number> = {};
  distributions.rows.forEach((r) => {
    distStats[r.status] = parseInt(r.count, 10);
  });

  return {
    total_artists: parseInt(artists.rows[0].count, 10),
    total_tracks: parseInt(tracks.rows[0].count, 10),
    stories: storyStats,
    distributions: distStats,
  };
}
