import { TrackForcer } from '@/components/TrackForcer';
import { SignupForm } from '@/components/SignupForm';

export const metadata = {
  title: 'Get set up to tip',
  description:
    'Add a card once. Scan, send, done — your appreciation lands in their account, not ours.',
};

const PROMISES = [
  {
    eyebrow: '01',
    title: 'No new app.',
    body: 'Tip with the wallet already on your phone.',
    tone: 'coral' as const,
  },
  {
    eyebrow: '02',
    title: 'Three free.',
    body: 'First three tips on us. No card needed to try.',
    tone: 'jade' as const,
  },
  {
    eyebrow: '03',
    title: 'No subscription.',
    body: 'Pay only for tips you actually send. Cancel anytime.',
    tone: 'gold' as const,
  },
];

const TONE_STYLES = {
  jade: {
    card: 'border-jade-100 bg-gradient-to-br from-jade-50 via-paper to-paper',
    eyebrow: 'text-jade-700',
    orb: 'bg-jade-100',
  },
  coral: {
    card: 'border-coral-100 bg-gradient-to-br from-coral-50 via-paper to-paper',
    eyebrow: 'text-coral-700',
    orb: 'bg-coral-100',
  },
  gold: {
    card: 'border-gold-500/25 bg-gradient-to-br from-gold-100/50 via-paper to-paper',
    eyebrow: 'text-gold-700',
    orb: 'bg-gold-100',
  },
} as const;

export default function SignupTipperPage() {
  return (
    <>
      <TrackForcer track="tipper" />

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-12 md:px-8 md:pb-32 md:pt-20">
        {/* HERO ======================================================== */}
        <header className="text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-wider2 text-accent transition-colors duration-200">
            For tippers
          </p>
          <h1 className="font-display text-4xl font-normal leading-[1.05] tracking-tightest text-ink text-balance md:text-5xl lg:text-6xl">
            Make sure your appreciation{' '}
            <em className="italic text-accent transition-colors duration-200">actually lands.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg font-light leading-relaxed text-ink-dim text-pretty md:text-xl">
            Add a card once. Scan, send, done — your tip goes straight to the person who earned it.
            We never sit between you and them.
          </p>
        </header>

        {/* PROMISES — colored gradient cards, brand journey treatment ==== */}
        <section className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
          {PROMISES.map((p) => {
            const styles = TONE_STYLES[p.tone];
            return (
              <div
                key={p.title}
                className={`relative overflow-hidden rounded-2xl border p-5 shadow-lift md:p-6 ${styles.card}`}
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-50 blur-2xl ${styles.orb}`}
                />
                <div className="relative">
                  <p className={`mb-2 font-mono text-xs font-medium uppercase tracking-wider2 ${styles.eyebrow}`}>
                    {p.eyebrow}
                  </p>
                  <h3 className="font-display text-lg font-medium italic text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{p.body}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* FORM PLACEHOLDER ============================================= */}
        <section
          aria-labelledby="signup-form-heading"
          className="mt-12 rounded-3xl border border-line-soft bg-surface p-6 shadow-md md:mt-16 md:p-10"
        >
          <h2
            id="signup-form-heading"
            className="font-display text-2xl font-normal italic leading-tight text-ink"
          >
            Start your account.
          </h2>
          <p className="mt-2 text-sm text-ink-dim">
            We&rsquo;ll text you a magic link to confirm — no password to remember.
          </p>

          {/* Native signup form — writes to our DB, pushes to GHL. */}
          <div className="mt-8">
            <SignupForm role="tipper" />
          </div>
        </section>

        {/* TRUST LINE =================================================== */}
        <p className="mt-10 text-center text-sm leading-relaxed text-ink-faint">
          We never store your card on our servers. Stripe vaults it; we charge against it monthly
          for the small fee on tips you actually send. You can see every cent.
        </p>
      </main>
    </>
  );
}
