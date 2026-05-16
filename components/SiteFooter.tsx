import Link from 'next/link';
import { Logo } from './Logo';

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
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-14 flex flex-col gap-2 border-t border-line-soft pt-6 font-mono text-xs uppercase tracking-wider2 text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Pop Tips</span>
          <span>Built with care, not VC pressure.</span>
        </div>
      </div>
    </footer>
  );
}
