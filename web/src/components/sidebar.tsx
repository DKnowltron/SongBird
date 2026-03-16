'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◻' },
  { href: '/tracks', label: 'Tracks', icon: '♫' },
  { href: '/stories', label: 'Stories', icon: '◎' },
  { href: '/notifications', label: 'Notifications', icon: '◈' },
];

const adminItems = [
  { href: '/admin/moderation', label: 'Moderation', icon: '⚑' },
  { href: '/admin/partners', label: 'Partners', icon: '⚙' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { artist, signOut } = useAuth();

  return (
    <aside className="w-64 h-screen bg-muted border-r border-border flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold">Storyteller</h1>
        <p className="text-sm text-muted-foreground mt-1">Artist Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname.startsWith(item.href)
                ? 'bg-primary text-white'
                : 'text-foreground hover:bg-border'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {artist && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase">Admin</p>
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  pathname.startsWith(item.href)
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-border'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        {artist && (
          <div className="mb-3">
            <p className="text-sm font-medium truncate">{artist.name}</p>
            <p className="text-xs text-muted-foreground truncate">{artist.email}</p>
          </div>
        )}
        <button
          onClick={signOut}
          className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-border rounded-md transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
