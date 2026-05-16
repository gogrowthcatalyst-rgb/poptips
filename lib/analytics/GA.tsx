'use client';

import { GoogleAnalytics } from '@next/third-parties/google';

/**
 * GA4 — uses Next.js's official third-party integration.
 *
 * Renders nothing (and adds zero bytes) if NEXT_PUBLIC_GA_ID is missing,
 * which is the desired behavior for local dev and preview deployments.
 *
 * The `@next/third-parties` package handles the gtag.js script load
 * with optimal performance flags. After mount, `window.gtag` is
 * available globally — the track() helper looks for it.
 */
export function GA() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
