/**
 * Corp tier catalog — maps each BUSINESS_TIERS enum value to its Stripe Price
 * and display metadata. The `tier` IS the plan (no separate plan concept).
 *
 * Price IDs below are TEST-MODE (sandbox). At launch, swap them for the live
 * Price IDs — that's the only change needed to go live on billing.
 */

import type { BusinessTier } from '@/lib/db/schema';

export interface TierMeta {
  tier: BusinessTier;
  label: string;
  segment: 'smb' | 'enterprise';
  priceMonthly: number; // dollars per property / month (for display)
  stripePriceId: string;
  blurb: string;
}

export const TIERS: Record<BusinessTier, TierMeta> = {
  smb_1: {
    tier: 'smb_1',
    label: 'Pop Tips for SMB',
    segment: 'smb',
    priceMonthly: 99,
    stripePriceId: 'price_1TbTbEKDFnXIKeKPXaPCKoA1',
    blurb: 'For a single location getting started.',
  },
  smb_2: {
    tier: 'smb_2',
    label: 'Pop Tips for SMB Plus',
    segment: 'smb',
    priceMonthly: 199,
    stripePriceId: 'price_1TbTc8KDFnXIKeKPvZiCN52X',
    blurb: 'For growing small & midsized teams.',
  },
  ent_standard: {
    tier: 'ent_standard',
    label: 'Pop Tips Enterprise',
    segment: 'enterprise',
    priceMonthly: 499,
    stripePriceId: 'price_1TbTd1KDFnXIKeKPOvcER2Jc',
    blurb: 'Multi-property reporting and roster control.',
  },
  ent_premium: {
    tier: 'ent_premium',
    label: 'Pop Tips Enterprise Plus',
    segment: 'enterprise',
    priceMonthly: 799,
    stripePriceId: 'price_1TbTdwKDFnXIKeKPbdD0Pryp',
    blurb: 'Benchmarking, exports, API, and priority support.',
  },
};

export const TIER_ORDER: BusinessTier[] = ['smb_1', 'smb_2', 'ent_standard', 'ent_premium'];

/** Narrow an arbitrary string to a known tier, or null. */
export function tierMeta(value: string | null | undefined): TierMeta | null {
  if (!value) return null;
  return (TIERS as Record<string, TierMeta>)[value] ?? null;
}

export function isBusinessTier(value: string): value is BusinessTier {
  return value in TIERS;
}
