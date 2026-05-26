/**
 * Corp provisioning data access.
 *
 * Flow: createPendingBusiness (status 'pending') at checkout start -> Stripe
 * Checkout -> activateBusiness on successful return (idempotent: a refresh or
 * a later webhook calling it again is a no-op). Activation seeds the position
 * roster and stamps the two QR target URLs.
 *
 * Power of Ten: small functions, bounded slug-retry loop, explicit null
 * returns, every write scoped by id.
 */

import { randomBytes } from 'crypto';
import { and, eq } from 'drizzle-orm';
import {
  db,
  businesses,
  properties,
  businessUsers,
  businessPositions,
  type Business,
  type BusinessUser,
  type Property,
  type BusinessTier,
} from '@/lib/db';
import { positionsForIndustry } from '@/lib/corp/position-templates';

function appOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://pop.tips').replace(/\/$/, '');
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'location';
}

/** A property slug that's unique across all properties (bounded retries). */
async function uniquePropertySlug(name: string): Promise<string> {
  const base = slugify(name);
  for (let i = 0; i < 5; i += 1) {
    const candidate = i === 0 ? base : `${base}-${randomBytes(2).toString('hex')}`;
    const hit = await db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, candidate))
      .limit(1);
    if (hit.length === 0) return candidate;
  }
  // Fall back to a fully random suffix — collision is astronomically unlikely.
  return `${base}-${randomBytes(4).toString('hex')}`;
}

export interface CreatePendingInput {
  businessName: string;
  tier: BusinessTier;
  industry: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  propertyName: string;
  propertyAddress?: string;
}

export interface PendingBusiness {
  businessId: string;
  propertyId: string;
  ownerUserId: string;
  slug: string;
}

/** Create the business (pending), its first property, and the owner admin. */
export async function createPendingBusiness(input: CreatePendingInput): Promise<PendingBusiness> {
  const slug = await uniquePropertySlug(input.propertyName);

  const [biz] = await db
    .insert(businesses)
    .values({
      name: input.businessName,
      tier: input.tier,
      industry: input.industry,
      contactEmail: input.ownerEmail,
      contactPhone: input.ownerPhone,
      status: 'pending',
    })
    .returning({ id: businesses.id });

  const [prop] = await db
    .insert(properties)
    .values({
      businessId: biz.id,
      name: input.propertyName,
      slug,
      address: input.propertyAddress ?? null,
    })
    .returning({ id: properties.id });

  const [owner] = await db
    .insert(businessUsers)
    .values({
      businessId: biz.id,
      name: input.ownerName,
      email: input.ownerEmail,
      phone: input.ownerPhone,
      role: 'owner',
      status: 'active',
    })
    .returning({ id: businessUsers.id });

  return { businessId: biz.id, propertyId: prop.id, ownerUserId: owner.id, slug };
}

export async function attachStripeCustomer(businessId: string, stripeCustomerId: string): Promise<void> {
  await db
    .update(businesses)
    .set({ stripeCustomerId, updatedAt: new Date() })
    .where(eq(businesses.id, businessId));
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const rows = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getBusinessUserById(id: string): Promise<BusinessUser | null> {
  const rows = await db.select().from(businessUsers).where(eq(businessUsers.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getOwnerForBusiness(businessId: string): Promise<BusinessUser | null> {
  const rows = await db
    .select()
    .from(businessUsers)
    .where(and(eq(businessUsers.businessId, businessId), eq(businessUsers.role, 'owner')))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPropertiesForBusiness(businessId: string): Promise<Property[]> {
  return db.select().from(properties).where(eq(properties.businessId, businessId));
}

async function seedPositionsIfEmpty(businessId: string, industry: string): Promise<void> {
  const existing = await db
    .select({ id: businessPositions.id })
    .from(businessPositions)
    .where(eq(businessPositions.businessId, businessId))
    .limit(1);
  if (existing.length > 0) return;

  const labels = positionsForIndustry(industry);
  await db.insert(businessPositions).values(
    labels.map((label, i) => ({ businessId, label, sortOrder: i })),
  );
}

async function stampQrTargets(businessId: string): Promise<void> {
  const props = await getPropertiesForBusiness(businessId);
  const origin = appOrigin();
  for (const p of props) {
    if (p.qrUrl && p.staffQrUrl) continue; // already stamped
    await db
      .update(properties)
      .set({
        qrUrl: `${origin}/join/${p.slug}`, // guest QR target
        staffQrUrl: `${origin}/work/${p.slug}`, // staff QR target
        updatedAt: new Date(),
      })
      .where(eq(properties.id, p.id));
  }
}

export interface ActivateResult {
  alreadyActive: boolean;
  business: Business | null;
}

/**
 * Idempotent activation. First call: flip to active, store the subscription,
 * seed positions, stamp QR targets. Subsequent calls (refresh / webhook): no-op
 * beyond returning the business, so the magic link is sent exactly once by the
 * caller guarding on alreadyActive.
 */
export async function activateBusiness(
  businessId: string,
  stripe: { stripeCustomerId: string; stripeSubscriptionId: string },
): Promise<ActivateResult> {
  const biz = await getBusinessById(businessId);
  if (!biz) return { alreadyActive: false, business: null };
  if (biz.status === 'active') return { alreadyActive: true, business: biz };

  await db
    .update(businesses)
    .set({
      status: 'active',
      stripeCustomerId: stripe.stripeCustomerId,
      stripeSubscriptionId: stripe.stripeSubscriptionId,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, businessId));

  await seedPositionsIfEmpty(businessId, biz.industry ?? '');
  await stampQrTargets(businessId);

  const fresh = await getBusinessById(businessId);
  return { alreadyActive: false, business: fresh };
}
