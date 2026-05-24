import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { TrackForcer } from '@/components/TrackForcer';
import { ProfileViewTracker } from '@/components/ProfileViewTracker';
import { Logo } from '@/components/Logo';
import { isReservedHandle } from '@/lib/reserved-handles';
import { getRecipientByHandle } from '@/lib/db/recipients';
import { paymentAppLabel } from '@/lib/payment-apps';
import { computeTippableStatus } from '@/lib/recipient-status';

interface Params {
  handle: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  if (isReservedHandle(handle)) return { title: 'Page not found' };
  const recipient = await getRecipientByHandle(handle);
  if (!recipient) return { title: 'Page not found' };
  return {
    title: `Tip ${recipient.displayName} (@${recipient.handle})`,
    description: `Send a tip directly to ${recipient.displayName}. 100% goes to them. Pop Tips never touches the money.`,
  };
}

export default async function ProfilePage({ params }: { params: Promise<Params> }) {
  const { handle } = await params;

  if (isReservedHandle(handle)) notFound();

  const recipient = await getRecipientByHandle(handle);
  if (!recipient) notFound();

  const { displayName, role, message, photoUrl, paymentApps } = recipient;
  const initial = displayName.charAt(0);
  const payBadges = paymentApps.map((a) => paymentAppLabel(a.app));
  const canReceive =
    computeTippableStatus({
      paymentAppCount: paymentApps.length,
      photoUrl,
      photoRequiredBy: recipient.photoRequiredBy,
    }) === 'live';

  return (
    <>
      <TrackForcer track="tipper" />
      <ProfileViewTracker handle={recipient.handle} />

      <main className="mx-auto max-w-2xl px-5 pb-20 pt-10 md:px-8 md:pb-32 md:pt-16">
        {/* IDENTITY ====================================================== */}
        <section className="text-center">
          <div className="relative mx-auto mb-8 flex h-64 w-64 items-center justify-center md:h-80 md:w-80">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full bg-accent-glow opacity-30 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute inset-2 rounded-full border-2 border-accent/20"
            />
            <div className="relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-2 border-line bg-surface shadow-lift md:h-72 md:w-72">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={displayName}
                  fill
                  sizes="(max-width: 768px) 14rem, 18rem"
                  className="object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <span className="font-display text-9xl font-medium italic leading-none text-accent md:text-[10rem]">
                  {initial}
                </span>
              )}
            </div>
          </div>

          <p className="mb-3 font-mono text-sm font-medium uppercase tracking-wider2 text-accent">
            @{recipient.handle}
          </p>

          <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-tightest text-ink text-balance md:text-7xl">
            {displayName}
          </h1>

          {role && (
            <p className="mt-4 font-display text-lg italic text-ink-dim md:text-xl">
              {role}
            </p>
          )}
        </section>

        {/* PERSONAL MESSAGE ============================================== */}
        {message && (
          <section className="mt-12 md:mt-16">
            <blockquote className="relative rounded-3xl border border-line bg-surface px-7 py-10 text-center shadow-lift md:px-12 md:py-14">
              <span
                aria-hidden
                className="absolute -left-1 -top-4 font-display text-7xl italic leading-none text-accent-glow opacity-60 md:-top-6 md:text-8xl"
              >
                &ldquo;
              </span>
              <p className="relative font-display text-xl font-medium italic leading-snug text-ink text-balance md:text-2xl">
                {message}
              </p>
            </blockquote>
          </section>
        )}

        {/* PRIMARY CTA — to the send page ================================= */}
        {canReceive ? (
          <section className="mt-12 flex justify-center md:mt-14">
            <Link
              href={`/${recipient.handle}/send`}
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-10 py-5 font-display text-xl font-medium text-paper shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-accent-dim hover:shadow-lift-strong active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-glow md:text-2xl"
            >
              <span>Send a tip</span>
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
          </section>
        ) : (
          <section className="mt-12 md:mt-14">
            <p className="mx-auto max-w-sm rounded-2xl border border-line-soft bg-surface px-6 py-5 text-center text-base leading-relaxed text-ink-dim">
              {displayName} is still finishing setup — tips aren&rsquo;t open yet.
            </p>
          </section>
        )}

        {/* PAYMENT APPS — informational =================================== */}
        {payBadges.length > 0 && (
          <section className="mt-12 text-center md:mt-14">
            <p className="mb-4 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
              Tips can land in
            </p>
            <ul className="inline-flex flex-wrap justify-center gap-2">
              {payBadges.map((app) => (
                <li
                  key={app}
                  className="rounded-full border border-line bg-paper px-4 py-2 font-display text-base font-medium text-ink"
                >
                  {app}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* TRUST LINE ==================================================== */}
        <p className="mt-12 text-center text-base leading-relaxed text-ink-faint md:mt-16">
          <span className="money font-semibold text-ink">100%</span> of your tip goes to{' '}
          <span className="font-medium text-ink">{displayName}</span>.<br className="hidden md:block" />
          {' '}Pop Tips never holds the money.
        </p>

        {/* RECIPIENT PITCH =============================================== */}
        <section className="mt-20 md:mt-28">
          <div className="rounded-3xl border border-line-soft bg-surface px-6 py-10 text-center md:px-10 md:py-12">
            <Logo
              variant="icon"
              height={36}
              className="mx-auto mb-4 opacity-50"
              alt="Pop Tips"
            />
            <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
              Empowering the appreciation economy
            </p>
            <p className="mx-auto mt-3 max-w-md font-display text-xl italic leading-snug text-ink-dim md:text-2xl">
              You earn tips too?{' '}
              <Link
                href="/signup-recipient"
                className="not-italic font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-dim hover:decoration-accent"
              >
                Claim your own page.
              </Link>{' '}
              Always free for workers.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
