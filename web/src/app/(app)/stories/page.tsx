'use client';

import Link from 'next/link';
import { useApi } from '@/lib/hooks';

interface Track {
  id: string;
  isrc: string;
  title: string;
  album: string | null;
  story_count?: number;
  has_verified_story?: boolean;
}

interface TracksResponse {
  data: Track[];
  pagination: { page: number; per_page: number; total: number };
}

export default function StoriesPage() {
  const { data, loading, error } = useApi<TracksResponse>('/v1/tracks?per_page=100');

  const tracksWithStories = data?.data.filter((t) => (t.story_count || 0) > 0) || [];
  const tracksWithout = data?.data.filter((t) => (t.story_count || 0) === 0) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Stories</h1>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {data && (
        <>
          {tracksWithStories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Tracks with stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tracksWithStories.map((track) => (
                  <Link
                    key={track.id}
                    href={`/tracks/${track.id}`}
                    className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <p className="font-medium">{track.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{track.isrc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {track.has_verified_story ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-success/10 text-success">Verified</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-warning/10 text-warning">In progress</span>
                      )}
                      <span className="text-xs text-muted-foreground">{track.story_count} {track.story_count === 1 ? 'story' : 'stories'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {tracksWithout.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Tracks needing stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tracksWithout.map((track) => (
                  <Link
                    key={track.id}
                    href={`/tracks/${track.id}`}
                    className="block p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <p className="font-medium">{track.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{track.isrc}</p>
                    <p className="text-xs text-muted-foreground mt-2">No stories — record one</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {data.data.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No tracks yet</p>
              <p className="mt-1">
                <Link href="/tracks" className="text-primary hover:underline">Add tracks</Link> to start recording stories.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
