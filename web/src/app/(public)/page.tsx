export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { api } from '@/lib/api';
import { SongCard } from '@/components/public/song-card';
import { SearchInput } from '@/components/public/search-input';

interface FeaturedData {
  track_title: string;
  artist_name: string;
  album: string;
  isrc: string;
  transcript: string;
  duration_seconds: number;
  verified: boolean;
}

interface RecentItem {
  isrc: string;
  title: string;
  artist_name: string;
  has_story: boolean;
  story_duration?: string;
  content_link_count: number;
}

async function getFeatured(): Promise<FeaturedData | null> {
  try {
    return await api<FeaturedData>('/v1/public/featured');
  } catch {
    return null;
  }
}

async function getRecent(): Promise<RecentItem[]> {
  try {
    const res = await api<{ data: RecentItem[] }>('/v1/public/recent?per_page=8');
    return res.data;
  } catch {
    return [];
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default async function LandingPage() {
  const [featured, recent] = await Promise.all([getFeatured(), getRecent()]);

  return (
    <>
      {/* Hero */}
      <section
        className="pt-40 pb-20 px-6 text-center"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--accent-glow) 0%, transparent 60%)' }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-5" style={{ letterSpacing: '-2px' }}>
          Every song has{' '}
          <em
            className="not-italic bg-clip-text"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            a story.
          </em>
        </h1>
        <p className="text-xl text-[var(--text-muted)] max-w-lg mx-auto mb-10">
          Hear what inspired the music you love — straight from the artists who made it.
        </p>
        <div className="max-w-xl mx-auto">
          <SearchInput placeholder="Search any song or artist..." />
        </div>
      </section>

      {/* Featured Story */}
      {featured && (
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Featured Story</h2>
          <Link href={`/song/${featured.isrc}`} className="no-underline text-inherit block">
            <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center transition-colors hover:border-[var(--accent)]">
              <div
                className="w-48 h-48 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d1b4e)' }}
              >
                <span className="text-6xl opacity-25">&#9835;</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="inline-block bg-[var(--accent-glow)] text-[var(--accent)] border border-[rgba(124,92,252,0.2)] px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  &#9733; Featured
                </span>
                <h3 className="text-3xl font-bold mb-1">{featured.track_title}</h3>
                <p className="text-[var(--text-muted)] text-base mb-4">
                  {featured.artist_name} &middot; {featured.album}
                </p>
                <div className="bg-[rgba(124,92,252,0.08)] border border-[rgba(124,92,252,0.15)] rounded-xl px-5 py-3 flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-white ml-0.5">
                      <polygon points="6,3 20,12 6,21" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-sm">
                      <div className="w-[35%] h-full bg-[var(--accent)] rounded-sm" />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                      <span>0:00</span>
                      <span>{formatDuration(featured.duration_seconds)}</span>
                    </div>
                  </div>
                </div>
                {featured.transcript && (
                  <p className="text-sm text-[var(--text-muted)] italic line-clamp-2">
                    &ldquo;{featured.transcript.slice(0, 200)}...&rdquo;
                  </p>
                )}
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Recently Added */}
      {recent.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Recently Added</h2>
            <Link href="/explore" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] no-underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {recent.map((item) => (
              <SongCard
                key={item.isrc}
                isrc={item.isrc}
                title={item.title}
                artist={item.artist_name}
                hasStory={item.has_story}
                storyDuration={item.story_duration}
                contentLinkCount={item.content_link_count}
              />
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold tracking-tight mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: '1', title: 'Search a song', desc: 'Find any song by title or artist name. Every track has a page.' },
            { n: '2', title: 'Hear the story', desc: 'Listen to the artist tell you what inspired the song, in their own words.' },
            { n: '3', title: 'Go deeper', desc: 'Explore interviews, podcasts, and articles. Then listen on your favorite platform.' },
          ].map((step) => (
            <div key={step.n} className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-7 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-glow)] border border-[rgba(124,92,252,0.2)] text-[var(--accent)] font-bold text-xl flex items-center justify-center mx-auto mb-4">
                {step.n}
              </div>
              <h4 className="text-base font-semibold mb-2">{step.title}</h4>
              <p className="text-sm text-[var(--text-muted)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Artist CTA */}
      <section
        className="text-center py-20 px-6"
        style={{ background: 'linear-gradient(180deg, transparent, var(--accent-glow), transparent)' }}
      >
        <h2 className="text-4xl font-extrabold mb-3" style={{ letterSpacing: '-1px' }}>
          Are you an artist?
        </h2>
        <p className="text-lg text-[var(--text-muted)] mb-8 max-w-md mx-auto">
          Your fans want to hear the stories behind your music. Record yours in minutes.
        </p>
        <Link
          href="/for-artists"
          className="inline-block px-8 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-semibold text-base transition-colors no-underline"
        >
          Tell Your Story
        </Link>
      </section>
    </>
  );
}
