import Link from 'next/link';
import { TrackForcer } from '@/components/TrackForcer';
import { PopCircle } from '@/components/PopCircle';
import { Reveal } from '@/components/Reveal';
import { ArrowRight } from '@/components/icons';

export const metadata = {
  title: "You're in",
  description: 'Welcome to Pop Tips. Your tipping account is being set up.',
};

export default function TipperThanksPage() {
  return (
    <>
      <TrackForcer track="tipper" />

      <main className="relative overflow-hidden">
        {/* Decorative atmosphere — coral warmth + gold highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-coral-100 opacity-50 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-gold-100 opacity-40 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-5 pb-24 pt-16 md:grid-cols-[1fr_auto] md:gap-16 md:px-8 md:pb-32 md:pt-24">
          <div>
            <Reveal>
              <p className="mb-4 font-mono text-xs font-medium uppercase tracking-wider2 text-coral-700">
                Welcome
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display text-5xl font-medium leading-[0.98] tracking-tightest text-ink text-balance md:text-6xl">
                You&rsquo;re in.
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-4 max-w-lg font-display text-2xl font-medium leading-snug text-ink-dim text-balance md:text-3xl">
                And now <em className="italic text-coral-500">YOU</em> are empowering the
                appreciation economy.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-ink-dim md:text-xl">
                Check your phone — we&rsquo;ve sent you a magic link to confirm your account.
                No password to remember.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 rounded-3xl border border-line bg-paper p-6 shadow-lift md:p-8">
                <p className="mb-4 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
                  What happens next
                </p>
                <ol className="space-y-4 text-base leading-relaxed text-ink-dim md:text-lg">
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-coral-100 font-mono text-xs font-medium text-coral-700">
                      1
                    </span>
                    <span>Tap the link in your text — that confirms your number.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-coral-100 font-mono text-xs font-medium text-coral-700">
                      2
                    </span>
                    <span>
                      Scan any{' '}
                      <span className="font-mono text-ink">pop.tips/[handle]</span> QR code to
                      send your first tip.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-coral-100 font-mono text-xs font-medium text-coral-700">
                      3
                    </span>
                    <span>
                      Your first three tips are free. We&rsquo;ll ask for your card on tip
                      #4 — that activates the{' '}
                      <span className="money font-semibold text-ink">$9.99</span>/year
                      account.
                    </span>
                  </li>
                </ol>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-base font-medium text-paper shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-coral-700 hover:shadow-halo-coral active:scale-95"
                >
                  Back to home <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </Link>
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-7 py-3.5 text-base font-medium text-ink transition-all duration-200 ease-out-soft hover:border-coral-300 hover:bg-coral-50"
                >
                  How tipping works
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Decorative PopCircle on the right — confirms brand presence */}
          <div className="hidden md:block">
            <Reveal delay={120}>
              <PopCircle amount={20} size={280} tone="brand" />
            </Reveal>
          </div>
        </div>

        {/* Quiet reassurance strip at the bottom */}
        <div className="border-t border-line-soft bg-surface/40">
          <div className="mx-auto max-w-3xl px-5 py-10 text-center md:px-8 md:py-12">
            <p className="font-mono text-xs uppercase tracking-wider2 text-ink-faint">
              100% to the worker. Instantly.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim md:text-base">
              Pop Tips never holds your money. Tips route directly from your payment app to
              theirs — we&rsquo;re not a wallet, not an escrow, not a middleman.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
