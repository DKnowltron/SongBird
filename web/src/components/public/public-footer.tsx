import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border-color)] py-10 px-6 text-center text-sm text-[var(--text-muted)]">
      <div className="flex justify-center gap-6 mb-4">
        <Link href="/about" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors no-underline">
          About
        </Link>
        <Link href="/explore" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors no-underline">
          Explore
        </Link>
        <Link href="/for-artists" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors no-underline">
          For Artists
        </Link>
        <Link href="/privacy" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors no-underline">
          Privacy
        </Link>
        <Link href="/terms" className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors no-underline">
          Terms
        </Link>
      </div>
      <p>&copy; 2026 Storyteller. Every song has a story.</p>
    </footer>
  );
}
