'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { CopyKey, Track, TrackId } from './types';
import { TRACKS } from './tracks';

interface TrackContextValue {
  track: Track;
  trackId: TrackId;
  applyTrack: (id: TrackId) => void;
  t: (key: CopyKey) => string;
}

const TrackContext = createContext<TrackContextValue | null>(null);

const COOKIE_NAME = 'pt_track';
const COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365; // 1 year

function readTrackCookie(): TrackId {
  if (typeof document === 'undefined') return 'neutral';
  const m = document.cookie.match(/(?:^|;\s*)pt_track=([^;]+)/);
  const v = m?.[1];
  return v === 'tipper' || v === 'recipient' || v === 'neutral' ? v : 'neutral';
}

function writeTrackCookie(id: TrackId) {
  document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${COOKIE_MAX_AGE_S}; SameSite=Lax`;
}

function injectTokens(track: Track) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(track.tokens)) {
    root.style.setProperty(k, v);
  }
  root.dataset.track = track.id;
}

export function TrackProvider({ children }: { children: ReactNode }) {
  // Server renders with 'neutral'. The no-flash inline script in <head>
  // already painted the right tokens before this component mounted, so
  // there is no visible flash even though state starts at 'neutral'.
  const [trackId, setTrackId] = useState<TrackId>('neutral');

  useEffect(() => {
    const cookieId = readTrackCookie();
    setTrackId(cookieId);
    // The inline script already set the tokens, but re-injecting is a
    // no-op and guarantees state and DOM stay in sync if the cookie
    // ever lies about itself.
    injectTokens(TRACKS[cookieId]);
  }, []);

  const applyTrack = useCallback((id: TrackId) => {
    setTrackId(id);
    injectTokens(TRACKS[id]);
    writeTrackCookie(id);
  }, []);

  const track = TRACKS[trackId];
  const t = useCallback((key: CopyKey) => track.copy[key], [track]);

  return (
    <TrackContext.Provider value={{ track, trackId, applyTrack, t }}>
      {children}
    </TrackContext.Provider>
  );
}

export function useTrack(): TrackContextValue {
  const ctx = useContext(TrackContext);
  if (!ctx) {
    throw new Error('useTrack() must be called inside <TrackProvider>.');
  }
  return ctx;
}
