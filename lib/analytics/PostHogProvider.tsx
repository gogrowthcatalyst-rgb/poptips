'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { useTrack } from '@/lib/track';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

/**
 * PostHog initialization + automatic page-view tracking.
 *
 * Initializes once on mount. If NEXT_PUBLIC_POSTHOG_KEY isn't set
 * (e.g. local dev without analytics), this is a silent no-op.
 *
 * Page views fire on every App Router navigation — usePathname() and
 * useSearchParams() change on each transition, and the effect captures it.
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackId } = useTrack();

  // Initialize once, on first client mount
  useEffect(() => {
    if (!POSTHOG_KEY) return;
    if (posthog.__loaded) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // we fire manually on App Router navigations
      capture_pageleave: true,
      person_profiles: 'identified_only', // GDPR-friendlier default
      session_recording: {
        // Belt-and-suspenders over PostHog's default: never let typed PII
        // (name, phone, email, ZIP) land in a session replay. Pinned
        // explicitly so we don't depend on an undocumented default.
        maskAllInputs: true,
        maskInputOptions: { password: true, email: true, tel: true },
      },
    });

    // Make available to the global track() helper
    (window as unknown as { posthog?: typeof posthog }).posthog = posthog;
  }, []);

  // Fire page_viewed on every route change
  useEffect(() => {
    if (!POSTHOG_KEY) return;

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    posthog.capture('$pageview', { $current_url: url });
    posthog.capture('page_viewed', { path: pathname, track: trackId });
  }, [pathname, searchParams, trackId]);

  return <>{children}</>;
}
