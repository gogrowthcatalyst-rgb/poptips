'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { Smartphone } from './icons';
import { InstallPrompt, PWA_INSTALLED_KEY } from './InstallPrompt';

const sections = [
  {
    title: 'For tippers',
    links: [
      { href: '/signup-tipper', label: 'Get set up' },
      { href: '/#how-it-works', label: 'How it works' },
      { href: '/#pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'For workers',
    links: [
      { href: '/signup-recipient', label: 'Claim your QR' },
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/#payout-apps', label: 'Supported apps' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export function SiteFooter() {
  const [installed, setInstalled] = useState(true); // default true so SSR hides the link
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Sync from localStorage on mount — show install link only when not installed
    const flag = typeof window !== 'undefined' && window.localStorage.getItem(PWA_INSTALLED_KEY) === '1';
    setInstalled(flag);
  }, []);

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
        {/* Brand block — the appreciation economy line front and center */}
        <div className="mb-14 max-w-2xl">
          <Logo variant="h-dark" height={36} className="mb-6" alt="Pop Tips" />
          <p className="font-display text-3xl font-medium leading-[1.1] text-ink md:text-4xl">
            Empowering the{' '}
            <em className="italic text-accent">appreciation economy.</em>
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-dim md:text-base">
            100% to the worker. <em className="italic text-accent">Instantly.</em>
          </p>
        </div>

        {/* Three columns */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-ink-dim transition-colors duration-200 hover:text-accent"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-ink-dim transition-colors duration-200 hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}

                {/* Conditional install link — only appears in About section
                    when the app isn't installed. Quiet, no-nag. */}
                {section.title === 'About' && !installed && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setShowPrompt((v) => !v)}
                      className="inline-flex items-center gap-1.5 text-sm text-ink-dim transition-colors duration-200 hover:text-jade-500"
                    >
                      <Smartphone className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Install the app
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Inline install prompt — shown when user taps the footer link.
            Renders below the footer columns, brand-styled. */}
        {showPrompt && !installed && (
          <div className="mt-10">
            <InstallPrompt forceOpen />
          </div>
        )}

        {/* Bottom row */}
        <div className="mt-14 flex flex-col gap-2 border-t border-line-soft pt-6 font-mono text-xs uppercase tracking-wider2 text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Pop Tips</span>
          <span>Built with care, not VC pressure.</span>
        </div>
      </div>
    </footer>
  );
}

