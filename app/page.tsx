'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTrack, type TrackId } from '@/lib/track';
import { AudiencePortraits } from '@/components/AudiencePortraits';
import { CelebrationBlock } from '@/components/CelebrationBlock';
import { PopCircle } from '@/components/PopCircle';
import { Reveal } from '@/components/Reveal';
import { StepScan } from '@/components/illustrations/StepScan';
import { StepHandoff } from '@/components/illustrations/StepHandoff';
import { StepLands } from '@/components/illustrations/StepLands';
import { track } from '@/lib/analytics';
import { getDefaultPricing } from '@/lib/pricing';

const PRICING = getDefaultPricing();

function TrackCTA({
  track: targetTrack,
  href,
  variant,
  tone = 'default',
  source,
  intent,
  children,
}: {
  track: TrackId;
  href: string;
  variant: 'primary' | 'secondary';
  /** Hover state color. Default ties to current track accent. Coral/jade carry the brand-direct halo. */
  tone?: 'default' | 'coral' | 'jade';
  source: 'home_hero' | 'home_pricing';
  intent: 'tip' | 'receive';
  children: React.ReactNode;
}) {
  const { applyTrack, trackId } = useTrack();
  const router = useRouter();

  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-medium transition-all duration-200 ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95';

  // tone drives hover background + halo + focus ring
  const toneStyles: Record<typeof tone, string> = {
    default: 'hover:bg-accent-dim hover:shadow-lift-strong focus-visible:outline-accent-glow',
    coral:   'hover:bg-coral-700 hover:shadow-halo-coral focus-visible:outline-coral-500',
    jade:    'hover:bg-jade-700 hover:shadow-halo-jade focus-visible:outline-jade-500',
  };

  const styles =
    variant === 'primary'
      ? `bg-ink text-paper shadow-lift hover:-translate-y-px ${toneStyles[tone]}`
      : `border border-line bg-paper text-ink hover:border-accent hover:bg-surface focus-visible:outline-accent-glow`;

  return (
    <Link
      href={href}
      onClick={(e) => {
        e.preventDefault();
        track('cta_clicked', { source, intent, track: trackId });
        if (trackId !== targetTrack) {
          track('track_changed', { from: trackId, to: targetTrack, via: 'cta' });
        }
        applyTrack(targetTrack);
        router.push(href);
      }}
      className={`${base} ${styles}`}
    >
      {children}
    </Link>
  );
}

const PAYOUT_APPS = [
  {
    name: 'Venmo',
    href: '/venmo',
    blurb: 'Free between personal accounts. Most universal.',
    badge: 'Recommended',
  },
  {
    name: 'Cash App',
    href: '/cashapp',
    blurb: 'Free, popular with younger users.',
    badge: null,
  },
  {
    name: 'PayPal',
    href: '/paypal',
    blurb: 'Widest international reach.',
    badge: null,
  },
  {
    name: 'Zelle',
    href: '/zelle',
    blurb: 'Bank-to-bank. Instant. Zero fees.',
    badge: 'No fees',
  },
] as const;

