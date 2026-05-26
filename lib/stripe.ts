/**
 * Stripe client — lazily initialized from STRIPE_SECRET_KEY.
 *
 * Lazy (never at module import) so `next build` doesn't crash when the env var
 * is absent in the build environment — the error only surfaces if a Stripe
 * call actually runs unconfigured, which is the correct behavior. Mirrors the
 * db proxy in lib/db/index.ts.
 */

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set (set the sk_test_… key in Vercel env).');
  }
  // Pin to the SDK's bundled API version (omit apiVersion) for forward-compat.
  _stripe = new Stripe(key);
  return _stripe;
}
