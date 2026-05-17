'use client';

import Link from 'next/link';
import { useTrack } from '@/lib/track';
import { track } from '@/lib/analytics';
import { Logo } from './Logo';

export function SiteHeader() {
  const { trackId } = useTrack();

  const navLink =
    trackId === 'recipient'
      ? { href: '/dashboard', label: 'Dashboard', intent: 'dashboard' as const }
      : trackId === 'tipper'
        ? { href: '/signup-tipper', label: 'Get set up', intent: 'tip' as const }
        : { href: '/signup-recipient', label: 'For workers', intent: 'receive' as const };

  return (
    <header className="border-b border-line-soft bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
        <Link
          href="/"
          aria-label="Pop Tips home"
          onClick={() =>
            track('cta_clicked', {
              source: 'header_nav',
              intent: 'home',
              track: trackId,
            })
          }
          className="inline-flex items-center transition-opacity duration-200 hover:opacity-80"
        >
          <Logo variant="h" height={40} priority alt="Pop Tips" />
        </Link>

        <nav>
          <Link
            href={navLink.href}
            onClick={() =>
              track('cta_clicked', {
                source: 'header_nav',
                intent: navLink.intent,
                track: trackId,
              })
            }
            className="rounded-full px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider2 text-ink transition-colors duration-200 hover:bg-surface hover:text-accent"
          >
            {navLink.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
