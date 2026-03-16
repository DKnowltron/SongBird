import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/connection.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors.js';
import { validateAudioContent } from '../../services/audio-validator.js';
import { getStorage } from '../../services/storage.js';
import { logAuditEvent, dispatchWebhook } from '../webhooks/webhooks.service.js';

export async function createStory(
  artistId: string,
  trackId: string,
  audioBuffer: Buffer,
  audioFilename: string,
  transcript?: string,
) {
  // Verify track ownership
  const trackResult = await query(
    'SELECT id, isrc FROM tracks WHERE id = $1 AND artist_id = $2',
    [trackId, artistId],
  );
  if (trackResult.rows.length === 0) {
    throw new NotFoundError('Track', trackId);
  }
  const track = trackResult.rows[0];

  // Validate audio
  const audioInfo = await validateAudioContent(audioBuffer, audioFilename);

  // Create audio asset
  const audioAssetId = uuidv4();
  const storageKey = `stories/${artistId}/${track.isrc}/${audioAssetId}.${audioInfo.format}`;

  const storage = getStorage();
  await storage.upload(storageKey, audioBuffer, `audio/${audioInfo.format}`);

  await query(
    `INSERT INTO audio_assets (id, storage_key, format, size_bytes, duration_seconds, sample_rate, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [audioAssetId, storageKey, audioInfo.format, audioInfo.sizeBytes, audioInfo.durationSeconds, audioInfo.sampleRate, artistId],
  );

  // Get current max version for this track
  const versionResult = await query<{ max_version: number | null }>(
    'SELECT MAX(version) as max_version FROM stories WHERE track_id = $1 AND artist_id = $2',
    [trackId, artistId],
  );
  const version = (versionResult.rows[0].max_version || 0) + 1;

  // Create story
  const storyId = uuidv4();
  const result = await query(
    `INSERT INTO stories (id, track_id, artist_id, source_type, status, audio_asset_id, transcript, duration_seconds, version)
     VALUES ($1, $2, $3, 'artist_recording', 'draft', $4, $5, $6, $7)
     RETURNING id, track_id, source_type, status, duration_seconds, version, created_at`,
    [storyId, trackId, artistId, audioAssetId, transcript || null, audioInfo.durationSeconds, version],
  );

  const story = result.rows[0];
  const audioUrl = await storage.getSignedUrl(storageKey);

  await logAuditEvent({
    eventType: 'story_created',
    actorId: artistId,
    actorType: 'artist',
    resourceType: 'story',
    resourceId: storyId,
    details: { trackId, version },
  });

  return {
    ...story,
    audio_url: audioUrl,
  };
}

export async function getStory(artistId: string, storyId: string) {
  const result = await query(
    `SELECT s.*, aa.storage_key
     FROM stories s
     JOIN audio_assets aa ON aa.id = s.audio_asset_id
     WHERE s.id = $1 AND s.deleted_at IS NULL`,
    [storyId],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Story', storyId);
  }

  const story = result.rows[0];

  // Only the owner can view their stories (or admin)
  if (story.artist_id !== artistId) {
    throw new ForbiddenError('You do not have access to this story');
  }

  const storage = getStorage();
  const audioUrl = await storage.getSignedUrl(story.storage_key);

  return {
    id: story.id,
    track_id: story.track_id,
    source_type: story.source_type,
    status: story.status,
    priority: story.priority,
    duration_seconds: parseFloat(story.duration_seconds),
    version: story.version,
    transcript: story.transcript,
    audio_url: audioUrl,
    verified_at: story.verified_at,
    rejection_reason: story.rejection_reason,
    created_at: story.created_at,
    updated_at: story.updated_at,
  };
}

export async function updateStory(
  artistId: string,
  storyId: string,
  audioBuffer: Buffer,
  audioFilename: string,
  transcript?: string,
) {
  // Get existing story
  const existing = await query(
    `SELECT s.*, t.isrc FROM stories s JOIN tracks t ON t.id = s.track_id
     WHERE s.id = $1 AND s.deleted_at IS NULL`,
    [storyId],
  );

  if (existing.rows.length === 0) {
    throw new NotFoundError('Story', storyId);
  }

  const story = existing.rows[0];
  if (story.artist_id !== artistId) {
    throw new ForbiddenError('You do not have access to this story');
  }

  // Validate new audio
  const audioInfo = await validateAudioContent(audioBuffer, audioFilename);

  // Upload new audio
  const audioAssetId = uuidv4();
  const storageKey = `stories/${artistId}/${story.isrc}/${audioAssetId}.${audioInfo.format}`;

  const storage = getStorage();
  await storage.upload(storageKey, audioBuffer, `audio/${audioInfo.format}`);

  await query(
    `INSERT INTO audio_assets (id, storage_key, format, size_bytes, duration_seconds, sample_rate, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [audioAssetId, storageKey, audioInfo.format, audioInfo.sizeBytes, audioInfo.durationSeconds, audioInfo.sampleRate, artistId],
  );

  // Update story with new audio and incremented version
  const result = await query(
    `UPDATE stories
     SET audio_asset_id = $1, duration_seconds = $2, version = version + 1,
         transcript = COALESCE($3, transcript), status = 'draft', updated_at = NOW()
     WHERE id = $4
     RETURNING id, track_id, source_type, status, duration_seconds, version, updated_at`,
    [audioAssetId, audioInfo.durationSeconds, transcript, storyId],
  );

  const updated = result.rows[0];
  const audioUrl = await storage.getSignedUrl(storageKey);

  await logAuditEvent({
    eventType: 'story_replaced',
    actorId: artistId,
    actorType: 'artist',
    resourceType: 'story',
    resourceId: storyId,
    details: { newVersion: updated.version },
  });

  return { ...updated, audio_url: audioUrl };
}

export async function deleteStory(artistId: string, storyId: string) {
  const existing = await query(
    'SELECT id, artist_id FROM stories WHERE id = $1 AND deleted_at IS NULL',
    [storyId],
  );

  if (existing.rows.length === 0) {
    throw new NotFoundError('Story', storyId);
  }

  if (existing.rows[0].artist_id !== artistId) {
    throw new ForbiddenError('You do not have access to this story');
  }

  await query(
    'UPDATE stories SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1',
    [storyId],
  );

  await logAuditEvent({
    eventType: 'story_deleted',
    actorId: artistId,
    actorType: 'artist',
    resourceType: 'story',
    resourceId: storyId,
    details: {},
  });

  await dispatchWebhook('story.removed', { story_id: storyId });
}

export async function verifyStory(artistId: string, storyId: string) {
  const existing = await query(
    'SELECT id, artist_id, status FROM stories WHERE id = $1 AND deleted_at IS NULL',
    [storyId],
  );

  if (existing.rows.length === 0) {
    throw new NotFoundError('Story', storyId);
  }

  if (existing.rows[0].artist_id !== artistId) {
    throw new ForbiddenError('You do not have access to this story');
  }

  const result = await query(
    `UPDATE stories SET status = 'verified', verified_at = NOW(), verified_by = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, status, verified_at`,
    [artistId, storyId],
  );

  await logAuditEvent({
    eventType: 'story_verified',
    actorId: artistId,
    actorType: 'artist',
    resourceType: 'story',
    resourceId: storyId,
    details: {},
  });

  await dispatchWebhook('story.verified', { story_id: storyId });

  return result.rows[0];
}

export async function rejectStory(artistId: string, storyId: string, reason: string) {
  const existing = await query(
    'SELECT id, artist_id FROM stories WHERE id = $1 AND deleted_at IS NULL',
    [storyId],
  );

  if (existing.rows.length === 0) {
    throw new NotFoundError('Story', storyId);
  }

  if (existing.rows[0].artist_id !== artistId) {
    throw new ForbiddenError('You do not have access to this story');
  }

  const result = await query(
    `UPDATE stories SET status = 'rejected', rejection_reason = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, status, rejection_reason`,
    [reason, storyId],
  );

  await logAuditEvent({
    eventType: 'story_rejected',
    actorId: artistId,
    actorType: 'artist',
    resourceType: 'story',
    resourceId: storyId,
    details: { reason },
  });

  return result.rows[0];
}

export async function publishStory(artistId: string, storyId: string) {
  const existing = await query(
    'SELECT id, artist_id, status FROM stories WHERE id = $1 AND deleted_at IS NULL',
    [storyId],
  );

  if (existing.rows.length === 0) {
    throw new NotFoundError('Story', storyId);
  }

  if (existing.rows[0].artist_id !== artistId) {
    throw new ForbiddenError('You do not have access to this story');
  }

  if (existing.rows[0].status !== 'draft') {
    throw new BadRequestError(`Cannot publish a story with status '${existing.rows[0].status}'`);
  }

  const result = await query(
    `UPDATE stories SET status = 'published', updated_at = NOW()
     WHERE id = $1
     RETURNING id, status`,
    [storyId],
  );

  await logAuditEvent({
    eventType: 'story_published',
    actorId: artistId,
    actorType: 'artist',
    resourceType: 'story',
    resourceId: storyId,
    details: {},
  });

  await dispatchWebhook('story.published', { story_id: storyId });

  return result.rows[0];
}
