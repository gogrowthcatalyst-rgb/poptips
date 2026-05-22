import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TrackForcer } from '@/components/TrackForcer';
import { SendForm } from '@/components/SendForm';
import { ArrowLeft } from '@/components/icons';
import { isReservedHandle } from '@/lib/reserved-handles';
import { getRecipientByHandle } from '@/lib/db/recipients';

interface Params {
  handle: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  if (isReservedHandle(handle)) return { title: 'Page not found' };
  const recipient = await getRecipientByHandle(handle);
  if (!recipient) return { title: 'Page not found' };
  return {
    title: `Send a tip to @${recipient.handle}`,
    description: 'Pick an amount and an app. Pop Tips opens your chosen app — we never see the money.',
  };
}

export default async function SendPage({ params }: { params: Promise<Params> }) {
  const { handle } = await params;

  if (isReservedHandle(handle)) notFound();

  const recipient = await getRecipientByHandle(handle);
  if (!recipient) notFound();

  const { displayName, photoUrl } = recipient;
  const initial = displayName.charAt(0);

  // Shape the apps for the client form — only what it needs.
  const apps = recipient.paymentApps.map((a) => ({
    app: a.app,
    appHandle: a.appHandle,
  }));

  return (
    <>
      <TrackForcer track="tipper" />

      <main className="mx-auto max-w-2xl px-5 pb-20 pt-8 md:px-8 md:pb-32 md:pt-12">
        {/* Back to profile */}
        <Link
          href={`/${recipient.handle}`}
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim transition-colors duration-200 hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          <span>Back to profile</span>
        </Link>

        {/* Compressed identity header */}
        <header className="mb-10 flex items-center gap-5 md:mb-14">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center md:h-24 md:w-24">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full bg-accent-glow opacity-30 blur-xl"
            />
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-line bg-surface">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-3xl font-medium italic text-accent md:text-4xl">
                  {initial}
                </span>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-accent">
              Sending to
            </p>
            <h1 className="truncate font-display text-3xl font-medium leading-tight tracking-tightest text-ink md:text-4xl">
              {displayName}
            </h1>
          </div>
        </header>

        <SendForm handle={recipient.handle} displayName={displayName} apps={apps} />

        {/* Trust */}
        <p className="mt-10 text-center text-sm leading-relaxed text-ink-faint md:text-base">
          We open your chosen app pre-filled with your amount. You confirm in
          the app. <span className="text-ink-dim">Pop Tips never sees the money.</span>
        </p>
      </main>
    </>
  );
}
