import Link from 'next/link';

export function PublicNavbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)]"
      style={{
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <Link
        href="/"
        className="text-xl font-extrabold text-[var(--text)] tracking-tight no-underline hover:no-underline"
        style={{ letterSpacing: '-0.5px' }}
      >
        <span className="text-[var(--accent)]">S</span>toryteller
      </Link>

      <div className="flex items-center gap-8">
        <Link
          href="/explore"
          className="hidden md:inline text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors no-underline"
        >
          Explore
        </Link>
        <Link
          href="/about"
          className="hidden md:inline text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors no-underline"
        >
          About
        </Link>
        <Link
          href="/for-artists"
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors no-underline"
        >
          For Artists
        </Link>
      </div>
    </nav>
  );
}
