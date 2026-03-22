const SOURCE_CONFIG: Record<string, { icon: string; thumbClass: string; tagClass: string; label: string }> = {
  youtube: {
    icon: '\u25B6',
    thumbClass: 'bg-gradient-to-br from-[#1a1a2e] to-[#2d1b4e]',
    tagClass: 'bg-[rgba(255,0,0,0.1)] text-[#ff4444]',
    label: 'YouTube',
  },
  podcast: {
    icon: '\uD83C\uDFA7',
    thumbClass: 'bg-gradient-to-br from-[#1e3a2e] to-[#0d2a1a]',
    tagClass: 'bg-[rgba(52,211,153,0.1)] text-[var(--green)]',
    label: 'Podcast',
  },
  article: {
    icon: '\uD83D\uDCC4',
    thumbClass: 'bg-gradient-to-br from-[#2e2a1a] to-[#1f1a0a]',
    tagClass: 'bg-[rgba(251,146,60,0.1)] text-[var(--orange)]',
    label: 'Article',
  },
  social: {
    icon: '\uD83C\uDD70',
    thumbClass: 'bg-gradient-to-br from-[#1a2e3a] to-[#0d1a2a]',
    tagClass: 'bg-[rgba(96,165,250,0.1)] text-[#60a5fa]',
    label: 'Social',
  },
};

const DEFAULT_SOURCE = {
  icon: '\uD83D\uDD17',
  thumbClass: 'bg-gradient-to-br from-[#1a1a2e] to-[#2d1b4e]',
  tagClass: 'bg-[var(--surface-hover)] text-[var(--text-muted)]',
  label: 'Link',
};

interface ContentLinkCardProps {
  url: string;
  title: string;
  source: string;
  description?: string;
  duration?: string;
  sourceName?: string;
}

export function ContentLinkCard({
  url,
  title,
  source,
  description,
  duration,
  sourceName,
}: ContentLinkCardProps) {
  const config = SOURCE_CONFIG[source.toLowerCase()] ?? DEFAULT_SOURCE;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="no-underline text-inherit block"
    >
      <div className="flex gap-4 items-center bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-4 mb-2.5 transition-all duration-200 cursor-pointer hover:border-[var(--accent)] hover:translate-x-1">
        {/* Thumbnail */}
        <div
          className={`w-20 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl ${config.thumbClass}`}
        >
          {config.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[var(--text)] truncate mb-0.5">
            {title}
          </h4>
          <div className="text-xs text-[var(--text-muted)] flex gap-2 items-center">
            <span
              className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${config.tagClass}`}
            >
              {config.label}
            </span>
            {sourceName && (
              <>
                <span className="opacity-50">&middot;</span>
                <span>{sourceName}</span>
              </>
            )}
            {description && !sourceName && (
              <>
                <span className="opacity-50">&middot;</span>
                <span className="truncate">{description}</span>
              </>
            )}
          </div>
        </div>

        {/* Duration tag */}
        {duration && (
          <div className="text-xs text-[var(--text-muted)] flex-shrink-0 bg-[var(--surface-hover)] px-2.5 py-1 rounded-md">
            {duration}
          </div>
        )}
      </div>
    </a>
  );
}
