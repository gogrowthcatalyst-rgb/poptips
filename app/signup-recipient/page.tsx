import { TrackForcer } from '@/components/TrackForcer';
import { GHLFormEmbed } from '@/components/GHLFormEmbed';

export const metadata = {
  title: 'Claim your QR code',
  description:
    'Your tips, your account, your rules. No employer skim. No payout delay. Always free for workers.',
};

const PROMISES = [
  {
    title: 'Always free.',
    body: 'Workers pay nothing. Ever. 100% of every tip is yours.',
  },
  {
    title: 'Your wallet, your call.',
    body: 'Pick from Venmo, Cash App, PayPal, or Zelle. Switch anytime.',
  },
  {
    title: 'Your name on it.',
    body: 'Your tipping page is pop.tips/your-handle. Yours to print, post, and share.',
  },
];

export default function SignupRecipientPage() {
  return (
    <>
      <TrackForcer track="recipient" />

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-12 md:px-8 md:pb-32 md:pt-20">
        {/* HERO ======================================================== */}
        <header className="text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-wider2 text-accent transition-colors duration-200">
            For workers
          </p>
          <h1 className="font-display text-4xl font-normal leading-[1.05] tracking-tightest text-ink text-balance md:text-5xl lg:text-6xl">
            Every cent.{' '}
            <em className="italic text-accent transition-colors duration-200">Yours.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg font-light leading-relaxed text-ink-dim text-pretty md:text-xl">
            No employer skim. No payout delay. No platform haircut. Pop Tips is the appreciation
            app workers actually own — your QR points to your account, your rules, every time.
          </p>
        </header>

        {/* PROMISES ===================================================== */}
        <section className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
          {PROMISES.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-line-soft bg-surface p-5 md:p-6"
            >
              <h3 className="font-display text-lg font-medium italic text-ink">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{p.body}</p>
            </div>
          ))}
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
            Claim your handle.
          </h2>
          <p className="mt-2 text-sm text-ink-dim">
            We&rsquo;ll text you a magic link — no password, no resume.
          </p>

          {/* Handle preview — sets the expectation */}
          <p className="mt-6 inline-flex items-baseline gap-1 rounded-xl bg-paper px-4 py-3 font-mono text-sm text-ink-faint">
            <span>pop.tips/</span>
            <span className="text-accent transition-colors duration-200">your-handle</span>
          </p>

          {/* GHL form — built and styled in GHL, embedded via iframe.
              After submit, GHL will (in Session 3+) redirect to our custom
              profile-completion step at /signup-recipient/profile?gid=... */}
          <div className="mt-6 overflow-hidden rounded-2xl bg-paper">
            <GHLFormEmbed
              formId="R5q096IomipgDdaZz6Av"
              formName="Recipient Sign Up Form"
              role="recipient"
            />
          </div>

          <p className="mt-6 text-center text-xs font-mono uppercase tracking-wider2 text-ink-faint">
            Next: pick your handle and add your photo.
          </p>
        </section>

        {/* TRUST LINE =================================================== */}
        <p className="mt-10 text-center text-sm leading-relaxed text-ink-faint">
          Pop Tips never holds your money. Tips route directly from the tipper&rsquo;s app to
          yours — we&rsquo;re not a wallet, not an escrow, not a payroll service. Just the line
          between gratitude and you.
        </p>
      </main>
    </>
  );
}
