/**
 * GET /business/welcome?session_id=…
 *
 * Stripe Checkout returns here on success. This page provisions the business:
 * verify the session is paid, activate the business (idempotent), and — on the
 * FIRST activation only — send the owner their magic link into the admin app.
 * A refresh re-runs activate() harmlessly (alreadyActive) and does not re-send.
 *
 * (This is the testable-today provisioning path. A Stripe webhook is the
 * production hardening for the rare "tab closed before redirect" case; it
 * calls the same idempotent activateBusiness.)
 */

import Link from 'next/link';
import { getStripe } from '@/lib/stripe';
import { activateBusiness, getOwnerForBusiness } from '@/lib/db/business';
import { issueMagicLink } from '@/lib/auth/magic-link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CORAL = {
  '--accent': '#F06844',
  '--accent-dim': '#C44A2C',
  '--accent-glow': '#FFA587',
} as React.CSSProperties;

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main style={CORAL} className="mx-auto max-w-lg px-5 py-16 md:py-24">
      <div className="rounded-2xl border border-line bg-paper px-6 py-10 text-center md:px-10 md:py-12">
        <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-accent">
          Pop Tips for Organizations
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium leading-tight tracking-tightest text-ink">
          {title}
        </h1>
        {children}
      </div>
    </main>
  );
}

async function provision(sessionId: string): Promise<'ok' | 'unpaid' | 'error'> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== 'complete') return 'unpaid';

    const businessId = session.client_reference_id ?? session.metadata?.businessId;
    if (!businessId) return 'error';

    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    if (!customerId || !subId) return 'error';

    const result = await activateBusiness(businessId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subId,
    });

    // Send the owner's admin magic link exactly once (first activation).
    if (!result.alreadyActive) {
      const owner = await getOwnerForBusiness(businessId);
      if (owner?.id) {
        try {
          await issueMagicLink({
            userId: owner.id,
            role: 'business',
            firstName: owner.name ?? undefined,
            email: owner.email ?? undefined,
            phone: owner.phone ?? undefined,
            tag: 'poptips-business',
            kind: 'signup',
          });
        } catch (e) {
          console.error('[business/welcome] magic link send failed', e);
          // Non-fatal: business is active; owner can request a resend.
        }
      }
    }
    return 'ok';
  } catch (e) {
    console.error('[business/welcome] provision error', e);
    return 'error';
  }
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <Shell title="Hmm — no checkout found">
        <p className="mt-3 text-base leading-relaxed text-ink-dim">
          We couldn&rsquo;t find your checkout session. If you were charged, check your phone for
          your admin link — otherwise, start again.
        </p>
        <Link href="/business/signup" className="mt-6 inline-block font-display text-accent underline">
          Back to sign up
        </Link>
      </Shell>
    );
  }

  const state = await provision(session_id);

  if (state === 'ok') {
    return (
      <Shell title="You're all set.">
        <p className="mt-3 text-base leading-relaxed text-ink-dim">
          Your account is active. We just texted the owner a secure link to open your admin
          dashboard — no password needed.
        </p>
        <p className="mt-4 font-mono text-xs uppercase tracking-wider2 text-ink-faint">
          Check your phone → tap the link → you&rsquo;re in.
        </p>
      </Shell>
    );
  }

  if (state === 'unpaid') {
    return (
      <Shell title="Payment didn't complete">
        <p className="mt-3 text-base leading-relaxed text-ink-dim">
          It looks like checkout wasn&rsquo;t finished. You can try again — you won&rsquo;t be
          charged twice.
        </p>
        <Link href="/business/signup" className="mt-6 inline-block font-display text-accent underline">
          Try again
        </Link>
      </Shell>
    );
  }

  return (
    <Shell title="Something went wrong">
      <p className="mt-3 text-base leading-relaxed text-ink-dim">
        We hit a snag finishing your setup. If you were charged, don&rsquo;t worry — reach out and
        we&rsquo;ll sort it out right away.
      </p>
    </Shell>
  );
}
