/**
 * Pricing — the source of truth for display strings on marketing pages.
 *
 * Currently returns the hardcoded launch config. When the pricing_variants
 * Drizzle table lands (Batch 6), this file evolves to read from the DB —
 * but consumers keep calling getDefaultPricing() and don't change.
 *
 * Locked v1 pricing model:
 *   - $9.99 / year (annual, single charge per year)
 *   - + 3.5% per tip take rate
 *   - First 3 tips free (no card required)
 *   - Annual fee charged on tip #4 (activation moment)
 *   - Renewal annually on activation anniversary
 *
 * A/B/N testable via the future pricing_variants table — change a row,
 * marketing copy updates without a deploy.
 */

export interface PricingDisplay {
  /** Numeric cents — keeps math integer-safe (999 = $9.99) */
  annual_fee_cents: number;
  /** Basis points — keeps math integer-safe (350 = 3.5%) */
  take_rate_bps: number;
  /** Number of free tips before activation */
  free_trial_tips: number;
  /** Which tip number triggers the annual fee */
  activation_tip_number: number;

  // Pre-formatted display strings
  /** e.g. "$9.99" */
  annual_fee: string;
  /** e.g. "/year" */
  annual_fee_period: string;
  /** e.g. "3.5%" */
  take_rate: string;
  /** e.g. "$9.99 / year + 3.5% per tip" */
  headline: string;
  /** e.g. "First 3 tips free. Annual fee charged on tip #4." */
  subline: string;
}

const LAUNCH_PRICING: PricingDisplay = {
  annual_fee_cents:      999,
  take_rate_bps:         350,
  free_trial_tips:       3,
  activation_tip_number: 4,

  annual_fee:        '$9.99',
  annual_fee_period: '/year',
  take_rate:         '3.5%',
  headline:          '$9.99 / year + 3.5% per tip',
  subline:           'First 3 tips free. Annual fee charged on tip #4.',
};

/**
 * Returns the public-facing default pricing variant.
 * Marketing pages, signup hubs, OG cards all read from this.
 */
export function getDefaultPricing(): PricingDisplay {
  return LAUNCH_PRICING;
}
