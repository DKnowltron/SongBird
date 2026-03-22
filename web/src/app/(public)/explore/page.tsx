export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { SearchInput } from '@/components/public/search-input';
import { SongRow } from '@/components/public/song-row';

export const metadata: Metadata = {
  title: 'Explore — Storyteller',
  description: 'Browse and search songs with stories and curated content.',
};

interface SearchResult {
  isrc: string;
  title: string;
  artist_name: string;
  album: string;
  has_story: boolean;
  is_verified: boolean;
  story_duration?: string;
  content_link_count: number;
}

interface SearchResponse {
  data: SearchResult[];
  pagination: { total: number; page: number; per_page: number };
}

async function search(q?: string, filter?: string): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (filter && filter !== 'all') params.set('filter', filter);
    params.set('per_page', '20');
    return await api<SearchResponse>(`/v1/public/search?${params.toString()}`);
  } catch {
    return { data: [], pagination: { total: 0, page: 1, per_page: 20 } };
  }
}

function formatDuration(seconds?: number): string | undefined {
  if (!seconds) return undefined;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q, filter } = await searchParams;
  const results = await search(q, filter);

  const filters = ['All', 'Has Story', 'Has Content', 'Verified', 'New This Week'];
  const filterValues = ['all', 'has_story', 'has_content', 'verified', 'new'];
  const activeFilter = filter || 'all';

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6" style={{ letterSpacing: '-1px' }}>
        Explore
      </h1>

      <div className="mb-6">
        <SearchInput placeholder="Search songs, artists, albums..." />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {filters.map((label, i) => (
          <a
            key={label}
            href={`/explore?${new URLSearchParams({ ...(q ? { q } : {}), filter: filterValues[i] }).toString()}`}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all no-underline ${
              activeFilter === filterValues[i]
                ? 'bg-[var(--accent-glow)] border border-[var(--accent)] text-[var(--accent)]'
                : 'bg-[var(--surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="text-sm text-[var(--text-muted)] mb-5">
        Showing {results.pagination.total} songs{q ? ` matching "${q}"` : ''}
      </div>

      {/* Results */}
      <div className="flex flex-col gap-2">
        {results.data.map((item) => (
          <SongRow
            key={item.isrc}
            isrc={item.isrc}
            title={item.title}
            artist={item.artist_name}
            album={item.album}
            hasStory={item.has_story}
            isVerified={item.is_verified}
            storyDuration={formatDuration(item.story_duration ? Number(item.story_duration) : undefined)}
            contentLinkCount={item.content_link_count}
          />
        ))}

        {results.data.length === 0 && (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <p className="text-lg mb-2">No songs found</p>
            <p className="text-sm">Try a different search or browse all songs.</p>
          </div>
        )}
      </div>
    </div>
  );
}
