import Link from 'next/link';
import { Reveal } from './Reveal';
import { ArrowLeft } from './icons';

interface LegalPageProps {
  /** Page title for hero */
  title: string;
  /** Italic accent word(s) in the title */
  titleAccent: React.ReactNode;
  /** Color tone — privacy uses jade, terms uses gold */
  tone: 'jade' | 'gold';
  /** ISO date string for last-updated */
  lastUpdated: string;
  /** Page-specific intro paragraph */
  intro: React.ReactNode;
  /** Section nav items: array of {id, label} */
  sections: { id: string; label: string }[];
  children: React.ReactNode;
}

const TONE_STYLES = {
  jade: {
    eyebrow: 'text-jade-700',
    accent: 'text-jade-500',
    blurLeft: 'bg-jade-100',
    blurRight: 'bg-gold-100',
    navHover: 'hover:border-jade-300 hover:bg-jade-50',
    ctaHover: 'hover:bg-jade-700 hover:shadow-halo-jade',
  },
  gold: {
    eyebrow: 'text-gold-700',
    accent: 'text-gold-500',
    blurLeft: 'bg-gold-100',
    blurRight: 'bg-coral-100',
    navHover: 'hover:border-gold-500/40 hover:bg-gold-100/30',
    ctaHover: 'hover:bg-coral-700 hover:shadow-halo-coral',
  },
} as const;

/**
 * Shared chrome for /privacy and /terms.
 *
 * Each page hands in its own intro + sections; this component handles
 * the hero strip, section-nav pills, page-specific content slot, and the
 * draft/lawyer-review disclaimer at the bottom.
 */
export function LegalPage({
  title,
  titleAccent,
  tone,
  lastUpdated,
  intro,
  sections,
  children,
}: LegalPageProps) {
  const styles = TONE_STYLES[tone];

  return (
    <main className="relative overflow-hidden">
      {/* Decorative atmosphere — gives the legal page room to breathe in brand */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full ${styles.blurLeft} opacity-40 blur-3xl`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-20 top-96 h-80 w-80 rounded-full ${styles.blurRight} opacity-30 blur-3xl`}
      />

      {/* HERO */}
      <section className="relative border-b border-line-soft">
        <div className="mx-auto max-w-3xl px-5 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim transition-colors duration-200 hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            <span>Back to home</span>
          </Link>

          <Reveal>
            <p className={`mb-4 font-mono text-xs font-medium uppercase tracking-wider2 ${styles.eyebrow}`}>
              Last updated · {lastUpdated}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display text-5xl font-medium leading-[0.98] tracking-tightest text-ink text-balance md:text-6xl">
              {title} <em className={`italic ${styles.accent}`}>{titleAccent}</em>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-ink-dim text-pretty md:text-xl">
              {intro}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION NAV — pills, sticky on desktop */}
      <Reveal delay={80}>
        <div className="sticky top-[57px] z-30 border-b border-line-soft bg-paper/90 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl overflow-x-auto px-5 py-3 md:px-8">
            <nav className="flex gap-2 whitespace-nowrap">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wider2 text-ink-dim transition-colors duration-200 ${styles.navHover}`}
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </Reveal>

      {/* CONTENT */}
      <div className="relative mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        {children}
      </div>

      {/* DRAFT DISCLAIMER — gold-bordered, honest about pending legal review */}
      <section className="relative border-t border-line-soft bg-surface/40">
        <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
          <div className="rounded-2xl border-2 border-gold-500/40 bg-paper px-6 py-6 md:px-8 md:py-8">
            <p className="mb-2 font-mono text-xs font-medium uppercase tracking-wider2 text-gold-700">
              A note on this page
            </p>
            <p className="text-sm leading-relaxed text-ink-dim md:text-base">
              This is a working draft. Pop Tips is reviewing this document with counsel
              before formal adoption. The substance describes how we actually operate today —
              but the precise legal language may change. If you spot anything that&rsquo;s
              unclear or that doesn&rsquo;t match your experience using Pop Tips, write to{' '}
              <a
                href="mailto:hello@pop.tips"
                className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                hello@pop.tips
              </a>{' '}
              and we&rsquo;ll fix it.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Standard section block for legal pages.
 * Numbered eyebrow + Fraunces italic heading + content area.
 */
export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section id={id} className="mb-12 scroll-mt-32 md:mb-16">
        <p className="mb-3 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
          {number}
        </p>
        <h2 className="font-display text-3xl font-medium leading-tight tracking-tightest text-ink text-balance md:text-4xl">
          {title}
        </h2>
        <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-dim md:text-lg">
          {children}
        </div>
      </section>
    </Reveal>
  );
}
