import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'For Artists — Storyteller',
  description: 'Record the story behind your music in minutes. We distribute it to every streaming platform.',
};

export default function ForArtistsPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="text-center pt-40 pb-20 px-6"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--accent-glow) 0%, transparent 60%)' }}
      >
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-4" style={{ letterSpacing: '-2px' }}>
          Your fans want{' '}
          <em
            className="not-italic"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            the story.
          </em>
        </h1>
        <p className="text-xl text-[var(--text-muted)] max-w-xl mx-auto mb-10">
          Record the story behind your music in minutes. We&apos;ll distribute it to every streaming platform.
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-4 bg-[var(--accent)] text-white rounded-xl font-bold text-lg shadow-[0_4px_24px_rgba(124,92,252,0.3)] hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 transition-all no-underline"
        >
          Get Started Free
        </Link>
        <p className="text-sm text-[var(--text-muted)] mt-4">No credit card required. Record your first story today.</p>
      </section>

      {/* Value Props */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-extrabold text-center mb-12" style={{ letterSpacing: '-1px' }}>
          Why artists love Storyteller
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '&#127908;', title: 'Record in Seconds', desc: 'Open the app, pick a song, hit record. Tell the story in your own words. It\'s that simple.' },
            { icon: '&#127760;', title: 'Distributed Everywhere', desc: 'Your story is delivered to Spotify, Apple Music, and every connected streaming platform automatically.' },
            { icon: '&#128176;', title: 'Own Your Narrative', desc: 'No algorithms deciding what your song means. Your words, your voice, your story. Verified by you.' },
          ].map((item) => (
            <div key={item.title} className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4" dangerouslySetInnerHTML={{ __html: item.icon }} />
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-[var(--border-color)]">
        <h2 className="text-3xl font-extrabold text-center mb-12" style={{ letterSpacing: '-1px' }}>
          How it works
        </h2>
        <div className="max-w-xl mx-auto space-y-10">
          {[
            { n: '1', title: 'Sign up and import your catalog', desc: 'Create an account, then import your tracks via CSV, search by name, or connect through your distributor. We use ISRCs to link everything.' },
            { n: '2', title: 'Record or upload stories', desc: 'Pick a song, tap record, and tell the story. Or upload a pre-recorded audio file. Stories can be 5 seconds to 5 minutes.' },
            { n: '3', title: 'Review and publish', desc: 'Listen back, add a transcript if you want, then hit publish. You can verify it to signal to platforms that it\'s artist-approved.' },
            { n: '4', title: 'We handle distribution', desc: 'Your story is packaged and delivered to streaming partners via our API. Listeners hear your story before your track plays.' },
          ].map((step, i) => (
            <div key={step.n} className="flex gap-6 relative">
              {i < 3 && (
                <div className="absolute left-[23px] top-[52px] bottom-[-24px] w-[2px] bg-[var(--border-color)]" />
              )}
              <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-white font-bold text-xl flex items-center justify-center flex-shrink-0 relative z-10">
                {step.n}
              </div>
              <div className="pt-2">
                <h3 className="text-lg font-bold mb-1.5">{step.title}</h3>
                <p className="text-[15px] text-[var(--text-muted)]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recording Mockup */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-[var(--border-color)] text-center">
        <h2 className="text-3xl font-extrabold mb-4" style={{ letterSpacing: '-1px' }}>
          Simple enough for anyone
        </h2>
        <p className="text-[var(--text-muted)] mb-10">
          The recording experience is designed to be as easy as leaving a voice memo.
        </p>
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-8 max-w-md mx-auto text-left">
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[var(--border-color)]">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, var(--accent), #c084fc)' }}>
              AJ
            </div>
            <div>
              <h4 className="text-sm font-semibold">Alicia Johnson</h4>
              <p className="text-xs text-[var(--text-muted)]">3 tracks &middot; 1 story</p>
            </div>
          </div>
          <div className="bg-[var(--surface-hover)] rounded-xl p-4 mb-5">
            <h4 className="text-[15px] font-semibold mb-0.5">Midnight Drive</h4>
            <p className="text-sm text-[var(--text-muted)]">Singles &middot; ISRC: USRC12345678</p>
          </div>
          <div className="bg-[rgba(124,92,252,0.06)] border border-[rgba(124,92,252,0.15)] rounded-xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f87171] mx-auto mb-3 flex items-center justify-center" style={{ border: '4px solid rgba(248,113,113,0.3)' }}>
              <div className="w-6 h-6 rounded-full bg-white" />
            </div>
            <div className="text-sm text-[var(--text-muted)] font-medium">Recording...</div>
            <div className="text-2xl font-bold mt-2 tabular-nums">0:18</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-[var(--border-color)]">
        <h2 className="text-3xl font-extrabold text-center mb-10" style={{ letterSpacing: '-1px' }}>
          Questions
        </h2>
        <div className="max-w-2xl mx-auto">
          {[
            { q: 'Is it free?', a: 'Yes. Recording and distributing stories is free during our early access period. We believe in proving value before charging for it.' },
            { q: 'Which streaming platforms do you distribute to?', a: "We're currently in partnership discussions with Spotify, Apple Music, Amazon Music, and YouTube Music. Stories will be delivered to all connected platforms as partnerships go live." },
            { q: 'How long should my story be?', a: 'Stories can be anywhere from 5 seconds to 5 minutes. Most artists find 30 seconds to 2 minutes hits the sweet spot.' },
            { q: 'Do I own my stories?', a: 'Your stories are your content. You grant Storyteller a license to distribute them to streaming platforms on your behalf. You can update, replace, or remove a story at any time.' },
            { q: 'What if I already have recorded stories elsewhere?', a: 'You can upload pre-recorded audio files in MP3, WAV, AAC, or WebM format. No need to re-record.' },
            { q: "I'm a label manager. Can I manage multiple artists?", a: 'Yes. Storyteller supports multi-label, multi-artist workflows from day one.' },
          ].map((item) => (
            <details key={item.q} className="border-b border-[var(--border-color)] py-5 group">
              <summary className="text-base font-semibold cursor-pointer list-none flex justify-between items-center">
                {item.q}
                <span className="text-[var(--text-muted)] transition-transform group-open:rotate-180">&#9660;</span>
              </summary>
              <p className="mt-3 text-[15px] text-[var(--text-muted)] leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className="text-center py-20 px-6"
        style={{ background: 'linear-gradient(180deg, transparent, var(--accent-glow), transparent)' }}
      >
        <h2 className="text-4xl font-extrabold mb-3" style={{ letterSpacing: '-1px' }}>
          Your music has a story. Tell it.
        </h2>
        <p className="text-lg text-[var(--text-muted)] mb-8">
          Join artists who are giving their fans the context behind the music.
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-4 bg-[var(--accent)] text-white rounded-xl font-bold text-lg shadow-[0_4px_24px_rgba(124,92,252,0.3)] hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 transition-all no-underline"
        >
          Create Your Account
        </Link>
      </section>
    </>
  );
}
