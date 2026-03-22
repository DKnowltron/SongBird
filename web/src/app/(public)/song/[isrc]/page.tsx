export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { AudioPlayer } from '@/components/public/audio-player';
import { ContentLinkCard } from '@/components/public/content-link-card';
import { SongCard } from '@/components/public/song-card';

interface Story {
  id: string;
  status: string;
  duration_seconds: number;
  transcript: string | null;
  audio_url: string;
  verified_at: string | null;
}

interface ContentLink {
  id: string;
  url: string;
  title: string;
  source: string;
  description: string | null;
  duration: string | null;
  affiliate_url?: string;
}

interface ArtistTrack {
  isrc: string;
  title: string;
  album: string;
  has_story: boolean;
}

interface SongData {
  track: {
    id: string;
    isrc: string;
    title: string;
    album: string;
    artist_id: string;
    artist_name: string;
    artist_verified: boolean;
  };
  story: Story | null;
  content_links: ContentLink[];
  more_from_artist: ArtistTrack[];
}

async function getSong(isrc: string): Promise<SongData | null> {
  try {
    return await api<SongData>(`/v1/public/songs/${isrc}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ isrc: string }> }): Promise<Metadata> {
  const { isrc } = await params;
  const song = await getSong(isrc);
  if (!song) return { title: 'Song Not Found | Storyteller' };

  const description = song.story?.transcript
    ? `${song.story.transcript.slice(0, 150)}...`
    : `Discover the story behind "${song.track.title}" by ${song.track.artist_name}`;

  return {
    title: `"${song.track.title}" by ${song.track.artist_name} — Story Behind the Song | Storyteller`,
    description,
    openGraph: {
      title: `${song.track.title} by ${song.track.artist_name} — The Story Behind the Song`,
      description,
      type: 'music.song',
    },
  };
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default async function SongPage({ params }: { params: Promise<{ isrc: string }> }) {
  const { isrc } = await params;
  const song = await getSong(isrc);
  if (!song) notFound();

  const { track, story, content_links } = song;

  // Group content links by source
  const grouped: Record<string, ContentLink[]> = {};
  for (const link of content_links) {
    const key = link.source;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(link);
  }

  const sourceLabels: Record<string, { label: string; icon: string }> = {
    youtube: { label: 'Videos', icon: '\uD83C\uDFAC' },
    podcast: { label: 'Podcasts', icon: '\uD83C\uDF99' },
    article: { label: 'Articles', icon: '\uD83D\uDCF0' },
    social: { label: 'Social', icon: '\uD83D\uDCAC' },
    other: { label: 'Other', icon: '\uD83D\uDD17' },
  };

  return (
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
      {/* Back */}
      <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)] no-underline mb-8">
        &larr; Back
      </Link>

      {/* Track Header */}
      <div className="flex flex-col md:flex-row gap-7 items-start mb-10">
        <div
          className="w-44 h-44 rounded-xl flex-shrink-0 flex items-center justify-center shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #2d1b4e, #1a0a2e)' }}
        >
          <span className="text-6xl opacity-25">&#9835;</span>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1" style={{ letterSpacing: '-1px' }}>
            {track.title}
          </h1>
          <div className="text-lg mb-1">
            <Link href={`/artist/${track.artist_id}`} className="text-[var(--text)] font-semibold hover:text-[var(--accent)] no-underline">
              {track.artist_name}
            </Link>
          </div>
          <div className="text-sm text-[var(--text-muted)] mb-4">
            {track.album}
          </div>
          <code className="text-xs text-[var(--text-muted)] bg-[var(--surface)] px-2 py-1 rounded inline-block mb-4">
            ISRC: {track.isrc}
          </code>
          <div className="flex gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--surface)] border border-[#1db954] rounded-lg text-sm font-medium text-[var(--text)] hover:bg-[rgba(29,185,84,0.1)] transition-colors cursor-pointer">
              &#9654; Spotify
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--surface)] border border-[#fc3c44] rounded-lg text-sm font-medium text-[var(--text)] hover:bg-[rgba(252,60,68,0.1)] transition-colors cursor-pointer">
              &#9654; Apple Music
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--surface)] border border-[#ff0000] rounded-lg text-sm font-medium text-[var(--text)] hover:bg-[rgba(255,0,0,0.1)] transition-colors cursor-pointer">
              &#9654; YouTube Music
            </span>
          </div>
        </div>
      </div>

      {/* The Story */}
      {story && (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-7 mb-10">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold">The Story</h2>
            {story.verified_at && (
              <span className="inline-flex items-center gap-1.5 text-[var(--green)] text-sm font-semibold bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.2)] px-3 py-1 rounded-full">
                &#10003; Artist Verified
              </span>
            )}
          </div>

          <AudioPlayer
            audioUrl={story.audio_url}
            duration={story.duration_seconds}
            label={`Artist Story \u00B7 ${formatDuration(story.duration_seconds)}`}
          />

          {story.transcript && (
            <details className="mt-5 border-t border-[var(--border-color)] pt-5">
              <summary className="text-[15px] font-semibold cursor-pointer select-none flex justify-between items-center">
                Transcript
                <span className="text-[var(--text-muted)] text-lg">&#9660;</span>
              </summary>
              <div className="mt-4 text-[15px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                {story.transcript}
              </div>
            </details>
          )}
        </div>
      )}

      {/* No story placeholder */}
      {!story && (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-7 mb-10 text-center">
          <h2 className="text-xl font-bold mb-2">No Story Yet</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            This song doesn&apos;t have an artist story yet. Check out the content below, or help build this page.
          </p>
        </div>
      )}

      {/* Content Links */}
      {content_links.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-5">More About This Song</h2>
          {Object.entries(grouped).map(([source, links]) => {
            const config = sourceLabels[source] || sourceLabels.other;
            return (
              <div key={source} className="mb-7">
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                  {config.icon} {config.label}
                </h3>
                {links.map((link) => (
                  <ContentLinkCard
                    key={link.id}
                    url={link.affiliate_url || link.url}
                    title={link.title}
                    source={link.source}
                    description={link.description ?? undefined}
                    duration={link.duration ?? undefined}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* More From Artist */}
      {song.more_from_artist && song.more_from_artist.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-5">
            More from{' '}
            <Link href={`/artist/${track.artist_id}`} className="text-[var(--accent)] hover:text-[var(--accent-hover)] no-underline">
              {track.artist_name}
            </Link>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {song.more_from_artist
              .filter((t) => t.isrc !== track.isrc)
              .slice(0, 4)
              .map((t) => (
                <SongCard
                  key={t.isrc}
                  isrc={t.isrc}
                  title={t.title}
                  artist={track.artist_name}
                  hasStory={t.has_story}
                />
              ))}
          </div>
        </div>
      )}

      {/* Contribute */}
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-8 text-center mb-10">
        <h3 className="text-lg font-bold mb-2">Know something about this song?</h3>
        <p className="text-sm text-[var(--text-muted)] mb-5">
          Help build the story behind {track.title} by sharing interviews, podcasts, articles, or videos.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <span className="inline-block px-6 py-2.5 bg-[var(--surface-hover)] border border-[var(--border-color)] text-[var(--text)] rounded-lg font-semibold text-sm cursor-pointer hover:border-[var(--accent)] transition-colors">
            Submit a Link
          </span>
          <Link
            href="/for-artists"
            className="inline-block px-6 py-2.5 bg-[var(--accent)] text-white rounded-lg font-semibold text-sm hover:bg-[var(--accent-hover)] transition-colors no-underline"
          >
            Are you the artist? Claim this page
          </Link>
        </div>
      </div>
    </div>
  );
}
