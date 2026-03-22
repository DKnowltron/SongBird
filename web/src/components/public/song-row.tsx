import Link from 'next/link';

const ART_GRADIENTS = [
  'linear-gradient(135deg, #2d1b4e, #1a0a2e)',
  'linear-gradient(135deg, #1e3a5f, #0d1b2a)',
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

interface SongRowProps {
  isrc: string;
  title: string;
  artist: string;
  album: string;
  storyDuration?: string;
  contentLinkCount?: number;
  hasStory: boolean;
  isVerified: boolean;
}

export function SongRow({
  isrc,
  title,
  artist,
  album,
  storyDuration,
  contentLinkCount,
  hasStory,
  isVerified,
}: SongRowProps) {
  const gradient = ART_GRADIENTS[hashIndex(isrc, ART_GRADIENTS.length)];

  return (
    <Link href={`/song/${isrc}`} className="no-underline text-inherit block">
      <div className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl px-5 py-4 transition-all duration-200 cursor-pointer hover:border-[var(--accent)] hover:translate-x-1">
        {/* Art */}
        <div
          className="w-[52px] h-[52px] rounded-lg flex-shrink-0 flex items-center justify-center text-[22px] opacity-30"
          style={{ background: gradient }}
        >
          &#9835;
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-semibold text-[var(--text)] truncate">{title}</h4>
          <div className="text-[13px] text-[var(--text-muted)] truncate">
            {artist} &middot; {album}
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-shrink-0 items-center">
          {hasStory ? (
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[var(--accent-glow)] text-[var(--accent)] border border-[rgba(124,92,252,0.2)]">
              Story
            </span>
          ) : contentLinkCount && contentLinkCount > 0 ? (
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[rgba(251,146,60,0.1)] text-[var(--orange)] border border-[rgba(251,146,60,0.2)]">
              Content
            </span>
          ) : (
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[var(--surface-hover)] text-[var(--text-muted)]">
              No Story
            </span>
          )}
          {isVerified && (
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[rgba(52,211,153,0.1)] text-[var(--green)] border border-[rgba(52,211,153,0.2)]">
              Verified
            </span>
          )}
        </div>

        {/* Duration */}
        <div className="text-[13px] text-[var(--text-muted)] flex-shrink-0 tabular-nums hidden md:block">
          {storyDuration ?? '\u2014'}
        </div>

        {/* Link count */}
        <div className="text-xs text-[var(--text-muted)] flex-shrink-0 hidden md:block">
          {contentLinkCount != null && contentLinkCount > 0
            ? `${contentLinkCount} links`
            : '\u2014'}
        </div>

        {/* Arrow */}
        <div className="text-lg text-[var(--text-muted)] flex-shrink-0">&rsaquo;</div>
      </div>
    </Link>
  );
}
