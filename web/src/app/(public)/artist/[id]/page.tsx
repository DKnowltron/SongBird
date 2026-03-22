export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SongCard } from '@/components/public/song-card';

interface ArtistData {
  artist: {
    id: string;
    name: string;
    avatar_url: string | null;
    verified_identity: boolean;
  };
  counts: {
    tracks: number;
    stories: number;
    content_links: number;
  };
  tracks: Array<{
    id: string;
    isrc: string;
    title: string;
    album: string;
    has_story: boolean;
    is_verified: boolean;
    story_duration?: number;
    content_link_count: number;
  }>;
}

async function getArtist(id: string): Promise<ArtistData | null> {
  try {
    return await api<ArtistData>(`/v1/public/artists/${id}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getArtist(id);
  if (!data) return { title: 'Artist Not Found | Storyteller' };
  return {
    title: `${data.artist.name} — Artist Stories | Storyteller`,
    description: `Hear the stories behind ${data.artist.name}'s music. ${data.counts.stories} stories across ${data.counts.tracks} tracks.`,
  };
}

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getArtist(id);
  if (!data) notFound();

  const { artist, counts, tracks } = data;
  const tracksWithStories = tracks.filter((t) => t.has_story);
  const initial = artist.name.charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
      <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] no-underline mb-8">
        &larr; Back to Explore
      </Link>

      {/* Artist Header */}
      <div className="flex flex-col md:flex-row gap-7 items-center mb-12 pb-8 border-b border-[var(--border-color)]">
        <div
          className="w-36 h-36 rounded-full flex-shrink-0 flex items-center justify-center text-5xl font-extrabold text-[var(--accent)] opacity-60 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #2d1b4e, #1a0a2e)' }}
        >
          {initial}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight mb-1" style={{ letterSpacing: '-1px' }}>
            {artist.name}
          </h1>
          {artist.verified_identity && (
            <div className="text-[var(--green)] text-sm font-semibold mb-2">&#10003; Verified Artist</div>
          )}
          <div className="text-[var(--text-muted)] text-base mb-4">
            <strong className="text-[var(--text)]">{counts.tracks}</strong> tracks &middot;{' '}
            <strong className="text-[var(--text)]">{counts.stories}</strong> stories &middot;{' '}
            <strong className="text-[var(--text)]">{counts.content_links}</strong> content links
          </div>
          <div className="flex gap-2.5 flex-wrap justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--surface)] border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text)] cursor-pointer hover:border-[var(--text-muted)] transition-colors">
              &#9654; Spotify
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--surface)] border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text)] cursor-pointer hover:border-[var(--text-muted)] transition-colors">
              &#9654; Apple Music
            </span>
          </div>
        </div>
      </div>

      {/* Songs with Stories */}
      {tracksWithStories.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold">Songs with Stories</h2>
            <span className="text-sm text-[var(--text-muted)]">{tracksWithStories.length} stories</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tracksWithStories.map((t) => (
              <SongCard
                key={t.isrc}
                isrc={t.isrc}
                title={t.title}
                artist={artist.name}
                hasStory={true}
                storyDuration={t.story_duration ? `${Math.floor(t.story_duration / 60)}:${String(Math.floor(t.story_duration % 60)).padStart(2, '0')}` : undefined}
                contentLinkCount={t.content_link_count}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Tracks */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">All Tracks</h2>
          <span className="text-sm text-[var(--text-muted)]">{counts.tracks} tracks</span>
        </div>
        <div>
          {tracks.map((t, i) => (
            <Link key={t.isrc} href={`/song/${t.isrc}`} className="no-underline text-inherit block">
              <div className="flex items-center gap-4 py-3.5 border-b border-[var(--border-color)] hover:bg-[var(--surface)] hover:rounded-lg hover:px-3 hover:-mx-3 transition-all cursor-pointer">
                <div className="w-7 text-center text-sm text-[var(--text-muted)] flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{t.title}</h4>
                </div>
                <div className="hidden md:block flex-shrink-0 w-48 text-sm text-[var(--text-muted)] truncate">
                  {t.album}
                </div>
                <div className="flex-shrink-0">
                  {t.is_verified ? (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[rgba(52,211,153,0.1)] text-[var(--green)]">
                      Verified Story
                    </span>
                  ) : t.has_story ? (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[var(--accent-glow)] text-[var(--accent)]">
                      Has Story
                    </span>
                  ) : t.content_link_count > 0 ? (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[rgba(251,146,60,0.1)] text-[var(--orange)]">
                      Content Only
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[var(--surface-hover)] text-[var(--text-muted)]">
                      No story yet
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
