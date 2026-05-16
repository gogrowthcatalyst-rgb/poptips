'use client';

import { useEffect } from 'react';
import { useTrack, type TrackId } from '@/lib/track';

/**
 * Force a specific track when this component mounts.
 *
 * Drop into any page where the URL identifies the visitor:
 *   /signup-tipper      → <TrackForcer track="tipper" />
 *   /signup-recipient   → <TrackForcer track="recipient" />
 *   /dashboard          → <TrackForcer track="recipient" />
 *   /tip/[handle]       → <TrackForcer track="tipper" />  (stranger about to send)
 *
 * Renders nothing. Idempotent — calling applyTrack with the current
 * track is a no-op.
 */
export function TrackForcer({ track }: { track: TrackId }) {
  const { trackId, applyTrack } = useTrack();

  useEffect(() => {
    if (trackId !== track) applyTrack(track);
  }, [track, trackId, applyTrack]);

  return null;
}
