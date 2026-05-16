'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/**
 * Fire profile_viewed exactly once when a profile page mounts.
 *
 * Detects whether the visitor likely came from a QR scan vs. shared link
 * vs. direct nav. Heuristic — refine later if needed.
 */
export function ProfileViewTracker({ handle }: { handle: string }) {
  useEffect(() => {
    let via: 'qr' | 'link' | 'direct' | 'unknown' = 'unknown';

    try {
      // QR codes can be tagged with a query param when generated in Session 8
      const params = new URLSearchParams(window.location.search);
      const src = params.get('src');
      if (src === 'qr') via = 'qr';
      else if (document.referrer && new URL(document.referrer).hostname !== window.location.hostname) {
        via = 'link';
      } else if (!document.referrer) {
        via = 'direct';
      } else {
        via = 'link';
      }
    } catch {
      via = 'unknown';
    }

    track('profile_viewed', { handle, via });
  }, [handle]);

  return null;
}
