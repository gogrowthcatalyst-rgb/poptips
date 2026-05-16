import Link from 'next/link';
import { Reveal } from './Reveal';

interface PaymentExplainerProps {
  /** Wallet name as users say it: "Venmo", "Cash App", "PayPal", "Zelle" */
  walletName: string;
  /** Wallet name with our accent italic applied — for the hero headline */
  walletNameAccent: React.ReactNode;
  /** Short lede shown directly under the hero headline (1-2 sentences) */
  lede: string;
  /** Renders below the hero — the page-specific sections */
  children: React.ReactNode;
}

/**
 * Shared chrome for the four /[wallet] explainer pages.
 *
 * - Back-to-home link at top
 * - Hero with consistent eyebrow + headline + lede
 * - Page-specific sections injected as children
 * - Dual sign-up CTAs at the bottom of every page (jade for workers,
 *   coral for tippers — both lanes visible regardless of which wallet
 *   the user is reading about)
 */
export function PaymentExplainer({
  walletName,
  walletNameAccent,
  lede,
  children,
}: PaymentExplainerProps) {
  return (
    <main>
      {/* HERO ============================================================ */}
      <section className="border-b border-line-soft bg-surface/40">
        <div className="mx-auto max-w-3xl px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
          <Link
            href="/#payout-apps"
            className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim transition-colors duration-200 hover:text-accent"
          >
            <span aria-hidden>←</span>
            <span>Back to supported apps</span>
          </Link>

          <Reveal>
            <p className="mb-4 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
              Payment method · supported by Pop Tips
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display text-5xl font-medium leading-[0.98] tracking-tightest text-ink text-balance md:text-6xl lg:text-7xl">
              Tipping with {walletNameAccent}.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-ink-dim text-pretty md:text-xl">
              {lede}
            </p>
          </Reveal>
        </div>
      </section>

      {/* PAGE-SPECIFIC CONTENT =========================================== */}
      <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">{children}</div>

      {/* DUAL CTA STRIP — every wallet page ends here =================== */}
      <section className="border-t border-line-soft bg-surface/50">
        <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="mb-3 text-center font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
              Ready when you are
            </p>
            <h2 className="text-center font-display text-3xl font-medium leading-tight tracking-tightest text-ink text-balance md:text-4xl">
              Get set up with{' '}
              <em className="italic text-accent">Pop Tips</em> in two minutes.
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
              <Link
                href="/signup-recipient"
                className="group flex flex-col items-center justify-center rounded-2xl border border-jade-100 bg-gradient-to-br from-jade-50 to-paper px-6 py-7 text-center shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-1 hover:border-jade-300 hover:shadow-lift-strong"
              >
                <span className="mb-2 font-mono text-xs font-medium uppercase tracking-wider2 text-jade-700">
                  For workers
                </span>
                <span className="font-display text-xl font-medium italic text-ink md:text-2xl">
                  Claim your handle
                </span>
                <span className="mt-1 text-sm text-ink-dim">
                  Set up your {walletName} to receive
                </span>
              </Link>
              <Link
                href="/signup-tipper"
                className="group flex flex-col items-center justify-center rounded-2xl border border-coral-100 bg-gradient-to-br from-coral-50 to-paper px-6 py-7 text-center shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-1 hover:border-coral-300 hover:shadow-lift-strong"
              >
                <span className="mb-2 font-mono text-xs font-medium uppercase tracking-wider2 text-coral-700">
                  For tippers
                </span>
                <span className="font-display text-xl font-medium italic text-ink md:text-2xl">
                  Get set up to tip
                </span>
                <span className="mt-1 text-sm text-ink-dim">
                  Use your {walletName} to send
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

/**
 * Section heading used inside payment explainer pages.
 * Keeps the visual rhythm consistent across all four pages.
 */
export function ExplainerSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="mb-14 md:mb-20">
        <p className="mb-3 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
          {eyebrow}
        </p>
        <h2 className="font-display text-3xl font-medium leading-tight tracking-tightest text-ink text-balance md:text-4xl">
          {title}
        </h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-dim md:text-lg">
          {children}
        </div>
      </section>
    </Reveal>
  );
}
