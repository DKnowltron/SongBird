import { query } from '../../db/connection.js';

export async function getDashboard(artistId: string) {
  const [tracksResult, storiesResult, distributedResult] = await Promise.all([
    query<{ total: string; with_stories: string }>(
      `SELECT
         COUNT(*) as total,
         COUNT(DISTINCT s.track_id) FILTER (WHERE s.id IS NOT NULL AND s.deleted_at IS NULL) as with_stories
       FROM tracks t
       LEFT JOIN stories s ON s.track_id = t.id
       WHERE t.artist_id = $1`,
      [artistId],
    ),
    query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) as count
       FROM stories
       WHERE artist_id = $1 AND deleted_at IS NULL
       GROUP BY status`,
      [artistId],
    ),
    query<{ count: string }>(
      `SELECT COUNT(DISTINCT d.id) as count
       FROM distributions d
       JOIN stories s ON s.id = d.story_id
       WHERE s.artist_id = $1 AND d.status = 'delivered'`,
      [artistId],
    ),
  ]);

  const storyStats: Record<string, number> = {};
  storiesResult.rows.forEach((r) => {
    storyStats[r.status] = parseInt(r.count, 10);
  });

  return {
    total_tracks: parseInt(tracksResult.rows[0].total, 10),
    tracks_with_stories: parseInt(tracksResult.rows[0].with_stories, 10),
    stories_verified: storyStats.verified || 0,
    stories_draft: storyStats.draft || 0,
    stories_distributed: parseInt(distributedResult.rows[0].count, 10),
  };
}
