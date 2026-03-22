import { query } from '../../db/connection.js';
import { getStorage } from '../../services/storage.js';
import { NotFoundError } from '../../utils/errors.js';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface TrackRow {
  id: string;
  isrc: string;
  title: string;
  album: string | null;
  artist_id: string;
  artist_name: string;
  verified_identity: boolean;
  created_at: string;
}

interface StoryRow {
  id: string;
  status: string;
  priority: number;
  duration_seconds: string;
  version: number;
  transcript: string | null;
  created_at: string;
  storage_key: string;
}

interface ContentLinkRow {
  id: string;
  url: string;
  title: string;
  source: string;
  description: string | null;
  duration: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

interface ArtistRow {
  id: string;
  name: string;
  avatar_url: string | null;
  verified_identity: boolean;
  created_at: string;
}

interface CountRow {
  count: string;
}

interface SearchRow {
  id: string;
  isrc: string;
  title: string;
  album: string | null;
  artist_id: string;
  artist_name: string;
  verified_identity: boolean;
  has_story: boolean;
  has_content: boolean;
  story_status: string | null;
}

// ─── getSongByIsrc ───────────────────────────────────────────────────────────

export async function getSongByIsrc(isrc: string) {
  // Fetch track + artist info
  const trackResult = await query<TrackRow>(
    `SELECT t.id, t.isrc, t.title, t.album, t.artist_id,
            a.name AS artist_name, a.verified_identity, t.created_at
     FROM tracks t
     JOIN artists a ON a.id = t.artist_id
     WHERE t.isrc = $1`,
    [isrc],
  );

  if (trackResult.rows.length === 0) {
    throw new NotFoundError('Track', isrc);
  }

  const track = trackResult.rows[0];

  // Fetch the active story (published or verified, ordered by priority)
  const storyResult = await query<StoryRow>(
    `SELECT s.id, s.status, s.priority, s.duration_seconds, s.version,
            s.transcript, s.created_at, aa.storage_key
     FROM stories s
     JOIN audio_assets aa ON aa.id = s.audio_asset_id
     WHERE s.track_id = $1
       AND s.status IN ('published', 'verified')
       AND s.deleted_at IS NULL
     ORDER BY s.priority ASC
     LIMIT 1`,
    [track.id],
  );

  let story = null;
  if (storyResult.rows.length > 0) {
    const row = storyResult.rows[0];
    const storage = getStorage();
    const audioUrl = await storage.getSignedUrl(row.storage_key);

    story = {
      id: row.id,
      status: row.status,
      priority: row.priority,
      duration_seconds: parseFloat(row.duration_seconds),
      version: row.version,
      transcript: row.transcript,
      audio_url: audioUrl,
      created_at: row.created_at,
    };
  }

  // Fetch approved content links
  const contentResult = await query<ContentLinkRow>(
    `SELECT id, url, title, source, description, duration, thumbnail_url, created_at
     FROM content_links
     WHERE track_id = $1 AND approved = TRUE
     ORDER BY created_at DESC`,
    [track.id],
  );

  return {
    track: {
      id: track.id,
      isrc: track.isrc,
      title: track.title,
      album: track.album,
      created_at: track.created_at,
    },
    artist: {
      id: track.artist_id,
      name: track.artist_name,
      verified_identity: track.verified_identity,
    },
    story,
    content_links: contentResult.rows,
  };
}

// ─── getArtistPublic ─────────────────────────────────────────────────────────

export async function getArtistPublic(artistId: string) {
  // Get artist info
  const artistResult = await query<ArtistRow>(
    `SELECT id, name, avatar_url, verified_identity, created_at
     FROM artists
     WHERE id = $1`,
    [artistId],
  );

  if (artistResult.rows.length === 0) {
    throw new NotFoundError('Artist', artistId);
  }

  const artist = artistResult.rows[0];

  // Count tracks, stories, and content links
  const trackCountResult = await query<CountRow>(
    'SELECT COUNT(*) AS count FROM tracks WHERE artist_id = $1',
    [artistId],
  );

  const storyCountResult = await query<CountRow>(
    `SELECT COUNT(*) AS count FROM stories
     WHERE artist_id = $1 AND status IN ('published', 'verified') AND deleted_at IS NULL`,
    [artistId],
  );

  const contentCountResult = await query<CountRow>(
    `SELECT COUNT(*) AS count FROM content_links cl
     JOIN tracks t ON t.id = cl.track_id
     WHERE t.artist_id = $1 AND cl.approved = TRUE`,
    [artistId],
  );

  // Paginated track list with story status indicator
  const tracksResult = await query<{
    id: string;
    isrc: string;
    title: string;
    album: string | null;
    story_status: string | null;
    created_at: string;
  }>(
    `SELECT t.id, t.isrc, t.title, t.album, t.created_at,
            (SELECT s.status FROM stories s
             WHERE s.track_id = t.id
               AND s.status IN ('published', 'verified')
               AND s.deleted_at IS NULL
             ORDER BY s.priority ASC LIMIT 1
            ) AS story_status
     FROM tracks t
     WHERE t.artist_id = $1
     ORDER BY t.created_at DESC`,
    [artistId],
  );

  return {
    artist: {
      id: artist.id,
      name: artist.name,
      avatar_url: artist.avatar_url,
      verified_identity: artist.verified_identity,
      created_at: artist.created_at,
    },
    counts: {
      tracks: parseInt(trackCountResult.rows[0].count, 10),
      stories: parseInt(storyCountResult.rows[0].count, 10),
      content_links: parseInt(contentCountResult.rows[0].count, 10),
    },
    tracks: tracksResult.rows,
  };
}

// ─── searchPublic ────────────────────────────────────────────────────────────

export async function searchPublic(q: string, filter: string, page: number, perPage: number) {
  const offset = (page - 1) * perPage;
  const searchTerm = `%${q}%`;

  // Build filter clause
  let filterClause = '';
  if (filter === 'has_story') {
    filterClause = `AND EXISTS (
      SELECT 1 FROM stories s
      WHERE s.track_id = t.id AND s.status IN ('published', 'verified') AND s.deleted_at IS NULL
    )`;
  } else if (filter === 'has_content') {
    filterClause = `AND EXISTS (
      SELECT 1 FROM content_links cl
      WHERE cl.track_id = t.id AND cl.approved = TRUE
    )`;
  } else if (filter === 'verified') {
    filterClause = `AND a.verified_identity = TRUE`;
  }

  // Count query
  const countResult = await query<CountRow>(
    `SELECT COUNT(*) AS count
     FROM tracks t
     JOIN artists a ON a.id = t.artist_id
     WHERE (t.title ILIKE $1 OR a.name ILIKE $1)
     ${filterClause}`,
    [searchTerm],
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Data query
  const dataResult = await query<SearchRow>(
    `SELECT t.id, t.isrc, t.title, t.album, t.artist_id,
            a.name AS artist_name, a.verified_identity,
            EXISTS (
              SELECT 1 FROM stories s
              WHERE s.track_id = t.id AND s.status IN ('published', 'verified') AND s.deleted_at IS NULL
            ) AS has_story,
            EXISTS (
              SELECT 1 FROM content_links cl
              WHERE cl.track_id = t.id AND cl.approved = TRUE
            ) AS has_content,
            (SELECT s.status FROM stories s
             WHERE s.track_id = t.id
               AND s.status IN ('published', 'verified')
               AND s.deleted_at IS NULL
             ORDER BY s.priority ASC LIMIT 1
            ) AS story_status
     FROM tracks t
     JOIN artists a ON a.id = t.artist_id
     WHERE (t.title ILIKE $1 OR a.name ILIKE $1)
     ${filterClause}
     ORDER BY t.title ASC
     LIMIT $2 OFFSET $3`,
    [searchTerm, perPage, offset],
  );

  return {
    data: dataResult.rows,
    pagination: {
      page,
      per_page: perPage,
      total,
    },
  };
}

// ─── getFeatured ─────────────────────────────────────────────────────────────

export async function getFeatured() {
  const result = await query<{
    story_id: string;
    story_status: string;
    story_priority: number;
    duration_seconds: string;
    story_version: number;
    transcript: string | null;
    story_created_at: string;
    storage_key: string;
    track_id: string;
    isrc: string;
    track_title: string;
    album: string | null;
    artist_id: string;
    artist_name: string;
    verified_identity: boolean;
  }>(
    `SELECT s.id AS story_id, s.status AS story_status, s.priority AS story_priority,
            s.duration_seconds, s.version AS story_version, s.transcript,
            s.created_at AS story_created_at, aa.storage_key,
            t.id AS track_id, t.isrc, t.title AS track_title, t.album,
            a.id AS artist_id, a.name AS artist_name, a.verified_identity
     FROM stories s
     JOIN audio_assets aa ON aa.id = s.audio_asset_id
     JOIN tracks t ON t.id = s.track_id
     JOIN artists a ON a.id = s.artist_id
     WHERE s.status = 'verified'
       AND s.deleted_at IS NULL
     ORDER BY s.verified_at DESC NULLS LAST, s.created_at DESC
     LIMIT 1`,
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const storage = getStorage();
  const audioUrl = await storage.getSignedUrl(row.storage_key);

  return {
    track: {
      id: row.track_id,
      isrc: row.isrc,
      title: row.track_title,
      album: row.album,
    },
    artist: {
      id: row.artist_id,
      name: row.artist_name,
      verified_identity: row.verified_identity,
    },
    story: {
      id: row.story_id,
      status: row.story_status,
      priority: row.story_priority,
      duration_seconds: parseFloat(row.duration_seconds),
      version: row.story_version,
      transcript: row.transcript,
      audio_url: audioUrl,
      created_at: row.story_created_at,
    },
  };
}

// ─── getRecent ───────────────────────────────────────────────────────────────

export async function getRecent(page: number, perPage: number) {
  const offset = (page - 1) * perPage;

  // Count tracks that have stories or content links
  const countResult = await query<CountRow>(
    `SELECT COUNT(DISTINCT t.id) AS count
     FROM tracks t
     WHERE EXISTS (
       SELECT 1 FROM stories s
       WHERE s.track_id = t.id AND s.status IN ('published', 'verified') AND s.deleted_at IS NULL
     )
     OR EXISTS (
       SELECT 1 FROM content_links cl
       WHERE cl.track_id = t.id AND cl.approved = TRUE
     )`,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await query<{
    id: string;
    isrc: string;
    title: string;
    album: string | null;
    artist_id: string;
    artist_name: string;
    verified_identity: boolean;
    story_status: string | null;
    latest_story_at: string | null;
  }>(
    `SELECT t.id, t.isrc, t.title, t.album, t.artist_id,
            a.name AS artist_name, a.verified_identity,
            (SELECT s.status FROM stories s
             WHERE s.track_id = t.id
               AND s.status IN ('published', 'verified')
               AND s.deleted_at IS NULL
             ORDER BY s.priority ASC LIMIT 1
            ) AS story_status,
            (SELECT MAX(s.created_at) FROM stories s
             WHERE s.track_id = t.id
               AND s.status IN ('published', 'verified')
               AND s.deleted_at IS NULL
            ) AS latest_story_at
     FROM tracks t
     JOIN artists a ON a.id = t.artist_id
     WHERE EXISTS (
       SELECT 1 FROM stories s
       WHERE s.track_id = t.id AND s.status IN ('published', 'verified') AND s.deleted_at IS NULL
     )
     OR EXISTS (
       SELECT 1 FROM content_links cl
       WHERE cl.track_id = t.id AND cl.approved = TRUE
     )
     ORDER BY latest_story_at DESC NULLS LAST, t.created_at DESC
     LIMIT $1 OFFSET $2`,
    [perPage, offset],
  );

  return {
    data: dataResult.rows,
    pagination: {
      page,
      per_page: perPage,
      total,
    },
  };
}
