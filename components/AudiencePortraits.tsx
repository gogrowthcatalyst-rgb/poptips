'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTrack } from '@/lib/track';
import { track } from '@/lib/analytics';
import { ArrowRight } from './icons';

/**
 * Side-by-side coral + jade portrait cards — the brand's central duality
 * made visible. Both colors live on the home page at the same time
 * regardless of the active track, using the persistent coral-* / jade-*
 * Tailwind colors (not the swappable --accent vars).
 *
 * Each card pre-applies its track on click, so navigation feels instant.
 */
export function AudiencePortraits() {
  const { applyTrack, trackId } = useTrack();
  const router = useRouter();

  const go = (target: 'tipper' | 'recipient', href: string) => () => {
    track('cta_clicked', {
      source: 'home_hero',
      intent: target === 'tipper' ? 'tip' : 'receive',
      track: trackId,
    });
    if (trackId !== target) {
      track('track_changed', { from: trackId, to: target, via: 'cta' });
    }
    applyTrack(target);
    router.push(href);
  };

  return (
    <div className="grid gap-5 md:grid-cols-2 md:gap-8">
      {/* CORAL — Tippers */}
      <Link
        href="/signup-tipper"
        onClick={(e) => {
          e.preventDefault();
          go('tipper', '/signup-tipper')();
        }}
        className="group relative overflow-hidden rounded-3xl border border-coral-100 bg-gradient-to-br from-coral-50 via-paper to-paper p-8 shadow-lift transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:border-coral-300 hover:shadow-lift-strong md:p-10"
      >
        {/* Decorative corner radial */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-coral-100 opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
        />

        <p className="relative font-mono text-xs uppercase tracking-wider2 text-coral-700">
          Track A · Tippers
        </p>
        <h3 className="relative mt-3 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
          The <em className="italic text-coral-500">Appreciator</em>
        </h3>
        <p className="relative mt-4 max-w-sm text-base leading-relaxed text-ink-dim">
          Travelers, diners, professionals, parents on vacation. They notice good service and want
          to reward it — not because they have to, but because it felt genuinely human.
        </p>
        <p className="relative mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider2 text-coral-700 transition-transform duration-200 group-hover:translate-x-1">
          I want to tip <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
        </p>
      </Link>

      {/* JADE — Recipients */}
      <Link
        href="/signup-recipient"
        onClick={(e) => {
          e.preventDefault();
          go('recipient', '/signup-recipient')();
        }}
        className="group relative overflow-hidden rounded-3xl border border-jade-100 bg-gradient-to-br from-jade-50 via-paper to-paper p-8 shadow-lift transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:border-jade-300 hover:shadow-lift-strong md:p-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-jade-100 opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
        />

        <p className="relative font-mono text-xs uppercase tracking-wider2 text-jade-700">
          Track B · Workers
        </p>
        <h3 className="relative mt-3 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
          The <em className="italic text-jade-500">Earner</em>
        </h3>
        <p className="relative mt-4 max-w-sm text-base leading-relaxed text-ink-dim">
          Bartenders, baristas, drivers, stylists, valets, hotel staff. They turn ordinary moments
          into ones worth tipping for — and deserve every cent that gratitude sends back.
        </p>
        <p className="relative mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider2 text-jade-700 transition-transform duration-200 group-hover:translate-x-1">
          I want to receive tips <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
        </p>
      </Link>
    </div>
  );
}
