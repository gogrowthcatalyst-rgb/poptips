import { BusinessSignupForm } from '@/components/BusinessSignupForm';
import { isBusinessTier } from '@/lib/corp/tiers';
import type { BusinessTier } from '@/lib/db/schema';

export const metadata = { title: 'Get set up — Pop Tips for Organizations' };

export default async function BusinessSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; canceled?: string }>;
}) {
  const { tier, canceled } = await searchParams;
  const defaultTier: BusinessTier | undefined = tier && isBusinessTier(tier) ? tier : undefined;

  return (
    <main className="mx-auto max-w-2xl px-5 pb-24 pt-10 md:px-8 md:pt-14">
      <header className="mb-8">
        <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-accent">
          Pop Tips for Organizations
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium leading-tight tracking-tightest text-ink md:text-4xl">
          Take tipping off your books.
        </h1>
        <p className="mt-2 text-base leading-relaxed text-ink-dim">
          Set up your account, add your first location, and get the QR codes that put 100% of every
          tip in your team&rsquo;s hands.
        </p>
      </header>

      {canceled === '1' && (
        <p className="mb-6 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-dim">
          No charge made — your checkout was canceled. Pick up where you left off below.
        </p>
      )}

      <BusinessSignupForm defaultTier={defaultTier} />
    </main>
  );
}
