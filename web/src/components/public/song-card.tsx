import Link from 'next/link';

const ART_GRADIENTS = [
  'linear-gradient(135deg, #1e3a5f, #0d1b2a)',
  'linear-gradient(135deg, #2d1b4e, #1a0a2e)',
  'linear-gradient(135deg, #1a2e1a, #0a1f0a)',
  'linear-gradient(135deg, #3a1a1a, #1f0a0a)',
  'linear-gradient(135deg, #2e2a1a, #1f1a0a)',
  'linear-gradient(135deg, #1a2e2e, #0a1f1f)',
];

function hashIndex(isrc: string, count: number): number {
  let hash = 0;
  for (let i = 0; i < isrc.length; i++) {
    hash = (hash * 31 + isrc.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % count;
}

interface SongCardProps {
  isrc: string;
  title: string;
  artist: string;
  storyDuration?: string;
  contentLinkCount?: number;
  hasStory: boolean;
  variant?: 'grid' | 'compact';
}

export function SongCard({
  isrc,
  title,
  artist,
  storyDuration,
  contentLinkCount,
  hasStory,
  variant = 'grid',
}: SongCardProps) {
  const gradient = ART_GRADIENTS[hashIndex(isrc, ART_GRADIENTS.length)];

  return (
    <Link href={`/song/${isrc}`} className="no-underline text-inherit block">
      <div
        className={`bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-4 transition-all duration-200 cursor-pointer hover:border-[var(--accent)] hover:-translate-y-0.5 ${
          variant === 'compact' ? 'flex gap-3 items-center' : ''
        }`}
      >
        {variant === 'grid' ? (
          <>
            <div
              className="w-full aspect-square rounded-lg mb-3 flex items-center justify-center relative overflow-hidden"
              style={{ background: gradient }}
            >
              <span className="text-[40px] opacity-25">&#9835;</span>
              <span
                className={`absolute top-2 right-2 text-white px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  hasStory
                    ? 'bg-[rgba(124,92,252,0.9)]'
                    : 'bg-[rgba(251,146,60,0.9)]'
                }`}
              >
                {hasStory ? 'Story' : 'Content'}
              </span>
            </div>
            <h4 className="text-[15px] font-semibold text-[var(--text)] mb-0.5 truncate">
              {title}
            </h4>
            <div className="text-[13px] text-[var(--text-muted)] truncate">{artist}</div>
            <div className="text-xs text-[var(--text-muted)] mt-2 flex gap-3">
              {storyDuration && <span>{storyDuration} story</span>}
              {contentLinkCount != null && contentLinkCount > 0 && (
                <span>{contentLinkCount} links</span>
              )}
            </div>
          </>
        ) : (
          <>
            <div
              className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ background: gradient }}
            >
              <span className="text-xl opacity-25">&#9835;</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[var(--text)] truncate">{title}</h4>
              <div className="text-xs text-[var(--text-muted)] truncate">{artist}</div>
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                hasStory
                  ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                  : 'bg-[rgba(251,146,60,0.1)] text-[var(--orange)]'
              }`}
            >
              {hasStory ? 'Story' : 'Content'}
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
