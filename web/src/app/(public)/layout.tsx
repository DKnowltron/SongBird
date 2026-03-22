import { PublicNavbar } from '@/components/public/public-navbar';
import { PublicFooter } from '@/components/public/public-footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-theme min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <PublicNavbar />
      {children}
      <PublicFooter />
    </div>
  );
}