export default function HomePage() {
  return (
    <main>
      {/* HERO ============================================================ */}
      <section className="relative overflow-hidden">
        {/* Decorative coral whisper top-left + jade whisper bottom-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-coral-100 opacity-40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-jade-100 opacity-40 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-14 md:grid-cols-2 md:gap-12 md:px-8 md:pb-32 md:pt-24 lg:gap-20">
          <div>
            <Reveal>
              <p className="mb-5 font-mono text-xs font-medium uppercase tracking-wider2 text-coral-700">
                Empowering the appreciation economy
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display text-5xl font-medium leading-[0.98] tracking-tightest text-ink text-balance md:text-6xl lg:text-7xl">
                Tip the person.{' '}
                <em className="italic text-accent">Not the system.</em>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-[52ch] text-lg font-light leading-relaxed text-ink-dim text-pretty md:text-xl">
                Pop Tips is the direct line between a moment of great service and the person who
                gave it. <span className="font-medium text-ink">100%</span> lands in their account
                — not ours, not their boss&rsquo;s, not the platform&rsquo;s. We designed
                ourselves out of the middle.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <TrackCTA
                  track="tipper"
                  href="/signup-tipper"
                  variant="primary"
                  source="home_hero"
                  intent="tip"
                >
                  I want to tip
                </TrackCTA>
                <TrackCTA
                  track="recipient"
                  href="/signup-recipient"
                  variant="secondary"
                  source="home_hero"
                  intent="receive"
                >
                  I want to receive tips
                </TrackCTA>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <p className="mt-6 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
                100% to the worker. <span className="text-accent">Instantly.</span>
              </p>
            </Reveal>
          </div>

          {/* Pop-circle on the right (stacked above on mobile) */}
          <div className="order-first mx-auto md:order-last md:ml-auto">
            <PopCircle amount={20} size={260} className="md:scale-110" />
          </div>
        </div>
      </section>

      {/* AUDIENCE PORTRAITS — both colors, same page ===================== */}
      <section className="border-y border-line-soft bg-surface/50">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <div className="mb-10 max-w-2xl md:mb-14">
              <p className="mb-3 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
                01 · Two audiences
              </p>
              <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-tightest text-ink text-balance md:text-5xl">
                Different people. <em className="italic text-accent">Same moment.</em>
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-dim md:text-lg">
                Pop Tips closes the gap between a moment of great service and a feeling of
                true appreciation. By making sure you can express your appreciation directly
                and fully — in the moment or later. Join us in empowering the appreciation
                economy.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <AudiencePortraits />
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS =================================================== */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-28">
        <Reveal>
          <div className="mb-12 max-w-3xl md:mb-16">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
              02 · How it works
            </p>
            <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-tightest text-ink text-balance md:text-5xl">
              From <em className="italic text-accent">&ldquo;thank you&rdquo;</em> to{' '}
              <em className="italic text-accent">&ldquo;received.&rdquo;</em>{' '}
              In about ten seconds.
            </h2>
          </div>
        </Reveal>

        <ol className="grid gap-5 md:grid-cols-3 md:gap-8">
          {/* Step 01 — They scan (CORAL) */}
          <Reveal delay={0} as="li">
            <div className="group relative h-full overflow-hidden rounded-3xl border border-coral-100 bg-gradient-to-br from-coral-50 via-paper to-paper p-7 shadow-lift transition-all duration-300 hover:-translate-y-1 hover:border-coral-300 hover:shadow-lift-strong md:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-coral-100 opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
              />
              <div className="relative">
                <StepScan className="mb-4 h-16 w-16" />
                <span className="font-mono text-xs font-medium tracking-wider2 text-coral-700">
                  01
                </span>
                <h3 className="mt-2 font-display text-2xl font-medium leading-snug text-ink md:text-3xl">
                  <em className="italic">They scan your code.</em>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim md:text-base">
                  A QR sticker, a pin, a printed receipt, your apron — wherever a thank-you
                  happens.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Step 02 — They open the app (GOLD) */}
          <Reveal delay={100} as="li">
            <div className="group relative h-full overflow-hidden rounded-3xl border border-gold-500/30 bg-gradient-to-br from-gold-100/60 via-paper to-paper p-7 shadow-lift transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/60 hover:shadow-lift-strong md:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold-100 opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
              />
              <div className="relative">
                <StepHandoff className="mb-4 h-16 w-16" />
                <span className="font-mono text-xs font-medium tracking-wider2 text-gold-700">
                  02
                </span>
                <h3 className="mt-2 font-display text-2xl font-medium leading-snug text-ink md:text-3xl">
                  <em className="italic">They open the app they already have.</em>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim md:text-base">
                  Venmo. Cash App. PayPal. Zelle. We open it pre-filled with your handle and
                  amount.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Step 03 — You get the tip (JADE) */}
          <Reveal delay={200} as="li">
            <div className="group relative h-full overflow-hidden rounded-3xl border border-jade-100 bg-gradient-to-br from-jade-50 via-paper to-paper p-7 shadow-lift transition-all duration-300 hover:-translate-y-1 hover:border-jade-300 hover:shadow-lift-strong md:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-jade-100 opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
              />
              <div className="relative">
                <StepLands className="mb-4 h-16 w-16" />
                <span className="font-mono text-xs font-medium tracking-wider2 text-jade-700">
                  03
                </span>
                <h3 className="mt-2 font-display text-2xl font-medium leading-snug text-ink md:text-3xl">
                  <em className="italic">You get the tip.</em>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim md:text-base">
                  No waiting. No skim. No employer in the middle. We designed ourselves out
                  of the money.
                </p>
              </div>
            </div>
          </Reveal>
        </ol>
      </section>

      {/* CELEBRATION ===================================================== */}
      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-24">
        <Reveal>
          <CelebrationBlock />
        </Reveal>
      </section>

      {/* PAYOUT APPS ==================================================== */}
      <section id="payout-apps" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
          <Reveal>
            <div>
              <p className="mb-3 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
                04 · Supported apps
              </p>
              <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-tightest text-ink text-balance md:text-5xl">
                The wallet they{' '}
                <em className="italic text-accent">already use.</em>
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink-dim md:text-lg">
                Pop Tips deep-links into whatever payment app the recipient picked. Tippers
                don&rsquo;t install anything new — just a single tap to confirm.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ul className="grid grid-cols-2 gap-3 md:gap-4">
              {PAYOUT_APPS.map((app, i) => {
                // Rotating subtle tints across the four cards for color rhythm
                const tints = [
                  'border-coral-100 from-coral-50 hover:border-coral-300',
                  'border-jade-100 from-jade-50 hover:border-jade-300',
                  'border-gold-500/20 from-gold-100/40 hover:border-gold-500/50',
                  'border-coral-100 from-coral-50 hover:border-coral-300',
                ];
                const tint = tints[i] ?? tints[0];
                return (
                  <li key={app.name}>
                    <Link
                      href={app.href}
                      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br ${tint} to-paper px-5 py-6 shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-1 hover:shadow-lift-strong`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-display text-xl font-medium text-ink md:text-2xl">
                            {app.name}
                          </span>
                          {app.badge && (
                            <span className="rounded-full border border-ink/10 bg-paper px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider2 text-ink-dim">
                              {app.badge}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-ink-dim md:text-sm">
                          {app.blurb}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-ink-faint transition-colors duration-200 group-hover:text-ink">
                        Learn more{' '}
                        <span
                          aria-hidden
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* SIGNUP HUB ============================================== */}
      <section id="pricing" className="border-y border-line-soft bg-surface/50">
        <div id="signup" className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <div className="mb-12 text-center md:mb-16">
              <p className="mb-3 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
                05 · Pick your lane
              </p>
              <h2 className="font-display text-5xl font-medium leading-[1.05] tracking-tightest text-ink text-balance md:text-6xl">
                Two ways in. <em className="italic text-accent">Pick yours.</em>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {/* WORKERS — jade gradient */}
            <Reveal delay={100}>
              <div className="relative h-full overflow-hidden rounded-3xl border border-jade-100 bg-gradient-to-br from-jade-50 via-paper to-paper p-7 shadow-lift md:p-10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-jade-100 opacity-60 blur-2xl"
                />

                <p className="relative mb-3 font-mono text-xs font-medium uppercase tracking-wider2 text-jade-700">
                  For workers
                </p>
                <h3 className="relative font-display text-4xl font-medium leading-[1.05] tracking-tightest text-ink text-balance md:text-5xl">
                  Every cent. <em className="italic text-jade-500">Yours.</em>
                </h3>
                <p className="relative mt-4 max-w-md text-base leading-relaxed text-ink-dim md:text-lg">
                  No employer skim. No payout delay. No platform haircut. Pop Tips is the
                  appreciation app workers actually own — your QR points to your account,
                  your rules, every time.
                </p>

                <ul className="relative mt-7 space-y-5">
                  <li>
                    <p className="font-display text-lg font-medium italic text-ink">
                      Always free.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                      Workers pay nothing. Ever.{' '}
                      <span className="money font-semibold text-ink">100%</span> of every tip
                      is yours.
                    </p>
                  </li>
                  <li>
                    <p className="font-display text-lg font-medium italic text-ink">
                      Your wallet, your call.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                      Pick from Venmo, Cash App, PayPal, or Zelle. Switch anytime.
                    </p>
                  </li>
                  <li>
                    <p className="font-display text-lg font-medium italic text-ink">
                      Your name on it.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                      Your tipping page is{' '}
                      <span className="font-mono text-ink">pop.tips/your-handle</span>. Yours
                      to print, post, and share.
                    </p>
                  </li>
                </ul>

                <div className="relative mt-8">
                  <TrackCTA
                    track="recipient"
                    href="/signup-recipient"
                    variant="primary"
                    tone="jade"
                    source="home_pricing"
                    intent="receive"
                  >
                    Claim your handle <span aria-hidden>→</span>
                  </TrackCTA>
                </div>
              </div>
            </Reveal>

            {/* TIPPERS — coral gradient */}
            <Reveal delay={200}>
              <div className="relative h-full overflow-hidden rounded-3xl border border-coral-100 bg-gradient-to-br from-coral-50 via-paper to-paper p-7 shadow-lift md:p-10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-coral-100 opacity-60 blur-2xl"
                />

                <p className="relative mb-3 font-mono text-xs font-medium uppercase tracking-wider2 text-coral-700">
                  For tippers
                </p>
                <h3 className="relative font-display text-4xl font-medium leading-[1.05] tracking-tightest text-ink text-balance md:text-5xl">
                  Make sure your appreciation{' '}
                  <em className="italic text-coral-500">actually lands.</em>
                </h3>
                <p className="relative mt-4 max-w-md text-base leading-relaxed text-ink-dim md:text-lg">
                  Add a card once. Scan, send, done — your tip goes straight to the person
                  who earned it. We never sit between you and them.
                </p>

                <ul className="relative mt-7 space-y-5">
                  <li>
                    <p className="font-display text-lg font-medium italic text-ink">
                      No new app.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                      Tip with the wallet already on your phone.
                    </p>
                  </li>
                  <li>
                    <p className="font-display text-lg font-medium italic text-ink">
                      Three free.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                      First three tips on us. No card needed to try.
                    </p>
                  </li>
                  <li>
                    <p className="font-display text-lg font-medium italic text-ink">
                      <span className="money font-semibold not-italic text-ink">
                        {PRICING.annual_fee}
                      </span>{' '}
                      / year.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                      Pay once a year after your 3rd tip. That&rsquo;s it. Cancel anytime.
                    </p>
                  </li>
                </ul>

                <div className="relative mt-8">
                  <TrackCTA
                    track="tipper"
                    href="/signup-tipper"
                    variant="primary"
                    tone="coral"
                    source="home_pricing"
                    intent="tip"
                  >
                    Get set up to tip <span aria-hidden>→</span>
                  </TrackCTA>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Prominent pricing callout below — gold border, the "called out
              prominently" beat from the locked pricing model */}
          <Reveal delay={300}>
            <div className="mt-10 rounded-2xl border-2 border-gold-500/40 bg-paper px-6 py-8 text-center shadow-lift md:mt-14 md:px-10 md:py-10">
              <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-gold-700">
                Pricing, plainly
              </p>
              <p className="mx-auto mt-3 max-w-2xl font-display text-4xl font-medium leading-[1.05] tracking-tightest text-ink text-balance md:text-5xl">
                First{' '}
                <span className="money font-semibold not-italic text-ink">
                  {PRICING.free_trial_tips}
                </span>{' '}
                tips <em className="italic text-jade-500">free.</em>
              </p>
              <p className="mx-auto mt-4 max-w-xl font-display text-xl font-medium leading-snug text-ink-dim md:text-2xl">
                Then only{' '}
                <span className="money font-semibold not-italic text-ink">
                  {PRICING.annual_fee}
                </span>
                <em className="italic">/year</em> +{' '}
                <span className="money font-semibold not-italic text-ink">
                  {PRICING.take_rate}
                </span>{' '}
                <em className="italic">per tip.</em>
              </p>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-ink-dim md:text-lg">
                Annual fee charged on tip #{PRICING.activation_tip_number}. You&rsquo;ll see
                it coming.
              </p>
              <p className="mt-4 font-mono text-xs uppercase tracking-wider2 text-ink-faint">
                We take that so we can keep the appreciation economy running. You can see
                every cent.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}
