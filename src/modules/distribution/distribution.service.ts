import { query } from '../../db/connection.js';
import { NotFoundError } from '../../utils/errors.js';
import { getStorage } from '../../services/storage.js';
import { logAuditEvent } from '../webhooks/webhooks.service.js';
import type { ListPartnerStoriesInput } from './distribution.schemas.js';

export async function listPartnerStories(partnerId: string, input: ListPartnerStoriesInput) {
  const offset = (input.page - 1) * input.per_page;
  const params: unknown[] = [];
  const conditions: string[] = [
    "s.status IN ('published', 'verified')",
    's.deleted_at IS NULL',
  ];

  if (input.updated_since) {
    params.push(input.updated_since);
    conditions.push(`s.updated_at >= $${params.length}`);
  }

  if (input.isrc) {
    params.push(input.isrc);
    conditions.push(`t.isrc = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM stories s
     JOIN tracks t ON t.id = s.track_id
     ${whereClause}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(input.per_page, offset);
  const result = await query(
    `SELECT s.id, t.isrc, t.title as track_title, a.name as artist_name,
            s.source_type, s.status, s.duration_seconds, s.transcript,
            s.verified_at, s.updated_at, aa.storage_key
     FROM stories s
     JOIN tracks t ON t.id = s.track_id
     JOIN artists a ON a.id = s.artist_id
     JOIN audio_assets aa ON aa.id = s.audio_asset_id
     ${whereClause}
     ORDER BY s.updated_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  const storage = getStorage();
  const data = await Promise.all(
    result.rows.map(async (row) => ({
      id: row.id,
      isrc: row.isrc,
      track_title: row.track_title,
      artist_name: row.artist_name,
      source_type: row.source_type,
      status: row.status,
      duration_seconds: parseFloat(row.duration_seconds),
      transcript: row.transcript,
      audio_url: await storage.getSignedUrl(row.storage_key),
      verified: row.status === 'verified',
      verified_at: row.verified_at,
      updated_at: row.updated_at,
    })),
  );

  // Record distributions
  for (const story of data) {
    await query(
      `INSERT INTO distributions (id, story_id, partner_id, status, delivered_at)
       VALUES (gen_random_uuid(), $1, $2, 'delivered', NOW())
       ON CONFLICT (story_id, partner_id) DO UPDATE SET status = 'delivered', delivered_at = NOW(), updated_at = NOW()`,
      [story.id, partnerId],
    );
  }

  return {
    data,
    pagination: { page: input.page, per_page: input.per_page, total },
  };
}

export async function getPartnerStoryByIsrc(partnerId: string, isrc: string) {
  const result = await query(
    `SELECT s.id, t.isrc, t.title as track_title, a.name as artist_name,
            s.source_type, s.status, s.duration_seconds, s.transcript,
            s.verified_at, s.updated_at, aa.storage_key
     FROM stories s
     JOIN tracks t ON t.id = s.track_id
     JOIN artists a ON a.id = s.artist_id
     JOIN audio_assets aa ON aa.id = s.audio_asset_id
     WHERE t.isrc = $1
       AND s.status IN ('published', 'verified')
       AND s.deleted_at IS NULL
     ORDER BY s.priority ASC, s.created_at DESC
     LIMIT 1`,
    [isrc],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Story for ISRC', isrc);
  }

  const row = result.rows[0];
  const storage = getStorage();

  // Record distribution
  await query(
    `INSERT INTO distributions (id, story_id, partner_id, status, delivered_at)
     VALUES (gen_random_uuid(), $1, $2, 'delivered', NOW())
     ON CONFLICT (story_id, partner_id) DO UPDATE SET status = 'delivered', delivered_at = NOW(), updated_at = NOW()`,
    [row.id, partnerId],
  );

  await logAuditEvent({
    eventType: 'story_distributed',
    actorId: partnerId,
    actorType: 'partner',
    resourceType: 'story',
    resourceId: row.id,
    details: { isrc },
  });

  return {
    id: row.id,
    isrc: row.isrc,
    track_title: row.track_title,
    artist_name: row.artist_name,
    source_type: row.source_type,
    status: row.status,
    duration_seconds: parseFloat(row.duration_seconds),
    transcript: row.transcript,
    audio_url: await storage.getSignedUrl(row.storage_key),
    verified: row.status === 'verified',
    verified_at: row.verified_at,
    updated_at: row.updated_at,
  };
}

export async function getStoryAudioRedirect(partnerId: string, storyId: string) {
  const result = await query(
    `SELECT aa.storage_key
     FROM stories s
     JOIN audio_assets aa ON aa.id = s.audio_asset_id
     WHERE s.id = $1
       AND s.status IN ('published', 'verified')
       AND s.deleted_at IS NULL`,
    [storyId],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Story', storyId);
  }

  const storage = getStorage();
  return storage.getSignedUrl(result.rows[0].storage_key);
}
