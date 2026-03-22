import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Storyteller',
  description: 'Streaming killed liner notes. Storyteller brings them back as audio, from the artists themselves.',
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-32 pb-20">
      {/* Hero */}
      <div className="text-center mb-16 pb-12 border-b border-[var(--border-color)]">
        <h1 className="text-5xl font-extrabold leading-tight mb-4" style={{ letterSpacing: '-2px' }}>
          Streaming killed{' '}
          <em
            className="not-italic"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            liner notes.
          </em>
          <br />
          We&apos;re bringing them back.
        </h1>
        <p className="text-lg text-[var(--text-muted)] max-w-lg mx-auto">
          Every song has a story — its inspiration, its meaning, the circumstances of its creation. Storyteller brings that context back, as audio, from the artists themselves.
        </p>
      </div>

      {/* The Problem */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">The Problem</h2>
        <p className="text-[var(--text-muted)] mb-4">
          In the vinyl and CD era, liner notes gave listeners a window into the music: who played on the track, what the lyrics meant, what was happening in the studio. <strong className="text-[var(--text)]">Streaming eliminated all of that.</strong>
        </p>
        <p className="text-[var(--text-muted)]">
          Today, you can listen to a song a thousand times without ever knowing the story behind it. That context — the human story — is what transforms a song from background noise into something meaningful.
        </p>
      </div>

      {/* Quote */}
      <div className="bg-[var(--surface)] border-l-[3px] border-l-[var(--accent)] rounded-r-xl px-7 py-6 my-8">
        <p className="text-lg italic text-[var(--text)] mb-2">
          &ldquo;I wrote &lsquo;Lose Yourself&rsquo; in a trailer on the 8 Mile set between takes. I had Mom&apos;s spaghetti stains on my shirt and I was trying to capture that exact feeling of having one shot.&rdquo;
        </p>
        <cite className="text-sm text-[var(--text-muted)] not-italic">— The kind of story every song deserves</cite>
      </div>

      {/* The Solution */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">The Solution</h2>
        <p className="text-[var(--text-muted)] mb-4">
          Storyteller is a platform where <strong className="text-[var(--text)]">artists record short audio stories about their songs</strong>. These stories are then distributed to streaming platforms as a new content type — the same way distributors deliver tracks and metadata today.
        </p>
        <p className="text-[var(--text-muted)]">
          When a listener plays a song on their streaming app, the artist&apos;s story plays first. It&apos;s like having the artist sit next to you and say, &ldquo;Let me tell you about this one.&rdquo;
        </p>
      </div>

      {/* How It Works */}
      <div className="space-y-6 my-8">
        {[
          { n: '1', title: 'Artists record stories', desc: 'Open the app, pick a song, hit record. Tell the story in your own words. It takes 30 seconds to a few minutes.' },
          { n: '2', title: 'We distribute to streaming platforms', desc: 'Storyteller packages the audio and delivers it to Spotify, Apple Music, and other partners via API — just like music distributors deliver tracks.' },
          { n: '3', title: 'Listeners hear the story', desc: 'Before the song plays, the listener hears the artist\'s story. They can skip it, replay it, or discover it here on our site alongside curated content.' },
        ].map((step) => (
          <div key={step.n} className="flex gap-5">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-glow)] border border-[rgba(124,92,252,0.2)] text-[var(--accent)] font-bold text-base flex items-center justify-center flex-shrink-0">
              {step.n}
            </div>
            <div className="pt-1.5">
              <h3 className="text-base font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-[var(--border-color)] my-12" />

      {/* Who It's For */}
      <h2 className="text-2xl font-bold tracking-tight mb-6">Who It&apos;s For</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-7">
          <div className="text-3xl mb-3">&#127911;</div>
          <h3 className="text-lg font-bold mb-2">Listeners</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Discover the stories behind the music you love. Hear artists explain their songs in their own words.
          </p>
          <Link href="/explore" className="inline-block px-5 py-2 bg-[var(--surface-hover)] border border-[var(--border-color)] text-[var(--text)] rounded-lg text-sm font-semibold hover:border-[var(--accent)] transition-colors no-underline">
            Start Exploring
          </Link>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-7">
          <div className="text-3xl mb-3">&#127908;</div>
          <h3 className="text-lg font-bold mb-2">Artists</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Your fans want the story behind the music. Record it in minutes, and we&apos;ll distribute it everywhere.
          </p>
          <Link href="/for-artists" className="inline-block px-5 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors no-underline">
            Tell Your Story
          </Link>
        </div>
      </div>

      <hr className="border-[var(--border-color)] my-12" />

      {/* What We're Not */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">What We&apos;re Not</h2>
        <p className="text-[var(--text-muted)] mb-3">
          <strong className="text-[var(--text)]">Not a streaming platform.</strong> We don&apos;t play music. We distribute story content to the platforms that do.
        </p>
        <p className="text-[var(--text-muted)] mb-3">
          <strong className="text-[var(--text)]">Not a podcast.</strong> Stories are short-form (under 5 minutes), tied to specific tracks, and designed to play before the song.
        </p>
        <p className="text-[var(--text-muted)]">
          <strong className="text-[var(--text)]">Not a social network.</strong> No comments, no likes, no followers. Just stories and music.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center py-12">
        <h2 className="text-3xl font-extrabold mb-3" style={{ letterSpacing: '-1px' }}>
          Ready to explore?
        </h2>
        <p className="text-[var(--text-muted)] mb-6">Find the stories behind your favorite songs.</p>
        <Link
          href="/explore"
          className="inline-block px-8 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-semibold text-base transition-colors no-underline"
        >
          Explore Songs
        </Link>
      </div>
    </div>
  );
}
