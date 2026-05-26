/**
 * POST /api/business/checkout
 *
 * Self-serve corp signup step 2: validate the intake, create the business in
 * 'pending' state (+ first property + owner admin), create a Stripe customer,
 * and open a Stripe Checkout session in SUBSCRIPTION mode for the chosen tier
 * (quantity = 1 property). Returns the Checkout URL for the client to redirect
 * to. Provisioning (activation + magic link) happens on the return page once
 * payment succeeds — see app/business/welcome/page.tsx.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { TIERS } from '@/lib/corp/tiers';
import { INDUSTRY_SLUGS } from '@/lib/industries';
import { createPendingBusiness, attachStripeCustomer } from '@/lib/db/business';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BodySchema = z.object({
  businessName: z.string().min(1).max(120),
  tier: z.enum(['smb_1', 'smb_2', 'ent_standard', 'ent_premium']),
  industry: z.enum(INDUSTRY_SLUGS),
  ownerName: z.string().min(1).max(80),
  ownerEmail: z.string().regex(EMAIL_RE, 'Enter a valid email'),
  ownerPhone: z.string().min(7).max(40),
  propertyName: z.string().min(1).max(120),
  propertyAddress: z.string().max(200).optional(),
});

function toE164(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return raw.startsWith('+') ? raw : `+${d}`;
}

function origin(): string {
  return (process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://pop.tips').replace(/\/$/, '');
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const priceId = TIERS[data.tier].stripePriceId;

  try {
    const stripe = getStripe();

    // 1) Create the pending business + property + owner.
    const pending = await createPendingBusiness({
      businessName: data.businessName,
      tier: data.tier,
      industry: data.industry,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      ownerPhone: toE164(data.ownerPhone),
      propertyName: data.propertyName,
      propertyAddress: data.propertyAddress,
    });

    // 2) Stripe customer, linked back to the business.
    const customer = await stripe.customers.create({
      name: data.businessName,
      email: data.ownerEmail,
      metadata: { businessId: pending.businessId },
    });
    await attachStripeCustomer(pending.businessId, customer.id);

    // 3) Subscription Checkout session (quantity = 1 property for now).
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: pending.businessId,
      metadata: { businessId: pending.businessId },
      subscription_data: { metadata: { businessId: pending.businessId } },
      success_url: `${origin()}/business/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin()}/business/signup?canceled=1`,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Could not start checkout.' }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[business/checkout]', err);
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }
}
