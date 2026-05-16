import type { EventMap, EventName } from './events';

/**
 * Fire a typed event to PostHog and GA4.
 *
 * Usage:
 *   track('cta_clicked', { source: 'home_hero', intent: 'tip', track: 'tipper' })
 *
 * The compiler enforces both the event name and the payload shape against
 * the registry in events.ts.
 *
 * If neither analytics provider is configured (env vars missing), this is
 * a silent no-op — safe to leave in code during local dev.
 */
export function track<E extends EventName>(name: E, payload: EventMap[E]): void {
  if (typeof window === 'undefined') return;

  // PostHog
  const ph = (window as unknown as { posthog?: PostHogStub }).posthog;
  if (ph?.capture) {
    try {
      ph.capture(name, payload as Record<string, unknown>);
    } catch {
      /* swallow — analytics must never break the app */
    }
  }

  // GA4
  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  if (gtag) {
    try {
      gtag('event', name, payload as Record<string, unknown>);
    } catch {
      /* swallow */
    }
  }
}

/**
 * Identify the current user across both providers.
 * Wires up post-login in Session 3.
 */
export function identify(
  userId: string,
  traits: Record<string, string | number | boolean | null | undefined> = {},
): void {
  if (typeof window === 'undefined') return;

  const ph = (window as unknown as { posthog?: PostHogStub }).posthog;
  if (ph?.identify) {
    try {
      ph.identify(userId, traits);
    } catch {
      /* swallow */
    }
  }

  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  if (gtag) {
    try {
      gtag('set', { user_id: userId, ...traits });
    } catch {
      /* swallow */
    }
  }
}

/**
 * Reset the analytics session — used on logout.
 */
export function reset(): void {
  if (typeof window === 'undefined') return;

  const ph = (window as unknown as { posthog?: PostHogStub }).posthog;
  if (ph?.reset) {
    try {
      ph.reset();
    } catch {
      /* swallow */
    }
  }
}

// --- minimal type stubs for the global script-loaded SDKs ---
interface PostHogStub {
  capture?: (event: string, props?: Record<string, unknown>) => void;
  identify?: (id: string, props?: Record<string, unknown>) => void;
  reset?: () => void;
}

type GtagFn = (
  command: 'event' | 'config' | 'set' | 'consent',
  ...args: unknown[]
) => void;
