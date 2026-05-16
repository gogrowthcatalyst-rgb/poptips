import Link from 'next/link';
import { TrackForcer } from '@/components/TrackForcer';
import { PopCircle } from '@/components/PopCircle';
import { Reveal } from '@/components/Reveal';

export const metadata = {
  title: 'Welcome aboard',
  description:
    'Welcome to Pop Tips. Your recipient account is being set up — check your phone for the next step.',
};

export default function RecipientThanksPage() {
  return (
    <>
      <TrackForcer track="recipient" />

      <main className="relative overflow-hidden">
        {/* Decorative atmosphere — jade earning + gold highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-jade-100 opacity-50 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-gold-100 opacity-40 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-5 pb-24 pt-16 md:grid-cols-[1fr_auto] md:gap-16 md:px-8 md:pb-32 md:pt-24">
          <div>
            <Reveal>
              <p className="mb-4 font-mono text-xs font-medium uppercase tracking-wider2 text-jade-700">
                Welcome aboard
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display text-5xl font-medium leading-[0.98] tracking-tightest text-ink text-balance md:text-6xl">
                Every tip from here on{' '}
                <em className="italic text-jade-500">is yours.</em>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-ink-dim md:text-xl">
                Check your phone — we&rsquo;ve sent a magic link to finish setting up your
                handle, photo, and payout app.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 rounded-3xl border border-line bg-paper p-6 shadow-lift md:p-8">
                <p className="mb-4 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
                  What happens next
                </p>
                <ol className="space-y-4 text-base leading-relaxed text-ink-dim md:text-lg">
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-jade-100 font-mono text-xs font-medium text-jade-700">
                      1
                    </span>
                    <span>
                      Tap the link in your text — that confirms your number and opens your
                      profile setup.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-jade-100 font-mono text-xs font-medium text-jade-700">
                      2
                    </span>
                    <span>
                      Pick your handle —{' '}
                      <span className="font-mono text-ink">pop.tips/your-name</span> — add a
                      photo, and connect Venmo, Cash App, PayPal, or Zelle.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-jade-100 font-mono text-xs font-medium text-jade-700">
                      3
                    </span>
                    <span>
                      We&rsquo;ll generate your QR code. Print it, share it, stick it on your
                      apron — wherever a thank-you happens.
                    </span>
                  </li>
                </ol>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-base font-medium text-paper shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-jade-700 hover:shadow-halo-jade active:scale-95"
                >
                  Preview your dashboard <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-7 py-3.5 text-base font-medium text-ink transition-all duration-200 ease-out-soft hover:border-jade-300 hover:bg-jade-50"
                >
                  How receiving works
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Decorative PopCircle on the right */}
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
              Workers always free. 100% of every tip.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-dim md:text-base">
              Pop Tips never holds your money. Tips route directly from the tipper&rsquo;s
              app to yours — we&rsquo;re not a wallet, not an escrow, not a payroll service.
              Just the line between gratitude and you.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
