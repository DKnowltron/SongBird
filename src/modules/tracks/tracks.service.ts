import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/connection.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import { logAuditEvent } from '../webhooks/webhooks.service.js';
import type { CreateTrackInput, ListTracksInput } from './tracks.schemas.js';

export async function createTrack(artistId: string, input: CreateTrackInput) {
  // Check for existing ISRC for this artist
  const existing = await query(
    'SELECT id FROM tracks WHERE isrc = $1 AND artist_id = $2',
    [input.isrc, artistId],
  );
  if (existing.rows.length > 0) {
    throw new ConflictError('This ISRC is already registered to your account');
  }

  const id = uuidv4();
  const result = await query<{
    id: string;
    isrc: string;
    title: string;
    album: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
  }>(
    `INSERT INTO tracks (id, isrc, title, artist_id, album, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, isrc, title, album, metadata, created_at, updated_at`,
    [id, input.isrc, input.title, artistId, input.album || null, input.metadata ? JSON.stringify(input.metadata) : null],
  );

  return result.rows[0];
}

export async function listTracks(artistId: string, input: ListTracksInput) {
  const offset = (input.page - 1) * input.per_page;

  let whereClause = 'WHERE t.artist_id = $1';
  const params: unknown[] = [artistId];

  if (input.search) {
    params.push(`%${input.search}%`);
    whereClause += ` AND (t.title ILIKE $${params.length} OR t.isrc ILIKE $${params.length})`;
  }

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM tracks t ${whereClause}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(input.per_page, offset);
  const result = await query(
    `SELECT t.id, t.isrc, t.title, t.album,
            COUNT(s.id) FILTER (WHERE s.deleted_at IS NULL) as story_count,
            BOOL_OR(s.status = 'verified' AND s.deleted_at IS NULL) as has_verified_story
     FROM tracks t
     LEFT JOIN stories s ON s.track_id = t.id
     ${whereClause}
     GROUP BY t.id, t.isrc, t.title, t.album
     ORDER BY t.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return {
    data: result.rows.map((r) => ({
      id: r.id,
      isrc: r.isrc,
      title: r.title,
      album: r.album,
      story_count: parseInt(r.story_count, 10),
      has_verified_story: r.has_verified_story || false,
    })),
    pagination: {
      page: input.page,
      per_page: input.per_page,
      total,
    },
  };
}

export async function getTrack(artistId: string, trackId: string) {
  const trackResult = await query(
    `SELECT id, isrc, title, album, metadata, created_at, updated_at
     FROM tracks WHERE id = $1 AND artist_id = $2`,
    [trackId, artistId],
  );

  if (trackResult.rows.length === 0) {
    throw new NotFoundError('Track', trackId);
  }

  const track = trackResult.rows[0];

  const storiesResult = await query(
    `SELECT id, source_type, status, duration_seconds, version, created_at
     FROM stories WHERE track_id = $1 AND deleted_at IS NULL
     ORDER BY priority ASC, created_at DESC`,
    [trackId],
  );

  return {
    ...track,
    stories: storiesResult.rows,
  };
}

export async function importTracks(artistId: string, rows: Array<{ isrc: string; title: string; album?: string }>) {
  let imported = 0;
  let skipped = 0;
  const errors: Array<{ row: number; isrc: string; reason: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    // Validate ISRC format
    if (!row.isrc || !/^[A-Z]{2}[A-Z0-9]{3}\d{2}\d{5}$/.test(row.isrc)) {
      errors.push({ row: rowNum, isrc: row.isrc || '', reason: 'Invalid ISRC format' });
      continue;
    }

    if (!row.title) {
      errors.push({ row: rowNum, isrc: row.isrc, reason: 'Missing title' });
      continue;
    }

    // Check if already exists
    const existing = await query(
      'SELECT id FROM tracks WHERE isrc = $1 AND artist_id = $2',
      [row.isrc, artistId],
    );

    if (existing.rows.length > 0) {
      skipped++;
      continue;
    }

    await query(
      `INSERT INTO tracks (id, isrc, title, artist_id, album)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), row.isrc, row.title, artistId, row.album || null],
    );
    imported++;
  }

  return { imported, skipped, errors };
}

export async function searchTracks(artistId: string, queryStr: string, type: string) {
  // For now, search local database. External API integration (MusicBrainz) is future work.
  const result = await query(
    `SELECT t.isrc, t.title, t.album, a.name as artist
     FROM tracks t
     JOIN artists a ON a.id = t.artist_id
     WHERE t.artist_id = $1
       AND (t.title ILIKE $2 OR t.isrc ILIKE $2)
     LIMIT 50`,
    [artistId, `%${queryStr}%`],
  );

  return { results: result.rows };
}
