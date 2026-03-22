import { v4 as uuidv4 } from 'uuid';
import { query } from '../../db/connection.js';
import { ConflictError, NotFoundError } from '../../utils/errors.js';
import type { CreateContentLinkInput, UpdateContentLinkInput, ListContentLinksInput } from './content-links.schemas.js';

interface ContentLink {
  id: string;
  track_id: string;
  url: string;
  title: string;
  source: string;
  description: string | null;
  duration: string | null;
  thumbnail_url: string | null;
  added_by: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

interface AffiliateConfig {
  domain_pattern: string;
  affiliate_tag: string;
  url_template: string;
}

/**
 * Wraps a URL with affiliate tags if a matching config exists.
 */
async function applyAffiliateLink(url: string): Promise<string> {
  const configs = await query<AffiliateConfig>(
    'SELECT domain_pattern, affiliate_tag, url_template FROM affiliate_configs WHERE active = TRUE',
  );

  for (const config of configs.rows) {
    if (url.includes(config.domain_pattern)) {
      return config.url_template
        .replace('{url}', encodeURIComponent(url))
        .replace('{tag}', config.affiliate_tag);
    }
  }

  return url;
}

/**
 * Apply affiliate links to an array of content links.
 */
async function enrichWithAffiliateLinks(links: ContentLink[]): Promise<(ContentLink & { affiliate_url: string })[]> {
  return Promise.all(
    links.map(async (link) => ({
      ...link,
      affiliate_url: await applyAffiliateLink(link.url),
    })),
  );
}

/**
 * List approved content links for a track. Public — no auth required.
 */
export async function listContentLinks(trackId: string, input: ListContentLinksInput) {
  const offset = (input.page - 1) * input.per_page;

  let whereClause = 'WHERE cl.track_id = $1 AND cl.approved = TRUE';
  const params: unknown[] = [trackId];

  if (input.source) {
    params.push(input.source);
    whereClause += ` AND cl.source = $${params.length}`;
  }

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM content_links cl ${whereClause}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(input.per_page, offset);
  const result = await query<ContentLink>(
    `SELECT cl.id, cl.track_id, cl.url, cl.title, cl.source, cl.description,
            cl.duration, cl.thumbnail_url, cl.added_by, cl.approved,
            cl.created_at, cl.updated_at
     FROM content_links cl
     ${whereClause}
     ORDER BY cl.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  const enriched = await enrichWithAffiliateLinks(result.rows);

  return {
    data: enriched,
    pagination: {
      page: input.page,
      per_page: input.per_page,
      total,
    },
  };
}

/**
 * Add a content link to a track.
 */
export async function createContentLink(trackId: string, addedBy: string, input: CreateContentLinkInput) {
  // Check for duplicate URL on this track
  const existing = await query(
    'SELECT id FROM content_links WHERE track_id = $1 AND url = $2',
    [trackId, input.url],
  );
  if (existing.rows.length > 0) {
    throw new ConflictError('This URL is already linked to this track');
  }

  // Verify track exists
  const track = await query('SELECT id FROM tracks WHERE id = $1', [trackId]);
  if (track.rows.length === 0) {
    throw new NotFoundError('Track', trackId);
  }

  const id = uuidv4();
  const result = await query<ContentLink>(
    `INSERT INTO content_links (id, track_id, url, title, source, description, duration, thumbnail_url, added_by, approved)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      id,
      trackId,
      input.url,
      input.title,
      input.source,
      input.description || null,
      input.duration || null,
      input.thumbnail_url || null,
      addedBy,
      false, // requires approval
    ],
  );

  return result.rows[0];
}

/**
 * Update a content link. Only the user who added it (or admin) can update.
 */
export async function updateContentLink(linkId: string, artistId: string, input: UpdateContentLinkInput) {
  const existing = await query<ContentLink>(
    'SELECT * FROM content_links WHERE id = $1',
    [linkId],
  );
  if (existing.rows.length === 0) {
    throw new NotFoundError('ContentLink', linkId);
  }

  const link = existing.rows[0];
  if (link.added_by !== artistId) {
    throw new NotFoundError('ContentLink', linkId); // don't reveal it exists
  }

  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      updates.push(`${key} = $${paramIdx}`);
      params.push(value);
      paramIdx++;
    }
  }

  if (updates.length === 0) {
    return link;
  }

  // Re-require approval after edit
  updates.push(`approved = $${paramIdx}`);
  params.push(false);
  paramIdx++;

  updates.push(`updated_at = NOW()`);

  params.push(linkId);
  const result = await query<ContentLink>(
    `UPDATE content_links SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
    params,
  );

  return result.rows[0];
}

/**
 * Delete a content link.
 */
export async function deleteContentLink(linkId: string, artistId: string) {
  const existing = await query<ContentLink>(
    'SELECT * FROM content_links WHERE id = $1',
    [linkId],
  );
  if (existing.rows.length === 0) {
    throw new NotFoundError('ContentLink', linkId);
  }

  if (existing.rows[0].added_by !== artistId) {
    throw new NotFoundError('ContentLink', linkId);
  }

  await query('DELETE FROM content_links WHERE id = $1', [linkId]);
}

/**
 * Admin: approve a content link.
 */
export async function approveContentLink(linkId: string) {
  const result = await query<ContentLink>(
    `UPDATE content_links SET approved = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [linkId],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('ContentLink', linkId);
  }

  return result.rows[0];
}

/**
 * Admin: list pending (unapproved) content links.
 */
export async function listPendingLinks(page: number, perPage: number) {
  const offset = (page - 1) * perPage;

  const countResult = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM content_links WHERE approved = FALSE',
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query<ContentLink & { track_title: string; artist_name: string }>(
    `SELECT cl.*, t.title as track_title, a.name as artist_name
     FROM content_links cl
     JOIN tracks t ON t.id = cl.track_id
     LEFT JOIN artists a ON a.id = cl.added_by
     WHERE cl.approved = FALSE
     ORDER BY cl.created_at ASC
     LIMIT $1 OFFSET $2`,
    [perPage, offset],
  );

  return {
    data: result.rows,
    pagination: { page, per_page: perPage, total },
  };
}
